# Code Craft Pattern Catalog & Guide

> Ground code patterns in verified engineering blueprints and anti-pattern guardrails rather than model training artifacts.

---

## 1. Skill Boundary & Responsibility Matrix

To prevent mixing concerns across the codebase, patterns are partitioned across four specialized skills:

| Concern Level | Governing Skill | Scope & Patterns Owned |
|---|---|---|
| **Macro / System Topology** (C4 L1–L3) | Architecture-design capability | Hexagonal / Ports & Adapters, Modular Monolith, Microservices, CQRS, Event Sourcing, Outbox, Sagas, API Gateway, Anti-Corruption Layer. |
| **Storage & Schema Design** | Schema-design capability | Key strategies, normalization, indexing, constraints, compatibility-safe migrations, audit tables. |
| **Data Access & Session Lifecycle** | Data-access capability | Unit of work, repository/session lifecycle, query builders, parameterized SQL, document boundaries, sync and idempotency. |
| **Code Craftsmanship (C4 L4)** | `code-craft` | Function/class/struct patterns, type-driven design, local concurrency/cancellation, language idioms, and code generation traps. |

---

## 2. Query Contract for `code-craft`

For a concrete implementation problem, optionally query for relevant blueprints,
trade-offs or known traps. Do not search before every change or introduce a
pattern just because it appears in the catalogue. The simplest suitable direct
implementation remains valid; catalog lookup is not a maintainability audit.

### Querying the Catalog

Use any available authorized search/query capability against the relevant CSV under this loaded skill's `assets/` directory. Prefer BM25 row retrieval for natural-language requirements, or an efficient CSV-aware query tool for exact IDs and field filters: SQLite (`sqlite3`, importing CSV into a temporary database), DuckDB SQL over CSV, Nushell CSV queries, an available BM25 CLI, or a configured MCP capability. These are alternatives, not required dependencies; inspect the actual interface and CSV header rather than assuming a command schema.

Retrieve a few matching rows with IDs and source locators. Apply stack, language, model or other constraints only where the actual catalog schema supports them; inspect applicability and exclusions rather than treating relevance as approval. Do not read entire CSV files into context. No particular MCP server or memory store is required. Do not install tools or upload catalogs without authorization; keep any database/index temporary and leave source CSVs unchanged.

---

## 3. Code-Craft Domains

| Domain | CSV under `assets/` | Use When |
|---|---|---|
| **Code Patterns** | `design-patterns.csv` | Structuring classes, functions, and modules (Result, Typestate, Functional Options, Builder, Strategy, Specification, Value Object, Discriminated Union, Constructor DI). |
| **Concurrency & Resilience** | `resilience.csv` | In-process execution safety, retries, rate limits, worker pools, structured concurrency (TaskGroup), and deadline propagation. |
| **Stacks** | `stacks.csv` | Pulling concrete, idiomatic syntax blueprints for Go, Rust, Python, TypeScript, C#, Java. |
| **Model Traps** | `model-traps.csv` | Checking generated code for observable defects such as over-abstraction, lost error context, and class bloat, regardless of model family. |
| **Decisions** | `code-reasoning.csv` | Evaluating concrete trade-offs (e.g. exceptions vs Result, typestate vs boolean flags, closures vs ABCs, Rust persistence adapters). Retrieve conditional candidates, then verify the actual requirements and backend capabilities. |

---

## 4. Offline Quick Reference for `code-craft`

If querying is unavailable, use bounded header/known-ID lookup or the quick
reference below and state the retrieval limitation; do not load entire CSV files,
install tools or bypass restrictions. Resolve `assets` against the loaded skill
directory, not a presumed working directory. These are conditional techniques,
not a required architecture:

### Modern Code Patterns
- `pat-result`: **Result / Railway Pattern** — Return `Result<T, E>` values for expected domain errors; avoid throwing exceptions for control flow.
- `pat-typestate`: **Typestate Pattern** — Encode state transitions in generic types; invalid states fail at compile time.
- `pat-functional-options`: **Functional Options** — Variadic `WithOption` closures for extensible configuration without breaking callers.
- `pat-builder`: **Type-Safe Fluent Builder** — Step-by-step aggregate construction enforcing required fields before compile.
- `pat-specification`: **Specification Pattern** — Encapsulate composable boolean business predicates (`.and()`, `.or()`).
- `pat-value-object`: **Value Object / Branded Type** — Immutable, self-validating domain primitives (prevent primitive obsession).
- `pat-strategy`: **Strategy Pattern** — Interchangeable algorithms via first-class closures or typed protocols.
- `pat-decorator`: **Decorator / Middleware Chain** — Composable handler wrappers for cross-cutting execution concerns.
- `pat-discriminated-union`: **Discriminated Union** — Tagged union enabling compiler exhaustiveness checking.
- `pat-constructor-di`: **Constructor Injection** — Explicit parameter passing to ensure testability without magic containers.

### In-Process Concurrency & Resilience
- `concur-worker-pool`: **Bounded Worker Pool** — Fixed worker goroutines/threads reading from a bounded queue with graceful drain.
- `concur-task-group`: **Structured Concurrency (TaskGroup)** — Lexical scoping for concurrent child tasks; cancels siblings on failure.
- `concur-git-lockfile`: **Git Atomic Lockfile** — Mutual exclusion and atomic file updates via `O_CREAT|O_EXCL`, temporary `.lock` write, atomic `rename(2)` swap, and signal/`atexit` cleanup where available. See [lock implementation](lock-patterns.md), including stale-lock limitations.
- `concur-exponential-backoff`: **Backoff + Full Jitter** — Prevent thundering herds: `sleep = min(max_delay, base * 2^attempt) * rand()`.
- `concur-circuit-breaker`: **In-Process Circuit Breaker** — 3-state machine failing fast during downstream degradation.
- `concur-deadline-propagation`: **Context Cancellation** — Propagate deadlines through all RPC/DB calls; check `ctx.Done()`.

### Model Anti-Pattern Traps
- **Abstraction and errors:** Avoid generic ABCs/monads for simple functions. Don't catch broad exceptions and return `None` silently.
- **Language idioms:** Prefer interfaces and functions over redundant TypeScript class hierarchies. Avoid mutable defaults in Python.
- **Boundaries and context:** Validate data at external boundaries with the project's chosen tooling. Wrap Go errors with `%w` context instead of returning naked errors.
- **Concurrency and ownership:** Don't overuse Go channels for basic mutex needs. Don't call `.clone()` in Rust just to escape borrow checker without understanding ownership. For local CLI/state files, consult [lock implementation](lock-patterns.md) rather than inventing distributed infrastructure or unsafe in-place writes.
