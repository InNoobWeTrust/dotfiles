# Lens: Distribution - Shape And Percentiles

## Purpose

Reveal how values are spread, whether the average is representative, and where tails matter.

## Best For

- Latency, spend, tenure, order value, and other skewed metrics.
- Cases where the median and average tell different stories.
- Fairness or service consistency questions.

## Required Inputs

- Numeric metric.
- Enough observations to reason about spread.
- Optional segment dimension.

## Questions Answered

- Is the distribution skewed or bimodal?
- Do tail cases drive the narrative?
- Which percentiles matter operationally?

## Method

1. Inspect histogram shape or equivalent descriptive statistics.
2. Compare median, mean, and key percentiles. Implementation must choose the percentile set and report the chosen values in the lens output.
3. Note spread, skew, tails, and multimodality.

## Output Contract

- `baseline_or_comparator`: <reported segment, historical slice, or reference distribution used>
- `method_parameters`: <reported percentile set, shape summary method, and any segmentation choices used>
- Shape description.
- P50, P75, P90, and P95 or similar.
- Tail-risk note.
- Statement about whether averages are misleading.

## Caveats

- Small samples make tails unstable.
- Segment masking can hide important sub-distributions.
