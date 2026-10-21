# Composable Data Stack: Ibis + DuckDB

The modern data science and data engineering baseline in Python centers on the **Composable Data Stack**: **Ibis** (`ibis-framework`) as the universal dataframe interface, **DuckDB** as the default embedded OLAP execution engine, and **Apache Arrow** (`pyarrow`) as the standardized zero-copy in-memory interchange format.

This architecture replaces the historically fragmented ecosystem of legacy Pandas, isolated Polars scripts, and 20+ incompatible database dialects with a cohesive, decoupled, write-once run-anywhere standard.

## Conditional engine: Apache DataFusion

**Keep DuckDB as the general local-analytics default; retain an existing compatible engine.** Apache DataFusion is an Arrow-native query engine library written in Rust, with SQL and DataFrame APIs. Consider it when embedding analytical queries in a Rust/Arrow application requires custom table providers, functions, optimizer rules or execution operators—not merely because another engine exists. Retrieve the conditional choice `reason-datafusion-embedded-analytics` from the [decision CSV](../../scripts/data/code-reasoning.csv); it is a candidate, not adoption authority or a performance ranking.

Python can use the `datafusion` package's `SessionContext` directly, or Ibis's optional `ibis-framework[datafusion]` backend through `ibis.datafusion.connect()`. These are documented integration routes, not a tested stack here. Backend interchangeability is conditional: verify required operations, types, null/timestamp/decimal semantics, connectors and extension needs on the selected versions. Ibis operation coverage and memtable behavior remain unverified here; the current backend page's unsupported-memtables badge and object-taking API listings do not establish actual compatibility. Do not assume the DuckDB examples or memory settings below apply unchanged.

Core DataFusion runs within one process using threads; it is not itself a distributed runtime, transactional application database, workflow orchestrator or provenance system. **Ballista** is a separate distributed platform built on DataFusion; **Comet** is a Spark accelerator. Neither is a default add-on: evaluate separately only for a justified cluster or existing Spark workload. DataFusion is not established here as universally faster than DuckDB or a replacement for a suitable DataFrame workflow.

### Agent-exposed queries and a bounded trial

- The application owns security. For untrusted SQL, reject unneeded DDL, DML and other statements using verified version-appropriate controls (Rust documents `SQLOptions`); keep path-based URL tables disabled unless required. Expose only intended registered sources and restrict filesystem access and object-store credentials. Do not assume the Python/Ibis route automatically applies Rust controls.
- Define CPU/concurrency, query timeout/cancellation, query-memory and spill-disk budgets. DataFusion's execution memory pool is not a hard bound on total application memory: use process/container limits when required. Spill support is operator-dependent; verify it for the actual query rather than promise out-of-memory safety.
- If packages or permitted runtime checks are unavailable, return the fit assessment and an explicit trial proposal; do not install dependencies or migrate automatically. Before an authorized trial, record exact Rust crate, Python package and Ibis versions for the chosen route. Compare representative identical inputs and output correctness under fixed resources, then end-to-end timing, peak memory, materialization and spill behavior against the existing engine. A proposed trial is not a benchmark result.

**Evidence status:** documentation checked 2026-10-22 from unversioned pages; no engine/Python/Ibis combination or operation matrix runtime-validated. Recheck on engine or Ibis/backend upgrades, a newly required operator/connector, and after the first 1–2 real uses; confirm correctness and resource bounds before promoting a default.

Sources: [DataFusion](https://datafusion.apache.org/), [positioning and execution scope](https://datafusion.apache.org/user-guide/faq.html), [Python](https://datafusion.apache.org/python/), [Ibis backend](https://ibis-project.org/backends/datafusion/) and [operation matrix](https://ibis-project.org/backends/support/matrix), [security and resource controls](https://datafusion.apache.org/library-user-guide/securing-datafusion.html), [Ballista](https://datafusion.apache.org/ballista/) and [Comet](https://datafusion.apache.org/comet/).

---

## 1. The Fragmentation Problem vs. The Composable Stack

### The Legacy Fragmented Landscape

For over a decade, Python data workflows were fractured across competing paradigms:

| Stack / Tool | How It Operated | Operational Friction |
|---|---|---|
| **Legacy Pandas** | In-memory, single-threaded, eager execution with explicit indexing | **5–10× memory multiplier** over raw file size; crashes with Out-Of-Memory (OOM) on datasets larger than RAM; idiosyncratic syntax (`loc`, `iloc`, `reset_index`, MultiIndex hell); no query pushdown. |
| **Isolated Polars** | Fast multi-threaded Rust engine, eager/lazy | Excellent local speed, but introduces **yet another proprietary DataFrame dialect** that cannot compile or push down operations to external databases, data lakes, or cloud warehouses. Teams rewrite logic to move to production. |
| **PySpark / Distributed** | Heavyweight JVM-based distributed cluster computing | Massive infrastructure overhead, JVM serialization costs, slow local prototyping, high cluster management bills. 95%+ of corporate data tasks processed on Spark actually fit comfortably on a single modern server. |
| **20+ Backend Dialects** | Writing raw SQL strings or ORMs per engine (Snowflake, BigQuery, ClickHouse, Postgres, Trino) | Dialect lock-in; code written for local testing (SQLite) does not match production SQL; no programmatic composability; high risk of string-concatenation errors. |

### The Composable Architecture

The Composable Data Stack separates concerns into three clean layers:

```
┌────────────────────────────────────────────────────────┐
│   DataFrame API (User Intent)                         │
│   Ibis (ibis-framework) — Pythonic, Typed, Lazy        │
└──────────────────────────┬─────────────────────────────┘
                           │ Compiles to optimized plan / SQL
┌──────────────────────────▼─────────────────────────────┐
│   Execution Engine (Physical Compute)                  │
│   DuckDB (Local / In-Process / Embedded OLAP)         │
│   OR Pushdown to: Snowflake, BigQuery, ClickHouse,     │
│                   PostgreSQL, Trino, Databricks        │
└──────────────────────────┬─────────────────────────────┘
                           │ Zero-copy columnar memory layout
┌──────────────────────────▼─────────────────────────────┐
│   In-Memory Interchange & Downstream ML                │
│   Apache Arrow (pyarrow) → Scikit-learn, PyTorch, XGB  │
└────────────────────────────────────────────────────────┘
```

1. **Analytical Intent (Ibis)**: You express data transformations using a unified, clean Python dataframe API. Ibis constructs a directed acyclic graph (DAG) of relational expressions without executing immediately.
2. **Physical Execution (DuckDB / Cloud Warehouses)**: Ibis compiles expressions into the target engine's native relational operators or optimized SQL dialect and executes in-engine. Locally, DuckDB provides multi-threaded vectorized execution with out-of-core streaming.
3. **Zero-Copy Interchange (Arrow)**: Results stream back as Apache Arrow RecordBatches or Tables, allowing direct consumption by NumPy, Pandas, Polars, or ML frameworks without data copying or serialization penalties.

---

## 2. Core Capabilities of Ibis + DuckDB

### Ibis: The Universal Portable DataFrame

- **Backend-Agnostic**: Code written in Ibis runs identically on DuckDB, MotherDuck, Snowflake, BigQuery, ClickHouse, PostgreSQL, Trino, Polars, and PySpark. Switching backends requires changing only `con = ibis.connect(...)`.
- **True Lazy Evaluation**: Expressions are relational plans. Projections, filters, and aggregations are automatically pruned and pushed down to the underlying engine.
- **Composable and Type-Safe**: Ibis expressions are standard Python objects that can be factored into reusable functions, combined with Python control flow, and statically analyzed.

### DuckDB: SQLite for Analytical Workloads

- **In-Process & Zero Infrastructure**: Installs via a single pip/uv package with no external server, daemon, or dependencies.
- **Out-Of-Core Streaming Execution**: DuckDB processes datasets significantly larger than physical RAM (e.g. querying a 200GB Parquet collection on a 16GB laptop) by streaming blocks from disk/storage, spilling intermediate partitions automatically when memory thresholds are met.
- **Zero-ETL Direct Querying**: Queries Parquet, CSV, JSON, Arrow, Iceberg, and Delta Lake tables directly from local disk or cloud object stores (S3, GCS, Azure, Cloudflare R2, HTTP, Hugging Face) without pre-ingesting data into database tables.
- **Vectorized Columnar Engine**: SIMD-optimized, multi-threaded C++ execution that outpaces Pandas by 10–100× on analytical queries (GROUP BY, JOIN, WINDOW).

---

## 3. Standard Patterns and Code Recipes

### Dependency Setup (`uv`)

```bash
# Add Ibis with DuckDB backend and PyArrow support
uv add "ibis-framework[duckdb]" pyarrow
```

### Pattern 1: Initializing and Direct File Querying

Avoid loading full files into memory upfront. Point Ibis + DuckDB directly at files or directories:

```python
import ibis

# Connect to in-memory DuckDB (or persistent: ibis.duckdb.connect("analytics.duckdb"))
con = ibis.duckdb.connect()

# Query local or remote files directly without ETL ingestion
# Supports globbing, partitioning, and remote URLs (s3://, https://)
events = con.read_parquet("data/events/*.parquet")
users = con.read_csv("data/users.csv")
```

### Pattern 2: Relational Transformations (Filter, Join, Aggregate)

Expressions remain lazy until an explicit materialization boundary:

```python
import ibis

# Define transformation pipeline (zero execution happens here)
active_users = users.filter(users.status == "active")

summary = (
    events
    .join(active_users, events.user_id == active_users.id, how="inner")
    .filter(events.event_time >= ibis.date("2026-01-01"))
    .group_by(["country", "device_type"])
    .aggregate(
        total_events=events.count(),
        unique_users=events.user_id.nunique(),
        total_revenue=events.revenue.sum(),
        avg_revenue=events.revenue.mean(),
    )
    .mutate(revenue_per_user=ibis._.total_revenue / ibis._.unique_users)
    .order_by(ibis.desc("total_revenue"))
)

# Inspect the compiled SQL query without executing
print(ibis.to_sql(summary))
```

### Pattern 3: Window Functions and Analytics

```python
# Compute rolling metrics and rank without index gymnastics
w = ibis.window(
    group_by="country",
    order_by="event_date",
    preceding=6,  # 7-day rolling window
    following=0,
)

rolling_stats = summary.mutate(
    rolling_7d_revenue=summary.total_revenue.mean().over(w),
    country_rank=ibis.row_number().over(
        ibis.window(group_by="country", order_by=ibis.desc("total_revenue"))
    ),
)
```

### Pattern 4: Materialization Boundaries

Only materialize when data leaves the pipeline to an external consumer or disk:

```python
# 1. Stream directly to Parquet on disk (out-of-core, constant memory)
con.to_parquet(rolling_stats, "output/rolling_stats.parquet")

# 2. Materialize to Apache Arrow Table (zero-copy for downstream ML)
arrow_table = rolling_stats.to_pyarrow()

# 3. Small summary to pandas/in-memory records for reporting
df = rolling_stats.limit(100).execute()
```

### Pattern 5: Multi-Backend Portability (Dev to Prod)

To switch the execution from local DuckDB to cloud Snowflake or BigQuery, only the connection factory changes. All business transformation functions remain untouched:

```python
import os
import ibis

def get_connection(env: str = "dev"):
    if env == "dev":
        return ibis.duckdb.connect()
    elif env == "prod":
        return ibis.snowflake.connect(
            user=os.environ["SNOWFLAKE_USER"],
            password=os.environ["SNOWFLAKE_PASSWORD"],
            account=os.environ["SNOWFLAKE_ACCOUNT"],
            database="PROD_DW",
            schema="ANALYTICS",
        )
    raise ValueError(f"Unknown environment: {env}")

# Pipeline code is 100% engine-agnostic:
def build_kpi_mart(con: ibis.BaseBackend) -> ibis.Table:
    t = con.table("raw_transactions")
    return (
        t.filter(t.is_valid)
        .group_by("merchant_id")
        .aggregate(gmv=t.amount.sum())
    )
```

---

## 4. Memory Management & Out-Of-Core Processing

When operating on datasets larger than RAM (e.g. 50GB–500GB on a single machine):

```python
import ibis

con = ibis.duckdb.connect()

# Configure DuckDB runtime parameters for bounded resource environments
con.raw_sql("""
    SET memory_limit = '16GB';
    SET max_temp_directory_size = '100GB';
    SET temp_directory = '/tmp/duckdb_temp';
    SET threads = 8;
""")
```

- **Avoid `.execute()` on large tables**: Calling `.execute()` pulls the entire result set into a Python in-memory Pandas dataframe, defeating out-of-core execution and causing OOM.
- **Stream sinks**: Use `con.to_parquet(...)` or `con.to_csv(...)` to stream query results directly to disk without intermediate RAM accumulation.

---

## 5. Anti-Patterns & Migration Guide

| Anti-Pattern (Legacy / Fragile) | Why It Fails | Modern Composable Pattern |
|---|---|---|
| `pd.read_csv("massive.csv")` or `pd.read_parquet(...)` | Loads the entire file into eager Python objects; uses 5–10× memory; crashes on files > RAM. | `con.read_parquet("massive.parquet")` or `ibis.read_csv(...)` for lazy, scanned, out-of-core execution. |
| `for index, row in df.iterrows(): ...` or `.apply(fn, axis=1)` | Row-level Python interpreter loop; catastrophically slow (100–1000× slower). | Vectorized Ibis expressions or `ibis.udf.scalar.pyarrow` for batched native execution. |
| MultiIndex slicing: `df.set_index(["a", "b"]).loc[("x", "y")]` | Index-state bugs, unreadable maintenance, breaks relational contracts. | Relational filtering: `t.filter((t.a == "x") & (t.b == "y"))`. |
| Handcrafted string SQL: `f"SELECT * FROM tbl WHERE date = '{dt}'"` | Syntax errors, SQL injection risk, untestable logic, dialect coupling. | Composable Ibis relational expressions: `t.filter(t.date == dt)`. |
| Spinning up PySpark / EMR cluster for a 150GB dataset | Hundreds of dollars in cloud bills; cluster provisioning lag; complex JVM debugging. | Single DuckDB instance with out-of-core streaming finishes in minutes on a standard developer workstation or small VM. |
| Tightly coupling pipeline logic to Polars-only expressions | Cannot push compute into warehouse or remote database; requires complete rewrite when moving to cloud DW. | Standard Ibis expressions: run locally on DuckDB, push down to warehouse in production. |

---

## 6. Verification Checklist

Before finalizing any data transformation, pipeline script, or analytical routine:

- [ ] Data is read via lazy scans (`con.read_parquet`, `con.read_csv`), not eager in-memory loading.
- [ ] No row-level iteration (`iterrows`, `itertuples`, row `apply`) is present.
- [ ] Transformations use composable Ibis expressions rather than string-interpolated SQL.
- [ ] Materialization boundaries (`.execute()`, `.to_pyarrow()`, `.to_parquet()`) are explicit and placed at terminal sinks.
- [ ] Pipeline logic accepts `con: ibis.BaseBackend` so compute can be swapped without rewriting transformation logic.
- [ ] Large result sets stream directly to disk sinks rather than collecting in memory.
