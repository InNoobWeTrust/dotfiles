# Architecture Pattern Catalog & Search Guide

> Queryable architecture pattern database, decision trees, and anti-pattern guardrails for system design and ADR writing.

## 1. Skill Boundary & Responsibility Matrix

To prevent mixing concerns across the codebase, patterns are partitioned across four specialized skills:

| Concern Level | Governing Skill | Scope & Patterns Owned |
|---|---|---|
| **Macro / System Topology** (C4 L1–L3) | `architecture-design` | Hexagonal / Ports & Adapters, Modular Monolith, Microservices, CQRS, Event Sourcing, Transactional Outbox, Sagas, Strangler Fig, API Gateway, BFF, Anti-Corruption Layer. |
| **Storage & Schema Design** | Schema-design capability | UUIDv7/ULID PK strategies, 1NF–3NF, indexes, constraints, compatibility-safe migrations, audit models. |
| **Data Access & Session Lifecycle** | Data-access implementation capability | Unit-of-work boundaries, repository/session lifecycle, parameterized queries, aggregate sync, write idempotency. |
| **Code Craftsmanship (C4 L4)** | Implementation capability | Function/class/struct patterns, type-driven design, local concurrency/cancellation, language idioms, and code-generation risks. |

---

## 2. Query Contract

When designing subsystem boundaries, modular monoliths, or asynchronous communication, query the relevant catalog under this loaded skill's `assets/` directory.

Use any available authorized search/query capability. Prefer BM25 row retrieval for natural-language requirements, or an efficient CSV-aware query tool for exact IDs and field filters: SQLite (`sqlite3`, importing CSV into a temporary database), DuckDB SQL over CSV, Nushell CSV queries, an available BM25 CLI, or a configured MCP capability. These are alternatives, not required dependencies; inspect the actual interface and CSV header rather than assuming a command schema.

Select only the relevant CSV below, query required capabilities/use conditions, and return a few matching rows with IDs and source locators. Check exclusions, trade-offs and constraints before choosing; relevance is not architectural approval. Do not read entire CSV files into context. If no query capability is available, use bounded header/known-ID lookup or the quick reference below and state the retrieval limitation. Do not install tools, create a memory store, or upload catalogs without authorization; keep any database/index temporary and leave source CSVs unchanged.

---

## 3. Core Domains

| Domain | CSV under `assets/` | Purpose |
|---|---|---|
| **Patterns** | `architecture.csv` | Macro architecture patterns: Hexagonal, Modular Monolith, Clean, CQRS, Outbox, Sagas, Strangler Fig, API Gateway, BFF, Anti-Corruption Layer, Data Mesh. |
| **Decisions** | `architecture-reasoning.csv` | Decision heuristics mapping operational requirements (read/write split, distributed transactions, legacy migration) to candidate architectures. |
| **Traps** | `architecture-traps.csv` | Macro-architectural anti-patterns to avoid (distributed monolith, 2PC across microservices, shared domain bags, smart pipes/dumb endpoints). |

---

## 4. Offline Quick Reference

- `arch-vsa`: **Vertical Slice Architecture** — Co-locate handlers, DTOs, and queries per feature; avoid layer-hopping.
- `arch-hex`: **Hexagonal / Ports & Adapters** — Core domain isolated from frameworks and persistence; driving/driven ports.
- `arch-mod-mono`: **Modular Monolith** — Bounded contexts in a single deployment; strict public interface per module.
- `arch-clean`: **Clean / Onion Architecture** — Domain-centric enterprise system with strict layer dependency inversion.
- `arch-microservices`: **Microservices** — Autonomous deployables with private databases and explicit API contracts.
- `arch-event-driven`: **Event-Driven Pub/Sub** — Loose temporal coupling and high-throughput async notifications.
- `arch-cqrs`: **CQRS** — Independent read projections vs command validation models.
- `arch-event-sourcing`: **Event Sourcing** — Complete immutable state history captured as domain event streams.
- `arch-outbox`: **Transactional Outbox** — Atomic database write + message publishing via outbox table.
- `arch-saga-orch`: **Saga (Orchestrated)** — Centralized orchestrator coordinating multi-service transactions with compensating rollbacks.
- `arch-saga-choreo`: **Saga (Choreographed)** — Decentralized event-driven workflow for lightweight 2–4 service interactions.
- `arch-strangler`: **Strangler Fig** — Incremental legacy monolith migration with reverse-proxy interceptors.
- `arch-api-gateway`: **API Gateway / BFF** — Tailored client-specific contracts aggregating internal microservices.
- `arch-acl`: **Anti-Corruption Layer** — Protecting domain model purity from volatile third-party or legacy schemas.
