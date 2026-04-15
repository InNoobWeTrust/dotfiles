# Prompt: Insight Scorer

## Objective

Rank candidate signals so the final narrative emphasizes what matters most.

## Inputs

- Candidate signals from the signal miner.
- Approved goal and KPI.
- Audience and output template.
- Canonical confidence profiles containing `confidence_label`, `confidence_score`, `confidence_basis`, `limitation_notes`, and `claim_ceiling`.

## Scoring Formula

Score each signal from `0` to `100` using:

```text
priority_score = (
  magnitude * 0.30 +
  novelty * 0.20 +
  confidence * 0.25 +
  goal_alignment * 0.25
) * 20
```

Each component is rated `0` to `5`.

Confidence score mapping:

| `confidence_score` | Insight scorer `confidence` component |
| --- | --- |
| `[0.0, 0.2]` | `1` (`very_low`) |
| `(0.2, 0.4]` | `2` (`low`) |
| `(0.4, 0.6]` | `3` (`medium`) |
| `(0.6, 0.8]` | `4` (`high`) |
| `(0.8, 1.0]` | `5` (`very_high`) |

## Component Definitions

- `magnitude`: business size of the change or difference.
- `novelty`: how non-obvious or surprising the signal is relative to expected baselines.
- `confidence`: methodological support and evidence quality derived from the canonical confidence schema.
- `goal_alignment`: direct relevance to the decision or KPI.

## Procedure

1. Score `magnitude`, `novelty`, and `goal_alignment` explicitly.
2. Convert each signal's `confidence_score` from `0.0-1.0` into the `1-5` confidence component using the mapping above.
3. Use `confidence_basis`, `limitation_notes`, and `claim_ceiling` to demote signals whose usable language is weaker than their raw magnitude suggests.
4. Compute the weighted score.
5. Tie-break first on goal alignment, then confidence, then magnitude.
6. Demote signals with weak confidence even if they are surprising.
7. Group signals into `headline`, `supporting`, and `background` buckets.

## Output Contract

```markdown
## Ranked Insights

| Rank | Signal | Magnitude | Novelty | Confidence label | Confidence score | Claim ceiling | Goal alignment | Score | Narrative role |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ... | ... | ... | ... | ... | ... | ... | ... | headline |
```

Then add:

- `Dropped signals`: low-value or weakly supported items and why they were excluded.

## Guardrails

- Do not let novelty outrank confidence when the audience needs action.
- Do not bury a high-goal-alignment signal just because it is not surprising.
- Keep the final narrative short enough for the selected template.

## Example

```markdown
| Rank | Signal | Magnitude | Novelty | Confidence label | Confidence score | Claim ceiling | Goal alignment | Score | Narrative role |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Mobile signup errors rose with the post-launch conversion drop | 5 | 4 | high | 0.77 | inferential | 5 | 90 | headline |
| 2 | Support tickets concentrated in the identity verification step | 4 | 3 | high | 0.73 | inferential | 4 | 77 | supporting |
| 3 | Desktop conversion stayed near baseline | 3 | 2 | very_high | 0.89 | descriptive | 4 | 70 | supporting |
```
