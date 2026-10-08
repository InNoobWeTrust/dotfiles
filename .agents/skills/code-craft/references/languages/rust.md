# Rust Default Stack

Use for greenfield Rust services and CLIs. Retain a repository's existing compatible choices.

## Baseline

- Use Cargo workspaces when appropriate, `cargo fmt`, `cargo clippy`, and `cargo test`. Use cargo-audit for advisory scanning and cargo-deny when license/source policy validation is required.
- Use Serde and format crates such as `serde_json`/`toml` for serialization. Use `thiserror` for library error types and `anyhow` at application boundaries where contextual error propagation is sufficient.
- Use Tokio for asynchronous I/O services, Axum for HTTP APIs, Tower/Tower HTTP middleware, and Tracing with `tracing-subscriber` for structured diagnostics.
- Use `clap` (derive feature) for multi-command CLIs and subcommands; use `inquire` for interactive prompt wizards. Use `Ratatui` for full-screen interactive TUIs.
- Use `owo-colors` for zero-allocation ANSI styling, `comfy-table` for terminal tables, `indicatif` for progress bars/spinners, and `miette` for rich error diagnostics. Use `validator` with Serde structs for declarative validation. For cross-language patterns, see [CLI & TUI Stacks](cli-tui-stacks.md).
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
