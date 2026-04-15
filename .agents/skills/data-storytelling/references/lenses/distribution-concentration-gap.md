# Lens: Distribution - Concentration And Gap

## Purpose

Show whether outcomes are concentrated among a few units and where inequality or service gaps exist.

## Best For

- Pareto analysis.
- Revenue or incident concentration.
- Performance gap analysis across groups.

## Required Inputs

- Metric.
- Unit of concentration such as customer, account, or category.
- Optional comparison groups.

## Questions Answered

- Is a small share of units driving most of the outcome?
- Where are the largest gaps between groups?
- Which concentration pattern matters most to the goal?

## Method

1. Rank units by contribution.
2. Compute concentration share such as top 10% or 80/20 split. Implementation must choose this cutoff and report the chosen value in the lens output.
3. Compare gap size across groups or service bands.

## Output Contract

- `baseline_or_comparator`: <reported comparison group, service band, or reference distribution used>
- `method_parameters`: <reported concentration cutoff, grouping choices, and any gap-comparison rules used>
- Concentration share.
- Largest group gap.
- Business implication of the concentration pattern.

## Caveats

- Concentration does not itself imply risk or opportunity; interpret in context.
- Group definitions must be meaningful and stable.
