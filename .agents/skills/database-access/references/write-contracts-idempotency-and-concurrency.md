# Write Contracts, Idempotency, and Concurrency

## Write Contract Checklist

Every write path must answer these questions before code is written:

1. **What is the UoW boundary?** (service method, explicit UoW class, or declared otherwise)
2. **Is the operation idempotent by design?** If not, what is the idempotency key?
3. **What happens on partial failure?** (rollback, compensating transaction, saga step)
4. **Is optimistic locking required?** (any entity with concurrent write risk)
5. **What is the aggregate sync mode?** (reconciliation-by-key default, or replacement with declared semantics)

## Idempotency

### Why It Matters

Without idempotency, retrying a failed write creates duplicates or inconsistent state. A write is idempotent if running it multiple times with the same input produces the same outcome.

### Idempotency Key Patterns

| Pattern | When to use |
|---|---|
| Natural business key (e.g. `order_id + line_item_sku`) | Best; derived from domain semantics |
| Client-generated request ID (UUID/ULID in request header) | For API-driven operations without a natural key |
| Idempotency token stored in a separate table | For operations where the natural key alone is insufficient |

### No Automatic Retries

Automatic write retries are **prohibited** unless all three conditions are met:

1. An idempotency key and error classification policy are declared in the project contract.
2. The error is classified as transient and safe to replay (e.g. connection reset, not a unique-key violation).
3. The retry executes in a **fresh unit of work** — never retry within the same session/transaction that failed.

```python
# Wrong: retry in the same session
try:
    session.commit()
except OperationalError:
    session.commit()  # ← same broken session; state is undefined

# Correct: fresh UoW for retry (only with declared idempotency policy)
for attempt in range(max_retries):
    try:
        async with UnitOfWork() as uow:  # fresh session each attempt
            await uow.orders.add(order)
        break
    except TransientDBError:
        if attempt == max_retries - 1:
            raise
        await asyncio.sleep(backoff(attempt))
```

## Optimistic Concurrency

### When to Use

Use optimistic locking for any entity that:
- Multiple users or processes may update concurrently.
- Has a "check-then-act" pattern (read state → apply business rule → write).
- Is a root aggregate with invariants that span multiple fields.

### Implementation Patterns

Assume the version or expected-state field already exists on the entity — adding it to the schema is a `db-design` concern (see [`../../db-design/references/concurrency-locking.md`](../../db-design/references/concurrency-locking.md)). The data-access layer's job is to read the current value, include it in the `WHERE` predicate, check that rows were actually affected, and translate a mismatch into a domain-level conflict error.

**Tracked ORM — map the existing version field and let the ORM enforce the predicate:**

```python
# SQLAlchemy: version_id_col wires the existing version column into automatic optimistic locking
class Order(Base):
    __tablename__ = "orders"
    id = Column(UUID, primary_key=True)
    status = Column(String, nullable=False)
    version = Column(Integer, nullable=False)           # column must already exist in schema
    __mapper_args__ = {"version_id_col": version}       # ORM adds WHERE version = N on UPDATE
```

```typescript
// TypeORM: @VersionColumn maps the existing version column
@Entity()
export class Order {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() status: string;
  @VersionColumn() version: number;                     // column must already exist in schema
}
```

**Document DB — filter on the version field and check for a match:**

```python
# MongoDB: use findOneAndUpdate with filter on existing version field
result = await collection.find_one_and_update(
    {"_id": doc_id, "version": current_version},        # predicate on existing field
    {"$set": {"status": new_status}, "$inc": {"version": 1}},
    return_document=True,
)
if result is None:
    raise OptimisticLockError(f"Concurrent modification on {doc_id}")
```

**Query builder / raw SQL — add the predicate and check affected rows:**

```python
# Raw SQL: include current version in WHERE; check rowcount
result = await conn.execute(
    "UPDATE orders SET status = $1, version = version + 1 WHERE id = $2 AND version = $3",
    new_status, order_id, current_version,
)
if result.rowcount == 0:
    raise OptimisticLockError(f"Concurrent modification on {order_id}")
```

### Handling Lock Conflicts

- Raise a domain-level conflict error (not a raw DB exception).
- Let the caller decide whether to retry with fresh data or surface the conflict to the user.
- Never silently swallow a version mismatch.

```python
from sqlalchemy.exc import StaleDataError

try:
    async with uow:
        order = await uow.orders.find_by_id(order_id)
        order.approve()
except StaleDataError:
    raise OrderConcurrentModificationError(order_id)
```

## Aggregate Synchronization

### Default: Reconciliation by Stable Key

When syncing a collection of aggregate members (e.g. updating line items in an order), default to reconciliation:

1. Load current persisted members.
2. Compare by stable domain key (not surrogate PK).
3. Insert new members, update changed members, delete removed members.

```python
def sync_line_items(self, order: Order, new_items: list[LineItemDTO]) -> None:
    existing = {item.sku: item for item in order.line_items}
    incoming = {dto.sku: dto for dto in new_items}

    for sku, dto in incoming.items():
        if sku not in existing:
            order.line_items.append(LineItem.from_dto(dto))  # insert
        elif existing[sku].quantity != dto.quantity:
            existing[sku].quantity = dto.quantity  # update

    for sku in list(existing):
        if sku not in incoming:
            order.line_items.remove(existing[sku])  # delete
```

### Replacement (Opt-In)

Delete-all-then-insert is only permitted when the domain semantics are declared: the operation is intentionally destructive, the caller owns the full state, and concurrent edits are not possible or are acceptable to lose.

If in doubt, use reconciliation.

## Isolation Levels

| Level | Reads | Writes | Use for |
|---|---|---|---|
| READ COMMITTED (typical default) | Sees committed rows | Allows phantom reads | Most OLTP operations |
| REPEATABLE READ | Consistent snapshot for duration of txn | Prevents non-repeatable reads | Financial aggregations within one transaction |
| SERIALIZABLE | Full isolation | Prevents phantoms; higher contention | Critical correctness (inventory deduction, seat booking) |

Do not upgrade isolation level without understanding the performance impact. Document the choice when deviating from the project default.

**Document stores**: Most document stores do not support multi-document isolation. Do not assume cross-document read consistency unless the capability contract explicitly declares it (e.g. MongoDB multi-document transactions with `SESSION.start_transaction()`).
