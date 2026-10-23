# Illustration Craft

`illustration-craft` is a reusable skill for building bespoke, information-carrying illustrations when Mermaid or standard analytical charts are not enough.

Use it for infographics, posters, academic multi-panel figures, annotated presentation graphics, and other visual compositions where hierarchy, layout, and typography matter as much as the data itself.

## When To Use It

Use this skill when you need:

- An infographic that tells a process, comparison, or recommendation visually.
- A presentation-ready SVG or raster image with deliberate layout and hierarchy.
- An academic or article figure with multiple coordinated panels.
- A bespoke architecture-adjacent explainer where Mermaid is too rigid.

Do not use it for routine chart choice or evidence-backed narrative synthesis; those need a chart-selection/data-narrative capability with the source data, baseline, audience and claim constraints. If that capability is unavailable, return the evidence as text or mark the requested chart unresolved rather than inventing a bespoke layout.

## Example Invocations

```text
Turn this architecture migration storyboard into a presentation-grade infographic with a dominant takeaway, one comparison panel, and SVG source plus PNG export if tooling is available.
```

Expected shape: one bold headline, one comparison panel, restrained callouts, and a source-first deliverable with a raster fallback note if export is unavailable.

```text
Create an academic-style multi-panel illustration from these three findings and keep the typography restrained, the callouts precise, and the layout publication-friendly.
```

Expected shape: a coordinated A/B/C figure where each panel supports the same thesis, shared styling is consistent, and caption/alt text are prepared for embedding.

## Escalation Example

If a chart-selection/data-narrative capability can explain the finding with a normal chart, use that output. Escalate to bespoke composition only when the message needs more than a chart — for example, when an approved architecture migration source needs phases, tradeoffs, and callouts arranged in one guided visual rather than a single Mermaid diagram. Provide the source findings, audience and claim ceiling; preserve all caveats and stop if the authoritative meaning is missing.
