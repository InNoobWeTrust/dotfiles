# Database Design Pattern Catalog & Search Guide

> Queryable database schema patterns, indexing strategies, zero-downtime migrations, and anti-pattern guardrails.

## 1. Skill Boundary & Responsibility Matrix

To prevent mixing concerns across the codebase, patterns are partitioned across four specialized skills:

| Concern Level | Governing Skill | Scope & Patterns Owned |
|---|---|---|
| **Macro / System Topology** (C4 L1–L3) | `architecture-design` | Hexagonal / Ports & Adapters, Modular Monolith, Microservices, CQRS, Event Sourcing, Transactional Outbox, Sagas, Strangler Fig, API Gateway, BFF, Anti-Corruption Layer. |
| **Storage & Schema Design** | `db-design` | UUIDv7/ULID PK strategies, 1NF–3NF, composite B-tree/GIN indexing, structural constraints, string enum storage, zero-downtime expand-contract migrations, append-only audit tables. |
| **Data Access & Session Lifecycle** | `database-access` | Unit of work boundaries, repository vs active record, query builders, parameterized raw SQL, document ODM boundaries, aggregate synchronization, write idempotency. |
| **Code Craftsmanship (C4 L4)** | `code-craft` | Function/class/struct patterns, type-driven design, local concurrency/cancellation, language idioms, and model-specific code generation traps. |

---

## 2. Query Contract

When designing relational schemas, indexing strategies, or production migrations, query the database pattern engine:

```bash
# Self-executing (via uv shebang)
./.agents/skills/db-design/scripts/search.py "<query>" [--domain <domain>]

# uv runner
uv run .agents/skills/db-design/scripts/search.py "<query>"

# Python 3 standard library
python3 .agents/skills/db-design/scripts/search.py "<query>"

# Database decision evaluation
./.agents/skills/db-design/scripts/search.py --decide
./.agents/skills/db-design/scripts/search.py "primary key" --decide

# Database traps / anti-patterns
./.agents/skills/db-design/scripts/search.py --traps
```

---

## 3. Core Domains

| Domain | CLI `--domain` | Purpose |
|---|---|---|
| **Schema** | `schema` / `modeling` | Primary key strategies (UUIDv7/ULID vs BigInt), 3NF normalization, string enum storage, invariant checks, optimistic locking, audit tables. |
| **Indexing** | `indexing` / `indexes` | Composite B-tree leftmost prefix rules, covering indexes (INCLUDE), partial indexes, GIN for JSONB, expression indexes, foreign key index mandates. |
| **Migrations** | `migrations` / `evolution` | Expand-contract zero-downtime rollouts, concurrent index creation, avoiding table rewrite locks, batched historical backfills. |
| **Decisions** | `reasoning` / `decide` | Decision heuristics mapping operational constraints to database architecture. |
| **Traps** | `traps` | Database anti-patterns to avoid (random UUIDv4 fragmentation, naive soft deletes, native DB enum lock traps, unindexed foreign keys). |

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
