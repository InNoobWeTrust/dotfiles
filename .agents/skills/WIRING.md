# Skill Wiring

Central registry for skill composition. Individual skills are self-contained
modules — they describe what THEY do, not what other skills do. This file is
the single source of truth for how skills relate, compose, and hand off.

> **Maintenance rule**: When adding, renaming, or removing a skill, update
> this file. Do NOT add cross-references inside individual skills.

---

## Composition Patterns

### Investigation → Fix → Review

When debugging or fixing a problem:

1. `codebase-exploration` — if the codebase is unfamiliar, navigate first
2. `systematic-investigation` — root cause analysis
3. `code-craft` — disciplined implementation of the fix
4. `reviewer` (design-rigor lens) — verify the fix was disciplined

### Feature Implementation

1. `requirements-driven-dev` — if the feature is large or ambiguous
2. `codebase-exploration` — if touching unfamiliar areas
3. `code-craft` — disciplined implementation
4. `reviewer` — post-implementation review

### UI/UX Implementation

1. `ui-ux` — design quality lens
2. `code-craft` — SOLID/modularity on component logic
3. `reviewer` (security lens) — input validation, auth on visual interfaces

### Browser Automation

1. `codebase-exploration` — map unfamiliar site structure before writing domain skills
2. `cdp-browser-automation` — automation implementation
3. `reviewer` (security lens) — for auth flows, cookies, sensitive data

### Bounded Iteration

1. `swarm-intelligence` — if the task needs design or decomposition first
2. `codebase-exploration` — if the codebase is unfamiliar
3. `bounded-iteration` — bounded iterative execution
4. `systematic-investigation` — if the loop hits oscillation or verifier failures
5. `reviewer` (security lens) — for auth, dependency, secrets, or network-facing work before AFK mode

---

## Handoff Points

Natural transitions between skills:

| From | To | Trigger |
|---|---|---|
| `codebase-exploration` | `systematic-investigation` | "I understand the codebase, now I need to debug" |
| `codebase-exploration` | `code-craft` | "I understand the codebase, now I need to implement" |
| `systematic-investigation` | `code-craft` | "Root cause found, now implementing the fix" |
| `code-craft` | `reviewer` | "Implementation complete, ready for review" |
| `requirements-driven-dev` | `code-craft` | "Specs approved, now implementing" |
| `requirements-driven-dev` | `reviewer` (editorial lens) | "Polish specs before sharing with stakeholders" |
| Any implementation skill | `reviewer` | "Review my work" |

---

## Provenance

Some reviewer sub-lenses are derived from implementation skills. The sub-lens
reviews whether the skill's principles were followed — it does not re-run the
skill.

| Reviewer Sub-Lens | Derived From | Relationship |
|---|---|---|
| `reviewer/references/design-rigor.md` | `code-craft`, `systematic-investigation` | Reviews whether design discipline and investigation rigor were applied |

---

## Default Composition Rules

- **Default for implementation**: load `code-craft`. Any task that writes or
  modifies code logic should use `code-craft` as the primary skill unless a
  narrower skill already covers the design dimension.
- `code-craft` can be composed with any other primary skill as a design lens —
  e.g. `systematic-investigation` (primary) + `code-craft` (design lens).
- Prefer no skill for simple edits (formatting, config values, renaming only).
- Prefer the narrowest skill that matches the user intent.
