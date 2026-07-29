---
name: data-storytelling
description: "Use this skill to transform raw data into decision-ready narratives — metric summaries, trend interpretation, insight extraction, stakeholder reports, and evidence-backed visuals. Activate when the user has data and wants to understand what it means, write a report, present findings, turn numbers into actionable recommendations, or choose/design supporting charts, even if they don't frame it as \"data analysis.\" Skip for graphic-rich infographics, posters, or bespoke SVG illustration work — use `illustration-craft` when Mermaid or standard charts are insufficient."
---

# Data Storytelling

Turn data into **decision-ready** narratives: goal-aligned, multi-lens, evidence-backed, HITL-correctable, and visual when visuals improve comprehension.

## Success / non-goals

**Succeeds when:** answers the decision first; mandatory `## Lenses Used`; confidence + caveats + counter-signals; audience-adapted; provenance preserved; visuals clarify material evidence without overstating certainty.

**Not:** autonomous ETL; free-form causal claims past threshold; hidden CoT dumps; domain packs beyond built-in lenses; graphic-rich infographics or bespoke illustrations better handled by `illustration-craft`.

## Operating flow (load detail as needed)

1. Frame goal / audience / decision (`references/questionnaire/goal-framing.md` if needed).
2. Profile data + import contract → `references/architecture-and-flow.md`.
3. Plan lenses (adaptive / exhaustive / user-specified) → `references/lenses-outputs-filemap.md` + `references/lenses/*`.
4. Mine signals with epistemic confidence + causal gate → `references/epistemic-and-hitl.md`.
5. Score insights; skeptic QA (`references/prompts/*`).
6. Decide whether visuals help, then select/craft the simplest effective chart → `references/visuals/*`.
7. Render via output template (`assets/templates/*`) and revise without losing provenance.

## Hard contracts (always)

- Every material claim has a **confidence** profile separate from causal threshold.
- Causal language levels 5–6 require the **causal evidence gate** (see epistemic ref).
- Intermediate artifacts keep `baseline_or_comparator` and `method_parameters`.
- Output must include `## Lenses Used` with signal + baseline per lens.
- This skill guides narrative structure and evidence interpretation; it does not perform ETL, database queries, or statistical computation on its own.
- Visuals must not exceed the approved `claim_ceiling`; if certainty is weak, show caveats in text/caption.
- Escalation order: choose the simplest effective chart first, use Mermaid when it can carry the message cleanly, then route to `illustration-craft` only when bespoke composition is required.
- When Mermaid is not sufficient, stop escalating inside this skill and route to `illustration-craft`.

## Visual generation gate

Create a visual only when it improves audience understanding of a **material** insight.

| Audience | Default visual budget |
|---|---|
| `exec` | 1–2 hero visuals |
| `analyst` | 1 visual per material insight, usually capped around 5 |
| `ops` | 0–2 visuals; prefer exception bars or tables |
| `customer` | 1 simple visual max |
| mixed / unknown | 1–3 visuals |

If a visual would add clutter, repeat the takeaway, or require bespoke illustration, do not force it.

## Progressive disclosure

| Need | Path |
|---|---|
| Architecture / flow | `references/architecture-and-flow.md` |
| Confidence, causal gate, HITL | `references/epistemic-and-hitl.md` |
| Lenses, templates, file map | `references/lenses-outputs-filemap.md` |
| Visual selection, Mermaid craft, QA | `references/visuals/` |
| Full reference index | `references/README.md`, `references/REFERENCE.md` |
| Lens bodies | `references/lenses/` |
| Prompt components | `references/prompts/` |
