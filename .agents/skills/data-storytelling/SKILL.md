---
name: data-storytelling
description: Transform data into goal-aligned, multi-lens, evidence-backed narratives with configurable causal thresholds, explicit epistemic confidence, and human-in-the-loop correction throughout.
---

# Data Storytelling Skill Specification

## Purpose

`data-storytelling` turns raw or semi-structured data into narratives that are:

- Aligned to a declared goal, mission, OKR, KPI, or decision.
- Produced through multiple analytical lenses instead of a single-pass summary.
- Evidence-backed, with explicit confidence and claim ceilings.
- Correctable in real time through human feedback.

The skill optimizes for decision support, not generic chart commentary.

## Problem Statement

Analysts and AI agents routinely generate one of two bad outcomes:

- Data dumps with no clear decision relevance.
- Overconfident stories that outrun the evidence.

This skill exists to keep insight generation tied to user goals, calibrated to the
evidence, and adjustable while the narrative is being built.

## Success Criteria

The skill succeeds when it produces an output that:

- Answers the stated goal or decision question first.
- Includes a mandatory `## Lenses Used` section that shows which analytical lenses were used, what signal each lens revealed, and which baseline or comparator anchored it.
- Preserves lens-level provenance through explicit `baseline_or_comparator` and `method_parameters` fields in intermediate artifacts.
- Distinguishes observation, interpretation, and causal language.
- Includes confidence, caveats, and counter-signals.
- Adapts the final narrative to the intended audience and format.
- Incorporates user corrections without losing provenance.

## Non-Goals

- Autonomous data connection or ETL orchestration.
- Fully automated causal inference beyond the approved threshold.
- Hidden chain-of-thought disclosure.
- Domain-specific lens packs beyond the core built-in library in this spec.

## Architecture

### Goal And Context Layer

- Accept mission, OKRs, KPIs, audience, threshold, orchestration mode, and output format.
- Prefer `structured-inquiry` as the upstream goal-framing step.
- If unavailable or incomplete, use `references/questionnaire/goal-framing.md` to gather equivalent context.
- If user already supplies a goal statement, treat it as authoritative unless they request refinement.

### Upstream Import Contract

Expected fields from `structured-inquiry` output:

- `goal`: string — the primary objective.
- `key_results`: string[] — measurable key results.
- `audience`: string — who will receive this analysis.
- `constraints`: string[] — budget, timeline, or other limits (optional).
- `assumptions`: string[] — stated assumptions (optional).

Fallback: if `structured-inquiry` was not run, or if any required field is missing, use `references/questionnaire/goal-framing.md` to gather the missing equivalent information before lens planning.

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

## Epistemic Confidence Contract

Every material claim must carry a confidence profile separate from the causal threshold.

Required fields:

- `confidence_label`: `very_low`, `low`, `medium`, `high`, or `very_high`.
- `confidence_score`: numeric score from `0.0` to `1.0`.
- `confidence_basis`: short justification using data quality, sample sufficiency, baseline quality, and method fit.
- `limitation_notes`: what weakens the claim.
- `claim_ceiling`: maximum language allowed after confidence and threshold are combined.

Rendering rule:

- `confidence_label`, `confidence_basis`, and `claim_ceiling` must be rendered for every material claim.
- Multi-claim templates must render those fields per claim or per insight row; a single document-level confidence block is not sufficient.
- `confidence_score` and `limitation_notes` are internal-only fields used to calibrate ranking, caveats, and claim ceilings; they must be preserved in intermediate artifacts but do not need to appear in final rendered templates.

Interpretation rules:

- High confidence does not permit stronger language than the approved threshold.
- Low confidence forces explicit caveats even at low thresholds.
- Missing baselines or weak sample quality cap the claim at descriptive or temporal language.

## Causal Threshold Scale

| Level | Label | Allowed phrasing | Minimum evidence bar |
| --- | --- | --- | --- |
| 1 | Descriptive | "X changed alongside Y" | Observation only |
| 2 | Temporal | "X preceded Y" | Ordered sequence with timestamps |
| 3 | Correlational | "X correlated with Y" | Stable association with stated limitations |
| 4 | Inferential | "X may help explain Y" | Strong correlation plus mechanism or comparative support |
| 5 | Causal (guarded) | "X may have contributed to Y" | Accepted evidence class, documented confounder analysis, human approval, and no observational-only fallback |
| 6 | Causal (strong) | "X likely drove Y" | Experimental or strong quasi-experimental evidence, documented confounder analysis, counterfactual logic, human approval, and explicit caveat path |

## Causal Evidence Gate For Levels 5-6

Levels 5 and 6 are only available when the evidence passes this gate.

Accepted evidence classes:

- Experimental evidence, including randomized or controlled tests.
- Quasi-experimental evidence, including natural experiments or interrupted time series with a credible comparison group.
- Instrumental variables.
- Regression discontinuity.
- Synthetic control.
- Statistical matching or weighting approaches with sensitivity analysis.

Required checks before a level 5 or 6 claim is allowed:

- State the evidence class explicitly in the signal record.
- Document the baseline or counterfactual used.
- List the main confounders and explain how each was tested, controlled, or left unresolved.
- Record robustness limits in `limitation_notes`.
- Obtain explicit human approval for level 5 or 6 language.

Escalation rules:

- Observational correlation alone is capped at level 4.
- Human approval does not override the evidence gate.
- If the analysis is observational but uses one of the accepted quasi-experimental or matching designs with documented justification, the skill may consider level 5 or 6 subject to the full gate.
- If the evidence is purely observational, the skill must not emit level 5 or 6 language under any circumstance, including direct user override.

Threshold policy:

- The skill recommends a threshold based on context.
- The human decides the requested threshold and can override it at any time, but the rendered claim language may not exceed the causal evidence gate.
- The skeptic layer may temporarily downgrade language even if the threshold remains unchanged.

## Lens Orchestration Modes

### Adaptive

- Default mode.
- Choose the smallest lens set that can answer the goal well.
- Usually 3 to 7 primary lenses plus skeptic validation.

### Exhaustive

- Broad survey mode.
- Run all relevant core lenses that the available data can support.
- Use when the user wants maximum coverage, audits, or open exploration.

### User-Specified

- Use only the lenses requested through `include_lenses`, minus any `exclude_lenses`, plus mandatory skeptic QA.
- Warn when the selected set cannot answer the stated goal cleanly.

## Canonical HITL State Machine

| Stage | Artifact | `continuous-feedback` | `checkpoint` | `review-and-revise` |
| --- | --- | --- | --- | --- |
| 1 | Analysis brief and parameter resolution | Approval is available at any time. Approval is required only when `threshold`, `mode`, or `template` was inferred. | Approval is required when any of `threshold`, `mode`, or `template` was inferred; otherwise the artifact may be shown without blocking progress. | Approval is required when `threshold`, `mode`, or `template` was inferred; otherwise continue to the first full draft. |
| 2 | Lens plan | Approval is available but not required. | Pause and require approval before signal mining. | Approval is available but not required. |
| 3 | First formatted draft | Approval is available but not required. | Pause and require approval before finalizing or continuing revisions. | Pause and require consolidated feedback or approval before the next pass. |
| 4 | Subsequent revisions | Continue iterating inline with short audit notes. | Resume from the affected checkpoint, then pause again at the first downstream required checkpoint. | Resume from the affected checkpoint and return a revised full draft with a revision summary. |

Correction handling:

- If the user changes goal, audience, KPI, threshold, mode, or template, rerun from goal interpretation.
- If the user changes `include_lenses`, `exclude_lenses`, or lens emphasis, rerun from lens planning.
- If the user challenges evidence, confidence, or claim strength, rerun from signal mining and continue through scoring, narrative planning, skeptic QA, and output.
- If the user only changes wording, audience fit, or formatting, rerun from audience adaptation or output rendering.
- The user may abort at any pause point. Otherwise the skill resumes from the earliest affected checkpoint.

## Human Feedback Contract

Recognize and act on the following feedback intents:

- `Deeper on X` or `Skip Y`: adjust lens allocation and narrative emphasis.
- `Wrong direction`: restate the goal, discard weak branches, and re-ground.
- `Missing context`: request or absorb missing definitions, events, or business context.
- `Overclaiming`: lower language strength, add caveats, and note evidence gaps.
- `Too noisy`: raise signal thresholds and shorten lower-value details.
- `Format wrong`: switch template or audience adaptation.

The skill must explain what changed after each revision in one short audit note and follow the canonical HITL state machine when deciding whether to pause or continue.

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
