---
name: code-craft
description: "Use this skill for any non-trivial code write, feature implementation, refactor, or restructuring — it is the default skill for all implementation tasks. Enforces SOLID, KISS, DRY, modularity, and human-readability at the function, class, and module level. Applies when writing new code, adding features, decomposing large functions, extracting modules, cleaning up code, or touching more than one file, even if the user doesn't explicitly ask for \"clean code\" or \"refactoring.\""
---

# Code Craft

Implementation workflow for non-trivial code. **Hard constraints** (naming, nesting, prohibited patterns, debt markers) live in always-on `rules/code-quality.md` and `rules/tdd.md` — obey them; do not restate them here.

**Skip only for:** typos, formatting, config values, renames with no logic change.

Progressive disclosure: load refs only when the phase needs them.

| When | Load |
|---|---|
| Writing implementation (Phase 3) | `references/write-standards.md` |
| Long tool chain, confidence drop, or thrash smell during Phase 3/4 | `references/trajectory-checkpoint.md` |
| Tempted by a shortcut | `references/anti-patterns.md` |

---

## Track Selection (before workflow)

Select the smallest delivery track that preserves the current acceptance criteria, hard invariants, and safety. Only when the phased-delivery trigger applies, use the roadmap or active milestone packet's phase/slice reference and canonical compromise-register references; lifecycle ownership remains with `../../rules/phased-delivery.md`.

| Track | Use when | Minimum phases / outputs | Strongest mandatory controls |
| --- | --- | --- | --- |
| **Patch** | Bounded defect or logic correction with no new slice | Compact Phase 1 intent, Phase 3 change, targeted Phase 4 audit | Reproduce or state the fault contract; tests and quality evidence for changed logic |
| **MVP Slice** | One independently valuable, shippable slice | Compact Phase 1, relevant Phase 2 checks, Phase 3 implementation/tests, Phase 4 audit | In-scope/non-goal boundary, acceptance criteria, explicit constraints, do not prebuild the next slice |
| **Expansion / Refactor** | Multiple slices, public-surface evolution, or structural change | All five phases and phased slice ordering | Compatibility, migration/rollback where relevant, full SOLID and quality review |
| **Hardening** | Security, data integrity, reliability, recoverability, or high-risk compatibility work | All five phases plus risk-specific verification | Fail-safe behavior, recovery evidence, relevant security/data controls, no unresolved hard-invariant breach |

## Workflow (5 phases — calibrated by track)

### Phase 1 — Design Intent (before writing)

When choosing a greenfield language/framework stack or adding a substantial platform capability, first load `references/languages/README.md`, then the smallest matching reference. Existing repository conventions and explicit project constraints always win.

For Expansion / Refactor and Hardening, produce the full block. For Patch and MVP Slice, it may be compact but must include the required slice fields first:

```
DESIGN INTENT
=============
In scope        :
Non-goals       :
Milestone/phase/slice reference: [when present]
Acceptance criteria:
Constraints     :
Known compromises: [canonical register references when phased; local deferrals otherwise; or none]
Unit name       :
Responsibility  : [one sentence, no "and"]
Caller interface: [in → out]
Glossary Sync   : yes/no
Interface contract: [signature / schema]
Docstring Spec  : yes/no
Interface sign-off: yes/no/assumed-approved (AFK only)
Module README   : yes/no/updated
Technology choice: [repo-native stack / established package + why]
Dependencies    : [existing first; new packages + maintenance/license/security fit]
Vendoring        : no / explicit user opt-in + rationale
Quality tools   : [repo-native commands first]
Complexity guard:
Isolation test  : yes/no
Error budget    :
Failure contract:
Ambiguity policy:
Traceability    :
```

For a Patch, `In scope`, `Non-goals`, acceptance criteria, constraints, and known compromises may be one line each. For an MVP Slice, they are mandatory even when every other field is compact. Do not invent a milestone or canonical-register reference when none exists.

**Technology default:** preserve the repository's established stack. Prefer the standard library/platform when it is suitable; otherwise, use a mature, maintained, production-proven ecosystem package rather than recreating an adequately supplied capability. Vendored third-party copies and deliberate dependency-free reimplementations are exceptions: require explicit user opt-in, or an existing repository policy, and record their ownership, update, and security rationale.

**STOP if:** isolation = no → redesign; interface sign-off = no (interactive) → get approval; edge-case semantics unspecified → ask (AFK: fail closed, do not invent fallbacks); a proposed vendored/reimplemented capability lacks explicit opt-in or documented repository policy → choose the platform/established dependency or clarify.

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

For Patch and MVP Slice, apply only checks relevant to the touched boundary and record N/A explicitly. Unchecked applicable items → fix or, when the phased-delivery trigger applies, record a material, cross-slice compromise through the shared compromise register. Otherwise record only a small local deferral in the change context; never use a local debt marker as a substitute for a required safety or correctness fix.

### Phase 3 — Write

1. Obey `rules/code-quality.md` + `rules/tdd.md` (RED → GREEN → REFACTOR; post test output).
2. Load `references/write-standards.md` for: defensive boundaries, immutability, invariants, types, quality tooling pass, docstrings, abstraction rules.
3. Re-check the selected language/framework reference before implementation when Phase 1 identified a new stack or substantial platform capability.
4. If the task crosses a long tool chain, confidence drops, or you detect thrash/re-reading, run the micro-protocol in `references/trajectory-checkpoint.md` before continuing.
5. Prefer repo-native `make` / scripts over ad-hoc tool installs.

### Phase 4 — Readability audit

As a new engineer: entry point, flow by names, side effects, error path, resilience, ambiguity handling, metric smells, docstrings, deep helpers. Fix or `// CLARITY:`. Create/update module `README.md` when the public surface or responsibility changes.

### Phase 5 — Tech debt inventory

When the phased-delivery trigger applies, inventory material deferred debt through the canonical compromise register in `../../rules/phased-delivery.md`. For Patch and MVP Slice in that context, create or update a shared canonical entry only when the debt is material or crosses slices. For non-phased work, record only small local deferrals in the change context. Do not create future infrastructure, abstractions, flags, or extension points solely to anticipate it.

---

## Deliverable

- [ ] Track selected; outputs and strongest controls satisfied
- [ ] Phase 1 design intent includes in scope, non-goals, milestone/phase/slice reference when present, acceptance criteria, constraints, and canonical compromise-register references when phased or local deferrals otherwise
- [ ] Phase 2 applicable checklist passed or material cross-slice compromise recorded
- [ ] Code follows `rules/code-quality.md` / `rules/tdd.md`
- [ ] Write-standards applied (Phase 3 ref when needed)
- [ ] Trajectory checkpoint used when drift/thrash signals appeared
- [ ] Tests: written first, evidence posted
- [ ] No invented semantic fallbacks
- [ ] Readability audit + module README when module responsibility/public surface changed
- [ ] When phased delivery applies, material/cross-slice future debt is entered in the shared compromise register; non-phased small local deferrals stay in the change context; no speculative prebuild
- [ ] Prohibited patterns: see `rules/code-quality.md` (not duplicated here)
