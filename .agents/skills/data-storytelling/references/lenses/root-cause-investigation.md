# Lens: Root Cause - Structured Investigation

## Purpose

Turn observed signals into a disciplined diagnosis using 5 Whys, fishbone framing, drill-downs, and before-versus-after checks.

## Best For

- Operational incidents.
- KPI degradation requiring action.
- Follow-up after trend, comparison, and anomaly work identifies a likely problem area.

## Required Inputs

- Candidate issue statement.
- Relevant segments or dimensions.
- Event timeline.
- Supporting metrics.

## Questions Answered

- What are the most plausible explanations?
- Which dimensions narrow the problem most effectively?
- What evidence supports or weakens each cause hypothesis?

## Method

1. State the observed problem precisely.
2. Drill down by segment, step, region, or owner.
3. Compare before and after key events.
4. Use 5 Whys to trace one or two promising chains.
5. Use fishbone categories when multiple cause families compete.
6. Rank hypotheses by evidence strength and actionability.

## Output Contract

- `baseline_or_comparator`: <reported before-versus-after anchor, control segment, or expected-state reference used>
- `method_parameters`: <reported drill-down path, cause-framing choices, and any hypothesis-ranking rules used>
- Top cause hypotheses.
- Evidence for each hypothesis.
- Evidence against each hypothesis.
- Next validation step or action.

## Caveats

- Root cause narratives are fragile when based on sparse evidence.
- Keep language at or below the approved threshold.
