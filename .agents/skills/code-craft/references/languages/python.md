# Python Default Stack

**Greenfield defaults only.** `uv`, Ruff, Pyright/mypy apply when starting fresh with no prior tooling decisions. For an existing project, inspect `pixi.toml`, `Makefile`, `pyproject.toml`, and CI first — honor whatever is configured there. A Pixi project using `ty` as its type checker **must not** be migrated to `uv` or have `ty` replaced with Pyright or mypy.

## Baseline

- Use `pyproject.toml`, `uv` for environments/dependencies, Ruff for linting and formatting, and the repository's configured type checker — prefer Pyright (`typeCheckingMode = "strict"`) or mypy (`strict = true`) in strict mode for greenfield projects; repos already using `ty` run `ty check` with the project's established rule configuration.
- **Single manifest pattern for uv and Pixi**: When projects bridge standard Python workflows with Conda/CUDA/binary dependencies, use `pyproject.toml` as the single unified manifest (configured with `[tool.pixi.*]` tables) rather than maintaining separate `pixi.toml` and `pyproject.toml` files. Pixi natively maps standard `[project.dependencies]`, `[project.optional-dependencies]`, and `[dependency-groups]` to PyPI dependencies/features, while Conda packages and tasks live under `[tool.pixi.dependencies]` and `[tool.pixi.tasks]`.
- Use pytest for tests; add `pytest-asyncio` only for async tests. Use `coverage.py` when coverage reporting is required.
- Prefer the standard library for small utilities, `pathlib`, `logging`, `argparse`-scale scripts, JSON, and HTTP where its ergonomics meet the need.

## Type and boundary models

- Use explicit annotations for public APIs, domain data, and non-trivial internal structures.
- Use `TypedDict` for shaped mapping payloads and frozen/standard `dataclass` instances for lightweight in-process records.
- Use Pydantic models for runtime validation, parsing, serialization, and structured external boundaries (HTTP, queues, files, and persistence DTOs). Do not use Pydantic for every primitive or short-lived local value.
- Use `pydantic-settings` `BaseSettings` for application configuration instead of manual environment parsing. Environment variables remain authoritative. If a requirement names a dotenv file, configure its exact path with `SettingsConfigDict(env_file=...)`; otherwise do not implicitly discover/load `.env`, especially in production.

## Application capabilities

- Use Typer for non-trivial CLIs, Rich for styled terminal output, and Textual for full interactive TUIs. Keep commands as adapters over typed application services.
- Use FastAPI plus Pydantic for async HTTP APIs unless an established framework is already in use.
- Use SQLAlchemy 2-style typed mappings with Alembic migrations for relational persistence unless direct database drivers or an existing data layer are a better fit.
- Use OpenTelemetry for portable tracing/metrics. Use the standard logging module or structlog when structured logging is required; do not add an observability vendor SDK as the sole abstraction.

## Data workflows

Choose the execution and orchestration layer independently. A DAG library improves organization; it does not automatically provide a scheduler, distributed runtime, lineage, or streaming engine. Keep transformations as typed, testable functions regardless of the selected tool.

| Use case | Suggestion | Why |
| --- | --- | --- |
| Small script or one-off local transformation | Standard Python plus Polars/Pandas as needed | Lowest operational overhead; do not introduce a workflow framework without dependency or reuse needs. |
| Local, single-process function DAG | Hamilton | Organizes typed Python transformation dependencies without introducing a distributed runner. |
| Reproducible data project with dataset catalog and pipeline conventions | Kedro | Provides project structure, data cataloging, and pipeline composition. |
| Asset-centric pipelines, lineage, and materialization policy | Dagster | Its asset model is a better fit than task DAGs when the durable tables/files are the primary product. |
| Scheduled coordination across services, jobs, and infrastructure | Prefect for Python-first dynamic flows; Airflow for established enterprise scheduling/integration estates | These are control planes: pair either with the selected execution engine (for example dbt, Spark, Beam, or a warehouse job) rather than treating them as dataframe engines. |
| Warehouse-native SQL transformations | dbt Core; SQLMesh when its planning/versioning workflow fits | Execute large transformations in the warehouse instead of extracting data into Python. |
| Portable distributed batch or streaming pipeline across Beam runners | Apache Beam | A unified batch/streaming model that runs through an appropriate runner such as Dataflow, Flink, or Spark. Choose it for runner portability, not merely because a task is parallel; verify the required Python SDK + runner capability matrix first. |
| Spark-centric data lakehouse or existing Spark platform | PySpark | Uses the platform's native distributed DataFrame and SQL ecosystem. |
| Python-native distributed tasks or ML/data workloads | Ray | General distributed tasks/actors; select it when its execution model matches the wider workload. |
| Stateful event streaming, especially Kafka/Redpanda | Apache Beam with a streaming runner; Bytewax for a Python-oriented streaming application | Select based on runner portability and operating platform, plus event-time/window semantics, checkpoint/state recovery, delivery/duplication guarantees, and idempotent sinks. |

- `pythonflow` is an obsolete lazy DAG library. Its documentation also describes optional distributed preprocessing, so it is not a meaningful local-versus-parallel decision point; its stale releases make it unsuitable for new production work.
- Apache Beam runner portability is not universal interchangeability. Before committing to Beam, validate transforms, connectors, state/timer behavior, streaming support, and delivery semantics against the exact Python SDK and intended runner capability matrix.
- Do not select a framework by a single dimension. Record data volume, batch versus streaming semantics, execution platform, scheduler/lineage needs, warehouse pushdown opportunity, state/retry requirements, and team operating capacity in the Design Intent.

### HPC and edge execution

Packaging is not execution. A Pixi lock (or `uv`-managed environment) defines reproducible dependencies; it does not determine how a workload lands on restricted HPC or edge hardware. Treat the two concerns separately.

**Discover before coding — query the site:**

| Concern | What to establish |
| --- | --- |
| Modules and runtime | Site-approved Python runtimes; whether user-installed environments are permitted on compute nodes (`module avail` on Lmod/Environment Modules systems) |
| Scheduler | Whether the site runs Slurm, PBS/Torque, LSF, or has no batch system; use scheduler-specific submission tools only when confirmed for that site |
| Allocations | Interactive allocation syntax versus batch submission; partition names, resource and memory flags, time limits, and job-array syntax are all site-specific — consult site documentation |
| Container runtime | Which runtime is available — Singularity/Apptainer, Docker, Podman, or none; do not assume Docker is disallowed, and do not assume any container runtime is present |
| GPU | Host driver version and CUDA/ROCm stack; image and library compatibility is governed by the host driver; do not assume a GPU is functional or accessible until verified |
| I/O paths | Bind-path conventions; shared read-only dataset locations versus writable scratch/cache; home-directory quotas versus scratch retention policies |
| Network access | Whether compute nodes have outbound internet; pip/conda installs may be blocked on compute nodes; offline environments require pre-bundled wheels or a local channel |
| Quotas | Storage, CPU-hours, and GPU-hours; verify limits before designing large-scale experiments |

**Smoke-test requirement:** Before making any performance or throughput claim, a test job or smoke test requires site permission, explicit user authorization, and an allocated compute node (not a login node); if any of these is unavailable, report "GPU/compute execution unverified" and do not run or submit. When all three are confirmed, run a minimal test job and verify environment activation, I/O bind paths, GPU access (if needed), and clean job completion. Never submit large compute jobs or pull heavy container images before this baseline passes.

**Python workflow specifics (when Slurm is confirmed):**
- **Array jobs:** map `$SLURM_ARRAY_TASK_ID` to per-sample input paths in the Python entry-point; use `--dependency=afterok:<job_id>` to gate downstream steps on clean completion.
- **Resource accounting:** specify CPU, memory, and walltime in `#SBATCH` headers using site-supported options (e.g., `--cpus-per-task`, `--mem`, `--mem-per-cpu`, `--time`) or site defaults where appropriate; review actual usage with `sacct` when available and tighten limits across runs. Keep all data and results paths explicit in scripts — ensure `--output` / `--error` log destinations are site-approved and exist before submission.
- **Container workflows:** only when site policy permits; use the site-approved format (commonly SIF/Apptainer) and add writable bind paths only for the least-privilege site-approved paths needed (e.g., scratch, cache, results) — avoid broad host mounts.
- **Interactive sessions:** run Jupyter, RStudio, or VS Code only via the site-approved portal or an authenticated SSH tunnel to an allocated node; prefer binding notebook servers to loopback (`127.0.0.1`); bind to an alternate interface only when the site-approved portal or tunnel topology explicitly requires it, with authentication/access controls and explicit authorization in place.

This guidance applies regardless of which orchestration framework (Hamilton, Kedro, Ray, Beam, bare scripts, or similar) the workflow uses.

## Sources

- https://docs.astral.sh/uv/
- https://docs.astral.sh/ruff/
- https://docs.pydantic.dev/latest/concepts/models/
- https://docs.pydantic.dev/latest/concepts/pydantic_settings/
- https://typer.tiangolo.com/
- https://rich.readthedocs.io/
- https://textual.textualize.io/
- https://fastapi.tiangolo.com/
- https://hamilton.dagworks.io/
- https://docs.kedro.org/
- https://docs.dagster.io/
- https://docs.prefect.io/
- https://airflow.apache.org/docs/
- https://docs.getdbt.com/
- https://sqlmesh.readthedocs.io/
- https://beam.apache.org/documentation/
- https://spark.apache.org/docs/latest/api/python/
- https://docs.ray.io/
- https://docs.bytewax.io/
- https://pypi.org/project/pythonflow/
- https://pixi.prefix.dev/latest/python/pyproject_toml/
- https://ngs101.com/setting-up-single-cell-rna-seq-analysis-environment-with-pixi-10x-faster-setup-zero-version-conflicts/
- https://ngs101.com/build-once-run-anywhere-creating-portable-ngs-analysis-environments-with-docker/
- https://ngs101.com/high-performance-computing-hpc-job-submission-systems-a-beginners-guide-to-slurm/
- https://ngs101.com/no-more-command-line-only-run-jupyter-lab-rstudio-and-vs-code-interactively-in-your-browser-on-any-hpc-cluster-with-pixi/
