# Lens: Trend - Time Series

## Purpose

Describe how a metric changes over time at the native reporting grain.

## Best For

- Direction-of-travel questions.
- Before-versus-after framing.
- Establishing context before deeper diagnosis.

## Required Inputs

- Time field.
- One or more metrics.
- Optional segment field.

## Questions Answered

- Is the metric rising, falling, or flat?
- When did the movement begin?
- Is the change broad or isolated?

## Method

1. Plot or reason across the metric by time.
2. Note level, slope, and volatility.
3. Compare recent periods with a stable baseline.
4. Flag missing dates or irregular grain.

## Output Contract

- `baseline_or_comparator`: <reported recent window, stable baseline, or comparison period used>
- `method_parameters`: <reported recent-window definition, grain normalization, and any missing-date handling used>
- Direction summary.
- Start and end values.
- Absolute and relative change.
- Confidence notes about baseline stability.

## Caveats

- Raw series may confuse trend with noise.
- Use with smoothing or seasonality lenses when volatility is high.
