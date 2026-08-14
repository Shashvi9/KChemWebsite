# Catalog and Export Benchmark Harness

This harness creates an isolated SQLite database, loads production-shaped catalog rows from
`kewin-chem-connect-main/public/data`, adds deterministic synthetic `SampleRequest` rows, and measures
the existing backend catalog/search/admin CSV export endpoint functions.

It does not modify production database settings, endpoint behavior, API contracts, or schema.

## Run

From the repository root:

```bash
python backend/benchmarks/catalog_export_harness.py --tier all
```

Default outputs:

- Machine-readable JSON: `backend/benchmarks/results/catalog_export_benchmark.json`
- Human-readable Markdown: `backend/benchmarks/results/catalog_export_benchmark.md`
- Isolated SQLite database: `backend/benchmarks/results/catalog_export_benchmark.sqlite3`

Useful options:

```bash
python backend/benchmarks/catalog_export_harness.py --tier small --repetitions 3
python backend/benchmarks/catalog_export_harness.py --tier worst --database /tmp/catalog-export.sqlite3
python backend/benchmarks/catalog_export_harness.py --workloads backend/benchmarks/workloads.json
```

## Workloads

`workloads.json` defines small, median, and worst-case workloads for:

- filtered and broad catalog reads
- selective, common, and no-hit searches
- filtered and unfiltered CSV exports

Each run records environment details, dataset cardinalities, warm-up/repetition policy, resource-budget
assumptions, latency, traced Python allocation peak, matched rows, returned rows, and response bytes.
