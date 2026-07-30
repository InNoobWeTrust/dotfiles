# Concurrency Control & Isolation Levels

## 1. Optimistic Locking (Recommended Default)

For high-contention domain entities (e.g. inventory balances, account balances, order status), use optimistic locking via a `version` column.

```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    balance_cents BIGINT NOT NULL CHECK (balance_cents >= 0),
    version INT NOT NULL DEFAULT 1
);
```

### Application Lock Pattern
```sql
-- Read initial record
SELECT balance_cents, version FROM accounts WHERE id = '...';

-- Update with explicit version check
UPDATE accounts 
SET balance_cents = balance_cents - 1000, 
    version = version + 1 
WHERE id = '...' AND version = 1;

-- If rows_affected == 0, a concurrent update occurred! Raise OptimisticLockException & retry.
```

---

## 2. Pessimistic Row Locking (`FOR UPDATE`)

Use pessimistic row locking only for short-lived, high-stakes atomic operations:

```sql
BEGIN;
-- Lock target row until transaction completes
SELECT balance_cents FROM accounts WHERE id = '...' FOR UPDATE;

UPDATE accounts SET balance_cents = balance_cents - 1000 WHERE id = '...';
COMMIT;
```

---

## 3. Transaction Isolation Levels

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read | Use Case |
|---|---|---|---|---|
| **Read Committed** (Default) | Prevented | Allowed | Allowed | Standard web app transactions |
| **Repeatable Read** | Prevented | Prevented | Allowed | Financial audits / reporting batch reads |
| **Serializable** | Prevented | Prevented | Prevented | Strict sequential invariant enforcement |
