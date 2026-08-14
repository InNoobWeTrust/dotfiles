# Rust Default Stack

Use for greenfield Rust services and CLIs. Retain a repository's existing compatible choices.

## Baseline

- Use Cargo workspaces when appropriate, `cargo fmt`, `cargo clippy`, and `cargo test`. Use cargo-audit for advisory scanning and cargo-deny when license/source policy validation is required.
- Use Serde and format crates such as `serde_json`/`toml` for serialization. Use `thiserror` for library error types and `anyhow` at application boundaries where contextual error propagation is sufficient.
- Use Tokio for asynchronous I/O services, Axum for HTTP APIs, Tower/Tower HTTP middleware, and Tracing with `tracing-subscriber` for structured diagnostics.
- Use clap derive for non-trivial CLIs; use `validator` when declarative data validation is needed.
- Prefer SQLx for SQL-forward persistence with checked mappings, and Diesel only when a full ORM is a clear fit. Use an established migration tool compatible with the selected persistence layer.

## Sources

- https://doc.rust-lang.org/cargo/
- https://doc.rust-lang.org/clippy/
- https://tokio.rs/
- https://docs.rs/axum/
- https://serde.rs/
- https://docs.rs/tracing/
- https://docs.rs/clap/
- https://github.com/launchbadge/sqlx
