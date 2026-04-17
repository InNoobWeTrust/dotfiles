# Prompt: Output Engine

## Objective

Render the approved narrative in the most useful output format for the audience and goal.

## Inputs

- Approved story plan.
- Skeptic QA results, including the canonical post-QA claim set.
- Selected or recommended template.
- Audience adaptation guidance.
- HITL mode.

## Confidence Contract

Every material claim carries a confidence profile separate from the causal threshold.

Required fields:

- `confidence_label`: `very_low`, `low`, `medium`, `high`, or `very_high`.
- `confidence_score`: numeric score from `0.0` to `1.0`.
- `confidence_basis`: short justification using data quality, sample sufficiency, baseline quality, and method fit.
- `limitation_notes`: what weakens the claim.
- `claim_ceiling`: maximum language allowed after confidence and threshold are combined.

Rendering rules:

- Render `confidence_label`, `confidence_basis`, and `claim_ceiling` for every material claim.
- In multi-claim sections, attach those rendered fields per claim or per insight row; a single document-level confidence block is not sufficient.
- Preserve `confidence_score` and `limitation_notes` in intermediate artifacts for ranking, caveats, and claim ceilings, but do not render them unless the selected template explicitly calls for them.

Interpretation rules:

- High confidence does not permit stronger language than the approved threshold.
- Low confidence forces explicit caveats even at low thresholds.
- Missing baselines or weak sample quality cap the claim at descriptive or temporal language.

## Procedure

1. Choose the template if none was specified.
2. Treat the post-QA claim set from skeptic QA as the canonical rendering artifact.
3. Map only `approved` or `downgraded` claims from that canonical artifact into the required sections for the selected template.
4. Carry forward confidence notes and caveats; every rendered material claim must include `confidence_label`, `confidence_basis`, and `claim_ceiling`, while `confidence_score` and `limitation_notes` remain internal-only support fields. In multi-claim sections, attach those fields per claim or per insight row rather than once per document.
5. Add the mandatory `## Lenses Used` section required by the template contract.
6. Add revision notes if the draft reflects user feedback.
7. Keep the output concise enough for the intended audience.

## Template Selection Rules

- `executive-summary`: decision-focused, low detail density.
- `analyst-deep-dive`: evidence-rich, method-aware.
- `ops-action-brief`: action-owner-threshold oriented.
- `structured-markdown`: neutral default.

## Output Contract

The final output must always contain:

- A direct answer to the goal.
- The strongest supporting evidence.
- A `## Lenses Used` section that lists each lens, the signal it revealed, and the baseline or comparator used.
- Confidence and caveats, with `confidence_label`, `confidence_basis`, and `claim_ceiling` shown for each material claim.
- Next actions or open questions, if relevant.

## HITL Rules

- Follow the canonical HITL state machine in `../../SKILL.md` (`Canonical HITL State Machine`).
- In `continuous-feedback`, emit short revision notes inline and only block when inferred parameters still need confirmation.
- In `checkpoint`, pause after the first formatted draft for approval and do not skip any earlier required checkpoint.
- In `review-and-revise`, produce a full draft after any required parameter confirmation, then include a `Revision summary` section on each new pass.

## Guardrails

- Do not expose raw internal scoring tables unless the chosen template calls for them.
- The post-QA claim set is canonical; do not render from pre-QA draft wording when it conflicts with skeptic QA.
- Render only `approved` or `downgraded` claims from skeptic QA. Blocked claims must not appear in the final output.
- Do not remove caveats to make the story cleaner.
- Do not over-compress analyst outputs into executive style.

## Example Revision Note

```markdown
Revision summary: shifted focus from total conversion to mobile verification, removed unsupported causal wording, and changed the format to an ops action brief.
```
