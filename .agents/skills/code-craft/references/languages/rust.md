# Rust Default Stack

Use for greenfield Rust services and CLIs. Retain a repository's existing compatible choices.

## Baseline

- Use Cargo workspaces when appropriate, `cargo fmt`, `cargo clippy`, and `cargo test`. Use cargo-audit for advisory scanning and cargo-deny when license/source policy validation is required.
- Use Serde and format crates such as `serde_json`/`toml` for serialization. Use `thiserror` for library error types and `anyhow` at application boundaries where contextual error propagation is sufficient.
- Use Tokio for asynchronous I/O services, Axum for HTTP APIs, Tower/Tower HTTP middleware, and Tracing with `tracing-subscriber` for structured diagnostics.
- Use `clap` (derive feature) for multi-command CLIs and subcommands; use `inquire` for interactive prompt wizards. Use `Ratatui` for full-screen interactive TUIs.
- Use `owo-colors` for zero-allocation ANSI styling, `comfy-table` for terminal tables, `indicatif` for progress bars/spinners, and `miette` for rich error diagnostics. Use `validator` with Serde structs for declarative validation. For cross-language patterns, see [CLI & TUI Stacks](cli-tui-stacks.md).

## Persistence lookup

Choose the engine and local, sync or remote access mode before selecting a Rust adapter. For a new embedded/local-first relational database, native Turso is a candidate; for direct SQLite-file access, libSQL is preferred. They are distinct engines/drivers and their SDK/ORM support is not interchangeable. Retain existing compatible choices; these preferences authorize no migration. Verify language, ORM, extension, transaction and schema-feature compatibility for the exact mode; SQLite compatibility alone is insufficient.

Retrieve conditional choices and backend/migration caveats from the [decision CSV](../../assets/code-reasoning.csv): `reason-rust-toasty`, `reason-rust-sqlx`, `reason-rust-diesel`, `reason-rust-libsql` and `reason-rust-turso`. Use an available [catalog query capability](../pattern-catalog.md#querying-the-catalog) with the actual Rust persistence requirements or exact IDs, retrieving bounded candidates rather than the whole CSV. If querying is unavailable, use bounded known-ID lookup and disclose the limitation; do not install a search dependency without approval.

Search results are candidates, not rankings or implementation approval. Verify required engine/mode, query and migration capabilities before selecting; note the decisive fit in the existing handoff, not a new comparison document. Return consequential capability gaps rather than silently changing engines or adapters.

## Embedded analytics lookup

For Rust/Arrow-native analytical SQL requiring custom table providers, functions or query planning/execution, retrieve `reason-datafusion-embedded-analytics` from the [decision CSV](../../assets/code-reasoning.csv). Apache DataFusion is an in-process query engine, not a distributed runtime, transactional database, workflow orchestrator or provenance system; Ballista and Comet require separate justification. Keep DuckDB as the general local-analytics default, retain compatible engines, and verify exact versions, operations, types, connectors, security controls and resource limits before adoption. Treat untested operation coverage and performance as unknown; any trial needs authorization and comparable correctness/resource measurements.

## Sources

- https://doc.rust-lang.org/cargo/
- https://doc.rust-lang.org/clippy/
- https://tokio.rs/
- https://docs.rs/axum/
- https://serde.rs/
- https://docs.rs/tracing/
- https://docs.rs/clap/
- https://github.com/transact-rs/sqlx
- https://github.com/tokio-rs/toasty
- https://tokio-rs.github.io/toasty/0.11.0/guide/schema-management.html
- https://diesel.rs/
- https://docs.rs/diesel-async/latest/diesel_async/
- https://docs.turso.tech/libsql
- https://docs.turso.tech/sdk
