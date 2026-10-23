# Database Design Pattern Catalog & Search Guide

> Queryable database schema patterns, indexing strategies, zero-downtime migrations, and anti-pattern guardrails.

## 1. Skill Boundary & Responsibility Matrix

To prevent mixing concerns across the codebase, patterns are partitioned across four specialized skills:

| Concern Level | Governing Skill | Scope & Patterns Owned |
|---|---|---|
| **Macro / System Topology** (C4 L1–L3) | Architecture-design capability | Hexagonal / Ports & Adapters, Modular Monolith, Microservices, CQRS, Event Sourcing, Outbox, Sagas, API Gateway, Anti-Corruption Layer. |
| **Storage & Schema Design** | `db-design` | UUIDv7/ULID keys, normalization, indexes, constraints, compatibility-safe migrations, audit tables. |
| **Data Access & Session Lifecycle** | Data-access capability | Unit of work, repository/session lifecycle, query builders, parameterized SQL, document boundaries, sync and idempotency. |
| **Code Craftsmanship (C4 L4)** | Implementation capability | Function/class/struct patterns, type-driven design, local concurrency/cancellation, language idioms, and code-generation risks. |

---

## 2. Query Contract

When designing relational schemas, indexing strategies, or production migrations, query the relevant catalog under this loaded skill's `assets/` directory.

Use any available authorized search/query capability. Prefer BM25 row retrieval for natural-language requirements, or an efficient CSV-aware query tool for exact IDs and field filters: SQLite (`sqlite3`, importing CSV into a temporary database), DuckDB SQL over CSV, Nushell CSV queries, an available BM25 CLI, or a configured MCP capability. These are alternatives, not required dependencies; inspect the actual interface and CSV header rather than assuming a command schema.

Select only the relevant CSV below and retrieve a few matching rows with IDs and source locators. Inspect applicability, exclusions, engine/version constraints and migration caveats before choosing; a high relevance score is not approval. Do not read entire CSV files into context. If querying is unavailable, use bounded header/known-ID lookup or the quick reference below and state the limitation. Do not install tools, create a memory store, or upload catalogs without authorization; keep any database/index temporary and leave source CSVs unchanged.

---

## 3. Core Domains

| Domain | CSV under `assets/` | Purpose |
|---|---|---|
| **Schema** | `schema.csv` | Primary key strategies (UUIDv7/ULID vs BigInt), 3NF normalization, string enum storage, invariant checks, optimistic locking, audit tables. |
| **Indexing** | `indexing.csv` | Composite B-tree leftmost prefix rules, covering indexes (INCLUDE), partial indexes, GIN for JSONB, expression indexes, foreign key index mandates. |
| **Migrations** | `migrations.csv` | Expand-contract zero-downtime rollouts, concurrent index creation, avoiding table rewrite locks, batched historical backfills. |
| **Decisions** | `db-reasoning.csv` | Decision heuristics mapping operational constraints to database architecture. |
| **Traps** | `db-traps.csv` | Database anti-patterns to avoid (random UUIDv4 fragmentation, naive soft deletes, native DB enum lock traps, unindexed foreign keys). |

---

## 4. Offline Quick Reference

- `db-uuidv7-pk`: **UUIDv7 / ULID Primary Keys** — Time-sortable 16-byte UUIDs; B-tree friendly, prevents enumeration attacks.
- `db-3nf-normalization`: **3NF Normalization** — Model core transactional entities in relational tables; avoid JSONB bags for structured data.
- `db-enum-storage`: **Plain String Enum Storage** — Store app-domain workflow states as plain strings with app-level validation to prevent migration locks.
- `db-optimistic-locking`: **Optimistic Locking** — Add `version INT NOT NULL DEFAULT 1` to mutable entities; avoids holding DB connection locks.
- `db-audit-tables`: **Append-Only Audit Tables** — Preserve complete immutable mutation history (who, when, what) in dedicated audit tables.
- `idx-composite-b-tree`: **Composite Leftmost Prefix** — Index order: 1. Equality filters, 2. Range filters, 3. Sort columns.
- `idx-partial`: **Partial / Filtered Indexes** — Index only active/pending rows (e.g. `WHERE deleted_at IS NULL` or `WHERE status = 'PENDING'`).
- `idx-foreign-key`: **Mandatory FK Indexing** — Always index foreign key columns to prevent full table locks on parent DELETE/UPDATE.
- `mig-expand-contract`: **Expand-Contract Migrations** — 4-phase rollout: Add column (dual write) -> Backfill -> Switch reads -> Drop old column.
- `mig-concurrent-index`: **Concurrent Index Creation** — Use `CREATE INDEX CONCURRENTLY` in Postgres to avoid blocking writes.
