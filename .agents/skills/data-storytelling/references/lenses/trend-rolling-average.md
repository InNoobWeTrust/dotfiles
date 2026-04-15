# Lens: Trend - Rolling Average

## Purpose

Smooth noisy time series so durable movement is easier to see.

## Best For

- Metrics with daily or weekly noise.
- Operational series with spikes.
- Communicating the underlying signal to non-analyst audiences.

## Required Inputs

- Time field.
- Metric.
- Window definition such as 7-day or 4-week.

## Questions Answered

- Does the underlying trend persist after smoothing?
- Was a recent spike a one-off or part of a broader change?

## Method

1. Choose the rolling window parameter and edge-handling rule. Implementation must choose these parameters and report the chosen values in the lens output.
2. Compute the raw series and rolling average.
3. Compare turning points in the smoothed line to the raw series.
4. Quantify the difference between the recent rolling window and prior windows.

## Output Contract

- `baseline_or_comparator`: <reported recent-versus-prior window, historical baseline, or raw-series reference used>
- `method_parameters`: <reported rolling window, edge-handling rule, and any smoothing exceptions used>
- Window used.
- Smoothed direction.
- Recent-versus-prior rolling difference.
- Warning if the window hides meaningful short-lived events.

## Caveats

- Smoothing can delay or flatten real inflections.
- Pair with inflection detection when timing matters.
