"""Organize the live catalog from the source sheets in kewin-chem-connect-main/public/data.

Safe by design:
  - only ADDS subcategory links and FILLS empty fields; never deletes or overwrites a value
  - dry run by default (everything rolled back); pass --apply to commit
  - prints what it would change and every source row it couldn't match, for manual review

Run from backend/ after `alembic upgrade head`:
  python scripts/organize_catalog.py            # dry run
  python scripts/organize_catalog.py --apply
"""
import json
import os
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from dotenv import load_dotenv  # noqa: E402

load_dotenv(ROOT / ".env")
from sqlalchemy import create_engine, text  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.core import cas  # noqa: E402

DATA = ROOT.parent / "kewin-chem-connect-main/public/data"

# source file -> (category slug, subcategory slug) as they exist in the live DB
SOURCES = {
    "dyes-intermediates/AcidDyesTable/acid_dyes.json": ("dyes-intermediates", "acid-dyes"),
    "dyes-intermediates/AcidDyesTable/levelling_dyes.json": ("dyes-intermediates", "levelling-dyes"),
    "dyes-intermediates/AcidDyesTable/mill_dyes.json": ("dyes-intermediates", "milling-dyes"),
    "dyes-intermediates/AcidDyesTable/metal_complex_1_1_dyes.json": ("dyes-intermediates", "metal-complex-11-dyes"),
    "dyes-intermediates/AcidDyesTable/metal_complex_1_2_dyes.json": ("dyes-intermediates", "metal-complex-12-dyes"),
    "dyes-intermediates/BasicDyesTable/basic_dyes_liquid.json": ("dyes-intermediates", "basic-dyes-liquid"),
    "dyes-intermediates/BasicDyesTable/basic_dyes_powder.json": ("dyes-intermediates", "basic-dyes-powder"),
    "dyes-intermediates/ReactiveDyesTable/HE_dyes.json": ("dyes-intermediates", "reactive-dyes-he"),
    "dyes-intermediates/ReactiveDyesTable/Hot_dyes.json": ("dyes-intermediates", "reactive-dyes-hot-brand"),
    "dyes-intermediates/ReactiveDyesTable/ME_dyes.json": ("dyes-intermediates", "reactive-dyes-me"),
    "dyes-intermediates/ReactiveDyesTable/printing_dyes_1.json": ("dyes-intermediates", "reactive-printing-dyes"),
    "dyes-intermediates/ReactiveDyesTable/printing_dyes_2.json": ("dyes-intermediates", "reactive-printing-dyes"),
    "dyes-intermediates/ReactiveDyesTable/vinyl_sulphone_base_dye.json": ("dyes-intermediates", "vinyl-sulphone-base-dyes"),
    "dyes-intermediates/direct_dyes_list.json": ("dyes-intermediates", "direct-dyes"),
    "dyes-intermediates/solvent_dyes_list.json": ("dyes-intermediates", "solvent-dyes"),
    "dyes-intermediates/intermediates_list.json": ("dyes-intermediates", "dye-intermediates"),
    "dyes-intermediates/FoodAndLakeColor/D_C_color.json": ("food-pharma-colors", "dc-colors"),
    "dyes-intermediates/FoodAndLakeColor/FD_C_color.json": ("food-pharma-colors", "fdc-colors"),
    "dyes-intermediates/FoodAndLakeColor/Food_color.json": ("food-pharma-colors", "food-colors"),
    "dyes-intermediates/FoodAndLakeColor/blended_color.json": ("food-pharma-colors", "blended-colors"),
    "dyes-intermediates/FoodAndLakeColor/lake_color.json": ("food-pharma-colors", "lake-colors"),
    "shades-Pigments/organic-Pigments/toner_fanal_pigment.json": ("pigments", "organic-pigments-toner-fanal"),
    "food-pharmacolors/injectable-OintmentsTable/injectables.json": ("pharmaceutical-products", "injectable-products"),
    "food-pharmacolors/injectable-OintmentsTable/ointments.json": ("pharmaceutical-products", "ointments"),
    "food-pharmacolors/nasalDrops-OralSuspensionsTable/nasal_drop.json": ("pharmaceutical-products", "nasal-drops"),
    "food-pharmacolors/nasalDrops-OralSuspensionsTable/oral_suspensions.json": ("pharmaceutical-products", "oral-suspensions"),
    "food-pharmacolors/nutraceuticalsTable/Minerals.json": ("pharmaceutical-products", "minerals"),
    "food-pharmacolors/nutraceuticalsTable/Specialities.json": ("pharmaceutical-products", "nutraceutical-specialities"),
    "food-pharmacolors/nutraceuticalsTable/Stabilized_vitamins.json": ("pharmaceutical-products", "stabilized-vitamins"),
    "food-pharmacolors/nutraceuticalsTable/amino_acid.json": ("pharmaceutical-products", "amino-acids"),
    "food-pharmacolors/tablets-CapsulesTable/combination_formulations.json": ("pharmaceutical-products", "combination-formulations"),
    "food-pharmacolors/tablets-CapsulesTable/tablet_and_capsules.json": ("pharmaceutical-products", "tablets-capsules"),
    "food-pharmacolors/veterinaryFormulationTable/companion_animal_products.json": ("pharmaceutical-products", "companion-animal-products"),
    "food-pharmacolors/veterinaryFormulationTable/livestock_product.json": ("pharmaceutical-products", "livestock-products"),
    "food-pharmacolors/veterinaryFormulationTable/other_product.json": ("pharmaceutical-products", "other-veterinary-products"),
    "food-pharmacolors/veterinaryFormulationTable/poultry_product.json": ("pharmaceutical-products", "poultry-products"),
}

NAME_KEYS = ["C.I Name", "CI_Name", "Product Name", "ProductName", "Name", "FD & C Color"]
CAS_KEYS = ["CAS no", "case_no"]
# source sheet flag column -> existing applications.slug in production
APPLICATION_FLAGS = {"Wool": "wool-dyeing", "Polyamide": "polyamide-dyeing", "Wood Stain": "wood-stain",
                     "Leathe": "leather-dyeing", "Cotton": "cotton-dyeing", "Paper": "paper-dyeing",
                     "Alluminium Anodize": "aluminium-anodizing", "SILK": "silk-dyeing", "INK": "ink-manufacturing"}
SPEC_KEYS = {"Strength": "strength", "Dosage Form": "dosage_form", "Presentation": "presentation",
             "Therapeutic Segments": "therapeutic_segment", "Hue": "hue"}
CI_NAME = re.compile(r"^(acid|basic|direct|reactive|solvent|disperse|pigment|vat|mordant|food)\s+[a-z]+\s*-?\s*\d", re.I)


def clean(v):
    v = str(v or "").strip()
    return "" if v.strip("-").lower() in {"", "na", "n/a", "nan"} else v


def key(name):
    """Match key tolerant of case, dash and spacing differences ("Reactive Red - 11" == "REACTIVE RED 11")."""
    n = name.lower().replace("–", "-").replace("—", "-")
    n = re.sub(r"\s*-\s*", " ", n)
    return re.sub(r"\s+", " ", n).strip()


def pretty_ci(name):
    n = re.sub(r"\s*-\s*(?=\d)", " ", re.sub(r"\s+", " ", name.strip()))
    return n.title() if n.isupper() or n.islower() else n


def facts(row, rel=""):
    """Organized fields a source row provides."""
    f = {"synonyms": [], "applications": [], "specs": {}}
    name = next((clean(row.get(k)) for k in NAME_KEYS if clean(row.get(k))), "")
    if CI_NAME.match(name):
        f["ci_name"] = pretty_ci(name)
    if clean(row.get("CI No")):
        f["ci_number"] = clean(row["CI No"])
    elif clean(row.get("CI Name")) and re.fullmatch(r"[\d:]+", clean(row["CI Name"])):
        f["ci_number"] = clean(row["CI Name"])  # D&C sheet stores the C.I. number under "CI Name"
    e = clean(row.get("EC No") or row.get("EEC No"))
    if e:
        f["e_number"] = e
    if "intermediates_list" in rel and clean(row.get("Compound")):
        f["specs"]["chemical_family"] = clean(row["Compound"])  # e.g. "Benzoic", not another name
    for k in (["Common Name", "D C No"] if "intermediates_list" in rel else ["Compound", "Common Name", "D C No"]):
        if clean(row.get(k)):
            f["synonyms"].append(clean(row[k]))
    fdc = clean(row.get("FD & C Color"))
    if fdc and fdc != name:
        f["synonyms"].append(fdc if fdc.upper().startswith("FD") else f"FD&C {fdc}")
    f["applications"] = [v for k, v in APPLICATION_FLAGS.items() if clean(row.get(k)).upper() == "Y"]
    for k, v in SPEC_KEYS.items():
        if clean(row.get(k)):
            f["specs"][v] = clean(row[k])
    return name, next((clean(row.get(k)) for k in CAS_KEYS if clean(row.get(k))), ""), f


def merge_list(cur, new):
    return cur + [x for x in new if x not in cur]


def main(apply: bool):
    url = os.environ.get("DATABASE_URL") or sys.exit("DATABASE_URL is not set")
    from app.db.session import database_url
    engine = create_engine(database_url())
    report, unmatched = Counter(), defaultdict(list)
    with Session(engine) as db:
        subs = {(r.cslug, r.sslug): r.id for r in db.execute(text(
            "SELECT s.id, s.slug AS sslug, c.slug AS cslug FROM subcategories s JOIN categories c ON c.id = s.category_id"))}
        products = db.execute(text(
            "SELECT p.id, p.name, p.cas_number, p.ci_name, p.ci_number, p.e_number, p.synonyms, p.specs, "
            "c.slug AS cslug, COALESCE(array_agg(a.cas_number) FILTER (WHERE a.cas_number IS NOT NULL), '{}') AS aliases "
            "FROM products p JOIN categories c ON c.id = p.category_id LEFT JOIN cas_aliases a ON a.product_id = p.id "
            "GROUP BY p.id, c.slug")).mappings().all()
        apps = {r.slug: r.id for r in db.execute(text("SELECT id, slug FROM applications"))}
        app_links = {tuple(r) for r in db.execute(text("SELECT product_id, application_id FROM product_applications"))}
        by_name = defaultdict(list)
        by_cas = defaultdict(list)
        for p in products:
            by_name[(p["cslug"], key(p["name"]))].append(p)
            for c in set(cas.normalize(p["cas_number"])) | set(p["aliases"]):
                by_cas[(p["cslug"], c)].append(p)
        links = {tuple(r) for r in db.execute(text("SELECT product_id, subcategory_id FROM product_subcategories"))}
        pending = {p["id"]: dict(p) for p in products}
        changed = set()
        new_links, new_app_links = [], []  # written in one statement each (DB is far away: avoid round trips)

        for rel, (cslug, sslug) in SOURCES.items():
            sub_id = subs.get((cslug, sslug))
            if sub_id is None:
                unmatched[rel].append(f"(subcategory {cslug}/{sslug} not in DB)")
                continue
            for row in json.loads((DATA / rel).read_text()):
                if not isinstance(row, dict):
                    continue
                name, raw_cas, f = facts(row, rel)
                if not name or key(name) in {"product name", "name"}:
                    continue
                hits = by_name.get((cslug, key(name)), [])
                if not hits:
                    cas_list = cas.normalize(raw_cas)
                    cands = {p["id"]: p for c in cas_list for p in by_cas.get((cslug, c), [])}
                    hits = list(cands.values()) if len(cands) == 1 else []
                if len(hits) != 1:
                    unmatched[rel].append(f"{name} ({raw_cas or 'no CAS'})" + (" [ambiguous]" if hits else ""))
                    continue
                pid = hits[0]["id"]
                report["source rows matched"] += 1
                if (pid, sub_id) not in links:
                    links.add((pid, sub_id))
                    new_links.append((pid, sub_id))
                    report["subcategory links added"] += 1
                cur = pending[pid]
                for col in ["ci_name", "ci_number", "e_number"]:
                    if f.get(col) and not cur[col]:
                        cur[col] = f[col]
                        changed.add(pid)
                        report[f"{col} filled"] += 1
                merged = merge_list(list(cur["synonyms"]), f["synonyms"])
                if merged != list(cur["synonyms"]):
                    cur["synonyms"] = merged
                    changed.add(pid)
                    report["synonyms added to"] += 1
                for slug in f["applications"]:
                    app_id = apps.get(slug)
                    if app_id is None:
                        report[f"application '{slug}' missing in DB (skipped)"] += 1
                    elif (pid, app_id) not in app_links:
                        app_links.add((pid, app_id))
                        new_app_links.append((pid, app_id))
                        report["application links added"] += 1
                specs = dict(cur["specs"])
                for k, v in f["specs"].items():
                    old = specs.get(k)
                    if old is None:
                        specs[k] = v
                    elif v != old and not (isinstance(old, list) and v in old):
                        specs[k] = (old if isinstance(old, list) else [old]) + [v]  # e.g. several pack sizes
                if specs != cur["specs"]:
                    cur["specs"] = specs
                    changed.add(pid)
                    report["specs filled"] += 1

        if new_links:
            db.execute(text("INSERT INTO product_subcategories (product_id, subcategory_id) "
                            "SELECT * FROM unnest(CAST(:p AS int[]), CAST(:s AS int[])) ON CONFLICT DO NOTHING"),
                       {"p": [a for a, _ in new_links], "s": [b for _, b in new_links]})
        if new_app_links:
            db.execute(text("INSERT INTO product_applications (product_id, application_id) "
                            "SELECT * FROM unnest(CAST(:p AS int[]), CAST(:a AS int[])) "
                            "ON CONFLICT (product_id, application_id) DO NOTHING"),
                       {"p": [a for a, _ in new_app_links], "a": [b for _, b in new_app_links]})
        if changed:
            rows = [{"id": pid, **{k: pending[pid][k] for k in ["ci_name", "ci_number", "e_number", "synonyms", "specs"]}}
                    for pid in changed]
            db.execute(text("""
                UPDATE products p SET ci_name = r.ci_name, ci_number = r.ci_number, e_number = r.e_number,
                                      synonyms = r.synonyms, specs = r.specs
                FROM jsonb_to_recordset(CAST(:rows AS jsonb))
                     AS r(id int, ci_name text, ci_number text, e_number text, synonyms text[], specs jsonb)
                WHERE p.id = r.id"""), {"rows": json.dumps(rows)})
        report["products updated"] = len(changed)

        print("\n".join(f"{v:6}  {k}" for k, v in sorted(report.items())))
        total = sum(len(v) for v in unmatched.values())
        print(f"\n{total} source rows not matched to a DB product (left alone, review manually):")
        for rel, names in unmatched.items():
            print(f"  {rel}: {len(names)}  e.g. {', '.join(names[:4])}")
        if apply:
            db.commit()
            print("\nAPPLIED.")
        else:
            db.rollback()
            print("\nDry run: nothing written. Re-run with --apply to commit.")


if __name__ == "__main__":
    main("--apply" in sys.argv)
