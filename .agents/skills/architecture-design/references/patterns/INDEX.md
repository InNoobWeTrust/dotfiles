# Architecture Pattern Index

Search this index with `rg` or `grep` to find relevant patterns by keyword.

## By Category

| Category | File | Patterns |
|---|---|---|
| Structural | `structural.md` | microservices, monolith, modular-monolith, hexagonal, clean, onion, layered, plugin |
| Communication | `communication.md` | event-driven, cqrs, saga, event-sourcing, message-bus, pub-sub, request-reply |
| Deployment | `deployment.md` | serverless, edge, sidecar, service-mesh |
| Data | `data.md` | data-mesh, data-lake, polyglot-persistence, sharding, materialized-views |
| Integration | `integration.md` | api-gateway, bff, strangler-fig, anti-corruption-layer |
| Resilience | `resilience.md` | circuit-breaker, bulkhead, retry-backoff, health-check, chaos-engineering |

## By Concern

Search by concern keyword to find patterns that address it:

| Concern | Patterns (→ category file) |
|---|---|
| scaling | microservices, serverless, sharding, edge, cqrs |
| decoupling | hexagonal, event-driven, message-bus, pub-sub, anti-corruption-layer |
| migration | strangler-fig, anti-corruption-layer, modular-monolith |
| consistency | saga, event-sourcing, cqrs, materialized-views |
| resilience | circuit-breaker, bulkhead, retry-backoff, health-check, chaos-engineering |
| security | service-mesh, sidecar, api-gateway |
| simplicity | monolith, modular-monolith, layered, request-reply |
| real-time | event-driven, pub-sub, edge, event-sourcing |
| data-intensive | data-mesh, data-lake, polyglot-persistence, sharding |
| api | api-gateway, bff, request-reply |
| testability | hexagonal, clean, onion, modular-monolith |
| team-autonomy | microservices, data-mesh, bff |

## Deep Dive

Each pattern file contains a compact entry (diagram + table). For patterns requiring deeper analysis, look for the `<details>` section within each pattern entry for extended discussion of tradeoffs, migration strategies, and real-world considerations.
