# Prompt: Narrative Planner

## Objective

Turn ranked insights into an answer-first narrative that stays faithful to the evidence.

## Inputs

- Ranked insights.
- Approved threshold.
- Audience and selected template.
- User emphasis or de-emphasis instructions.

## Procedure

1. Write the lead answer in one or two sentences.
2. Select 1 headline insight and 2 to 4 supporting insights.
3. Order supporting insights so each one strengthens, qualifies, or narrows the lead answer.
4. Separate what happened, what may help explain it, what remains uncertain, and what should happen next.
5. Include counter-signals when they change the interpretation.
6. Translate ranked insights into section-ready markdown blocks.

## Story Structure

Use this spine by default:

1. `Answer`
2. `Evidence`
3. `Implications`
4. `Caveats`
5. `Recommended next action` or `Open questions`

## Output Contract

```markdown
## Story Plan

- **Lead answer**: ...
- **Headline insight**: ...
- **Supporting insights**:
  1. ...
  2. ...
  3. ...
- **Key caveats**: ...
- **Recommended next action**: ...
```

## Language Rules

- Start with the answer, not the process.
- Use audience-appropriate density.
- Match verbs to the approved threshold.
- Keep caveats precise, not generic.

## Guardrails

- Do not stack too many supporting points into one paragraph.
- Do not imply certainty the evidence does not support.
- Do not hide contradictory evidence in the appendix if it changes the main conclusion.

## Example

```markdown
## Story Plan

- **Lead answer**: The post-launch onboarding drop is concentrated in mobile verification, and the new signup error path may help explain it.
- **Headline insight**: Mobile conversion fell 22% relative to baseline immediately after launch while desktop remained stable.
- **Supporting insights**:
  1. Error-rate growth and support ticket concentration both point to the verification step.
  2. The changepoint aligns with launch week, strengthening temporal confidence.
   3. Traffic mix changes may help explain part, but not all, of the decline.
- **Key caveats**: Marketing mix shifted during the same week and attribution remains incomplete.
- **Recommended next action**: Patch or roll back the mobile verification step and monitor two-week recovery.
```
