# Unit of Work and State Lifecycle

## Unit of Work Ownership

### Default: Application Service Owns the Boundary

By default, the application service layer owns and delimits the unit of work. This means:

- The service method opens the UoW (begins the transaction or session context).
- Repository/adapter methods execute queries within that context.
- The service method (or UoW context manager) commits or rolls back; the session is closed at UoW exit.
- Repositories and adapters must NOT independently call `commit()`, `rollback()`, or `session.close()` — doing so silently ends or replaces the caller-owned UoW and prevents atomic multi-repository operations.
- A `flush()` inside a repository is permitted when the reason is explicit: for example, to obtain a database-generated value (e.g. a serial PK) or to surface a constraint violation early within the same UoW. A flush does not commit.
- For Active Record facades: a repository/adapter method may call `.save()` or `.create()` when doing so inside a service-owned outer transaction (e.g. `transaction.atomic()` in Django). The prohibition is on independently establishing the final commit boundary, not on issuing model writes.

```python
# Correct: service owns the UoW boundary
class OrderService:
    def place_order(self, cmd: PlaceOrderCommand) -> OrderId:
        with self.uow:  # or: async with db_session() as session:
            order = Order.create(cmd)
            self.order_repo.add(order)
            self.inventory_repo.reserve(cmd.items)
            # uow.__exit__ commits; exception triggers rollback
            return order.id
```

```python
# Wrong: repository independently commits, replacing the caller's UoW boundary
class OrderRepository:
    def add(self, order: Order) -> None:
        self.session.add(order)
        self.session.commit()  # ← independently commits; breaks atomicity with other repos
```

### Explicit UoW Abstraction (Opt-In)

A Unit of Work abstraction (e.g. a `UnitOfWork` class managing multiple repositories under one session) is an **explicit opt-in** per repository or vertical slice. Do not introduce it without a contract declaration.

When declared, the UoW class:
- Wraps session/context acquisition and release
- Exposes repositories as attributes
- Commits or rolls back on context exit
- Does not expose the raw session to callers

```python
# Only use when explicitly declared in project contract
class UnitOfWork:
    def __enter__(self):
        self.session = Session()
        self.orders = OrderRepository(self.session)
        self.inventory = InventoryRepository(self.session)
        return self

    def __exit__(self, exc_type, *_):
        if exc_type:
            self.session.rollback()
        else:
            self.session.commit()
        self.session.close()
```

## ORM Session / Entity State Machine

Tracked ORMs (SQLAlchemy, Hibernate, EF Core) maintain entity state. Agents must understand this machine or produce incorrect code.

```
new → [session.add / persist] → pending
pending → [flush / commit] → persistent
persistent → [session.expunge / evict] → detached
persistent → [session.delete] → deleted → [commit] → removed
detached → [session.merge] → persistent  (re-attach, not a new insert)
```

**Critical lifecycle rules:**

| Rule | Why |
|---|---|
| Do not access lazy relations after session close | Raises `DetachedInstanceError` (SQLAlchemy) or `LazyInitializationException` (Hibernate) |
| Do not return persistent entities from adapters | Session-bound state escapes; caller cannot control lifecycle |
| After `bulk_update()` / `execute()`, expire in-memory objects | Session cache is stale; reads will return old values |
| `session.merge()` re-attaches a detached object — it is NOT an upsert | Use explicit upsert logic if insert-or-update semantics are needed |
| `flush()` writes to DB but does not commit | Useful within UoW to surface constraint errors early; does not end the transaction |

## Entity / DTO Boundary

**Default**: ORM entities, lazy proxies, and session-bound objects stay inside persistence adapters. Adapters return DTOs or value objects.

```python
# Correct: adapter returns a DTO
class OrderRepository:
    def find_by_id(self, order_id: UUID) -> Optional[OrderDTO]:
        row = self.session.get(OrderORM, order_id)
        if row is None:
            return None
        return OrderDTO(id=row.id, status=row.status, total=row.total)
```

```python
# Wrong: returning live ORM entity
class OrderRepository:
    def find_by_id(self, order_id: UUID) -> Optional[OrderORM]:
        return self.session.get(OrderORM, order_id)  # ← session-bound leak
```

**Exception**: If the project contract explicitly declares that entities may escape to a named layer (e.g. "ORM entities are permitted in the service layer"), that boundary is binding. Document the justification.

## Session Context Patterns

### Context Manager (preferred)

```python
async with AsyncSession(engine) as session:
    async with session.begin():
        repo = OrderRepository(session)
        order = await repo.find_by_id(order_id)
        order_dto = OrderDTO.from_orm(order)
# session closed and transaction committed/rolled back on exit
```

### Scope-per-request (web frameworks)

Many web frameworks inject a per-request session via DI or middleware. Ensure:
- The session is closed at request end (not reused across requests).
- Never store the session in a module-level or class-level variable shared across requests.
- Async frameworks: use `async with` or `asynccontextmanager` — never mix sync and async session types.

## Document Store: No Session State Machine

Document stores (MongoDB, DynamoDB, Firestore) do not have a persistent-entity state machine. Each operation is typically independent. This means:

- No "dirty tracking" — you must re-fetch after writes if you need the current state.
- No lazy relations — embed or reference explicitly.
- No session.expunge/merge equivalents.
- Optimistic locking requires a version/ETag field managed in application code.

See `facade-guides.md` § Document DB / ODM for operational details.
