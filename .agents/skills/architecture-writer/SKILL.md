---
name: architecture-writer
description: "Use this skill to generate or update architecture documentation — responsibility splits, data ownership, data flow diagrams, API contracts, integration modes, and non-goals. Activate when the user asks to document system design, create architecture diagrams, map data flows, or define API contracts. Skip for code changes that don't affect system architecture."
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
