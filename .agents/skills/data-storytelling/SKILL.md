---
name: data-storytelling
description: "Transform raw data into decision-ready narratives aligned to goals, KPIs, or OKRs. Multi-lens analysis with explicit evidence grading and confidence levels. Use for data analysis, metric summaries, trend interpretation, insight extraction, report writing, or presenting findings to stakeholders. Activate on \"analyze this data\", \"summarize the metrics\", \"what do these numbers mean\", \"write a report\", \"present findings\", \"interpret trends\", or any task turning data into actionable narrative."
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
