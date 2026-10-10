# Database Inspection and Verification with hsql

## Preferred Tool: `hsql`

`hsql` is the headless companion CLI to [Harlequin](https://harlequin.sh/), packaged together with Harlequin. It is the **preferred tool** for agents to explore database catalogs, inspect schemas, and verify queries safely in headless and scripted environments.

### Why `hsql` for Agents

1. **Headless Execution**: Fast, non-interactive CLI optimized for agents and automation scripts (`hsql -c "..."`).
2. **Catalog Discovery Without SQL**: Inspects schemas, tables, and columns directly without requiring DBMS-specific `information_schema` or `sys` queries.
3. **Safety Guardrails**:
   - `--read-only`: Connects in a mode where the database adapter refuses writes.
   - `--timeout <seconds>`: Automatically cancels runs exceeding the threshold.
4. **Adapter Parity**: Shares adapters and profiles with Harlequin (DuckDB, SQLite, PostgreSQL, MySQL, ODBC, etc.).

---

## Core Agent Workflows

### 1. Catalog & Schema Exploration (No SQL Required)

Before writing DTOs, entity mappings, or queries, inspect the live database structure:

```bash
# List top-level schemas or relations
hsql -P dev --catalog

# List relations within a schema
hsql -P dev --catalog --path analytics

# List columns and types for a specific table
hsql -P dev --catalog --path analytics.orders

# Search all catalog levels for a column or table name
hsql -P dev --catalog-search customer_id
```

### 2. Headless Query Execution & Testing

Execute queries headlessly to verify query syntax, test CTEs/window functions, or examine sample data:

```bash
# Execute a single query
hsql -P dev --read-only --timeout 30 -c "SELECT id, status, total FROM orders LIMIT 5"

# Read SQL from a file, or name stdin explicitly with --file -
hsql -P dev --read-only --timeout 30 --file migration_check.sql
cat migration_check.sql | hsql -P dev --read-only --timeout 30 --file -

# Select the adapter explicitly; -P None bypasses configured default profiles.
hsql -P None -a duckdb ./local.duckdb --read-only --timeout 30 -c "SHOW TABLES"
hsql -P None -a sqlite ./app.db --read-only --timeout 30 -c "PRAGMA table_info(orders)"
```

### 3. Agent Safety Bounds

Always apply safety bounds when exploring or inspecting unknown or production-like databases. The `--timeout 30` shown below is an example budget; adjust within your caller's job limit and remain fail-closed if execution exceeds it.

```bash
# Enforce read-only mode (adapter refuses INSERT, UPDATE, DELETE, DDL)
hsql -P prod --read-only --timeout 30 -c "SELECT count(*) FROM orders"

# Set a strict execution timeout (in seconds) to prevent hanging queries
hsql -P dev --read-only --timeout 30 -c "EXPLAIN ANALYZE SELECT * FROM large_table"

# Combine read-only and timeout
hsql -P dev --read-only --timeout 30 -c "SELECT * FROM users LIMIT 10"
```

---

## Profile & Configuration

`hsql` uses the same configuration and profiles as Harlequin. Automatically discovered files include `~/.harlequin.toml`, a project `.harlequin.toml`, or a `pyproject.toml` with a `[tool.harlequin]` section. Use `--config-path <file>` for other locations.

- Select a profile with `-P <profile>` or `--profile <profile>`.
- Profile keys use underscores, not CLI flag names: `read_only = true` and `timeout = 30`. For example, in `.harlequin.toml`:

  ```toml
  [profiles.dev]
  adapter = "duckdb"
  conn_str = ["./local.duckdb"]
  read_only = true
  timeout = 30
  ```

  In `pyproject.toml`, use `[tool.harlequin.profiles.dev]` instead. These bounds require adapter support; `hsql` refuses the run if the selected adapter cannot enforce them.
- Inspect and validate profiles:
  ```bash
  hsql --config show
  hsql --config validate
  ```

---

## Integration with `database-access` Workflow

| Phase | `hsql` Usage | Command Pattern |
|---|---|---|
| **Phase 1: Contract Discovery** | Confirm table exists, verify column data types and nullability | `hsql --catalog --path <schema.table>` |
| **Phase 2: Pattern Identification** | Check dialect capabilities, search relations | `hsql --catalog-search <entity>` |
| **Phase 3/4: Implementation** | Test raw SQL, query plans (`EXPLAIN`), or dialect-specific features | `hsql --read-only --timeout 30 -c "EXPLAIN <query>"` |
| **Phase 5: Self-Verification** | Verify test data state or seed state post-run | `hsql --read-only --timeout 30 -c "<query>"` |
