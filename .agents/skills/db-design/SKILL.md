---
name: db-design
description: "Use this skill for operational database design — OLTP schema modeling, 1NF-3NF normalization, PK/FK strategies (UUIDv7/ULID), indexing optimization, structural constraints, state auditing, concurrency/locking, recovery-safe migrations, strongly-typed repository DTO mapping, and ORM-safe enum storage. Backward compatibility requires root engineering opt-in; rolling coexistence may separately serve authorized availability needs. It produces schema and migration contracts; implementation and broad system architecture are separate responsibilities."
---

# Database Design (`db-design`)

Operational database engineering across the full lifecycle: schema modeling, indexing, constraints, concurrency, migrations, and strongly-typed repository mapping.

Progressive disclosure: this file is the decision gate and router. Deep technical guidelines live in `references/`.

Before schema/interface or migration design, research and present the relevant
existing/native/standard-library and established engine/driver/tool stack, APIs,
sources/constraints, alternatives and custom insufficiency; require the human's
approval source plus task/scope/proposal revision. Read-only discovery may precede
approval, design/prototypes may not. Primary/architect/tool approval cannot replace
it. Reuse unchanged same-task approval; reapprove material stack/custom changes.
Missing receipt, required source or tool stops affected design as UNVERIFIED.
Backward compatibility is OFF unless actual root engineering docs affirmatively
enable it with scope; unavailable evidence is unknown. Data/recovery safety and
authorized availability remain required independently of legacy preservation.

| Concern | Load |
|---|---|
| Querying database patterns, decisions, traps via CLI | `references/pattern-catalog.md` |
| Entity modeling, 1NF–3NF, PK/FK strategy | `references/schema-modeling.md` |
| Indexing, composite order, query tuning | `references/indexing-performance.md` |
| Integrity, structural constraints, enum storage, FK rules | `references/integrity-constraints.md` |
| State changes, soft deletes, audit history | `references/state-auditing-history.md` |
| Optimistic locking, MVCC, concurrency | `references/concurrency-locking.md` |
| Recovery-safe schema evolution; expand-contract when required | `references/migrations-evolution.md` |
| Strongly-typed DTO / Repository mapping | `references/typed-mapping.md` |

---

## Gate 1 — Storage & Workload Check

| Primary workload | Route |
|---|---|
| Operational transactional state | Relational storage under `db-design`; apply the defaults below |
| Analytical / lakehouse | Require a separately settled dataflow/engine design with workload, formats, scale, quality, privacy and operational constraints; if unavailable, do not apply OLTP defaults |
| Unstructured / ephemeral | Evaluate key-value, document or cache storage for the actual access pattern |

### Database defaults

- **New operational databases:** Treat [local Turso Database](https://docs.turso.tech/local-development#local-turso-database) as a robust modern first choice across languages when an embedded/local-first relational engine meets the requirements and a larger ecosystem such as PostgreSQL is not yet needed. Native SDKs cover TypeScript/JavaScript, Python, Go and Rust; verify the required language, ORM and engine capabilities. Retain existing compatible project choices; this preference does not authorize migration.
- **SQLite-file access:** Default to [libSQL](https://docs.turso.tech/libsql), the production-ready SQLite-compatible fork, and its language bindings instead of plain SQLite libraries. Select local/file access explicitly; neither a cloud account nor a remote service is required merely to open a file.
- **Engine and driver fit:** Turso Database is a rewrite; libSQL is a separate SQLite fork, not another name for the same engine. Follow the [SDK matrix](https://docs.turso.tech/sdk) for the chosen engine and local, sync or remote mode; do not assume native Turso and libSQL clients or ORM adapters are interchangeable. SQLite compatibility is not evidence that every extension, transaction mode or PostgreSQL-specific schema feature is supported.
- **Escalation:** Choose PostgreSQL or another established backend when concrete extension, operational, concurrency, integration or ecosystem requirements justify it. These are selection defaults, not a measured performance guarantee or permission to replace existing storage.

If the task involves operational OLTP application state (user data, billing, orders, domain entities), proceed with this workflow. If building analytical warehouses or streaming data pipelines, obtain a separate workload/dataflow/engine contract first. Query the database CSV catalog with an available BM25 search or CSV-aware query capability per `references/pattern-catalog.md`; resolve catalog paths from the loaded bundle and retrieve bounded candidates rather than loading entire CSV files into context.

---

## Gate 2 — Essential Database Design Checklist

Every database schema design delivered by an agent MUST pass these 7 gates:

1. **Primary Key Choice**: Use **UUIDv7** or **ULID** for distributed/API entities (time-sortable + B-tree index friendly); `BigInt` auto-increment for internal-only lookup tables. Never random UUIDv4 as PKs.
2. **Schema Normalization**: Design in **3NF** by default. Do not use JSONB/Document columns as a substitute for structured relational tables.
3. **Indexing Strategy**: Every foreign key and query predicate (`WHERE`, `JOIN`, `ORDER BY`) MUST be evaluated for index coverage. Composite indexes must follow the leftmost prefix rule.
4. **Data Integrity**: Enforce structural constraints at the database level (`NOT NULL`, `FOREIGN KEY ON DELETE RESTRICT/CASCADE`, `UNIQUE`). Use `CHECK` constraints selectively for stable physical invariants (e.g. non-negative amounts, start/end ordering), not as the default mechanism for ORM/application enums or mutable workflow states. For app-domain enums, prefer plain string storage plus application-level validation; justify the representation against current integrity/recovery needs, not automatic preservation of deprecated values. Rolling coexistence applies only to opted-in compatibility or actual availability needs.
5. **State & History**: No naive `is_deleted` flags without partial indexes (`WHERE is_deleted = false`). Use append-only audit log tables or CDC for immutable historical tracking.
6. **Concurrency**: High-contention entities MUST include an optimistic locking column (`version INT DEFAULT 1`).
7. **Strongly-Typed Repository Mapping**: Query results MUST map to explicit DTOs/Entities (e.g. `@dataclass`, Pydantic `BaseModel`, TS `interface`, Go/Rust `struct`). Returning raw tuples or untyped dicts is forbidden.

### Artifact Level Calibration

The 7 gates check the **schema design**, but the depth of evidence required depends on the artifact being reviewed or produced:

| Artifact | What the gates check | What belongs elsewhere |
|---|---|---|
| **Engineering design doc (TRD)** | The design *specifies* PK strategy (e.g. "UUIDv7"), normalization level, audit model, concurrency approach, and typed contracts. ER diagram shows entities, relationships, key types. | Exact DDL, index definitions, migration scripts, repository method signatures — these are implementation details for the code phase. |
| **Implementation / migration script** | The code *enforces* all 7 gates in actual DDL: `CREATE TABLE` with `NOT NULL`, `FK`, `UNIQUE`, selective invariant `CHECK`, `CREATE INDEX`, `version` column, typed repository returns. ORM/application enums may remain plain strings with app-level validation; old/new coexistence is conditional on root policy or actual availability needs. | Design rationale, ADR, alternative analysis — these belong in the TRD. |
| **Code review (PR)** | The diff *implements* the gates correctly: no raw tuples, no missing indexes, no naive soft-delete, no missing FK. | Design-level questions — defer to TRD review. |

**Do not fail a design doc for not containing implementation DDL.** A TRD that specifies "UUIDv7 PK, 3NF, append-only audit with polymorphic target, optimistic locking on mutable entities, typed repository DTOs" has passed the gates at the design level. The exact `CREATE INDEX` statements belong in the migration script.

---

## Workflow Routing

| Scenario | Trigger | Action |
|---|---|---|
| **Greenfield DB Schema** | Designing a new database or service tables | Load `references/schema-modeling.md` + `references/integrity-constraints.md` |
| **Index & Query Tuning** | Slow queries, missing indexes, scaling | Load `references/indexing-performance.md` |
| **Audit & State Tracking** | Soft deletes, history, compliance, events | Load `references/state-auditing-history.md` |
| **Concurrency & Safety** | Race conditions, updates, versioning | Load `references/concurrency-locking.md` |
| **Schema Evolution** | Adding/modifying columns in production | Load `references/migrations-evolution.md` |
| **Data Access / ORM Layer** | Writing repositories, queries, DTOs | Load `references/typed-mapping.md` |

---

## Hard Rules

- **Illustration-first**: Include an ER diagram (`mermaid erDiagram`) for all schema proposals.
- **Explicit types over tuples**: DB repositories must NEVER return positional tuples or untyped dicts.
- **Recovery-safe migrations**: Require authorized data changes, validated recovery and availability bounds. Use Expand-Contract when root-opted-in rolling compatibility or actual availability requires coexistence, not for every live schema change. Opt-out never authorizes destructive DDL or data loss.
- **Enum storage fit**: For application-domain enums/status fields, prefer plain strings plus typed mapping/validation. Do not default to DB `ENUM` or allowed-value `CHECK` lists unless immutable/schema-coupled deployment fits; do not retain deprecated values solely for unrequested compatibility.
- **No unindexed JSONB queries**: If a JSONB field is queried in a `WHERE` clause, it MUST have a GIN index or expression index.

---

## Deliverables

- [ ] ER diagram (`mermaid erDiagram`) with explicit field types & nullability
- [ ] Primary key strategy specified (UUIDv7 / ULID / BigInt)
- [ ] Foreign keys and UNIQUE indices defined
- [ ] Any `CHECK` constraints are justified as stable invariants rather than default enum/status gates
- [ ] Enum/storage integrity and recovery strategy; root compatibility scope recorded when enabled
- [ ] Index strategy documented with target query access patterns
- [ ] Authorized recovery-safe migration strategy; Expand-Contract only when coexistence is required
- [ ] Strongly-typed DTO / Repository interface definition

---

## References

- `references/INDEX.md` — Master index of DB design reference guides
- `references/pattern-catalog.md` — Database schema, indexing, and migration pattern search CLI
- `references/schema-modeling.md` — Normalization, PK/FK strategies, entity modeling
- `references/indexing-performance.md` — B-Tree, composite indexes, partial indexes, GIN
- `references/integrity-constraints.md` — Database-level safety & constraints
- `references/state-auditing-history.md` — Soft deletes vs audit tables vs temporal logs
- `references/concurrency-locking.md` — Optimistic locking & isolation levels
- `references/migrations-evolution.md` — Recovery-safe evolution and conditional zero-downtime techniques
- `references/typed-mapping.md` — Strongly-typed DTO / Repository return mapping
