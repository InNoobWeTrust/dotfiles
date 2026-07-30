# Database Integrity & Constraints

## 1. Database-First Safety

Data integrity MUST be guaranteed by the database engine, not just application code. Application bugs or direct DB access will bypass app-level checks.

```mermaid
graph LR
    AppValidation["Application Validation (Soft Layer)"] --> DBConstraint["DB Constraints (Hard Layer)"]
    DBConstraint --> Engine["Storage Engine"]
```

---

## 2. Essential Constraints Checklist

### A. Nullability (`NOT NULL`)
- Mark columns `NOT NULL` by default.
- Require explicit architecture justification for any column marked nullable.

### B. Foreign Key Constraints
- Enforce relational links explicitly:
  ```sql
  CONSTRAINT fk_orders_customer 
    FOREIGN KEY (customer_id) 
    REFERENCES customers(id) 
    ON DELETE RESTRICT
  ```

### C. `CHECK` Constraints
- Enforce domain ranges and state validity at the table boundary:
  ```sql
  -- Ensure non-negative amounts
  CONSTRAINT chk_positive_amount CHECK (amount_cents >= 0),
  
  -- Enforce state machine transitions / allowed values
  CONSTRAINT chk_order_status CHECK (status IN ('DRAFT', 'PAID', 'SHIPPED', 'CANCELLED'))
  ```

### D. `UNIQUE` Constraints
- Enforce business uniqueness rules directly:
  ```sql
  -- Multi-tenant uniqueness
  CONSTRAINT uq_tenant_user_email UNIQUE (tenant_id, email)
  ```

---

## 3. Domain Custom Types & Enums
- Prefer `VARCHAR` with a `CHECK` constraint over native database `ENUM` types for application domain statuses. Native ENUM types in Postgres/MySQL require `ALTER TYPE` schema locks during migrations when adding new values.
