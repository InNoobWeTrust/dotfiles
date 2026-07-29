---
name: illustration-craft
description: "Use this skill to create graphic-rich illustrations such as infographics, posters, academic figures, and bespoke visual compositions when Mermaid or standard charts are insufficient. Activate when the user needs layout, hierarchy, annotation, visual metaphor, or presentation-grade illustration from structured inputs. Skip for routine chart selection or evidence-backed analytical narrative — use `data-storytelling` for those." 
---

# Illustration Craft

Create polished illustrations that carry information through layout, hierarchy, annotation, and visual structure — not just through text.

## Scope check

Use this skill when the message needs **bespoke visual composition**: infographic, poster, multi-panel explainer, academic figure, or presentation graphic where Mermaid is too limiting.

`presentation-grade` means the final artifact is targeting a slide deck, stakeholder report, or publication-quality PDF and needs custom layout, typography, annotations, or visual hierarchy beyond a standard Mermaid render.

Operational activation cues:

- 2 or more coordinated panels are needed.
- 3 or more callouts / annotations are needed around a focal visual.
- The layout is spatial, poster-like, or metaphor-driven rather than a normal x/y chart.
- The architecture or business story is already clear, but the final artifact needs a presentation-grade explainer beyond Mermaid.

Stop and route elsewhere when:

- the task is mainly choosing a chart for data evidence → `data-storytelling`
- the task is mainly UI/product interface design → `ui-ux`
- the task is mainly C4 or architecture documentation → `architecture-design`

Architecture handoff note:

- If architecture documentation is not done yet, start in `architecture-design`.
- If architecture documentation is already done and the user now needs a bespoke infographic, poster, or presentation explainer built from that documentation, stay here.

## Minimum input contract

Before drawing, capture at least:

- audience and destination artifact
- dominant takeaway or primary thesis
- source content or findings to visualize
- required panels, callouts, or comparisons
- output requirements (`svg`, `png`, `jpeg`, or source-only fallback)
- for quantitative claims: source attribution plus upstream confidence / claim ceiling when available

If these are missing, ask for them or explicitly mark assumptions.

## Operating flow

1. Clarify audience, format, size, and the dominant takeaway the illustration must carry.
2. Convert raw content into a storyboard: what must be seen first, second, and third.
3. Choose a layout methodology → `references/layout-methodologies.md`.
4. Apply visual grammar → `references/visual-grammar.md`.
5. Draft the illustration structure with minimal decorative noise; produce SVG when the environment supports it, otherwise deliver a structural illustration spec suitable for SVG handoff.
6. Run visual QA → `references/visual-qa-checklist.md`.
7. Export source + embeddable image and capture alt text / usage notes.

## Hard rules

- The illustration must have one primary thesis; comparison panels may present balanced alternatives as long as the dominant insight is still obvious.
- Layout is part of the meaning; do not place elements arbitrarily.
- Typography, spacing, alignment, and color must support hierarchy, not decorate randomly.
- Use visual metaphor only when a non-domain reader can understand it without a long explanation.
- If the illustration carries quantitative claims without an approved confidence or claim ceiling from upstream analysis, present certainty conservatively and caveat visibly.
- If the illustration starts behaving like a normal chart, route back to `data-storytelling`.

## Stop conditions

- Required inputs remain too vague after clarification -> stop and ask instead of inventing a layout.
- The message is still chart-shaped after storyboard review -> route back to `data-storytelling`.
- Architecture documentation is missing and the user is still defining the system -> route to `architecture-design` first.
- Export tooling is unavailable -> deliver source/spec plus a fallback note rather than claiming production-ready raster output.

## Anti-patterns

| Temptation | Why wrong | Correct path |
|---|---|---|
| Decorate with icons everywhere | Noise competes with meaning | Use icons only where they encode information |
| Force a chart-shaped problem into bespoke illustration | Adds effort without clarity | Route back to `data-storytelling` |
| Use a metaphor that needs paragraph-length explanation | The visual obscures instead of clarifies | Use direct labels or a simpler layout |
| Overload one infographic with many unrelated claims | The viewer loses the hierarchy | Split into one thesis with supporting panels |
| Promise polished raster output without tooling | Breaks trust when export fails | Deliver source/spec plus a clear fallback note |

## Progressive disclosure

| Need | Path |
|---|---|
| Layout choice | `references/layout-methodologies.md` |
| Typography, color, iconography, spacing | `references/visual-grammar.md` |
| Review and polish | `references/visual-qa-checklist.md` |
| Deliverable shape | `references/export-and-embedding.md` |
