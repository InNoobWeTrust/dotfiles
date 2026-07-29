# Chart Selection Heuristics

Choose the **simplest visual that proves the claim**. Context and Big Idea come first; do not pick a chart just because the data allows it.

## Message intent → default visual

| Intent | Prefer | Avoid when possible |
|---|---|---|
| Compare categories | Horizontal bar chart | Pie, bubble chart |
| Show change over time | Line chart | Dense area chart, 3D line |
| Show before/after or rank shifts | Slopegraph or paired bars | Stacked bars without clear comparison |
| Show composition | Stacked bars or a small table; pie only for very few parts | Pie with many slices |
| Show distribution | Histogram, boxplot, or table summary | Over-decorated density shapes |
| Show relationship | Scatterplot | Bubble chart unless size is essential |
| Show contribution / build-up | Waterfall | Arbitrary stacked columns |
| Show flow / process | Flowchart or Sankey when the flow itself is the point | Mermaid xychart |
| Show exception vs threshold | Bullet graph, dot plot, or simple table | Gauges |

## Selection rules

1. Start from the claim sentence, not the dataset.
2. Prefer position and length over angle, area, or color.
3. Use direct labels where possible; legends are a fallback.
4. If the visual needs a long explanation, choose a simpler visual or use text.
5. If categories or series exceed readable limits, aggregate or switch formats.
6. If the message is mostly procedural, causal, or conceptual, escalate to `illustration-craft`.

## Common anti-patterns

- 3D charts
- Dual-axis charts without strong justification
- Pie charts with many slices
- Rainbow palettes that imply meaning they do not have
- Visuals that merely restate a table without sharpening the takeaway
