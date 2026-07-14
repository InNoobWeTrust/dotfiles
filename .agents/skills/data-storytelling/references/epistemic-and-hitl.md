# epistemic-and-hitl

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
