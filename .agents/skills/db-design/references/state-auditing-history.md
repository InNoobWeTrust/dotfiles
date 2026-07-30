# State Auditing, History, & Soft Deletes

## 1. Soft Delete Patterns & Pitfalls

Naive `is_deleted BOOLEAN DEFAULT FALSE` columns introduce severe bugs:
- They break standard `UNIQUE` constraints (e.g. creating a new account with a previously soft-deleted email fails).
- They pollute every application query with `WHERE is_deleted = FALSE`.

```sql
-- CORRECT PATTERN: Partial Unique Index for Soft Deletes
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    deleted_at TIMESTAMPTZ NULL
);

-- Unique index applies ONLY to active records
CREATE UNIQUE INDEX uq_active_user_email ON users (email) WHERE deleted_at IS NULL;
```

---

## 2. Immutable Audit Log Pattern

For compliance, financial, or sensitive domain entities, use append-only audit log tables. When the audit log spans multiple entity types (the common case for cross-cutting concerns like RBAC, access control, or general change tracking), use a **polymorphic target** pattern.

### Why polymorphic targets are acceptable for audit tables

The general rule against polymorphic FKs (`target_id` + `target_type`) applies to **live business relationships** — those need referential integrity. Audit tables are different:

- Audit rows are **immutable historical snapshots** — they capture state at a point in time and are never updated.
- The referenced entity may be deleted, deactivated, or re-created, but the audit row must persist.
- Forcing a live FK would either block entity deletion (wrong for audit) or require `ON DELETE SET NULL` (loses the audit trail).
- Splitting into per-entity audit tables (`user_audit`, `role_audit`, `dept_audit`) fragments the timeline and makes cross-entity queries (e.g. "show everything admin X did") expensive.

### Cross-entity audit table pattern

```sql
CREATE TABLE rbac_audit_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES rbac_user(id) ON DELETE RESTRICT,

    -- Polymorphic target: no DB-level FK. Referential integrity is enforced
    -- by the audit writer (it always writes the actual row ID from the mutated entity).
    target_id UUID NOT NULL,
    target_type VARCHAR(50) NOT NULL,  -- 'user' | 'role' | 'department' | 'user_role' | ...

    action VARCHAR(50) NOT NULL,       -- 'user_role_add' | 'role_deactivate' | ...

    -- Immutable JSON snapshots of changed fields only (not full row dumps).
    -- Include human-readable identifiers (email, code) for audit readability.
    before JSONB,                      -- NULL for creates
    after JSONB,                       -- NULL for deletes

    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Indexes for common audit read paths
CREATE INDEX idx_audit_actor ON rbac_audit_event (actor_id, created_at DESC);
CREATE INDEX idx_audit_target ON rbac_audit_event (target_id, created_at DESC);
CREATE INDEX idx_audit_action ON rbac_audit_event (action, created_at DESC);
```

### Immutability hardening (defense-in-depth)

Append-only must be enforced at multiple layers:

1. **Repository layer**: the repository refuses `UPDATE` and `DELETE` on audit tables.
2. **DB role privileges**: revoke `UPDATE` and `DELETE` from the application DB role.
   ```sql
   REVOKE UPDATE, DELETE ON rbac_audit_event FROM app_role;
   ```
3. **DB trigger or rule** (hardest to bypass): reject mutations from any role.
   ```sql
   CREATE OR REPLACE FUNCTION prevent_audit_mutation() RETURNS trigger AS $$
   BEGIN
       RAISE EXCEPTION 'rbac_audit_event is append-only';
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER audit_no_update BEFORE UPDATE ON rbac_audit_event
       FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();
   CREATE TRIGGER audit_no_delete BEFORE DELETE ON rbac_audit_event
       FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();
   ```

### Snapshot convention

The `before`/`after` JSON columns capture **changed fields only**, not full row dumps. This keeps audit rows lightweight. Convention:

- Include **human-readable identifiers** (email, role_code, department_code) in the snapshot for audit readability — a reviewer should not need to join back to live tables to understand what changed.
- These snapshot values are **immutable** — they capture the state at audit time and are never updated even if the referenced entity later changes.
- `before` is `NULL` for create events; `after` is `NULL` for delete events.
- The `target_id` UUID is the **canonical reference** (row PK); the snapshot identifiers are **denormalized readability metadata**.

---

## 3. Change Data Capture (CDC) & Outbox Pattern

When audit logs or external event publishing (Kafka, RabbitMQ) are needed without double-write race conditions:
1. Write domain change + Outbox event within a single ACID transaction.
2. Read outbox table asynchronously via Debezium / CDC worker.
