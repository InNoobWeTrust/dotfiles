# Facade Guides

Each database access facade has distinct operational risks. This guide covers them per facade. Do not conflate semantics across facades — they do not share transaction, constraint, or lifecycle behavior.

---

## Tracked ORM / Data Mapper

*Examples: SQLAlchemy ORM, Hibernate/JPA, EF Core, ActiveJDBC with explicit session*

### How it works

A session/entity-manager tracks every loaded object. Changes to tracked objects are automatically included in the next flush/commit. This is powerful but creates subtle bugs when the lifecycle is misunderstood.

### Key risks

| Risk | Detail | Mitigation |
|---|---|---|
| **Stale cache after bulk update** | `session.execute(UPDATE ...)` bypasses the identity map. In-memory objects still hold old values. | Call `session.expire_all()` or reload affected objects after any bulk statement. |
| **N+1 via lazy loading** | Accessing a relation attribute on a loaded entity triggers an additional SELECT per instance. | Eager-load required relations in the query: `joinedload`, `selectinload`, `fetch = EAGER`. |
| **DetachedInstanceError** | Accessing a lazy relation after the session is closed raises an error (SQLAlchemy, Hibernate). | Convert to DTO inside the session scope; never return live entities. |
| **Implicit flush before query** | SQLAlchemy flushes pending changes before executing a SELECT (autoflush). Can cause unexpected constraint errors mid-transaction. | Be explicit about flush points; consider `autoflush=False` for complex UoW patterns. |
| **session.merge() is not upsert** | `merge()` re-attaches a detached object. It does not semantically mean "insert or update." | Use explicit upsert SQL (`ON CONFLICT DO UPDATE`) for true upsert semantics. |
| **Cross-session entity sharing** | Passing entities between sessions without detaching corrupts identity maps. | Detach (`expunge`) before sharing, or convert to DTO. |

### References

- SQLAlchemy session state: https://docs.sqlalchemy.org/en/20/orm/session_state_management.html
- Hibernate entity lifecycle: https://docs.jboss.org/hibernate/orm/6.4/userguide/html_single/Hibernate_User_Guide.html#pc
- EF Core change tracking: https://learn.microsoft.com/en-us/ef/core/change-tracking/

---

## Active Record

*Examples: Django ORM, Rails ActiveRecord, Eloquent (Laravel), Sequelize (in model-instance mode)*

### How it works

Each model instance IS the persistence unit. Calling `.save()`, `.create()`, `.update()`, or `.delete()` on a model directly writes to the database. There is no separate session or entity manager; transaction control is via explicit `transaction.atomic()` (Django) or equivalent.

### Key risks

| Risk | Detail | Mitigation |
|---|---|---|
| **Implicit per-operation commits** | Without wrapping in a transaction block, each `.save()` auto-commits. A failed second save leaves the DB partially modified. | Always wrap multi-step writes in `transaction.atomic()` (Django) or equivalent. |
| **Signal/callback side effects** | `post_save`, `after_create`, etc. fire inside the transaction. Side effects (e.g. sending an email) inside a signal may execute even if the transaction is later rolled back. | Keep signals idempotent; move side effects to a post-commit hook. |
| **Bulk operation bypasses model lifecycle** | `.objects.bulk_create()`, `.update()`, `.delete()` skip model `save()` method, signals, and validators. | Use bulk ops intentionally; document that signals/validators are bypassed. |
| **select_for_update() locking scope** | `queryset.select_for_update()` must be evaluated inside an active transaction. On supporting backends, Django raises `TransactionManagementError` if called in autocommit mode; behavior varies by backend and test configuration, so "silent no-op" is not a safe assumption. Backend lock support must also be verified — not all databases support `SELECT FOR UPDATE` in all modes. | Always use inside `transaction.atomic()` or the contract-declared equivalent. Verify backend lock support against the project Data Access Contract. |
| **N+1 with related managers** | `order.items.all()` in a loop hits the DB per order. | Use `prefetch_related` / `select_related` at query time. |

### References

- Django database transactions: https://docs.djangoproject.com/en/stable/topics/db/transactions/
- Django bulk operations: https://docs.djangoproject.com/en/stable/ref/models/querysets/#bulk-create

---

## Query Builder

*Examples: Knex.js, jOOQ, SQLAlchemy Core (not ORM), LINQ-to-SQL, Kysely*

### How it works

Query builders construct SQL programmatically without tracking entity state. There is no identity map or lazy loading. Queries return plain data structures (rows, dicts, typed records).

### Key risks

| Risk | Detail | Mitigation |
|---|---|---|
| **No built-in concurrency protection** | Query builders do not provide optimistic locking. | Add `WHERE version = $current_version` to UPDATE predicates and check affected row count. |
| **No change tracking** | You must explicitly fetch after a write if you need the updated state. | Re-query or use `RETURNING` / `OUTPUT` clauses. |
| **String interpolation = SQL injection** | Query builders provide escaping APIs; bypassing them by interpolating strings is still dangerous. | Always use parameterized bindings (`.where("id = ?", id)` not `.where(\`id = ${id}\`)`). |
| **Transaction scope not implicit** | Unlike ORM session, you must explicitly begin/commit/rollback. | Use the framework's transaction API: `knex.transaction()`, `jOOQ.transaction()`. |
| **Type safety gap (JS/TS)** | Some query builders return untyped rows by default. | Use typed query builders (Kysely, jOOQ with generated types) or map to explicit interfaces immediately. |

### References

- Knex.js transactions: https://knexjs.org/guide/transactions.html
- Kysely (fully type-safe query builder for TS): https://kysely.dev
- jOOQ transaction API: https://www.jooq.org/doc/latest/manual/sql-execution/transaction-management/

---

## Raw SQL

*Parameterized queries via psycopg2, asyncpg, database/sql (Go), JDBC, etc.*

Raw SQL is covered in depth in `raw-sql-bulk-and-native-operations.md`. Key risks unique to raw SQL:

| Risk | Detail | Mitigation |
|---|---|---|
| **SQL injection** | String-concatenated queries with user input. | Parameterized queries only — `%s` / `$1` / `?` placeholders. Never f-strings or string concatenation. |
| **No automatic type mapping** | Results are tuples or dicts. | Map immediately to typed DTOs/structs after fetch. Never pass raw rows through service boundaries. |
| **Manual transaction management** | No ORM magic; every `conn.commit()` or `conn.rollback()` is explicit. | Use context managers or try/finally to ensure rollback on error. |
| **Connection not returned on exception** | Forgetting to close/return a connection leaks the pool. | Always use context managers: `with pool.acquire() as conn:`. |

---

## Document DB / ODM

*Examples: Mongoose (MongoDB + Node), Motor (MongoDB + Python async), Beanie (MongoDB + Python), Firestore client, DynamoDB DocumentClient*

### Critical: No assumed relational semantics

Document stores do not behave like relational databases. This is not a limitation to work around — it is their design. Do not assume:

- Multi-document atomicity (unless your DB version + driver explicitly support it and the contract declares it).
- Foreign key constraints or cascading deletes.
- JOINs (use $lookup in MongoDB aggregation, but it is not a SQL JOIN with referential integrity).
- Row-level locking (document stores typically use document-level locking or MVCC at best).

If the task requires any of these, **stop and require an explicit capability contract** before writing code. Do not silently fall back to application-level workarounds without declaring them.

### Key risks

| Risk | Detail | Mitigation |
|---|---|---|
| **Assumed cross-document atomicity** | Default MongoDB: operations are atomic at the document level only. | Use single-document operations where possible. For multi-document: use transactions (MongoDB 4.0+ replica set) or declare a saga/outbox pattern. |
| **Schema drift (schemaless danger)** | Documents in the same collection can have different shapes. | Enforce schema at the ODM layer (Mongoose schema validation, Beanie `BaseDocument` field types). |
| **No cascade deletes** | Deleting a parent document does not remove references in child documents. | Manage references explicitly; or embed child data rather than reference. |
| **Optimistic locking is manual** | Document stores have no `@VersionColumn`. | Add a `version` / `_etag` field; use `findOneAndUpdate` with version predicate. |
| **Mongoose write semantics vary by API and context** | Saving a projected or partially loaded document, or using replacement-oriented APIs, can cause unintended field loss or persistence depending on ODM version, schema settings, and which write API is used. Ordinary document `.save()` is not universally a full-document replacement, but its exact behavior depends on the declared ODM version and schema configuration. | Verify the declared ODM/version and write semantics in the project Data Access Contract before choosing a write path. For partial updates, prefer `findOneAndUpdate` with `$set` plus a concurrency predicate rather than relying on instance `.save()` semantics. |
| **Beanie / Motor async gotchas** | `await` is required on every DB call. Missing it returns a coroutine, not data. | Lint with `asyncio` type checking; use `await` consistently. |

### References

- MongoDB multi-document transactions: https://www.mongodb.com/docs/manual/core/transactions/
- Mongoose transactions: https://mongoosejs.com/docs/transactions.html
- Mongoose document `.save()`: https://mongoosejs.com/docs/api/document.html#Document.prototype.save()
- Beanie ODM: https://beanie-odm.dev/
- DynamoDB transactions: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html
