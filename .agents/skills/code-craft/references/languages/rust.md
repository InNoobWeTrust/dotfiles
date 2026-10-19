# Rust Default Stack

Use for greenfield Rust services and CLIs. Retain a repository's existing compatible choices.

## Baseline

- Use Cargo workspaces when appropriate, `cargo fmt`, `cargo clippy`, and `cargo test`. Use cargo-audit for advisory scanning and cargo-deny when license/source policy validation is required.
- Use Serde and format crates such as `serde_json`/`toml` for serialization. Use `thiserror` for library error types and `anyhow` at application boundaries where contextual error propagation is sufficient.
- Use Tokio for asynchronous I/O services, Axum for HTTP APIs, Tower/Tower HTTP middleware, and Tracing with `tracing-subscriber` for structured diagnostics.
- Use `clap` (derive feature) for multi-command CLIs and subcommands; use `inquire` for interactive prompt wizards. Use `Ratatui` for full-screen interactive TUIs.
- Use `owo-colors` for zero-allocation ANSI styling, `comfy-table` for terminal tables, `indicatif` for progress bars/spinners, and `miette` for rich error diagnostics. Use `validator` with Serde structs for declarative validation. For cross-language patterns, see [CLI & TUI Stacks](cli-tui-stacks.md).

## Persistence lookup

Choose the engine and local, sync or remote access mode first using the [database defaults](../../../db-design/SKILL.md#gate-1--storage--workload-check). Native Turso is the first candidate for a new embedded/local-first relational database; libSQL is the default for direct SQLite-file access. Retain existing compatible choices; neither preference authorizes a migration.

Retrieve conditional choices and backend/migration caveats from the [decision CSV](../../scripts/data/code-reasoning.csv): `reason-rust-toasty`, `reason-rust-sqlx`, `reason-rust-diesel`, `reason-rust-libsql` and `reason-rust-turso`. Use the existing [catalogue search](../pattern-catalog.md#running-the-search-engine), resolved against the code-craft skill directory: `scripts/search.py "<actual Rust persistence requirements>" --domain reasoning --max-results 3`. If execution or dependencies are unavailable, read the relevant CSV rows directly; do not install a search dependency without approval.

Search results are candidates, not rankings or implementation approval. Verify required engine/mode, query and migration capabilities before selecting; note the decisive fit in the existing handoff, not a new comparison document. Return consequential capability gaps rather than silently changing engines or adapters.

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
