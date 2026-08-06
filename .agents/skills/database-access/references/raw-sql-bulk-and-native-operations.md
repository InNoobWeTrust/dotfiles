# Raw SQL, Bulk, and Native Operations

## When to Use Raw SQL

Raw SQL (via parameterized driver queries) is appropriate when:
- The ORM cannot express the required query efficiently (e.g. window functions, CTEs, `INSERT … ON CONFLICT DO UPDATE`).
- Bulk data loading performance is critical and ORM overhead is measurable.
- The project contract explicitly declares certain operations as raw-SQL paths.

Raw SQL is **not** a workaround for ORM complexity. If the query is expressible cleanly in the ORM, prefer the ORM for its lifecycle integration.

---

## Parameterized Queries — Non-Negotiable

**Never concatenate user input into SQL strings.** Always use parameterized placeholders.

```python
# psycopg2 / psycopg3 — %s placeholders
cursor.execute("SELECT * FROM orders WHERE id = %s AND status = %s", (order_id, status))

# asyncpg — $N positional placeholders
await conn.fetch("SELECT * FROM orders WHERE id = $1 AND status = $2", order_id, status)

# Go database/sql — ? placeholders (MySQL) or $N (pgx)
rows, err := db.QueryContext(ctx, "SELECT id, status FROM orders WHERE id = $1", orderID)

# JDBC
PreparedStatement ps = conn.prepareStatement("SELECT * FROM orders WHERE id = ?");
ps.setObject(1, orderId);
```

**Prohibited patterns:**
```python
# SQL injection — never do this
cursor.execute(f"SELECT * FROM orders WHERE id = '{order_id}'")
cursor.execute("SELECT * FROM orders WHERE id = " + str(order_id))
```

---

## Result Mapping — Return DTOs, Not Raw Rows

Raw queries return untyped tuples or dicts by default. Map immediately to typed structures before returning from the repository.

```python
# psycopg2 with RealDictCursor — still map to DTO
cursor.execute("SELECT id, status, total FROM orders WHERE id = %s", (order_id,))
row = cursor.fetchone()
if row is None:
    return None
return OrderDTO(id=row["id"], status=OrderStatus(row["status"]), total=Decimal(row["total"]))
```

```go
// Go — map immediately after scan
var id string
var status string
var total int64
err := row.Scan(&id, &status, &total)
if err != nil { return nil, err }
return &OrderDTO{ID: id, Status: status, Total: total}, nil
```

---

## Bulk INSERT / UPDATE

### When bulk operations bypass ORM lifecycle

Bulk operations executed via `session.execute(UPDATE …)` or driver `executemany()` **bypass**:
- ORM identity map (in-memory objects are stale after the operation)
- Model validators and `save()` hooks
- ORM signals / lifecycle events (Django `post_save`, Hibernate `@PreUpdate`)

Always expire/reload affected objects from the ORM session after a bulk statement.

```python
# SQLAlchemy Core bulk update — ORM objects are stale after this
await session.execute(
    update(Order).where(Order.status == "pending").values(status="expired")
)
session.expire_all()  # ← synchronous state management; clears stale identity map
```

```python
# Django bulk_update — signals are NOT fired
Order.objects.filter(status="pending").update(status="expired")
# post_save signal NOT fired; use with awareness
```

### Batch INSERT patterns

```python
# psycopg3 — executemany with RETURNING
async with await conn.cursor() as cur:
    await cur.executemany(
        "INSERT INTO order_items (order_id, sku, qty) VALUES (%s, %s, %s)",
        [(order_id, item.sku, item.qty) for item in items],
    )

# SQLAlchemy Core bulk insert (most efficient — no ORM overhead)
await session.execute(
    insert(OrderItem),
    [{"order_id": order_id, "sku": item.sku, "qty": item.qty} for item in items],
)
```

### INSERT … ON CONFLICT (Upsert)

**Upsert syntax is dialect-specific.** The capability and correct syntax depend on the database provider. Check the project Data Access Contract for the declared dialect before writing upsert code. Do not write upsert logic when the provider does not support it or when the contract does not declare it.

```sql
-- PostgreSQL: ON CONFLICT DO UPDATE
INSERT INTO order_items (order_id, sku, qty)
VALUES ($1, $2, $3)
ON CONFLICT (order_id, sku) DO UPDATE SET qty = EXCLUDED.qty;

-- MySQL / MariaDB: ON DUPLICATE KEY UPDATE
INSERT INTO order_items (order_id, sku, qty)
VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE qty = VALUES(qty);

-- SQLite (3.24+): ON CONFLICT DO UPDATE (same syntax as PostgreSQL)
-- SQL Server: MERGE statement (different syntax entirely)
-- Databases without upsert support: implement as SELECT + INSERT/UPDATE in application code
```

```python
# SQLAlchemy Core — PostgreSQL-specific upsert via pg_insert
# This uses the postgresql dialect. It is NOT portable to MySQL, SQLite, or other engines.
# Only use when the project Data Access Contract declares PostgreSQL as the target dialect.
from sqlalchemy.dialects.postgresql import insert as pg_insert

stmt = pg_insert(OrderItem).values(order_id=order_id, sku=sku, qty=qty)
stmt = stmt.on_conflict_do_update(
    index_elements=["order_id", "sku"],
    set_={"qty": stmt.excluded.qty},
)
await session.execute(stmt)
# For other dialects, use the equivalent dialect-specific import and API.
# SQLAlchemy does not provide a cross-dialect upsert abstraction.
```

---

## Transaction Management with Raw Drivers

Unlike ORMs, raw drivers require explicit transaction control.

```python
# asyncpg — explicit transaction
async with conn.transaction():
    await conn.execute("INSERT INTO orders …", …)
    await conn.execute("INSERT INTO order_items …", …)
# commits on clean exit; rolls back on exception

# psycopg3 — autocommit off by default; use context manager
async with await psycopg.AsyncConnection.connect(dsn) as aconn:
    async with aconn.transaction():
        await aconn.execute("INSERT INTO orders …", …)
```

```go
// Go — explicit Begin / Commit / Rollback
tx, err := db.BeginTx(ctx, nil)
if err != nil { return err }
defer tx.Rollback() // no-op if already committed
_, err = tx.ExecContext(ctx, "INSERT INTO orders …", …)
if err != nil { return err }
return tx.Commit()
```

**Always use a context manager or deferred rollback** — never rely on garbage collection to close a transaction.

---

## Connection Pool Safety

- Acquire a connection for the minimum time needed; return it immediately.
- Never store a connection in a long-lived object (module-level, class attribute).
- Async pools: `async with pool.acquire() as conn:` — not `conn = await pool.acquire()` without a matching release.
- If a query errors, the connection is returned in a dirty state by some drivers; use `pool.release(conn, discard=True)` or equivalent when in doubt.

### References

- psycopg3 transactions: https://www.psycopg.org/psycopg3/docs/basic/transactions.html
- asyncpg transactions: https://magicstack.github.io/asyncpg/current/api/transaction.html
- Go `database/sql` transactions: https://pkg.go.dev/database/sql#DB.BeginTx
- SQLAlchemy Core bulk insert: https://docs.sqlalchemy.org/en/20/core/dml.html#sqlalchemy.sql.expression.Insert
- PostgreSQL `ON CONFLICT`: https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT
