# Lens: Trend - Seasonality And Inflection

## Purpose

Separate recurring seasonal patterns from structural changes and identify major turning points.

## Best For

- Metrics with weekly, monthly, or yearly cycles.
- Post-launch or post-policy-change analysis.
- Distinguishing normal variation from regime change.

## Required Inputs

- Time field with enough history.
- Metric.
- Optional event dates.

## Questions Answered

- Is the recent change seasonal or structural?
- Where do inflection points occur?
- Do event dates align with the shift?

## Method

1. Compare current behavior with prior seasonal equivalents.
2. Look for repeated patterns at the same cadence.
3. Detect inflection points or changepoints. Implementation must choose the cadence and changepoint logic, then report the chosen values in the lens output.
4. Check whether an external event aligns with the shift.

## Output Contract

- `baseline_or_comparator`: <reported prior seasonal equivalent, pre-change period, or event-period anchor used>
- `method_parameters`: <reported seasonal cadence, changepoint logic, and any event-alignment settings used>
- Seasonal pattern summary.
- Inflection or changepoint dates.
- Structural-change assessment.
- Event alignment note.

## Caveats

- Short histories weaken seasonality claims.
- Event alignment is not proof of causation.
