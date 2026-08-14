#!/usr/bin/env python
"""Reproducible benchmark harness for catalog reads, searches, and CSV exports."""

from __future__ import annotations

import argparse
import asyncio
import csv
import io
import json
import os
import platform
import statistics
import sys
import time
import tracemalloc
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Callable

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = REPO_ROOT / "backend"
DEFAULT_RESULTS_DIR = BACKEND_ROOT / "benchmarks" / "results"
DEFAULT_DB = DEFAULT_RESULTS_DIR / "catalog_export_benchmark.sqlite3"
DEFAULT_WORKLOADS = BACKEND_ROOT / "benchmarks" / "workloads.json"
CATALOG_DATA = REPO_ROOT / "kewin-chem-connect-main" / "public" / "data"

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

os.environ.setdefault("DATABASE_URL", f"sqlite:///{DEFAULT_DB}")

from fastapi.encoders import jsonable_encoder  # noqa: E402
from sqlalchemy import create_engine, or_  # noqa: E402
from sqlalchemy.orm import Session, sessionmaker  # noqa: E402

from app.api.v1.endpoints import admin_sample_requests, products  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.models import Category, Product, SampleRequest, Subcategory  # noqa: E402


CATEGORY_MAPPING = {
    "dyes-intermediates": {
        "name": "Dyes & Intermediates",
        "slug": "dyes-intermediates",
        "folder": "dyes-intermediates",
        "subcategories": {
            "AcidDyesTable": ("Acid Dyes", "acid-dyes"),
            "BasicDyesTable": ("Basic Dyes", "basic-dyes"),
            "ReactiveDyesTable": ("Reactive Dyes", "reactive-dyes"),
            "FoodAndLakeColor": ("Food & Lake Colors", "food-lake-colors"),
            "direct_dyes_list.json": ("Direct Dyes", "direct-dyes"),
            "solvent_dyes_list.json": ("Solvent Dyes", "solvent-dyes"),
            "intermediates_list.json": ("Intermediates", "intermediates"),
        },
    },
    "food-pharmacolors": {
        "name": "Food & Pharma Colors",
        "slug": "food-pharmacolors",
        "folder": "food-pharmacolors",
        "subcategories": {
            "injectable-OintmentsTable": ("Injectable & Ointments", "injectable-ointments"),
            "nasalDrops-OralSuspensionsTable": (
                "Nasal Drops & Oral Suspensions",
                "nasal-drops-oral-suspensions",
            ),
            "nutraceuticalsTable": ("Nutraceuticals", "nutraceuticals"),
            "tablets-CapsulesTable": ("Tablets & Capsules", "tablets-capsules"),
            "veterinaryFormulationTable": ("Veterinary Formulations", "veterinary-formulations"),
        },
    },
    "shades-pigments": {
        "name": "Shades & Pigments",
        "slug": "shades-pigments",
        "folder": "shades-Pigments",
        "subcategories": {
            "organic-Pigments": ("Organic Pigments", "organic-pigments"),
        },
    },
}

STATUSES = ("pending", "approved", "rejected", "in_review")
COUNTRIES = ("US", "India", "Germany", "Brazil", "Japan", "South Africa")
COMPANY_PREFIXES = ("Acme", "Color", "Kewin", "Nova", "Vertex", "Summit")


@dataclass(frozen=True)
class ProductSeed:
    name: str
    category_slug: str
    subcategory_slug: str
    cas_number: str | None
    molecular_formula: str | None
    molecular_weight: str | None
    appearance: str | None
    description: str | None


def slugify(value: str) -> str:
    return (
        value.strip()
        .lower()
        .replace("&", "and")
        .replace("/", "-")
        .replace("_", "-")
        .replace(" ", "-")
    )


def load_json_records(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if isinstance(data, dict):
        for key in ("data", "items", "rows", "list"):
            if isinstance(data.get(key), list):
                data = data[key]
                break
        else:
            return []
    if not isinstance(data, list):
        return []
    return [item for item in data if isinstance(item, dict)]


def clean_text(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text or text.lower() in {"-", "nan", "n/a", "none", "no data available in table"}:
        return None
    return text


def first_value(item: dict[str, Any], keys: tuple[str, ...]) -> str | None:
    for key in keys:
        value = clean_text(item.get(key))
        if value:
            return value
    return None


def product_seed_from_record(
    item: dict[str, Any],
    *,
    category_slug: str,
    subcategory_slug: str,
    form: str | None,
) -> ProductSeed | None:
    name = first_value(item, ("ProductName", "Product Name", "C.I Name", "Name", "name"))
    if not name or name.lower() == "product name":
        return None

    description_parts = []
    for key in ("Strength", "Presentation", "Dosage Form", "Therapeutic Segments", "Shade"):
        value = clean_text(item.get(key))
        if value:
            description_parts.append(f"{key}: {value}")
    if form:
        description_parts.append(f"Form: {form}")

    return ProductSeed(
        name=name,
        category_slug=category_slug,
        subcategory_slug=subcategory_slug,
        cas_number=first_value(item, ("CAS No.", "CAS No", "CAS", "Cas No")),
        molecular_formula=first_value(item, ("Molecular Formula", "Formula")),
        molecular_weight=first_value(item, ("Molecular Weight", "Mol. Wt.", "Mol Wt")),
        appearance=first_value(item, ("Appearance", "Physical Appearance", "Shade")),
        description="; ".join(description_parts) if description_parts else None,
    )


def load_catalog_seed() -> list[ProductSeed]:
    seeds: list[ProductSeed] = []
    for category in CATEGORY_MAPPING.values():
        category_path = CATALOG_DATA / category["folder"]
        for entry_name, (_, subcategory_slug) in category["subcategories"].items():
            entry_path = category_path / entry_name
            json_files = sorted(entry_path.glob("*.json")) if entry_path.is_dir() else [entry_path]
            for json_file in json_files:
                if not json_file.exists():
                    continue
                form = json_file.stem.replace("_", " ").replace("-", " ").title()
                for item in load_json_records(json_file):
                    seed = product_seed_from_record(
                        item,
                        category_slug=category["slug"],
                        subcategory_slug=subcategory_slug,
                        form=form,
                    )
                    if seed:
                        seeds.append(seed)
    if not seeds:
        raise RuntimeError(f"No catalog seed rows found under {CATALOG_DATA}")
    return seeds


def recreate_database(database_url: str) -> sessionmaker:
    engine = create_engine(database_url)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


def seed_catalog(db: Session, seeds: list[ProductSeed], multiplier: int) -> list[Product]:
    categories: dict[str, Category] = {}
    subcategories: dict[str, Subcategory] = {}

    for category in CATEGORY_MAPPING.values():
        obj = Category(name=category["name"], slug=category["slug"])
        db.add(obj)
        db.flush()
        categories[category["slug"]] = obj

        for _, (subcategory_name, subcategory_slug) in category["subcategories"].items():
            subcategory = Subcategory(
                name=subcategory_name,
                slug=subcategory_slug,
                category_id=obj.id,
            )
            db.add(subcategory)
            db.flush()
            subcategories[subcategory_slug] = subcategory

    products_created: list[Product] = []
    for duplicate in range(multiplier):
        suffix = "" if duplicate == 0 else f" Benchmark Variant {duplicate + 1:03d}"
        for seed in seeds:
            product = Product(
                name=f"{seed.name}{suffix}",
                slug=slugify(f"{seed.name}{suffix}"),
                cas_number=seed.cas_number,
                molecular_formula=seed.molecular_formula,
                molecular_weight=seed.molecular_weight,
                appearance=seed.appearance,
                description=seed.description,
                category_id=categories[seed.category_slug].id,
                subcategory_id=subcategories[seed.subcategory_slug].id,
            )
            db.add(product)
            products_created.append(product)
    db.commit()
    return products_created


def seed_sample_requests(db: Session, products_created: list[Product], total: int) -> None:
    base_time = datetime(2026, 1, 1, tzinfo=timezone.utc)
    for index in range(total):
        product = products_created[index % len(products_created)]
        subcategory = db.get(Subcategory, product.subcategory_id)
        category = db.get(Category, subcategory.category_id) if subcategory else None
        status = STATUSES[index % len(STATUSES)]
        company_prefix = COMPANY_PREFIXES[index % len(COMPANY_PREFIXES)]
        db.add(
            SampleRequest(
                category_slug=category.slug if category else "unknown",
                subcategory_slug=subcategory.slug if subcategory else "unknown",
                product_id=product.id,
                product_name=product.name,
                attributes={"benchmark_index": index, "tier_shape": "synthetic"},
                quantity=f"{(index % 25) + 1} kg",
                use_case=f"Benchmark use case {index % 17}",
                name=f"Benchmark Requester {index:06d}",
                company=f"{company_prefix} Color Labs {index % 100:02d}",
                email=f"benchmark-{index:06d}@example.invalid",
                phone=f"+1-555-{index % 10000:04d}",
                country=COUNTRIES[index % len(COUNTRIES)],
                send_copy_to_requester=False,
                status=status,
                assigned_to=f"admin-{index % 7}" if index % 3 == 0 else None,
                internal_notes=f"benchmark-note-{index}" if index % 11 == 0 else None,
                created_at=base_time + timedelta(minutes=index),
            )
        )
        if index and index % 1000 == 0:
            db.flush()
    db.commit()


def dataset_cardinalities(db: Session) -> dict[str, int]:
    return {
        "categories": db.query(Category).count(),
        "subcategories": db.query(Subcategory).count(),
        "products": db.query(Product).count(),
        "sample_requests": db.query(SampleRequest).count(),
    }


def response_bytes(payload: Any) -> int:
    encoded = jsonable_encoder(payload)
    return len(json.dumps(encoded, sort_keys=True, default=str).encode("utf-8"))


async def collect_streaming_response(response: Any) -> bytes:
    chunks: list[bytes] = []
    async for chunk in response.body_iterator:
        if isinstance(chunk, bytes):
            chunks.append(chunk)
        else:
            chunks.append(str(chunk).encode("utf-8"))
    return b"".join(chunks)


def count_catalog_matches(db: Session, params: dict[str, Any]) -> int:
    query = db.query(Product)
    query = products._apply_category_filters(  # noqa: SLF001
        query,
        params.get("category_slug"),
        params.get("subcategory_slug"),
    )
    return query.count()


def count_search_matches(db: Session, params: dict[str, Any]) -> int:
    query = clean_text(params.get("q"))
    if not query or len(query) < 2:
        return 0
    like = f"%{query}%"
    return (
        db.query(Product)
        .filter(or_(Product.name.ilike(like), Product.cas_number.ilike(like)))
        .count()
    )


def count_export_matches(db: Session, params: dict[str, Any]) -> int:
    query = db.query(SampleRequest)
    query = admin_sample_requests._apply_filters(  # noqa: SLF001
        query,
        params.get("q"),
        params.get("status"),
        params.get("date_from"),
        params.get("date_to"),
    )
    return query.count()


def run_catalog(db: Session, params: dict[str, Any]) -> dict[str, Any]:
    payload = products.read_products(db=db, **params)
    return {
        "payload": payload,
        "returned_rows": len(payload),
        "matched_rows": count_catalog_matches(db, params),
        "response_bytes": response_bytes(payload),
    }


def run_search(db: Session, params: dict[str, Any]) -> dict[str, Any]:
    payload = products.search_products(db=db, **params)
    return {
        "payload": payload,
        "returned_rows": len(payload),
        "matched_rows": count_search_matches(db, params),
        "response_bytes": response_bytes(payload),
    }


def run_export(db: Session, params: dict[str, Any]) -> dict[str, Any]:
    response = admin_sample_requests.export_sample_requests(db=db, **params)
    body = asyncio.run(collect_streaming_response(response))
    rows = list(csv.reader(io.StringIO(body.decode("utf-8"))))
    return {
        "payload": None,
        "returned_rows": max(len(rows) - 1, 0),
        "matched_rows": count_export_matches(db, params),
        "response_bytes": len(body),
    }


def percentile(values: list[float], pct: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = max(0, min(len(ordered) - 1, round((pct / 100) * (len(ordered) - 1))))
    return ordered[index]


def measure(
    db: Session,
    workload: dict[str, Any],
    *,
    warmups: int,
    repetitions: int,
) -> dict[str, Any]:
    runners: dict[str, Callable[[Session, dict[str, Any]], dict[str, Any]]] = {
        "catalog_read": run_catalog,
        "search": run_search,
        "csv_export": run_export,
    }
    runner = runners[workload["kind"]]
    params = workload.get("params", {})

    for _ in range(warmups):
        runner(db, params)

    durations_ms: list[float] = []
    peaks: list[int] = []
    last_result: dict[str, Any] | None = None
    for _ in range(repetitions):
        tracemalloc.start()
        start = time.perf_counter()
        last_result = runner(db, params)
        duration_ms = (time.perf_counter() - start) * 1000
        _, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        durations_ms.append(duration_ms)
        peaks.append(peak)

    assert last_result is not None
    return {
        "name": workload["name"],
        "kind": workload["kind"],
        "case": workload["case"],
        "tier": workload["tier"],
        "params": params,
        "first_latency_ms": round(durations_ms[0], 3),
        "total_latency_ms": round(sum(durations_ms), 3),
        "p50_latency_ms": round(statistics.median(durations_ms), 3),
        "p95_latency_ms": round(percentile(durations_ms, 95), 3),
        "peak_memory_bytes": max(peaks),
        "matched_rows": last_result["matched_rows"],
        "returned_rows": last_result["returned_rows"],
        "response_bytes": last_result["response_bytes"],
        "iterations": repetitions,
    }


def benchmark_environment(database_url: str) -> dict[str, Any]:
    return {
        "python": platform.python_version(),
        "platform": platform.platform(),
        "processor": platform.processor(),
        "database_url": database_url,
        "cwd": str(REPO_ROOT),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True, default=str) + "\n", encoding="utf-8")


def write_markdown(path: Path, payload: dict[str, Any]) -> None:
    lines = [
        "# Catalog and Export Benchmark Results",
        "",
        f"Generated: `{payload['environment']['generated_at']}`",
        f"Database: `{payload['environment']['database_url']}`",
        "",
        "## Dataset Cardinalities",
        "",
        "| Tier | Categories | Subcategories | Products | Sample Requests |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]
    for tier, counts in payload["dataset_cardinalities"].items():
        lines.append(
            f"| {tier} | {counts['categories']} | {counts['subcategories']} | "
            f"{counts['products']} | {counts['sample_requests']} |"
        )

    lines.extend(
        [
            "",
            "## Workload Results",
            "",
            "| Workload | Tier | Case | First ms | Total ms | p50 ms | p95 ms | Peak bytes | Matched | Returned | Response bytes |",
            "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
        ]
    )
    for result in payload["results"]:
        lines.append(
            f"| {result['name']} | {result['tier']} | {result['case']} | "
            f"{result['first_latency_ms']} | {result['total_latency_ms']} | "
            f"{result['p50_latency_ms']} | {result['p95_latency_ms']} | "
            f"{result['peak_memory_bytes']} | {result['matched_rows']} | "
            f"{result['returned_rows']} | {result['response_bytes']} |"
        )

    lines.extend(["", "## Low-confidence Assumptions", ""])
    for assumption in payload["assumptions"]:
        if assumption["confidence"] == "low":
            lines.append(f"- {assumption['note']}")

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workloads", type=Path, default=DEFAULT_WORKLOADS)
    parser.add_argument("--tier", choices=("small", "median", "worst", "all"), default="all")
    parser.add_argument("--database", type=Path, default=DEFAULT_DB)
    parser.add_argument(
        "--json-output",
        type=Path,
        default=DEFAULT_RESULTS_DIR / "catalog_export_benchmark.json",
    )
    parser.add_argument(
        "--markdown-output",
        type=Path,
        default=DEFAULT_RESULTS_DIR / "catalog_export_benchmark.md",
    )
    parser.add_argument("--repetitions", type=int, default=None)
    parser.add_argument("--warmups", type=int, default=None)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    workloads_doc = json.loads(args.workloads.read_text(encoding="utf-8"))
    policy = workloads_doc["environment_policy"]
    repetitions = args.repetitions or int(policy["measured_repetitions"])
    warmups = args.warmups if args.warmups is not None else int(policy["warmup_runs"])
    selected_tiers = tuple(workloads_doc["tiers"]) if args.tier == "all" else (args.tier,)
    database_url = f"sqlite:///{args.database.resolve()}"

    args.database.parent.mkdir(parents=True, exist_ok=True)
    os.environ["DATABASE_URL"] = database_url
    SessionLocal = recreate_database(database_url)

    seed_rows = load_catalog_seed()
    all_results: list[dict[str, Any]] = []
    all_cardinalities: dict[str, dict[str, int]] = {}

    for tier_name in selected_tiers:
        tier = workloads_doc["tiers"][tier_name]
        SessionLocal = recreate_database(database_url)
        with SessionLocal() as db:
            products_created = seed_catalog(db, seed_rows, int(tier["catalog_multiplier"]))
            seed_sample_requests(db, products_created, int(tier["sample_requests"]))
            all_cardinalities[tier_name] = dataset_cardinalities(db)
            tier_workloads = [w for w in workloads_doc["workloads"] if w["tier"] == tier_name]
            for workload in tier_workloads:
                result = measure(db, workload, warmups=warmups, repetitions=repetitions)
                result["dataset_cardinalities"] = all_cardinalities[tier_name]
                all_results.append(result)

    payload = {
        "workload_version": workloads_doc["version"],
        "environment": benchmark_environment(database_url),
        "policy": {
            **policy,
            "warmup_runs": warmups,
            "measured_repetitions": repetitions,
        },
        "tiers": {name: workloads_doc["tiers"][name] for name in selected_tiers},
        "assumptions": workloads_doc["assumptions"],
        "dataset_cardinalities": all_cardinalities,
        "results": all_results,
    }
    write_json(args.json_output, payload)
    write_markdown(args.markdown_output, payload)
    print(f"Wrote {args.json_output}")
    print(f"Wrote {args.markdown_output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
