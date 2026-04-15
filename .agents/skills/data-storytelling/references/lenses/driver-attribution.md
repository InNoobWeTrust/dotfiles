# Lens: Driver - Attribution

## Purpose

Allocate observed outcomes across known contributors or channels.

## Best For

- Marketing mix.
- Traffic, funnel, or revenue contribution stories.
- Any problem where contribution shares matter more than pairwise association.

## Required Inputs

- Outcome metric.
- Contribution fields or decomposition-ready measures.
- Attribution logic or business rules.

## Questions Answered

- Which contributors explain the largest share of the result?
- Did contributor mix shift over time?
- Which contributor should the narrative emphasize?

## Method

1. Validate the attribution logic and coverage.
2. Compute share of outcome by contributor.
3. Compare current shares to prior shares.
4. Flag unattributed residue.

## Output Contract

- `baseline_or_comparator`: <reported prior mix, comparison period, or reference allocation used>
- `method_parameters`: <reported attribution logic, coverage rules, and any business-rule overrides used>
- Top contributors.
- Share of total explained.
- Change in contributor mix.
- Unattributed remainder.

## Caveats

- Attribution rules may encode assumptions that must be stated.
- Unattributed residue weakens strong claims.
