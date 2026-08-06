# database-access

Agent skill for governing database access correctness and state lifecycle across all access patterns.

## Purpose

This skill guides agents through implementing and reviewing database access code that is correct, boundary-respecting, and safe — covering tracked ORM/data mapper, Active Record, query builders, parameterized raw SQL, document DB/ODM, and bulk/native operations.

It is **not** a schema design skill. For schema modeling, normalization, migrations, and indexing strategy, use `db-design`.

## Scope

| In scope | Out of scope |
|---|---|
| ORM/data mapper session lifecycle and state | Schema design, DDL, migrations → `db-design` |
| Active Record pattern risks | Analytical/OLAP pipelines → `architecture-design` |
| Query builder and parameterized raw SQL | Tenancy/authorization (optional extension only) |
| Document DB / ODM access correctness | Soft deletion / auditing (optional extension only) |
| Unit-of-work boundaries and ownership | Replica routing / read scaling (optional extension only) |
| Write contracts, idempotency, concurrency | Pool / timeout / cancellation (optional extension only) |
| Aggregate synchronization strategy | Observability instrumentation (optional extension only) |
| Bulk/native operations safety | — |
| Test strategy for data-access adapters | — |

## Files

```
database-access/
├── SKILL.md                             # Router and decision gate (load this first)
├── README.md                            # This file — lifecycle, scope, ownership
└── references/
    ├── INDEX.md                         # Reference directory
    ├── capability-contract.md           # Contract discovery template and missing-capability protocol
    ├── unit-of-work-and-state-lifecycle.md  # UoW ownership, session state machine
    ├── write-contracts-idempotency-and-concurrency.md  # Write safety, retries, locking
    ├── facade-guides.md                 # Per-facade risks (ORM, AR, QB, SQL, ODM)
    ├── raw-sql-bulk-and-native-operations.md  # Raw SQL, bulk ops, native driver
    └── testing-and-extensions.md       # Test doubles, integration tests, optional extensions
```

## Lifecycle

| Field | Value |
|---|---|
| Stage | Stage 1: Prototype |
| Created | 2026-08-06 |
| Next review | Quarterly governance audit (Q4 2026) |
| Owner | Governance / skill-author workflow |

## Design Decisions

- **Application services own the unit-of-work boundary by default.** A UoW abstraction is an explicit opt-in per repository or vertical slice.
- **A project Data Access Contract is authoritative.** Read project `AGENTS.md` first, then any linked dedicated data-access document.
- **Missing contract → stop before risky writes.** Safe reads and basic local work may continue.
- **No relational capabilities assumed for document stores.** Require explicit capability declaration.
- **Default aggregate sync is reconciliation by stable key.** Replacement requires declared domain semantics.
- **No automatic write retries.** Requires idempotency policy + error classification + fresh UoW replay.
- **ORM entities do not escape persistence adapters by default.** Overriding this requires a project contract declaration.
- **Core scope is correctness and state lifecycle.** Tenancy, soft delete/audit, replicas, pooling, and observability are optional extensions.

## Composition

- Triggered after `db-design` (schema finalized → implement access layer)
- Triggered after `architecture-design` (data-access boundaries decided → implement)
- Composes with `code-craft` for non-trivial adapter implementation
- Feeds into `reviewer` (security lens for injection/exposure; design-rigor lens for boundary discipline)

## Maintenance Notes

This is a Stage 1 Prototype skill. First real-project usage should verify that the capability-contract template, facade guides, and stop conditions work without agent confusion. After 1–2 uses, promote to Stage 2 (Hardened) or file gaps as issues for the next Workflow B audit.
