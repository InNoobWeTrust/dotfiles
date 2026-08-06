# Capability Contract

A Data Access Contract is the authoritative declaration of what the project's data layer supports. It prevents agents from assuming capabilities (e.g. multi-document atomicity, cross-shard transactions, JOIN semantics on a document store) that do not exist.

## Discovery Protocol

1. Read the project `AGENTS.md` for a `Database Rules`, `Data Access Contract`, or `Data Access` section.
2. If a dedicated document is linked (e.g. `docs/data-access.md`), read it next.
3. If neither exists, the contract is **undeclared** — apply the missing-capability protocol below.

## Contract Template

Use this template as a checklist when reading or writing a project Data Access Contract:

```markdown
## Data Access Contract

### Facade
- Type: [SQLAlchemy ORM | Django ORM | Prisma | TypeORM | Hibernate | GORM | Mongoose | Motor | Beanie | raw psycopg2/asyncpg | raw pg/mysql2 | custom hybrid]
- Version: [x.y if behavior-specific]
- Source: [file path or link]

### Transaction and Consistency Guarantees
- Relational ACID multi-statement: [yes | no | partial — describe]
- Savepoint support: [yes | no]
- Document-level atomicity only: [yes | N/A]
- Cross-document / cross-collection atomicity: [not supported | requires declared pattern: <saga/outbox/etc>]

### Unit of Work Ownership
- Default boundary owner: [application service (default) | explicit UoW class at <path>]
- Explicit UoW abstraction: [none | declared for <vertical/repo> at <path>]

### Entity / DTO Boundary
- ORM entities escape persistence adapters: [no (default) | yes — permitted to <layer>]
- Lazy proxies / session-bound objects: [stay inside adapters | permitted to <layer>]

### Aggregate Synchronization
- Default sync mode: [reconciliation by stable key (default) | replacement — semantics declared at <path>]

### Retry and Idempotency Policy
- Automatic write retries: [none (default) | declared: idempotency key = <field>, classification = <policy>, fresh UoW replay = yes]

### Optional Extensions (declared only)
- Tenancy/authorization: [not declared | declared at <path>]
- Soft deletion/auditing: [not declared | declared at <path>]
- Replica / read routing: [not declared | declared at <path>]
- Pool / timeout / cancellation: [not declared | declared at <path>]
- Observability instrumentation: [not declared | declared at <path>]
```

## Missing Capability Protocol

If the capability required for the current task is not declared in the contract:

| Operation type | Action |
|---|---|
| Safe read, basic local query | Continue — document the assumption in code comment |
| Destructive sync (replacement/delete-all) | **Stop and ask** — declare the semantics in the contract first |
| Multi-record write (batch insert/update) | **Stop and ask** — verify atomicity guarantee or declare non-atomic intent |
| Cross-document change (document stores) | **Stop and ask** — require explicit capability or declare saga/outbox pattern |
| Retry path | **Stop and ask** — require idempotency key + error classification before writing retry logic |
| Operation requiring unsupported guarantee | **Stop and ask** — do not silently degrade or pick a lowest-common-denominator fallback |

"Stop and ask" means: surface the gap to the human, describe what needs to be declared, and wait for a contract update before implementing.

## Contract Evolution

When a new capability is needed:
1. Propose the addition to the contract document (or AGENTS.md section).
2. Get human approval.
3. Implement only after the contract is updated.

Never backfill a contract to justify code that was already written.
