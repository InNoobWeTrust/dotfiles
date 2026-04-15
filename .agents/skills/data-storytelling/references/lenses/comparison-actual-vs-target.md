# Lens: Comparison - Actual Vs Target

## Purpose

Measure performance against explicit goals, plans, or service thresholds.

## Best For

- KPI reviews.
- SLA or SLO tracking.
- Board and operating cadence summaries.

## Required Inputs

- Actual metric.
- Target, goal, or threshold.
- Time grain or reporting slice.

## Questions Answered

- Are we above or below target?
- How large is the miss or beat?
- Is the gap widening or closing?

## Method

1. Pair each actual with its target.
2. Calculate absolute and relative gap.
3. Flag sustained misses and recoveries.
4. Segment misses when the top line hides uneven performance.

## Output Contract

- `baseline_or_comparator`: <reported target, goal, threshold, or service level used for comparison>
- `method_parameters`: <reported target definition, segmentation choices, and any aggregation rules affecting interpretation>
- Target attainment summary.
- Gap size.
- Duration of miss or beat.
- Highest-risk segment if applicable.

## Caveats

- Poor targets create misleading stories.
- Always validate whether the target is current and comparable.
