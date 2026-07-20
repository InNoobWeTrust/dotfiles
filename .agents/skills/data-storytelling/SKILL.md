---
name: data-storytelling
description: "Use this skill to transform raw data into decision-ready narratives — metric summaries, trend interpretation, insight extraction, and stakeholder reports. Activate when the user has data and wants to understand what it means, write a report, present findings, or turn numbers into actionable recommendations, even if they don't frame it as \"data analysis.\""
---

# Data Storytelling

Turn data into **decision-ready** narratives: goal-aligned, multi-lens, evidence-backed, HITL-correctable. Not chart commentary or uncalibrated stories.

## Success / non-goals

**Succeeds when:** answers the decision first; mandatory `## Lenses Used`; confidence + caveats + counter-signals; audience-adapted; provenance preserved.

**Not:** autonomous ETL; free-form causal claims past threshold; hidden CoT dumps; domain packs beyond built-in lenses.

## Operating flow (load detail as needed)

1. Frame goal / audience / decision (`references/questionnaire/goal-framing.md` if needed).
2. Profile data + import contract → `references/architecture-and-flow.md`.
3. Plan lenses (adaptive / exhaustive / user-specified) → `references/lenses-outputs-filemap.md` + `references/lenses/*`.
4. Mine signals with epistemic confidence + causal gate → `references/epistemic-and-hitl.md`.
5. Score insights; skeptic QA (`references/prompts/*`).
6. Render via output template (`assets/templates/*`).
7. Incorporate human feedback without losing provenance.

## Hard contracts (always)

- Every material claim has a **confidence** profile separate from causal threshold.
- Causal language levels 5–6 require the **causal evidence gate** (see epistemic ref).
- Intermediate artifacts keep `baseline_or_comparator` and `method_parameters`.
- Output must include `## Lenses Used` with signal + baseline per lens.

## Progressive disclosure

| Need | Path |
|---|---|
| Architecture / flow | `references/architecture-and-flow.md` |
| Confidence, causal gate, HITL | `references/epistemic-and-hitl.md` |
| Lenses, templates, file map | `references/lenses-outputs-filemap.md` |
| Full reference index | `references/README.md`, `references/REFERENCE.md` |
| Lens bodies | `references/lenses/` |
| Prompt components | `references/prompts/` |
