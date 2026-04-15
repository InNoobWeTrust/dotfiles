# Lens: Comparison - Period Over Period

## Purpose

Compare a metric to a prior time window such as week-over-week, month-over-month, or year-over-year.

## Best For

- Quantifying recent change.
- Communicating business momentum.
- Establishing a baseline for anomaly or driver analysis.

## Required Inputs

- Time field.
- Metric.
- Defined comparison period.

## Questions Answered

- How much did the metric change?
- Is the change accelerating or decelerating?
- Does the change persist across comparison windows?

## Method

1. Define the prior comparison window. Implementation must choose this parameter and report the chosen value in the lens output.
2. Compute absolute and relative deltas.
3. Check sensitivity across more than one baseline when possible.

## Output Contract

- `baseline_or_comparator`: <reported prior period, alternate baseline, or seasonal equivalent used>
- `method_parameters`: <reported comparison window, alternate baselines checked, and any calendar-alignment rules used>
- Comparison window.
- Absolute change.
- Relative change.
- Stability note across alternate baselines.

## Caveats

- Beware holiday, seasonality, or calendar effects.
- Use year-over-year or seasonal comparisons when needed.
