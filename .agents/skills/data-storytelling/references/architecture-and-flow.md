# architecture-and-flow

## Architecture

### Goal And Context Layer

- Accept mission, OKRs, KPIs, audience, threshold, orchestration mode, and output format.
- Prefer a prior investigation step as the upstream goal-framing source.
- If unavailable or incomplete, use `references/questionnaire/goal-framing.md` to gather equivalent context.
- If user already supplies a goal statement, treat it as authoritative unless they request refinement.

### Upstream Import Contract

Expected fields from the upstream investigation output:

- `goal`: string — the primary objective.
- `key_results`: string[] — measurable key results.
- `audience`: string — who will receive this analysis.
- `constraints`: string[] — budget, timeline, or other limits (optional).
- `assumptions`: string[] — stated assumptions (optional).

Fallback: if no upstream investigation was run, or if any required field is missing, use `references/questionnaire/goal-framing.md` to gather the missing equivalent information before lens planning.

### Core Engine

- **Data Profiler**: identify grain, metrics, dimensions, time coverage, missingness, and quality risks.
- **Lens Planner**: recommend lenses adaptively, or honor exhaustive and user-specified modes.
- **Signal Miner**: run lens-specific reasoning and capture evidence, counterevidence, and caveats.
- **Insight Scorer**: rank signals by magnitude, novelty, confidence, and goal alignment.
- **Narrative Planner**: convert ranked signals into answer-first story structure.
- **Skeptic/QA Layer**: downgrade or block unsupported claims and missing baselines.

### Output Engine

- Recommend a template when the user does not specify one.
- Build markdown output using one of the defined templates.
- Adapt tone, density, and action framing for exec, analyst, ops, or customer audiences.

### Human-In-The-Loop Layer

- Default to `continuous-feedback`.
- Support `checkpoint` mode for explicit approval gates.
- Support `review-and-revise` mode for draft-first workflows.
- Re-ground the narrative when the user says the direction, context, or framing is wrong.
- Follow the canonical HITL state machine defined in this spec.

## Invocation Contract

When invoked for data storytelling, extract or request these fields:

- `goal` (required unless supplied via prerequisite or questionnaire): objective, decision, or question.
- `data` (required): description or reference to the data source(s).
- `audience` (optional): `exec`, `analyst`, `ops`, `customer`, or freeform.
- `threshold` (optional): causal claim ceiling from 1 to 6.
- `mode` (optional): `adaptive`, `exhaustive`, or `user-specified`.
- `template` (optional): recommended from goal plus audience if not specified.
- `hitl_mode` (optional): defaults to `continuous-feedback`.
- `include_lenses` (optional): array of lenses to force include.
- `exclude_lenses` (optional): array of lenses to remove.

## Operating Flow

1. Normalize the goal and audience.
2. Profile the data and identify constraints.
3. Recommend threshold, mode, and output template if absent; if threshold, mode, or template is inferred, label it `[RECOMMENDED]` and pause for confirmation before lens planning.
4. Plan lenses.
5. Mine signals.
6. Score insights.
7. Draft answer-first narrative.
8. Run skeptic QA.
9. Render in the selected template.
10. Accept feedback and revise according to the selected HITL mode.
