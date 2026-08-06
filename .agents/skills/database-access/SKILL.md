---
name: database-access
description: "Use this skill when implementing or reviewing database access code — ORM/data mapper layers, Active Record patterns, query builders, parameterized raw SQL, document store/ODM access, and bulk/native database operations. Covers unit-of-work boundaries, session/context lifecycle, write contracts, idempotency, concurrency, aggregate sync, and testing strategy. Do not use for schema design or migrations (use db-design), high-level analytical pipelines (use architecture-design), or simple config-value changes."
---

# Database Access (`database-access`)

Governs correctness and state lifecycle for all database access patterns across ORM/data mapper, Active Record, query builders, parameterized raw SQL, document DB/ODM, and bulk/native operations.

Progressive disclosure: this file is the router and decision gate. Deep guidelines live in `references/`.

## Concern Table

| Concern | Load |
|---|---|
| Capability discovery — what does this project's data layer support? | `references/capability-contract.md` |
| Unit of work, session lifecycle, entity state machine | `references/unit-of-work-and-state-lifecycle.md` |
| Write contracts, idempotency, concurrency, aggregate sync | `references/write-contracts-idempotency-and-concurrency.md` |
| ORM/data mapper, Active Record, query builder, raw SQL, document ODM risks | `references/facade-guides.md` |
| Raw SQL, bulk INSERT/UPDATE, native operations | `references/raw-sql-bulk-and-native-operations.md` |
| Testing (unit, integration, test-double strategy) and optional extensions | `references/testing-and-extensions.md` |

---

## Phase 1 — Capability Contract Discovery

**Before writing any data-access code**, establish what the project's data layer actually supports.

1. Read the project `AGENTS.md` for a Data Access Contract section or link to a dedicated data-access document.
2. If a dedicated document is linked, read it and extract:
   - Facade type (ORM/data mapper, Active Record, query builder, raw SQL, ODM, hybrid)
   - Transaction and consistency guarantees available
   - Unit-of-work ownership policy (who owns the boundary)
   - Declared entity/DTO boundary (do ORM entities escape adapters?)
   - Any retries or idempotency policy
   - Cross-document or cross-collection constraints (document stores only)
3. If no contract exists for the operation you need, see **Stop Condition S1** below.

> **Copyable discovery example** — paste into investigation notes:
> ```
> Data Access Contract discovery
> ================================
> AGENTS.md data-access section: [found / not found / link: <path>]
> Facade type:           [SQLAlchemy ORM | Django ORM | Prisma | TypeORM | Mongoose | raw psycopg2 | ...]
> Transaction support:   [multi-statement ACID | session-scoped | document-level only | none declared]
> UoW ownership:         [application service (default) | repository | explicit UoW class at <path>]
> Entity/DTO boundary:   [entities stay in adapters (default) | entities escape to <layer>]
> Retry policy:          [none declared | explicit at <path>: idempotency key = <field>, classification = <policy>]
> Aggregate sync mode:   [reconciliation by stable key (default) | replacement — semantics declared at <path>]
> Cross-doc constraints: [N/A relational | not declared | declared: <capability>]
> Missing capabilities:  [list any required but not declared]
> ```

---

## Phase 2 — Pattern and Facade Identification

Identify which database access patterns apply to the current task. Load only the relevant section of `references/facade-guides.md`.

| Pattern | Guide section |
|---|---|
| Tracked ORM / data mapper (SQLAlchemy, Hibernate, EF Core) | `facade-guides.md` § Tracked ORM / Data Mapper |
| Active Record (Django ORM, Rails AR, Eloquent) | `facade-guides.md` § Active Record |
| Query builder (Knex, jOOQ, SQLAlchemy Core) | `facade-guides.md` § Query Builder |
| Parameterized raw SQL | `facade-guides.md` § Raw SQL + `raw-sql-bulk-and-native-operations.md` |
| Document DB / ODM (Mongoose, Motor, Beanie) | `facade-guides.md` § Document DB / ODM |
| Bulk / native operations | `raw-sql-bulk-and-native-operations.md` |

---

## Phase 3 — Write Contract and State Lifecycle

For any write operation, verify before coding:

1. **Unit-of-work boundary**: Is the UoW owned by the application service (default)? Is an explicit UoW abstraction declared for this vertical? Do not introduce a UoW abstraction without explicit declaration.
2. **Entity/DTO boundary**: ORM entities, lazy proxies, and session-bound objects must not escape persistence adapters unless the contract explicitly permits it.
3. **Aggregate synchronization mode**: Use reconciliation by stable key (default). Use replacement only when domain semantics are declared.
4. **Idempotency**: No automatic write retries. Retries require an explicit idempotency policy, error classification, and replay in a fresh unit of work.
5. **Concurrency**: Load `references/write-contracts-idempotency-and-concurrency.md` for optimistic locking, version columns, and isolation choices.

---

## Phase 4 — Implementation

Implement using the verified contract. Keep cross-cutting concerns out of core scope:

- **Core**: session/context lifecycle, state transitions, write correctness, query parameterization.
- **Optional extensions** (only if declared in contract): tenancy/authorization, soft deletion/auditing hooks, replica/read routing, pool/timeout/cancellation configuration, observability instrumentation.

Load `references/testing-and-extensions.md` for test-double strategy and optional extension patterns.

---

## Phase 5 — Self-Verification

- [ ] Capability contract was read; no missing capabilities are assumed
- [ ] Facade-specific lifecycle risks addressed (see `facade-guides.md`)
- [ ] All write paths have a declared UoW boundary
- [ ] No ORM entities/lazy proxies escape persistence adapters (unless contract permits)
- [ ] Parameterized queries only — no string-concatenated SQL
- [ ] Aggregate sync mode is reconciliation-by-key or has declared replacement semantics
- [ ] No automatic retries; retry paths have idempotency policy + fresh UoW
- [ ] Document store: no assumed relational capabilities without explicit contract
- [ ] Tests exist: at minimum repository/adapter unit tests; integration tests for multi-step write paths

---

## Stop Conditions

**S1 — Missing capability contract for risky operation**
If the required contract or capability is not declared AND the operation is any of: destructive sync, multi-record write, cross-document change, operation requiring unsupported guarantee, or retry path — **stop and ask** before writing. Safe reads and basic local work may continue.

**S2 — Document store with assumed relational semantics**
If a document store is in use and the task requires multi-document atomicity, foreign-key-style cascade, or join-style cross-collection query — do not silently fall back to a lowest-common-denominator approach. Stop and require an explicit capability contract.

**S3 — Entity escape without declaration**
If ORM entities or session-bound objects would escape the persistence adapter and no contract explicitly permits this — stop, declare the boundary in the contract, then proceed.

**S4 — Automatic retry without idempotency policy**
If code would add write retries without a declared idempotency key, error classification, and fresh-UoW replay guarantee — stop and require the policy first.

**S5 — Facade / project contract conflict**
If an existing local convention conflicts with the confirmed decisions in this skill — stop and report rather than inventing a policy.

---

## Anti-Patterns

| Temptation | Why Wrong | Correct Path |
|---|---|---|
| Return ORM entity from repository method | Leaks session-bound state; breaks after session closes; couples callers to ORM | Return DTO or value object; keep entity inside adapter boundary |
| Assume document store supports multi-doc transactions | MongoDB/Firestore/DynamoDB have limited or no cross-document atomicity by default | Check capability contract; use single-document atomic operations or declared saga pattern |
| Retry write on transient error without checking idempotency | Non-idempotent writes create duplicates; partial retries leave inconsistent state | Declare idempotency key + error classification first; replay in fresh UoW |
| Use ORM bulk update then assume in-memory state is current | ORM session cache does not know about bulk updates; stale state causes silent corruption | Expire/evict affected objects from session or reload after bulk operation |
| Introduce Unit of Work class without project declaration | Adds complexity, conflicts with existing service-boundary ownership | Application service owns UoW by default; only add UoW abstraction if declared per-vertical |
| String-concatenate SQL with user input | SQL injection; no query plan reuse | Parameterized queries only, always |
| Call `commit()`, `rollback()`, or `session.close()` inside a repository/adapter method | Silently ends or replaces the caller-owned UoW; the service can no longer roll back atomically | Repository/adapter executes queries only; the service or UoW context manager owns commit/rollback/close. A `flush()` inside the UoW is permitted when the reason is explicit (e.g. obtaining a generated DB value or surfacing a constraint error early). |
| Call Active Record `.save()` / `.create()` outside a service-owned outer transaction | Each `.save()` auto-commits when no transaction is active, leaving partial state on failure | Wrap all multi-step Active Record writes in `transaction.atomic()` (Django) or equivalent; `.save()` inside an outer transaction is permitted. |
| Silently replace aggregate on sync | Destroys untracked concurrent edits | Default is reconcile-by-stable-key; replacement needs declared domain semantics |
| Add tenancy/soft-delete/replica logic without contract | Out-of-scope; creates implicit coupling; violates optional-extension boundary | Declare in Data Access Contract first; implement only when declared |
| Use lazy-loaded relations across request boundary | N+1 queries; relation access after session close raises error | Eager-load required relations within the session; design queries to fetch what's needed |

---

## Composition Boundaries

| Skill | Relationship |
|---|---|
| `db-design` | Schema and migration design — hands off to `database-access` for implementation |
| `architecture-design` | Data-access boundary and capability decisions — hands off to `database-access` for implementation |
| `code-craft` | Implementation discipline (SOLID, modularity) — load alongside for non-trivial adapter code |
| `reviewer` | Post-implementation review — load for security lens (injection, exposure) or design-rigor lens |

---

## References

- `references/INDEX.md` — Master index of all reference guides
- `references/capability-contract.md` — Contract discovery, template, and missing-capability protocol
- `references/unit-of-work-and-state-lifecycle.md` — UoW boundaries, session state machine, entity lifecycle
- `references/write-contracts-idempotency-and-concurrency.md` — Write safety, idempotency, optimistic locking
- `references/facade-guides.md` — Per-facade operational risks and caveats
- `references/raw-sql-bulk-and-native-operations.md` — Raw SQL, bulk INSERT/UPDATE, native operations
- `references/testing-and-extensions.md` — Test strategy and optional extension patterns
