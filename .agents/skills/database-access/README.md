---
metadata:
  created: "2026-08-06"
  review-after: "Quarterly governance audit (Q4 2026)"
  lifecycle: "Stage 1: Prototype"
  owner: "Governance / reusable-guidance maintenance"
  maintenance-note: "This is a Stage 1 Prototype skill. First real-project usage should verify that the capability-contract template, facade guides, and stop conditions work without agent confusion. After 1–2 uses, promote to Stage 2 (Hardened) or file gaps as issues for the next Workflow B audit."
---

# database-access

Agent skill for governing database access correctness and state lifecycle across all access patterns.

## Purpose

This skill guides agents through implementing and reviewing database access code that is correct, boundary-respecting, and safe — covering tracked ORM/data mapper, Active Record, query builders, parameterized raw SQL, document DB/ODM, and bulk/native operations.

It is **not** a schema design skill. Obtain schema modeling, normalization, migration, and indexing decisions as an explicit usable input contract; without that contract, do not infer schema requirements.

## Scope

| In scope | Out of scope |
|---|---|
| ORM/data mapper session lifecycle and state | Schema design, DDL, migrations require a separate schema-design contract |
| Active Record pattern risks | Analytical/OLAP pipelines require a separately settled dataflow/stack contract |
| Query builder and parameterized raw SQL | Tenancy/authorization (optional extension only) |
| Document DB / ODM access correctness | Soft deletion / auditing (optional extension only) |
| Unit-of-work boundaries and ownership | Replica routing / read scaling (optional extension only) |
| Write contracts, idempotency, concurrency | Pool / timeout / cancellation (optional extension only) |
| Aggregate synchronization strategy | Observability instrumentation (optional extension only) |
| Bulk/native operations safety | — |
| Test strategy for data-access adapters | — |
| Database inspection & query testing (`hsql`) | — |

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
    ├── testing-and-extensions.md       # Test doubles, integration tests, optional extensions
    └── hsql-inspection.md              # Database inspection, catalog discovery, and query testing with hsql
```

## Design Decisions

- **hsql is the preferred CLI tool for agents.** Use `hsql` for headless schema/catalog exploration and query verification with bounded `--read-only` and `--timeout` controls.
- **Application services own the unit-of-work boundary by default.** A UoW abstraction is an explicit opt-in per repository or vertical slice.
- **A project Data Access Contract is authoritative.** Read project `AGENTS.md` first, then any linked dedicated data-access document.
- **Missing contract → stop before risky writes.** Safe reads and basic local work may continue.
- **No relational capabilities assumed for document stores.** Require explicit capability declaration.
- **Default aggregate sync is reconciliation by stable key.** Replacement requires declared domain semantics.
- **No automatic write retries.** Requires idempotency policy + error classification + fresh UoW replay.
- **ORM entities do not escape persistence adapters by default.** Overriding this requires a project contract declaration.
- **Core scope is correctness and state lifecycle.** Tenancy, soft delete/audit, replicas, pooling, and observability are optional extensions.

## Composition

- Begin only when schema changes have an approved schema/migration contract and data-access boundaries are settled; missing inputs block dependent work.
- Non-trivial adapter changes require an implementation capability and observable verification; after working behavior, an independent maintainability assessment remains separate.
- Independent review requires the changed source, acceptance contract and relevant security/boundary evidence; authors do not self-validate.
