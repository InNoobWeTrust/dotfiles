# Architecture Pattern Catalog & Search Guide

> Queryable architecture pattern database, decision trees, and anti-pattern guardrails for system design and ADR writing.

## 1. Skill Boundary & Responsibility Matrix

To prevent mixing concerns across the codebase, patterns are partitioned across four specialized skills:

| Concern Level | Governing Skill | Scope & Patterns Owned |
|---|---|---|
| **Macro / System Topology** (C4 L1–L3) | `architecture-design` | Hexagonal / Ports & Adapters, Modular Monolith, Microservices, CQRS, Event Sourcing, Transactional Outbox, Sagas, Strangler Fig, API Gateway, BFF, Anti-Corruption Layer. |
| **Storage & Schema Design** | `db-design` | UUIDv7/ULID PK strategies, 1NF–3NF, composite B-tree/GIN indexing, structural constraints, string enum storage, zero-downtime expand-contract migrations, append-only audit tables. |
| **Data Access & Session Lifecycle** | `database-access` | Unit of work boundaries, repository vs active record, query builders, parameterized raw SQL, document ODM boundaries, aggregate synchronization, write idempotency. |
| **Code Craftsmanship (C4 L4)** | `code-craft` | Function/class/struct patterns, type-driven design, local concurrency/cancellation, language idioms, and model-specific code generation traps. |

---

## 2. Query Contract

When designing subsystem boundaries, microservices, modular monoliths, or asynchronous communication, query the architecture engine:

```bash
# Self-executing (via uv shebang)
./.agents/skills/architecture-design/scripts/search.py "<query>" [--domain <domain>]

# uv runner
uv run .agents/skills/architecture-design/scripts/search.py "<query>"

# Python 3 standard library
python3 .agents/skills/architecture-design/scripts/search.py "<query>"

# Architecture decision evaluation
./.agents/skills/architecture-design/scripts/search.py --decide
./.agents/skills/architecture-design/scripts/search.py "high write throughput" --decide

# Architecture traps / anti-patterns
./.agents/skills/architecture-design/scripts/search.py --traps
```

---

## 3. Core Domains

| Domain | CLI `--domain` | Purpose |
|---|---|---|
| **Patterns** | `patterns` / `arch` | Macro architecture patterns: Hexagonal, Modular Monolith, Clean, CQRS, Outbox, Sagas, Strangler Fig, API Gateway, BFF, Anti-Corruption Layer, Data Mesh. |
| **Decisions** | `reasoning` / `decide` | Decision heuristics mapping operational requirements (read/write split, distributed transactions, legacy migration) to optimal architectures. |
| **Traps** | `traps` | Macro-architectural anti-patterns to avoid (distributed monolith, 2PC across microservices, shared domain bags, smart pipes/dumb endpoints). |

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
