"""Import technical-data-sheet values from a reviewed CSV into products.

Two modes:
  default      only FILLS empty fields; existing values are kept
  --overwrite  the CSV wins: differing values are replaced (used for products we share with a
               reference source). Nothing is lost: each replaced value is kept in
               specs["_previous"], and a replaced CAS number is also kept as a CAS alias so
               searches for it still find the product.

Always: dry run unless --apply; idempotent; the source of every value is recorded in
specs["_sources"]. Both bookkeeping keys are hidden from the API.

CSV columns: product_id, source_url, and any of
  ci_number, chemical_class, appearance, hue, solubility, dye_content, light_fastness, wash_fastness,
  shade_hex (a #rrggbb reference colour),
  cas (or their_cas)        only checksum-valid CAS numbers are used

  python scripts/import_tds.py tds.csv                          # dry run, fill empty only
  python scripts/import_tds.py tds.csv --overwrite --apply      # CSV wins
  python scripts/import_tds.py tds.csv --overwrite --changes changes.csv   # also write what changed
"""
import csv
import json
import os
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from dotenv import load_dotenv  # noqa: E402

load_dotenv(ROOT / ".env")
from sqlalchemy import create_engine, text  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.core import cas  # noqa: E402
from app.db.session import database_url  # noqa: E402

COLUMN_FIELDS = ("cas_number", "ci_number", "appearance")  # real columns on products
SPEC_FIELDS = ("chemical_class", "hue", "solubility", "dye_content", "light_fastness", "wash_fastness", "shade_hex")


def read_rows(path: str) -> list[dict]:
    """One row per product: if a product appears twice (two source pages), the first non-empty value wins."""
    merged: dict[str, dict] = {}
    for r in csv.DictReader(open(path, encoding="utf-8-sig")):
        found = cas.normalize(r.get("cas") or r.get("their_cas"))
        r["cas_number"] = found[0] if found else ""
        m = merged.setdefault(r["product_id"], dict(r))
        for k, v in r.items():
            if v and not m.get(k):
                m[k] = v
    return list(merged.values())


def main(path: str, apply: bool, overwrite: bool, changes_path: str | None):
    if not os.environ.get("DATABASE_URL"):
        sys.exit("DATABASE_URL is not set")
    report, changes = Counter(), []
    with Session(create_engine(database_url())) as db:
        current = {r.id: r for r in db.execute(text(
            "SELECT id, name, cas_number, ci_number, appearance, specs FROM products")).mappings()}
        updates, aliases = [], []
        for row in read_rows(path):
            pid = int(row["product_id"])
            cur = current.get(pid)
            if cur is None:
                report["unknown product id (skipped)"] += 1
                continue
            specs = dict(cur["specs"] or {})
            sources, previous = dict(specs.get("_sources") or {}), dict(specs.get("_previous") or {})
            cols = {f: cur[f] for f in COLUMN_FIELDS}
            changed = False
            for f in COLUMN_FIELDS + SPEC_FIELDS:
                new = (row.get(f) or "").strip()
                if f == "ci_number" and not re.fullmatch(r"\d+([:.]\d+)?", new):
                    new = ""  # some sources put the dye name in this field; only real numbers count
                if f == "shade_hex":
                    new = new.lower()
                    if re.fullmatch(r"#[0-9a-f]{3}", new):
                        new = "#" + "".join(c * 2 for c in new[1:])
                    if not re.fullmatch(r"#[0-9a-f]{6}", new):
                        new = ""
                if not new:
                    continue
                old = cols[f] if f in COLUMN_FIELDS else specs.get(f)
                old_s = (str(old).strip() if old is not None else "")
                if f == "cas_number":
                    # our CAS already covers theirs (e.g. "61901-98-7/61910-95-9") -> nothing to do
                    if new in cas.normalize(old_s):
                        continue
                elif old_s == new:
                    continue
                if old_s and not overwrite:
                    report[f"{f}: differs, kept ours"] += 1
                    continue
                if old_s:
                    previous.setdefault(f, old_s)  # first original value is the one worth keeping
                    report[f"{f}: replaced"] += 1
                    if f == "cas_number":
                        aliases += [{"p": pid, "c": c} for c in cas.normalize(old_s) if c != new]
                else:
                    report[f"{f}: filled"] += 1
                changes.append({"product_id": pid, "product": cur["name"], "field": f, "old": old_s, "new": new,
                                "source_url": row.get("source_url", "")})
                if f in COLUMN_FIELDS:
                    cols[f] = new
                else:
                    specs[f] = new
                sources[f] = row.get("source_url", "")
                changed = True
            if changed:
                specs["_sources"] = sources
                if previous:
                    specs["_previous"] = previous
                updates.append({"id": pid, **cols, "specs": specs})
        if updates:
            db.execute(text("""
                UPDATE products p SET cas_number = r.cas_number, ci_number = r.ci_number,
                                      appearance = r.appearance, specs = r.specs
                FROM jsonb_to_recordset(CAST(:rows AS jsonb))
                     AS r(id int, cas_number text, ci_number text, appearance text, specs jsonb)
                WHERE p.id = r.id"""), {"rows": json.dumps(updates)})
        if aliases:
            db.execute(text("INSERT INTO cas_aliases (product_id, cas_number) VALUES (:p, :c) "
                            "ON CONFLICT (product_id, cas_number) DO NOTHING"), aliases)
        report["products updated"] = len(updates)
        report["old CAS kept as alias"] = len(aliases)
        print("\n".join(f"{v:6}  {k}" for k, v in sorted(report.items())))
        if changes_path:
            with open(changes_path, "w", newline="", encoding="utf-8-sig") as fh:
                w = csv.DictWriter(fh, fieldnames=["product_id", "product", "field", "old", "new", "source_url"])
                w.writeheader()
                w.writerows(changes)
            print(f"\n{len(changes)} changes written to {changes_path}")
        if apply:
            db.commit()
            print("\nAPPLIED.")
        else:
            db.rollback()
            print("\nDry run: nothing written. Re-run with --apply to commit.")


if __name__ == "__main__":
    argv = sys.argv[1:]
    changes_path = argv[argv.index("--changes") + 1] if "--changes" in argv else None
    files = [a for a in argv if not a.startswith("--") and a != changes_path]
    if not files:
        sys.exit(__doc__)
    main(files[0], "--apply" in argv, "--overwrite" in argv, changes_path)
