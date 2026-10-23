# Testing and Optional Extensions

## Test Strategy for Data-Access Adapters

### Scope by Layer

| Layer | Test type | What to verify |
|---|---|---|
| Repository / adapter | Real DB test on the target engine | Query construction, DTO mapping, error translation, exercised constraints |
| Multi-step write path | Integration test against real DB | UoW boundary, rollback on error, constraint enforcement |
| Full service + adapter | Integration or contract test | End-to-end correctness, idempotency, concurrency behavior |

### Unit Testing Repositories

Default to the real adapter against a real DB on the target engine, using
authorized isolated data and cleanup. Stock SQLite in-memory can verify exercised
constraints, rollback and adapter behavior for compatible SQLite-targeted code.
It does not establish libSQL/Turso, file-backed durability/locking/WAL, or
PostgreSQL/MySQL coverage; those claims require the actual engine/version and
relevant configuration/mode, otherwise report UNVERIFIED.

Follow [real-first execution](../../code-craft/references/testing.md#real-first-execution).
The schema, queries and adapter code that the current system defines and controls
are owned regardless of where the engine runs; transport, hosting or deployment
topology alone does not decide ownership. Do not replace them with a repository fake
or a mocked ORM session; neither can verify query, constraint, rollback, concurrency
or engine behavior, and the DB boundary stays UNVERIFIED. Test pure mapping or
transformation helpers directly with deterministic fixtures. If the target engine
cannot run within authorization or safety limits, report the DB coverage UNVERIFIED.
A genuinely externally governed data service — one whose contract is defined and
controlled outside the current system — may apply the external mock-first gate to
its own service-contract boundary; that mock does not verify real engine behavior
or persistence.

```python
# Integration test with real DB (pytest + SQLAlchemy)
@pytest.fixture
async def session(engine):
    async with AsyncSession(engine) as s:
        async with s.begin():
            yield s
            await s.rollback()  # each test is isolated

async def test_order_repository_persists_and_retrieves(session):
    repo = OrderRepository(session)
    order = Order.create(customer_id=uuid4(), total=Decimal("99.00"))
    repo.add(order)
    await session.flush()

    result = await repo.find_by_id(order.id)
    assert result is not None
    assert result.total == Decimal("99.00")
```

### Integration Tests for Multi-Step Write Paths

Test these paths against a real database:
- Rollback on failure (one step succeeds, next fails — verify no partial state).
- Optimistic lock conflict (two sessions update the same version — verify the second raises a conflict error).
- Idempotency (same operation applied twice — verify no duplicates).

```python
async def test_place_order_rolls_back_on_inventory_error(session, order_service):
    with pytest.raises(InsufficientInventoryError):
        await order_service.place_order(PlaceOrderCommand(items=[out_of_stock_item]))

    # verify no order was persisted
    result = await session.execute(select(OrderORM).where(OrderORM.customer_id == customer_id))
    assert result.scalars().first() is None
```

### Concurrency Tests

```python
async def test_optimistic_lock_conflict_raises_domain_error(engine):
    # Two sessions load the same order version
    async with AsyncSession(engine) as s1, AsyncSession(engine) as s2:
        order_v1_s1 = await s1.get(OrderORM, order_id)
        order_v1_s2 = await s2.get(OrderORM, order_id)

        order_v1_s1.status = "approved"
        await s1.commit()  # version bumped to 2

        order_v1_s2.status = "cancelled"
        with pytest.raises(OrderConcurrentModificationError):
            await s2.commit()  # version mismatch → StaleDataError → domain error
```

### Test-Double Decision Tree

```
For current-system-owned data-access boundaries and real engine/persistence claims
(external service-contract mocks follow the gate above):

Can the real path run within authorization and safety limits?
  YES → use the real adapter and target-engine DB, including service-layer paths
  NO → state the concrete blocker or safety limit; DB coverage UNVERIFIED

Is the target the actual engine required by the claim?
  YES → real DB evidence may establish engine behavior
  NO → report which engine was exercised and what remains UNVERIFIED

Does the claim involve constraints, ORM lifecycle, rollback or concurrency?
  YES → only a real target-engine DB can establish that behavior
  NO → still use real execution; an ORM/session double is not a substitute
```

---

## Optional Extensions

These concerns are **out of core scope** for `database-access`. Implement only when declared in the project Data Access Contract.

### Multi-Tenancy / Row-Level Authorization

When declared, typical patterns:
- **Session-level variable**: `SET app.tenant_id = 'X'` before queries; enforce via RLS policy or query filter.
- **Discriminator column**: every query includes `WHERE tenant_id = :tenant_id`.
- **Schema-per-tenant**: separate schemas or databases per tenant.

Risk: a missing tenant filter leaks cross-tenant data. Enforce at the adapter layer, not the service layer, so it cannot be forgotten.

### Soft Deletion and Audit Hooks

When declared in the project Data Access Contract:
- All repository queries must filter on the already-declared deletion marker (e.g. `WHERE deleted_at IS NULL`) — do not omit the filter or expose deleted rows as live records.
- Hard-delete operations are prohibited unless the contract explicitly permits them.
- For audit history, repositories append to the audit log; they do not mutate the primary row for historical reads.

Schema design for soft deletion (the `deleted_at` column, partial index, and audit table structure) is a `db-design` concern — see [`../../db-design/references/state-auditing-history.md`](../../db-design/references/state-auditing-history.md).

### Read Replica Routing

When declared:
- Write operations use the primary.
- Read-only queries (queries not part of an active write UoW) may route to a replica.
- Never route a read within an active write transaction to a replica — replication lag will cause stale reads.
- Declare the routing rule explicitly; do not rely on implicit session detection.

### Connection Pool and Timeout Configuration

When declared:
- Set explicit `pool_size`, `max_overflow`, `pool_timeout` for SQLAlchemy.
- Set `connectionTimeoutMillis`, `idleTimeoutMillis` for pg/mysql2 (Node).
- Always set a statement timeout or query cancellation policy for long-running queries.
- Document the values and rationale in the Data Access Contract.

### Observability Instrumentation

When declared:
- Wrap repository methods with span creation (OpenTelemetry, DataDog, etc.).
- Log slow queries above a declared threshold.
- Do not log query parameters that contain PII or secrets.
- Track query counts per request to surface N+1 patterns in production.

---

## testcontainers — Portable Real-DB Tests

For projects that need portable integration tests without a running DB service,
use testcontainers only where the dependencies, container runtime and image are
already available or their acquisition/execution is authorized. These examples
grant no installation, network or container-execution authority:

```python
# Python — testcontainers-python
from testcontainers.postgres import PostgresContainer

@pytest.fixture(scope="session")
def postgres():
    with PostgresContainer("postgres:16") as pg:
        yield pg.get_connection_url()
```

```typescript
// Node — testcontainers
import { PostgreSqlContainer } from "@testcontainers/postgresql";

let container: StartedPostgreSqlContainer;
beforeAll(async () => {
  container = await new PostgreSqlContainer().start();
});
afterAll(async () => { await container.stop(); });
```

References:
- testcontainers-python: https://testcontainers-python.readthedocs.io/
- testcontainers for Node: https://node.testcontainers.org/
