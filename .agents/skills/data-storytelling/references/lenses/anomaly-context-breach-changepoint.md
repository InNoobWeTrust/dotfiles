# Lens: Anomaly - Context Outlier, Threshold Breach, And Changepoint

## Purpose

Detect deviations that matter because they break business rules, contextual expectations, or regime stability.

## Best For

- SLA misses.
- Policy violations.
- Launch or incident analysis.
- Structural-break detection.

## Required Inputs

- Metric.
- Business threshold, event date, or expected context.
- Time field.

## Questions Answered

- Did we breach an important rule or threshold?
- Is the point unusual relative to context, not just math?
- Did the process enter a new regime?

## Method

1. Compare the series to known thresholds or business rules.
2. Evaluate whether recent values are unusual for their context.
3. Detect changepoints and align them to events. Implementation must choose the contextual baseline window and changepoint logic, then report the chosen values in the lens output.

## Output Contract

- `baseline_or_comparator`: <reported business threshold, contextual baseline window, or event-period comparator used>
- `method_parameters`: <reported changepoint logic, contextual baseline window, and any threshold-breach settings used>
- Breach summary.
- Contextual anomaly note.
- Changepoint timing.
- Event-alignment caveat.

## Caveats

- Event alignment alone is not proof.
- Rules and thresholds must be current and explicitly stated.
