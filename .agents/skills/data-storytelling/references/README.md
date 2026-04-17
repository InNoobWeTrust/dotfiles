# Data Storytelling

`data-storytelling` is a reusable AI skill for turning data into narratives that stay aligned to business goals, calibrated to evidence strength, and adjustable while the user reviews the output.

## When To Use It

Use this skill when the user wants more than a descriptive summary, including:

- Decision support tied to OKRs, KPIs, or business questions.
- Multi-lens analysis instead of a single chart explanation.
- Audience-adapted output for exec, analyst, ops, or customer readers.
- Explicit claim calibration and caveats.
- Iterative storytelling with human corrections.

Do not use it as a replacement for data plumbing, dashboard implementation, or formal econometric modeling.

## Invocation

```text
Analyze `warehouse model mart.account_retention` to help reduce churn in SMB accounts for an `exec` audience, using threshold `4`, `adaptive` mode, and `checkpoint` HITL mode.
```

```text
Find the biggest drivers of checkout abandonment in `weekly checkout funnel mart` for an `analyst` audience, using `user-specified` mode with `comparison-period-over-period`, `comparison-segment-vs-segment`, and `driver-factor-decomposition`, while excluding `comparison-peer-benchmark`.
```

```text
Summarize customer-facing reliability changes from `incident review export + SLA trend table` for a `customer` audience, using `adaptive` mode with `trend-time-series` and `anomaly-context-breach-changepoint`, in `review-and-revise` HITL mode.
```

Accepted arguments:

- `goal`: objective, decision, or question to answer.
- `data`: data source reference or explanation of the available dataset.
- `audience` (optional): `exec`, `analyst`, `ops`, `customer`, or freeform.
- `threshold` (optional): causal threshold `1` to `6`.
- `mode` (optional): `adaptive`, `exhaustive`, or `user-specified`.
- `template` (optional): explicit output format override.
- `hitl_mode` (optional): `continuous-feedback`, `checkpoint`, or `review-and-revise`.
- `include_lenses` (optional): array of lenses to force include.
- `exclude_lenses` (optional): array of lenses to remove.

Execution note:

- If `threshold`, `mode`, or `template` is inferred instead of explicitly provided, mark the recommendation with `[RECOMMENDED]` and pause for human confirmation before lens planning.

## Workflow

### 1. Goal Framing

Preferred path:

- Run `strategic-problem-solving` first.
- Import `goal`, `key_results`, `audience`, and any available `constraints` or `assumptions`.

Fallback path:

- Use `questionnaire/goal-framing.md` when `strategic-problem-solving` was not run or required fields are missing.
- Ask 3 to 5 lightweight questions.
- Propose goal framing, success metrics, threshold, mode, and template.
- Mark inferred threshold, mode, or template with `[RECOMMENDED]` and require confirmation before lens planning.

Opt-out path:

- If the user explicitly supplies their own goal statement, treat it as authoritative.

### 2. Data Profiling

Before choosing lenses, profile the data for:

- Grain and unit of analysis.
- Metric and dimension inventory.
- Time coverage and freshness.
- Missingness, outliers, and obvious data quality issues.
- Available baselines, targets, or benchmarks.

The profiler contract lives in `prompts/data-profiler.md`.

### 3. Parameter Recommendation

If the user has not provided them, recommend:

- A causal threshold.
- A lens orchestration mode.
- An output template.
- A HITL mode.

If `threshold`, `mode`, or `template` is inferred rather than explicit, present the recommendation with a `[RECOMMENDED]` label and stop for confirmation before proceeding.

Recommendation rules:

- Prefer `adaptive` for focused decision support.
- Prefer `exhaustive` for open exploration or audit-style work.
- Recommend `executive-summary` for decisions, `analyst-deep-dive` for diagnosis, `ops-action-brief` for operating cadence, and `structured-markdown` when audience is mixed or unknown.

### 4. Lens Planning

The lens planner chooses the analytical surface.

- `adaptive`: smallest useful set, usually 3 to 7 lenses.
- `exhaustive`: broad sweep across all applicable built-in lenses.
- `user-specified`: use `include_lenses` as the working lens set, remove anything listed in `exclude_lenses`, and warn about blind spots.

The planner should always include at least one baseline-oriented lens when possible.

### 5. Signal Mining And Scoring

Each lens produces candidate signals with:

- A quantified observation.
- Supporting evidence.
- A structured confidence profile.
- Lens provenance fields: `baseline_or_comparator` and `method_parameters`.
- Alternative explanations or caveats.
- Relevance to the stated goal.

The confidence profile must preserve:

- `confidence_label`
- `confidence_score`
- `confidence_basis`
- `limitation_notes`
- `claim_ceiling`

Insights are ranked using the score contract in `prompts/insight-scorer.md`.

### 6. Narrative Planning

The narrative planner converts ranked signals into answer-first structure:

- Lead with the answer or strongest finding.
- Show the evidence.
- Explain why it matters to the goal.
- Add caveats and uncertainty.
- End with actions or next questions when relevant.

### 7. Skeptic QA

Every draft passes through the skeptic layer before final rendering.

The skeptic layer must look for:

- Missing baselines.
- Weak sample sizes.
- Confounders.
- Incorrect denominators.
- Overclaiming relative to threshold or confidence.

Final rendering must use the canonical post-QA claim set and exclude any blocked claim.

### 8. Human-In-The-Loop Revision

Default mode: `continuous-feedback`

- Approval is available after the analysis brief, lens plan, and first formatted draft.
- Approval is required only when `threshold`, `mode`, or `template` was inferred.
- Skill revises without discarding proven evidence.

Alternative modes:

- `checkpoint`: pause after the lens plan and the first formatted draft; also pause after goal framing when inferred threshold, mode, or template needs approval.
- `review-and-revise`: produce a full draft after any required parameter confirmation, then pause for consolidated feedback on each revision round.

Correction routing:

- Goal, audience, KPI, threshold, mode, or template changes rerun from goal framing.
- `include_lenses` or `exclude_lenses` changes rerun from lens planning.
- Evidence, confidence, or claim-strength changes rerun from signal mining.
- Wording or formatting changes rerun from audience adaptation or output rendering.

## Causal Thresholds

| Level | Meaning | Example |
| --- | --- | --- |
| 1 | Descriptive | "SMB churn rose 3.2 points while support backlog also increased." |
| 2 | Temporal | "The backlog spike preceded the churn increase by two weeks." |
| 3 | Correlational | "Backlog size correlated with churn across cohorts." |
| 4 | Inferential | "Backlog growth may help explain churn, especially in new SMB cohorts." |
| 5 | Causal (guarded) | "Backlog growth may have contributed to churn." |
| 6 | Causal (strong) | "Backlog growth likely drove churn." |

Levels 5 and 6 require the causal evidence gate from `../../SKILL.md` (`Causal Evidence Gate For Levels 5-6`).

Accepted evidence classes for levels 5 and 6:

- Experimental evidence.
- Quasi-experimental evidence.
- Instrumental variables.
- Regression discontinuity.
- Synthetic control.
- Statistical matching or weighting with sensitivity analysis.

Observational correlation alone is capped at level 4. Human approval cannot override that hard stop.

## Confidence Rules

Every material claim must include:

- `confidence_label`
- `confidence_score`
- `confidence_basis`
- `limitation_notes`
- `claim_ceiling`

Rendered templates must show `confidence_label`, `confidence_basis`, and `claim_ceiling` for material claims.

For outputs with multiple claims or insights, those rendered fields must travel with each claim or insight row; a single document-level confidence block is not enough.

`confidence_score` and `limitation_notes` remain part of the canonical schema, but they are internal-only fields used for ranking, caveat generation, and claim-ceiling calibration rather than final rendering.

Suggested default mapping:

| Label | `confidence_score` range | Insight scorer component | Typical Use |
| --- | --- | --- | --- |
| `very_low` | `[0.0, 0.2]` | `1` | Sparse data, weak baseline, or conflicting signals |
| `low` | `(0.2, 0.4]` | `2` | Limited support with important gaps or instability |
| `medium` | `(0.4, 0.6]` | `3` | Reasonable support with notable caveats |
| `high` | `(0.6, 0.8]` | `4` | Strong support with manageable caveats |
| `very_high` | `(0.8, 1.0]` | `5` | Strong support and low ambiguity, still capped by threshold |

## Built-In Lens Library

| File | Category | Primary Use |
| --- | --- | --- |
| `lenses/trend-time-series.md` | Trend | Raw directional movement over time |
| `lenses/trend-rolling-average.md` | Trend | Smooth noisy series |
| `lenses/trend-seasonality-inflection.md` | Trend | Separate seasonality from structural change |
| `lenses/comparison-actual-vs-target.md` | Comparison | Performance versus goals |
| `lenses/comparison-period-over-period.md` | Comparison | Change versus prior period |
| `lenses/comparison-segment-vs-segment.md` | Comparison | Compare cohorts, regions, tiers, or channels |
| `lenses/comparison-peer-benchmark.md` | Comparison | Compare to peers or external benchmarks |
| `lenses/distribution-shape-percentiles.md` | Distribution | Understand spread, skew, and tails |
| `lenses/distribution-concentration-gap.md` | Distribution | Detect Pareto concentration and inequality gaps |
| `lenses/driver-correlation-network.md` | Driver | Map correlated factors |
| `lenses/driver-attribution.md` | Driver | Allocate observed outcomes across contributors |
| `lenses/driver-factor-decomposition.md` | Driver | Break top-line changes into component drivers |
| `lenses/anomaly-statistical-outlier.md` | Anomaly | Detect mathematically unusual points |
| `lenses/anomaly-context-breach-changepoint.md` | Anomaly | Detect rule breaches, contextual outliers, and regime shifts |
| `lenses/root-cause-investigation.md` | Root cause | Structured diagnosis and drill-down |

## Supported Output Templates

### Executive Summary

- Best for leaders and decisions.
- Lead with the answer.
- Keep detail density low.
- End with recommendation or watchouts.

### Analyst Deep-Dive

- Best for analysts and reviewers.
- Include methods, assumptions, and caveats.
- Preserve evidence trails and open questions.

### Ops Action Brief

- Best for recurring operating reviews.
- Focus on actions, owners, thresholds, and exceptions.

### Structured Markdown

- Best when audience is mixed or unknown.
- Use consistent sections and neutral tone.

## Feedback Command Surface

The skill must interpret these forms directly:

- `Deeper on X`
- `Skip Y`
- `Wrong direction`
- `Missing context`
- `Overclaiming`
- `Too noisy`
- `Format wrong`

Expected behavior:

- Acknowledge the correction internally.
- Re-plan only the affected parts when possible.
- Preserve prior evidence that still stands.
- Add a one-line revision note in the next response.

## Example Runs

### Example 1: Executive Retention Story

```text
Understand the recent SMB churn increase using `retention dashboard export + support backlog table` for an `exec` audience, with threshold `4` and `adaptive` mode.
```

Expected output:

- Executive summary template.
- 3 to 5 lenses.
- Inferential but not causal language.
- Recommendation section at the end.

### Example 2: Open Exploration

```text
Find the most important changes in marketplace conversion last quarter using `conversion mart with weekly grain` for an `analyst` audience, with `exhaustive` mode and `continuous-feedback` HITL mode.
```

Expected output:

- Analyst deep-dive template.
- Broad lens coverage.
- Ranked insight table with caveats.

### Example 3: Operator Review

```text
Explain missed SLA performance and what to fix this week using `ticket SLA dataset` for an `ops` audience, with threshold `3` and the lenses `comparison-actual-vs-target`, `anomaly-context-breach-changepoint`, and `root-cause-investigation`.
```

Expected output:

- Ops action brief.
- Threshold-aware language.
- Action items, thresholds, and watch list.

### Example 4: User-Specified Lens Sweep

```text
Audit the biggest causes of renewal slippage using `renewals mart + CSAT table` for an `analyst` audience, in `user-specified` mode with `comparison-segment-vs-segment`, `driver-factor-decomposition`, and `distribution-concentration-gap`, excluding `comparison-peer-benchmark`, and using `checkpoint` HITL mode.
```

Expected output:

- Analyst deep-dive template unless the user overrides it.
- Only the requested lenses, minus any excluded lenses.
- Checkpoint pauses after lens planning and first formatted draft.

## Implementation Notes

- The skill is tool-agnostic with respect to data access.
- The user remains responsible for authorizing data access and supplying sources.
- Emit intermediate artifacts cleanly enough for later UI or automation layers to consume.
- Extend domain-specific lens packs without replacing the built-in contracts.
