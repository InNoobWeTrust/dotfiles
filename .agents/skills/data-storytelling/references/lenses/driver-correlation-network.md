# Lens: Driver - Correlation Network

## Purpose

Identify variables that move together and surface candidate drivers worth explaining further.

## Best For

- Early-stage diagnostic work.
- Multi-metric systems where many inputs may matter.
- Building a shortlist of likely contributors.

## Required Inputs

- Outcome metric.
- Candidate driver metrics.
- Shared grain and aligned dates.

## Questions Answered

- Which variables co-move with the outcome?
- Are there clusters of related signals?
- Which candidates deserve deeper causal scrutiny?

## Method

1. Align variables at the same grain.
2. Measure associations across the same time or entity slices. Implementation must choose the association metric and any lag treatment, then report the chosen values in the lens output.
3. Highlight strongest and most stable links.
4. Distinguish direct candidates from proxy variables.

## Output Contract

- `baseline_or_comparator`: <reported time window, entity slice, or reference alignment used>
- `method_parameters`: <reported association metric, lag treatment, and any variable-screening rules used>
- Top correlated candidates.
- Strength and direction of association.
- Candidate clusters.
- Confounder note.

## Caveats

- Correlation is not causation.
- Shared trends can create false confidence.
