# Lens: Anomaly - Statistical Outlier

## Purpose

Detect values that are unusually far from expected statistical behavior.

## Best For

- Incident detection.
- Fraud, abuse, or defect spikes.
- Triaging sudden unexplained changes.

## Required Inputs

- Metric.
- Enough history or peer observations.
- Optional segment field.

## Questions Answered

- Which points or entities are mathematically unusual?
- How extreme is the deviation?
- Does the outlier deserve narrative prominence?

## Method

1. Choose the outlier method, baseline window, and cutoff parameter. Implementation must choose these parameters and report the chosen values in the lens output.
2. Define the expected range.
3. Flag points outside the range.
4. Quantify deviation size.
5. Check whether the outlier survives segmentation or alternative baselines.

## Output Contract

- `baseline_or_comparator`: <reported historical window, peer group, or expected-range anchor used>
- `method_parameters`: <reported outlier method, baseline window, cutoff, and any segmentation settings used>
- Outlier identity.
- Expected range.
- Deviation magnitude.
- Confidence note.

## Caveats

- Statistical outlier does not always equal business importance.
- Unstable baselines create false positives.
