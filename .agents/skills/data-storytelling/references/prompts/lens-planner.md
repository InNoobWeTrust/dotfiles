# Prompt: Lens Planner

## Objective

Select the analytical lenses most likely to answer the goal without wasting effort or omitting critical perspective.

## Inputs

- Approved analysis brief.
- Data profile: grain, metrics, dimensions, time coverage, targets, benchmarks, and data quality notes.
- `mode`.
- `include_lenses` and `exclude_lenses` overrides.

## Procedure

1. Translate the goal into question types: trend, comparison, distribution, driver, anomaly, root cause.
2. Map each question type to one or more built-in lenses.
3. In `adaptive` mode, select the smallest lens set that can answer the goal and cross-check the strongest claim.
4. In `exhaustive` mode, include every built-in lens the data supports.
5. In `user-specified` mode, use `include_lenses` as the requested working set, remove any `exclude_lenses`, and add a warning if the remaining set leaves a critical blind spot.
6. Ensure the plan contains at least one baseline lens when baseline data exists.
7. Ensure the plan contains at least one segmentation or distribution lens when the goal could hide cohort differences.
8. Record the baseline or comparator each selected lens is expected to use, plus any tunable method parameters that must be surfaced later in lens output.
9. Add a skeptic validation note for the strongest expected claim.

## Output Contract

Return a plan table:

```markdown
## Lens Plan

| Priority | Lens | Why it is selected | Baseline or comparator | Expected method parameters | Required fields | Expected output | Stop condition |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ... | ... | ... | ... | ... | ... | ... |
```

Then add:

- `Coverage note`: what perspectives are covered.
- `Known blind spots`: what cannot be answered from the available data.
- `User override impact`: what changes because of `include_lenses` or `exclude_lenses`.

## Selection Heuristics

- Start with trend or comparison when the goal references change over time or target attainment.
- Add distribution when averages could hide tail risk or concentration.
- Add driver when the goal asks why.
- Add anomaly when the question centers on spikes, drops, incidents, or exceptions.
- Add root cause when the user needs diagnosis or action, not just description.

## Guardrails

- Do not add lenses just to look comprehensive if they do not materially inform the goal.
- Do not omit counterfactual or baseline-oriented lenses when stronger claims are likely.
- Keep the plan executable against the actual data fields available.
- When a lens requires tunable parameters, include the chosen or expected values in the plan so downstream artifacts preserve provenance.

## Example

```markdown
## Lens Plan

| Priority | Lens | Why it is selected | Baseline or comparator | Expected method parameters | Required fields | Expected output | Stop condition |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `comparison-period-over-period` | Measure the size of the conversion drop | prior four-week conversion baseline | comparison window=four weeks; alternate baseline=prior eight weeks if volatility is high | weekly conversion, prior period baseline | percent change and affected period | drop magnitude is quantified |
| 2 | `comparison-segment-vs-segment` | Check whether the issue is isolated to mobile or a cohort | mobile versus desktop conversion baseline | segment ranking by conversion delta; minimum segment size=report if material | device, cohort, conversion | affected segments | dominant segment differences are clear |
| 3 | `anomaly-context-breach-changepoint` | Test whether the launch date aligns with a structural break | eight-week pre-launch conversion baseline | contextual baseline window=eight weeks; changepoint logic=launch-aligned structural break check | date, conversion, launch event | changepoint alignment | launch-aligned shift confirmed or rejected |
| 4 | `driver-correlation-network` | Identify likely co-moving metrics | pre-launch co-movement baseline | association metric=Spearman; lag treatment=same-week and one-week lag check | conversion, errors, tickets, latency | candidate contributors | top correlated drivers identified |
| 5 | `root-cause-investigation` | Turn signals into action-oriented diagnosis | pre-launch process baseline by step | drill-down path=device -> verification step -> error code; cause framing=5 Whys plus fishbone | segments, event date, error codes | likely causes and next checks | actionable hypotheses are ranked |
```
