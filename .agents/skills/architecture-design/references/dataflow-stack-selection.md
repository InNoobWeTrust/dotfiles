# Inspectable Dataflow Stack Selection

## Scope and outcome

Use when choosing tools for analytical/scientific pipelines, untangling notebook transformations, or when a user wants a code-derived DAG and auditable data flow. This is a focused selection guide, not a mandate to run the enterprise data-architecture workflow or adopt a framework.

**Inputs:** repository conventions, representative transformation code, source/output contracts, execution environment, and the user's inspection needs. If missing, inspect a small representative path or ask; do not assume the domain from a repository name.

**Output:** a short recommendation containing the current flow, the visibility gap, the smallest adequate option, a rejected alternative with its cost, and an audit/verification sketch. Stop there when asked only for research or suggestions. Obtain informed agreement before changing stack, environment, execution semantics, or rewriting a consumer interface. Ask whether backward compatibility is required before a rewrite; do not invent compatibility shims.

## Selection sequence

1. **Map one real flow:** sources → transformations → consumers; name where I/O, mutation, materialization, and failures occur. Cite current code separately from proposed structure.
2. **Identify the missing visibility:** notebook-cell dependencies, Python-function dependencies, relation/model dependencies, column expressions, or actual run provenance. These are different views.
3. **Compare the smallest adequate options** below. Repository constraints win. Explain material choices before asking for a decision; do not install a preferred tool merely because it is listed here.
4. **Define an inspection contract:** graph plus source identity, node contracts, checks, and run receipts. Propose one bounded pilot, not a whole-repository migration.

## What each layer owns

| Layer | Purpose | Not a substitute for |
|---|---|---|
| DuckDB / other engine | Execute relational queries | Pipeline structure or result provenance |
| Ibis | Compose typed relational expressions in Python; defer execution until an explicit boundary | A complete multi-artifact DAG or automatic backend equivalence |
| marimo | Reactive notebook dependencies and interactive exploration | Internal lineage inside one large SQL/Python cell |
| Hamilton | Derive a computation DAG from Python function names and parameters | A database engine, batch scheduler, or automatic audit of hidden effects |
| dbt | Declare and build relational models with dependencies, tests, and documentation | General-purpose ingestion, streaming coordination, or cluster lifecycle management |
| Dask / Slurm / workflow scheduler | Parallel/distributed execution or job lifecycle | Proof that a scientific result is correct or reproducible |

Retain existing execution tools unless there is a measured problem. A graph framework does not remove sequential decompression bottlenecks or automatically justify more workers.

## Decision table

| Option | Prefer when | What becomes inspectable | Costs / reject when |
|---|---|---|---|
| **Plain functions + existing SQL/Ibis + marimo** | Small stable pipeline; named modules and an explicit top-level flow already suffice | Function contracts, expression plans, notebook-cell graph | Cross-module provenance remains manual; a large opaque cell/SQL batch still hides dependencies. Reject only when that gap actually obstructs review. |
| **Hamilton, optionally returning Ibis expressions** | Branching reusable Python transformations, feature/ML preparation, or several outputs sharing intermediates | Function/node DAG; requested-output execution graph; upstream/downstream impact | Parameter/name wiring is an extra convention; decorators and giant nodes can obscure logic. Hidden reads, shared mutation, or resources inside nodes weaken the graph. Skip for a short linear script. |
| **dbt + DuckDB/warehouse** | SQL-first relations with stable grains, shared consumers, model tests, and documentation needs | Model DAG via `ref`/`source`, compiled SQL, declared tests, manifest dependencies | Project/YAML/Jinja/config overhead; incremental models add state and invalidation complexity. Poor fit for per-record loops, arbitrary Python research, model training, or resource-owning scanners. |
| **Hamilton + dbt** | Both substantial Python/artifact flow and a substantial SQL-model layer independently need structure | Python graph plus SQL graph with an explicit artifact boundary | Two graphs, environments/configuration surfaces, and failure owners. Use only if one tool cannot cover the demonstrated gap; never duplicate the same transformation in both. |

**Default:** improve names, module boundaries, and explicit inputs/outputs first. Add Hamilton for a demonstrated Python dependency gap; add dbt for a demonstrated relational modeling/testing gap. Do not force SQL-first work through Ibis, or force Python-first work into dbt, merely to standardize a diagram.

### Hamilton-specific guardrails

- Name nodes after meaningful data/products, not generic `step_1` wrappers. Use typed parameters/returns and small inspectable functions; helpers are fine, but consequential dependencies must not disappear inside helper/global reads.
- Pure transformations should not mutate shared inputs. Hamilton recommends immutability but does **not** enforce it. Keep loaders, savers, and resource ownership explicit; verify cleanup, retry, and failure semantics at those boundaries.
- Generate a graph from actual definitions and, when useful, requested outputs/inputs/overrides (`display_all_functions` / `visualize_execution`). Label it as a definition or planned-execution graph, not evidence of a successful run. Graph construction should not invoke transformation bodies; module imports must still be free of unintended downloads, training, or other expensive effects.
- Returning Ibis expressions can expose a Python DAG while leaving relational work lazy in DuckDB. Materialize deliberately at outputs/model/display boundaries; inspect compiled SQL/query plans separately. A function graph is not necessarily column-level lineage.
- Leave caching off unless reuse is required and invalidation is specified. The same file path with changed contents can produce stale cached results. Supply trustworthy content/revision identities or recompute loaders; test this case. Code/dependency hashing alone is not complete external-data provenance.
- Savers/materializers may overwrite outputs or be skipped on cache hits. Preserve the repository's no-overwrite, receipt, and side-effect contracts explicitly. No hosted tracking UI is required merely to use the DAG; do not upload data/metadata without approval.

### dbt-specific guardrails

- Use `source` for declared input relations and `ref` for model dependencies, rather than hard-coded downstream relation names. Document each model's **grain** (what one row represents), key, units, join cardinality, and null policy.
- Prefer direct, readable SQL models to deeply nested macros. Add generic data tests only where their assumptions hold; add custom checks for conservation totals, join fan-out, ranges, and domain invariants. Passing tests do not establish biological validity or source independence.
- Keep definition artifacts (manifest/compiled SQL/docs) separate from run artifacts (run results, test results, source receipts). The model DAG is not automatically column-level or row-level lineage.
- **Version-sensitive, checked 2026-10-07:** Python dbt Core 1.x + `dbt-duckdb` and Rust-based dbt v2 are different execution/distribution paths. dbt v2 has native DuckDB support through ADBC; do not assume its driver uses the project's Python DuckDB version. Verify engine, extension, adapter, license, and environment compatibility before selecting either path. Do not prescribe a migration based on this note alone.
- Python models are adapter/platform-specific. `dbt-duckdb` supports local Python models; that does not imply equivalent support in every dbt engine/platform. Avoid introducing pandas or another dataframe API against repository conventions.
- Do not claim column lineage is always paid-only: current dbt v2 offers local column lineage with strict static analysis. Verify the selected version's capabilities. Current CLI path: `dbt compile --generate-info-schema --static-analysis strict`, then `dbt show --info column_lineage`. Parsing/compilation and tests can require database access; do not describe them as harmless offline inspection.
- For file/SQLite inputs, define and validate how they become queryable dbt sources (attachment, staging, or exported artifacts). Model declarations do not perform arbitrary ingestion automatically.

## Minimum inspection contract

For a bounded pilot, show that a reviewer can follow one output back to its inputs without reading the whole codebase:

- **Graph:** code-derived dependency view with meaningful node names and links to definitions; distinguish expected graph from observed execution.
- **Source identity:** pinned dataset/model revisions or content identities; schema and completeness/partial status. A path alone is not an identity. Use existing receipts/manifests instead of inventing a parallel registry.
- **Node contracts:** input/output grain, keys, units, cardinality, null/missing-data behavior, and explicit side effects/materialization. Document hidden dependencies or remove them.
- **Checks:** a small fixture with known outputs, plus a failure case (changed source at the same path, join fan-out, missing metadata, or partial scan). Compare selected outputs to the existing implementation where preservation was agreed.
- **Run evidence:** code/environment identity, parameters/seeds where relevant, requested outputs, statuses/errors, test results, and output identities. Label reused/cached artifacts; do not present partial input as a complete corpus result.
- **Ownership:** one owner for orchestration/transactions/resources and one for each transformation. In a hybrid, connect the two graphs with an identified artifact and producing-run receipt rather than claiming automatic end-to-end lineage.

Keep artifacts local and avoid secrets, controlled data, row payloads, or sensitive paths in shared diagrams/logs. Use repository-owned environments and synthetic fixtures; no corpus scan, cluster provisioning, weight download, or dependency installation solely to evaluate this guide.

## Worked selection: NTv3 sequence-research POC

**Observed sample, not a complete audit:** `pilot_eda` uses Dask for header parsing and coordinator-owned SQLite writes. `pilot_eda/notebooks/eda.py` defines a large `ANALYTICS_SQL` batch and executes it in one connection cell. `export_report.py` imports that batch from the notebook and executes it again. marimo exposes cell dependencies, but most SQL-view dependencies sit inside the batch. The README's active track is DNA sequence analysis, not an AnnData/scRNA count-matrix pipeline.

Current read/write and registration outline (paths below are relative to that project's `src/ntv3_single_cell/`):

```text
pilot_eda/runner.py CLI -> _execute -> stream/header parsing -> catalogue SQLite
                                        Dask workers           coordinator writes
metadata enrichment -----------------------------------------> enrichment SQLite
catalogue.records -------------------------------------------> totals / quantiles / histogram
catalogue.records + enrichment.assemblies/taxa -> assemblies -> coverage
                    ANALYTICS_SQL registered in eda.py
                    -> notebook display / export_report.render -> HTML
```

**Suggested first seam, not implemented:** extract analytical transformations from notebook-owned code into a reusable module/model layer consumed by both notebook and report. Preserve sequence-character/count semantics, unknown taxonomy/null coverage, partial-input status, read-only source access, and explicit output ownership. The scanner's signal handling, commit order, progress threads, and cluster cleanup should remain ordinary imperative lifecycle code.

- **Lowest cost:** named SQL/Ibis transformations in a shared module; retain marimo, DuckDB, Dask, and the existing Pixi environment.
- **Python DAG pilot:** Hamilton nodes for source expressions, assembly summaries, coverage, and report inputs; use existing Ibis/Arrow boundaries. Suitable if Python reusability and cross-output dependencies dominate.
- **SQL DAG pilot:** dbt models for `assemblies`, `coverage`, and distribution summaries with `ref`/`source`; document keys/null policies and test joins and totals. Suitable if relation-level lineage and shared model tests dominate. Validate SQLite attachment and dbt/DuckDB environment compatibility first.
- **Not the first move:** adopting both, replacing Dask/Slurm, or graphifying the scanner's per-record loop.

Example recommendation format:

```text
Current flow: two SQLite inputs -> notebook-owned SQL batch -> summaries -> notebook/HTML.
Gap: cell graph hides SQL-model dependencies; reusable logic lives in a presentation module.
Smallest option: shared named SQL/Ibis transformations, keeping the repository environment.
Escalation: dbt if model DAG/tests are needed; Hamilton if Python branching/reuse is the gap.
Rejected now: both frameworks, because there is no demonstrated need for two graph owners.
Pilot evidence: trace coverage to assemblies/metadata; test unknown taxonomy and join fan-out;
record source completeness and output identity; compare to agreed existing summary semantics.
```

## Sources and maintenance

Checked 2026-10-07. Recheck version-specific claims before adoption; this guide is selection policy, not a dependency pin.

- [Hamilton visualization](https://hamilton.apache.org/concepts/visualization/), [Ibis integration](https://hamilton.apache.org/integrations/ibis/), [output immutability](https://hamilton.apache.org/concepts/best-practices/output-immutability/), [caching tutorial](https://hamilton.apache.org/how-tos/caching-tutorial/).
- [dbt SQL models](https://docs.getdbt.com/docs/build/sql-models), [data tests](https://docs.getdbt.com/docs/build/data-tests), [manifest artifacts](https://docs.getdbt.com/reference/artifacts/manifest-json), [Python models](https://docs.getdbt.com/docs/build/python-models), [column-level lineage](https://docs.getdbt.com/docs/collaborate/column-level-lineage).
- [DuckDB: dbt v2 support and distribution choices](https://duckdb.org/2026/09/22/dbt-fusion), [dbt-duckdb adapter and Python support](https://github.com/duckdb/dbt-duckdb).

### ACI Pass

- Result: PASS (selection interface; adoption efficacy requires a future pilot).
- Main risks: framework over-adoption; mistaking static dependencies for result provenance; version/backend drift.
- Interface upgrades applied: concrete triggers, declared inputs/output, conditional options, explicit research-only stop, pilot evidence contract, repository-relative example, and source/version notes.
