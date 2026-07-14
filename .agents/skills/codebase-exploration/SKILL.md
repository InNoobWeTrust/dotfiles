---
name: codebase-exploration
description: "Navigate and map large unfamiliar codebases. Find where behavior lives, trace feature flow and call chains, map architecture and dependency graphs, plan migrations/refactors, or answer \"where is X\" and \"how does this work\" questions. Also use for codebase scouting, hunting for specific patterns, discovering module relationships, or code archaeology. Activate on \"find the code for\", \"how is X implemented\", \"navigate the codebase\", \"trace this\", \"map the architecture\", or any task in an unfamiliar repo."
---

# Codebase Exploration

Navigate large unfamiliar codebases without reading everything. Always **quick recon first**, then decide direct vs deep.

---

## Phase 1 — Quick exploration (2–3 tool turns max)

Goal: enough overview to answer or know you need a deep dive.

1. Locate domain (`fd` / glob / path search — limit results).
2. Identify structure (symbols, exports, routes — concise tools).
3. Assess complexity (imports, file count, unfamiliar patterns).

Tool recipes: `references/quick-exploration-tools.md`.  
Direct vs delegate scenarios: `references/quick-vs-delegate-scenarios.md`.

```
Can you answer now?
  YES (≤3 files, clear pattern) → continue with a strategy below
  NO  (>5 files, unclear architecture) → Phase 2 delegate or deep strategy
```

---

## Phase 2 — Deep path

**Delegate** when harness has an explore agent and scope is large: give goal, strategy number, report template path.

**Or run directly** using one strategy (load only that section):

| Need | Strategy | Detail |
|---|---|---|
| Fix bug / add feature | 1 Logic Bubble | `references/navigation-strategies.md` |
| How system works | 2 Boundary & Registration | same |
| Add similar thing | 3 Clone & Mutate | same |
| Migration / module map | 4 Metadata & Module Audit | same |

---

## Report templates (pick one)

| Purpose | Template |
|---|---|
| Bug / feature context | `assets/logic-bubble-report.md` |
| System understanding | `assets/architecture-map-report.md` |
| Similar feature | `assets/clone-pattern-report.md` |
| Migration impact | `assets/dependency-audit-report.md` |
| Integration | `assets/api-surface-report.md` |
| Config change | `assets/config-schema-report.md` |
| Custom | `assets/custom-report-guide.md` |

---

## Stop navigating when

- Question answered with file:line evidence
- Change locus is clear (≤ bubble of files)
- Further reading is curiosity, not task need
- Diminishing returns after the chosen strategy’s steps

Do not dump the whole repo into context. Prefer structured report over raw file paste.
