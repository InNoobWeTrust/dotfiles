# lenses-outputs-filemap

## Built-In Lens Library

The core library ships with 15 built-in lenses defined in `references/lenses/`.

| Category | Lens Files |
| --- | --- |
| Trend | `references/lenses/trend-time-series.md`, `references/lenses/trend-rolling-average.md`, `references/lenses/trend-seasonality-inflection.md` |
| Comparison | `references/lenses/comparison-actual-vs-target.md`, `references/lenses/comparison-period-over-period.md`, `references/lenses/comparison-segment-vs-segment.md`, `references/lenses/comparison-peer-benchmark.md` |
| Distribution | `references/lenses/distribution-shape-percentiles.md`, `references/lenses/distribution-concentration-gap.md` |
| Driver | `references/lenses/driver-correlation-network.md`, `references/lenses/driver-attribution.md`, `references/lenses/driver-factor-decomposition.md` |
| Anomaly | `references/lenses/anomaly-statistical-outlier.md`, `references/lenses/anomaly-context-breach-changepoint.md` |
| Root Cause | `references/lenses/root-cause-investigation.md` |

These lenses intentionally cover the common analytical surface first. Domain-specific lenses should be added later without changing the core contracts.

## Output Templates

The output engine must support at least these templates:

- `assets/templates/executive-summary.md`
- `assets/templates/analyst-deep-dive.md`
- `assets/templates/ops-action-brief.md`
- `assets/templates/structured-markdown.md`

If the user does not specify a format, the skill recommends one and builds it.

## Required Prompt Components

Use the following prompt specs as distinct execution guides while running the skill:

- `references/prompts/goal-interpreter.md`
- `references/prompts/data-profiler.md`
- `references/prompts/lens-planner.md`
- `references/prompts/signal-miner.md`
- `references/prompts/insight-scorer.md`
- `references/prompts/narrative-planner.md`
- `references/prompts/skeptic-qa.md`
- `references/prompts/output-engine.md`
- `references/prompts/audience-adapter.md`

## Minimum Deliverable Behavior

When running this skill:

- Extract or request the invocation fields.
- Recommend missing parameters without silently forcing them.
- Run at least one comparison or trend lens when the data supports it.
- Emit lens outputs with explicit `baseline_or_comparator` and `method_parameters` provenance.
- Attach confidence and evidence notes to every ranked insight.
- Respect the causal evidence gate before allowing level 5 or 6 language.
- Render only approved or downgraded claims from the post-QA artifact; blocked claims must not appear in final output.
- Prevent causal overclaiming above the approved threshold.
- Support iterative correction without restarting the whole workflow.

## File Map

- `references/README.md`: usage documentation and examples.
- `references/questionnaire/goal-framing.md`: fallback goal interpreter.
- `references/prompts/`: component-level prompt contracts.
- `references/lenses/`: built-in lens definitions.
- `assets/templates/`: output templates.

## Run Status

Status: self-contained standalone skill guidance; execute directly from this file and the referenced prompt components.
