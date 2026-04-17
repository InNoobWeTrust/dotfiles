---
description: >
  Transform data into goal-aligned, evidence-backed narratives with adaptive
  analytical lenses, confidence calibration, and human-in-the-loop revision.
---

# Data Storytelling Command

Use the `data-storytelling` skill.

## Inputs

- `goal`: objective, decision, or question to answer.
- `data`: reference or description of the data source.
- `audience` (optional): target consumer.
- `threshold` (optional): causal threshold `1` to `6`.
- `mode` (optional): `adaptive`, `exhaustive`, or `user-specified`.
- `template` (optional): output template override.
- `hitl_mode` (optional): `continuous-feedback`, `checkpoint`, or `review-and-revise`.
- `include_lenses` (optional): array of lenses to force include.
- `exclude_lenses` (optional): array of lenses to remove.

## Protocol

1. Read `data-storytelling` skill.
2. If goal framing is missing, prefer `strategic-problem-solving` and import `goal`, `key_results`, `audience`, `constraints`, and `assumptions`; otherwise use `<data-storytelling-skill-dir>/references/questionnaire/goal-framing.md` to collect the missing equivalent fields.
3. Recommend missing parameters without silently forcing them.
4. If `threshold`, `mode`, or `template` is inferred, label it `[RECOMMENDED]` and stop for human confirmation before lens planning.
5. Use `include_lenses` and `exclude_lenses` as the canonical lens override contract. In `mode:user-specified`, treat `include_lenses` as the requested working set.
6. Run the prompt components in order:
   - `goal-interpreter`
   - `data-profiler`
   - `lens-planner`
   - `signal-miner`
   - `insight-scorer`
   - `narrative-planner`
   - `skeptic-qa`
   - `audience-adapter`
   - `output-engine`
7. Follow the canonical HITL state machine from `data-storytelling` skill.
8. Keep claims below the approved causal threshold and below the causal evidence gate.
9. Accept feedback and revise according to the skill feedback contract.

## Output Requirements

- Lead with the answer to the goal.
- Include a `## Lenses Used` section that states which lenses were used, what signal each revealed, and which baseline or comparator anchored it.
- Include confidence and caveats for material claims.
- Adapt the output to the chosen audience and template.

## Examples

```text
/data-storytelling goal:"Explain the decline in onboarding conversion" data:"weekly funnel mart + support tickets" audience:"exec" threshold:4 mode:adaptive hitl_mode:checkpoint
```

```text
/data-storytelling goal:"Audit the main causes of renewal slippage" data:"renewals mart" audience:"analyst" mode:user-specified include_lenses:[comparison-segment-vs-segment,driver-factor-decomposition,distribution-concentration-gap] exclude_lenses:[comparison-peer-benchmark]
```

```text
/data-storytelling goal:"Prepare a customer-safe reliability summary" data:"incident export + SLA table" audience:"customer" mode:adaptive include_lenses:[trend-time-series,anomaly-context-breach-changepoint] hitl_mode:review-and-revise
```
