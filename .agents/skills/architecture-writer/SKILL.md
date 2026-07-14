---
name: architecture-writer
description: "Generate or update docs/architecture.md with responsibility split, data ownership, data flow diagrams, API contract strategy, integration modes, and explicit non-goals. Load for \"write architecture doc\", \"document system design\", \"create architecture diagram\", \"map data flow\", or \"define API contracts\". Skip for minor code changes that don't affect architecture."
---

# Architecture Writer

Produce or update `docs/architecture.md` from the real codebase — not generic templates.

| Content | Path |
|---|---|
| Phases 1–6 detail | `references/phases.md` |
| Stop / deliverable / anti-patterns | `references/stop-deliverable-antipatterns.md` |

## Phase map

1. Discover existing architecture docs + code layout.
2. Responsibility split (who owns what).
3. Data ownership (tables/collections → services).
4. Data flow (ASCII diagram).
5. API contract strategy + sync.
6. Non-goals (explicit out-of-scope).

## Hard rules

- Prefer evidence from code over aspirational design.
- Mark unknowns; do not invent services.
- Ask before overwriting a substantially different existing doc.
- Link domain terms to `GLOSSARY.md` when present.
