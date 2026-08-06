# Testing and Optional Extensions

## Test Strategy for Data-Access Adapters

### Scope by Layer

| Layer | Test type | What to verify |
|---|---|---|
| Repository / adapter unit | Unit test with test double | Query construction, DTO mapping, error translation |
| Multi-step write path | Integration test against real DB | UoW boundary, rollback on error, constraint enforcement |
| Full service + adapter | Integration or contract test | End-to-end correctness, idempotency, concurrency behavior |

### Unit Testing Repositories

Use a test double for the DB session when testing query logic and mapping in isolation. Avoid mocking the ORM session object directly — it is large and fragile. Prefer:

1. **In-process real DB** (SQLite in-memory, PostgreSQL via Docker / testcontainers) — most reliable.
2. **Fake repository** implementing the same interface — for service-layer unit tests that should not touch the DB.
3. **Mock/stub session** — only when a real DB is unavailable and the query logic is simple enough.

```python
# Fake repository for service-layer unit tests
class FakeOrderRepository:
    def __init__(self):
        self._store: dict[UUID, OrderDTO] = {}

    def add(self, order: Order) -> None:
        self._store[order.id] = OrderDTO.from_domain(order)

    def find_by_id(self, order_id: UUID) -> Optional[OrderDTO]:
        return self._store.get(order_id)
```

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
Does the test need real constraint enforcement (FK, UNIQUE, CHECK)?
  YES → use a real DB (in-memory or containerized)
  NO → use a fake repository or in-memory store

Does the test verify ORM lifecycle behavior (flush, lazy load, expire)?
  YES → must use a real DB session (no mock substitutes session internals reliably)
  NO → fake repository is fine

Is this a service-layer test focusing on business logic?
  YES → fake repository (fast, isolated, no DB setup)
  NO → integration test with real DB
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

For projects that need portable integration tests without a running DB service:

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
