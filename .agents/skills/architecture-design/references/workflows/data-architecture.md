# Data Architecture Design

## When
Triggered when building enterprise data warehouse/lakehouse platforms, implementing real-time streaming systems, or migrating to a domain-driven data mesh. Use this workflow to design scalable data architectures.

---

## Phase 1 — Data Domain Modeling
```mermaid
erDiagram
    Conceptual ||--o{ Logical : refines
    Logical ||--o{ Physical : implements
    DomainContext ||--|{ Entity : contains
```
**Do:**
- Construct conceptual, logical, and physical data models with formal Entity-Relationship diagrams.
- Define domain boundaries, entity key structures, normalization levels, and access patterns.
**Ask:**
- Are entity models aligned with bounded domain contexts and operational read/write requirements?

---

## Phase 2 — Engine & Storage Selection
```mermaid
graph TD
    DataNeed[Data Access Pattern] --> OLTP[Relational OLTP: Postgres]
    DataNeed --> EmbeddedOLAP["Embedded In-Process OLAP: DuckDB"]
    DataNeed --> CloudOLAP["Cloud Columnar OLAP: Snowflake / BigQuery / ClickHouse"]
    DataNeed --> Doc[Document / Graph / Time-Series]

    EmbeddedOLAP --> IbisLayer["Portable Query Layer: Ibis"]
    CloudOLAP --> IbisLayer
```
**Do:**
- Select storage engines (OLTP relational, embedded in-process OLAP, cloud columnar OLAP, document, graph, time-series) based on access patterns.
- Evaluate embedded in-process OLAP (**DuckDB**) for local data pipelines, micro-services, CLI tools, and single-node analytical workloads (<5–10TB) before provisioning costly cloud warehouses or distributed clusters.
- Decouple analytical transformation logic from physical execution engines using a portable query abstraction layer (**Ibis**), ensuring code runs identically locally on DuckDB or in production cloud warehouses.
- Benchmark write throughput, query latency, and indexing capabilities for candidate engines.
**Ask:**
- Is the analytical query logic decoupled from underlying engines using a portable layer (Ibis) to avoid vendor lock-in?
- Is analytical workload isolated from transactional OLTP engine instances?

---

## Phase 3 — Ingestion & Pipeline Architecture
```mermaid
flowchart LR
    Source[Operational Systems] -->|CDC / Kafka| Stream[Event Bus / Stream] -->|ETL / ELT| Lakehouse[(Data Lakehouse: Parquet / Iceberg)]
    Lakehouse --> Compute["Engine: DuckDB (Single-node) / Warehouse / Spark"]
    Compute --> Query["Abstraction: Ibis"]
```
**Do:**
- Design ETL/ELT pipelines, CDC capture streams, and event stream topologies (e.g., Kafka, Flink).
- Favor the Composable Lakehouse pattern (Parquet / Iceberg + DuckDB + Ibis) for single-node and serverless pipelines to eliminate cluster overhead.
- Implement idempotent pipeline executions and retryable stateful stream processors.
**Ask:**
- Can the workload be processed with single-node out-of-core streaming (DuckDB) instead of provisioning a distributed cluster (Spark)?
- Does pipeline ingestion handle out-of-order data delivery and late-arriving events seamlessly?

---

## Phase 4 — Data Governance
```mermaid
flowchart LR
    Producer[Data Producer] --> Contract[Schema Registry] --> Quality[Data Quality Checks] --> Consumer[Data Consumer]
```
**Do:**
- Enforce data contracts, schema registry enforcement, and lineage tracking (e.g., OpenLineage).
- Integrate automated data quality checks (e.g., Great Expectations) into ingestion pipelines.
**Ask:**
- Are breaking schema evolution changes blocked by a central schema registry prior to pipeline failure?

---

## Phase 5 — Storage Lifecycle
```mermaid
flowchart LR
    Hot[Hot Storage: S3 / NVMe] -->|Time Partitioning| Warm[Warm Storage: Parquet] -->|Retention Policy| Cold[Cold / Archive]
```
**Do:**
- Configure table partitioning, indexing strategies, and hot/cold tiering lifecycle rules.
- Automate retention policies, data anonymization, and regulatory deletion workflows.
**Ask:**
- Are automated retention, archiving, and deletion policies configured to comply with regulations?

---

## Deliverables
- [ ] Conceptual, logical, and physical ER data models
- [ ] Access-pattern benchmark and a database-engine ADR only when the canonical ADR threshold is met
- [ ] Ingestion pipeline topology spec (CDC, ETL/ELT, streaming, or Composable Lakehouse)
- [ ] Data contract, lineage, and schema registry configuration
- [ ] Storage lifecycle, partitioning, and compliance retention policy

## Pitfalls
| Temptation | Mitigation |
|---|---|
| Analytics on OLTP | Route analytical queries to dedicated read replicas or OLAP columnar stores |
| Premature distributed clusters | Evaluate single-node out-of-core columnar processing (DuckDB) first; 95% of workloads finish faster with zero cluster ops |
| Engine dialect lock-in | Use a portable query abstraction layer (Ibis) so analytical logic runs unchanged locally or in cloud warehouses |
| Ungoverned data swamp | Enforce schema registries, data contracts, and automated quality gates |
| Uncontrolled schema drift | Gate schema evolution through schema registry compatibility checks |

## Approvers
Chief Data Architect, Data Engineering Manager, Analytics Lead
