---
name: code-craft
description: "Code design discipline enforcing SOLID, KISS, DRY, modularity, separation of concerns, and human-readability during implementation. Load for any non-trivial code write, feature addition, refactor, or restructuring. Covers: clean code, design patterns, decomposition, dependency management, naming, and architecture at the function/class/module level. Activate on \"refactor\", \"restructure\", \"design this module\", \"clean up this code\", \"make this maintainable\", \"decompose\", \"extract\", or any implementation touching more than one file."
---

# Code Craft

Implementation workflow for non-trivial code. **Hard constraints** (naming, nesting, prohibited patterns, debt markers) live in always-on `rules/code-quality.md` and `rules/tdd.md` — obey them; do not restate them here.

**Skip only for:** typos, formatting, config values, renames with no logic change.

Progressive disclosure: load refs only when the phase needs them.

| When | Load |
|---|---|
| Writing implementation (Phase 3) | `references/write-standards.md` |
| Tempted by a shortcut | `references/anti-patterns.md` |

---

## Workflow (5 phases — all required for non-trivial work)

### Phase 1 — Design Intent (before writing)

Produce this block:

```
DESIGN INTENT
=============
Unit name       :
Responsibility  : [one sentence, no "and"]
Caller interface: [in → out]
Glossary Sync   : yes/no
Interface contract: [signature / schema]
Docstring Spec  : yes/no
Interface sign-off: yes/no/assumed-approved (AFK only)
Module README   : yes/no/updated
Dependencies    :
Quality tools   : [repo-native commands first]
Complexity guard:
Isolation test  : yes/no
Error budget    :
Failure contract:
Ambiguity policy:
Traceability    :
```

**STOP if:** isolation = no → redesign; interface sign-off = no (interactive) → get approval; edge-case semantics unspecified → ask (AFK: fail closed, do not invent fallbacks).

### Phase 2 — SOLID checklist (before writing)

| Check | Pass? |
|---|---|
| S — one responsibility | ☐ |
| O — extend without rewrite | ☐ |
| L — no weakened contracts | ☐ / N/A |
| I — minimal public surface | ☐ |
| D — depend on abstractions | ☐ |
| Docstrings on public APIs | ☐ |
| Deep modules (no shallow 1–3 line helpers) | ☐ |
| YAGNI | ☐ |
| SoC — logic free of framework/IO details | ☐ |
| Complexity budget OK | ☐ |

Unchecked → fix or `// TODO(debt):`.

### Phase 3 — Write

1. Obey `rules/code-quality.md` + `rules/tdd.md` (RED → GREEN → REFACTOR; post test output).
2. Load `references/write-standards.md` for: defensive boundaries, immutability, invariants, types, quality tooling pass, docstrings, abstraction rules.
3. Prefer repo-native `make` / scripts over ad-hoc tool installs.

### Phase 4 — Readability audit

As a new engineer: entry point, flow by names, side effects, error path, resilience, ambiguity handling, metric smells, docstrings, deep helpers. Fix or `// CLARITY:`. Create/update module `README.md` when the public surface or responsibility changes.

### Phase 5 — Tech debt inventory

```
TECH DEBT INVENTORY
===================
[none]
— OR —
- TODO(debt): [where] — [what] — [why deferred] — [cleanup trigger]
```

---

## Deliverable

- [ ] Phase 1 design intent complete; stop gates honored
- [ ] Phase 2 checklist passed or debt marked
- [ ] Code follows `rules/code-quality.md` / `rules/tdd.md`
- [ ] Write-standards applied (Phase 3 ref when needed)
- [ ] Tests: written first, evidence posted
- [ ] No invented semantic fallbacks
- [ ] Readability audit + module README
- [ ] Tech debt inventory stated (even if empty)
- [ ] Prohibited patterns: see `rules/code-quality.md` (not duplicated here)
