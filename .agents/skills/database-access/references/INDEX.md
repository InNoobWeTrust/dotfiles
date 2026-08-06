# database-access — Reference Index

Load references only when the router (`SKILL.md`) directs you here. Do not preload the full tree.

| Reference | When to load |
|---|---|
| `capability-contract.md` | Phase 1 — before any data-access implementation; missing-capability protocol |
| `unit-of-work-and-state-lifecycle.md` | Designing UoW boundaries; session state machine; entity lifecycle |
| `write-contracts-idempotency-and-concurrency.md` | Any write path — idempotency, concurrency, optimistic locking |
| `facade-guides.md` | Pattern identification (Phase 2) — load the section matching the project facade |
| `raw-sql-bulk-and-native-operations.md` | Raw SQL queries, bulk INSERT/UPDATE, native driver operations |
| `testing-and-extensions.md` | Writing tests for data-access adapters; optional extension patterns |
