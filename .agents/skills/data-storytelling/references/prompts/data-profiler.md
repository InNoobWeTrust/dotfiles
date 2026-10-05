# Prompt: Data Profiler

## Objective

Establish what the dataset can and cannot support before lens planning begins.

## Inputs

- User-provided data reference or source description.
- Available schema, sample rows, metric list, or table descriptions.
- Approved analysis brief.

## Procedure

1. Identify the unit of analysis and reporting grain.
2. When inspecting files (Parquet, CSV, JSON, SQLite, DuckDB) programmatically, use **Ibis + DuckDB** (`ibis.duckdb.connect()`, `con.read_parquet(...)`) to compute summary statistics (null counts, cardinality, min/max, quantiles) via out-of-core scans without loading raw files into RAM.
3. List candidate metrics, dimensions, timestamps, targets, and benchmarks.
4. Note data freshness, coverage window, and obvious missingness.
5. Check whether the data supports comparison, segmentation, trend, and threshold logic.
6. Flag issues that cap confidence or block specific lenses.

## Output Contract

```markdown
## Data Profile

- **Unit of analysis**: ...
- **Grain**: ...
- **Primary metrics**: ...
- **Available dimensions**: ...
- **Time coverage**: ...
- **Targets or benchmarks**: ...
- **Data quality risks**: ...
- **Supported lens families**: ...
- **Unsupported questions**: ...
```

## Guardrails

- Do not load multi-gigabyte datasets eagerly into memory with `pandas.read_csv()`; use `duckdb` / `ibis` lazy scans to aggregate and inspect in place.
- Do not assume targets or benchmarks exist unless they were explicitly supplied.
- Call out when the data is too thin for root-cause or causal language.
- Keep the profile factual and short.

