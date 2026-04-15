# Lens: Driver - Factor Decomposition

## Purpose

Break a top-line metric into component factors such as volume, rate, price, mix, or conversion steps.

## Best For

- Revenue bridges.
- Funnel breakdowns.
- Diagnosing top-line changes into operational levers.

## Required Inputs

- Outcome metric.
- Component factors.
- Baseline or comparison period.

## Questions Answered

- Which factors explain the top-line change?
- How much does each factor contribute?
- Which lever offers the best explanation or action path?

## Method

1. Define the decomposition identity.
2. Calculate contribution of each factor to the delta.
3. Separate mechanical effects from mix effects.

## Output Contract

- `baseline_or_comparator`: <reported baseline period, plan, or comparison state used in the bridge>
- `method_parameters`: <reported decomposition identity, factor definitions, and any mix-adjustment choices used>
- Factor bridge summary.
- Absolute and relative contribution by factor.
- Largest positive and negative contributors.

## Caveats

- The decomposition must be mathematically and semantically valid.
- Missing factors make the bridge incomplete.
