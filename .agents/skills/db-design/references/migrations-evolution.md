# Zero-Downtime Schema Migrations

## 1. The Expand-Contract (Parallel Change) Pattern

Never execute destructive DDL (`DROP COLUMN`, `RENAME COLUMN`, altering data types) in a single deployment. Zero-downtime database changes require a 4-phase rollout:

```mermaid
sequenceDiagram
    autonumber
    participant DB as Database Schema
    participant AppOld as Old App Instances
    participant AppNew as New App Instances

    Note over DB,AppNew: Phase 1: Expand
    DB->>DB: Add new column (nullable or default)
    
    Note over DB,AppNew: Phase 2: Dual Write
    AppNew->>DB: Writes to BOTH old & new columns
    AppOld->>DB: Writes to old column
    
    Note over DB,AppNew: Phase 3: Backfill Data
    DB->>DB: Run background worker to backfill old rows to new column
    
    Note over DB,AppNew: Phase 4: Contract
    AppNew->>DB: Reads ONLY from new column
    DB->>DB: Drop old column (Safe DDL)
```

---

## 2. Non-Blocking DDL Guidelines (Postgres / MySQL)

- **Adding Columns**: Always add new columns as `NULLABLE` or with `DEFAULT` values that do not lock the table (Postgres 11+ handles defaults without rewriting the table).
- **Adding Indexes**: Always build indexes concurrently on live tables:
  ```sql
  CREATE INDEX CONCURRENTLY idx_users_phone ON users (phone);
  ```
- **Adding Foreign Keys**: Add foreign keys with `NOT VALID` first, then validate separately to avoid long table locks:
  ```sql
  ALTER TABLE orders ADD CONSTRAINT fk_orders_user 
    FOREIGN KEY (user_id) REFERENCES users(id) NOT VALID;
    
  ALTER TABLE orders VALIDATE CONSTRAINT fk_orders_user;
  ```
