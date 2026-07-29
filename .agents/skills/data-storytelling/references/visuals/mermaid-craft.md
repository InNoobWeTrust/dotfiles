# Mermaid Craft

Use Mermaid when it can express the message cleanly and quickly. Prefer Mermaid for portable, editable visuals in markdown workflows.

## Chart defaults

- Use `xychart-beta` for simple quantitative charts.
- Use `flowchart` for process, root-cause, and decision flow.
- Use `sankey-beta` only when the flow volumes are the message and the diagram remains readable.

## Readability limits

- Maximum ~6 series.
- Maximum ~12 categories on one axis.
- Do not pass raw granular data; aggregate first.
- Prefer horizontal category labels when category names are long.

## Craft rules

1. Title the visual with the takeaway, not the chart type.
2. Keep one dominant message per visual.
3. Direct-label important series or bars whenever Mermaid supports it; otherwise reduce legend dependence.
4. Use restrained color: one accent for focus, neutrals for context.
5. Start quantitative axes at zero for bars unless there is an explicit reason not to; if not, say so in the caption.
6. Do not force complex infographic layouts in Mermaid; escalate to `illustration-craft`.

## Escalation triggers

Route to `illustration-craft` when you need:

- custom layout with multiple visual panels
- rich annotation, callouts, or visual metaphor
- poster / infographic treatment
- polished SVG work where typography and spacing are first-class concerns
