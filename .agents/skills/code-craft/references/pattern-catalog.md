# Code Craft Pattern Catalog & Guide

> Ground code patterns in verified engineering blueprints and anti-pattern guardrails rather than model training artifacts.

---

## 1. Skill Boundary & Responsibility Matrix

To prevent mixing concerns across the codebase, patterns are partitioned across four specialized skills:

| Concern Level | Governing Skill | Scope & Patterns Owned |
|---|---|---|
| **Macro / System Topology** (C4 L1–L3) | `architecture-design` | Hexagonal / Ports & Adapters, Modular Monolith, Microservices, CQRS, Event Sourcing, Transactional Outbox, Sagas, Strangler Fig, API Gateway, BFF, Anti-Corruption Layer. |
| **Storage & Schema Design** | `db-design` | UUIDv7/ULID PK strategies, 1NF–3NF, composite B-tree/GIN indexing, structural constraints, string enum storage, zero-downtime expand-contract migrations, append-only audit tables. |
| **Data Access & Session Lifecycle** | `database-access` | Unit of work boundaries, repository vs active record, query builders, parameterized raw SQL, document ODM boundaries, aggregate synchronization, write idempotency. |
| **Code Craftsmanship (C4 L4)** | `code-craft` | Function/class/struct patterns, type-driven design, local concurrency/cancellation, language idioms, and model-specific code generation traps. |

---

## 2. Query Contract for `code-craft`

Before writing non-trivial implementation code (Phase 1 & Phase 2 of `code-craft`), query the pattern engine for canonical blueprints, trade-offs, and model traps.

### Running the Search Engine

The search engine is a self-executing script with PEP 723 inline metadata and zero dependencies:

```bash
# Self-executing (via uv shebang)
./.agents/skills/code-craft/scripts/search.py "<query>" [--stack <stack>] [--domain <domain>]

# uv runner
uv run .agents/skills/code-craft/scripts/search.py "<query>" [--stack <stack>]

# Python 3 standard library
python3 .agents/skills/code-craft/scripts/search.py "<query>" [--stack <stack>]

# Specialized queries
./.agents/skills/code-craft/scripts/search.py "<requirements>" --decide
./.agents/skills/code-craft/scripts/search.py --traps --model claude --stack typescript
```

---

## 3. Code-Craft Domains

| Domain | CLI `--domain` | Use When |
|---|---|---|
| **Code Patterns** | `patterns` / `pattern` | Structuring classes, functions, and modules (Result, Typestate, Functional Options, Builder, Strategy, Specification, Value Object, Discriminated Union, Constructor DI). |
| **Concurrency & Resilience** | `concurrency` / `resilience` | In-process execution safety, retries, rate limits, worker pools, structured concurrency (TaskGroup), and deadline propagation. |
| **Stacks** | `stacks` / `stack` | Pulling concrete, idiomatic syntax blueprints for Go, Rust, Python, TypeScript, C#, Java. |
| **Model Traps** | `traps` | Checking common model-specific hallucinations (Claude over-abstraction, Gemini error omission, GPT class bloat). |
| **Decisions** | `reasoning` / `decide` | Evaluating micro-level trade-offs (e.g. exceptions vs Result, typestate vs boolean flags, closures vs ABCs). |

---

## 4. Offline Quick Reference for `code-craft`

If command execution is restricted, reference the canonical IDs below:

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
- `concur-exponential-backoff`: **Backoff + Full Jitter** — Prevent thundering herds: `sleep = min(max_delay, base * 2^attempt) * rand()`.
- `concur-circuit-breaker`: **In-Process Circuit Breaker** — 3-state machine failing fast during downstream degradation.
- `concur-deadline-propagation`: **Context Cancellation** — Propagate deadlines through all RPC/DB calls; check `ctx.Done()`.

### Model Anti-Pattern Traps
- **Claude:** Stop over-abstracting simple functions into generic ABCs/monads. Don't catch broad exceptions and return `None` silently.
- **GPT:** Stop generating Java-style class hierarchies with getters/setters in TypeScript. Use interfaces and functions. Avoid mutable defaults in Python.
- **Gemini:** Always validate data at boundaries (Zod/Pydantic). Wrap Go errors with `%w` context instead of returning naked errors.
- **General:** Don't overuse Go channels for basic mutex needs. Don't call `.clone()` in Rust just to escape borrow checker without understanding ownership.
