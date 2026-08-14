# Python Default Stack

Use for greenfield Python work. Retain a repository's existing compatible choices.

## Baseline

- Use `pyproject.toml`, `uv` for environments/dependencies, Ruff for linting and formatting, and the repository's configured strict type checker (prefer Pyright or mypy strict mode).
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
