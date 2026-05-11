# Goal Framing Questionnaire

Use this when `structured-inquiry` was not run, when its required fields are missing, or when the user has not provided enough context to align the analysis.

## Ask These Questions

1. What decision, outcome, or question should this analysis help with?
2. Who is the audience, and what do they need to do after reading it?
3. Which metric, KPI, or business outcome matters most here?
4. What context, events, targets, or constraints should shape the interpretation?
5. What should the skill avoid doing, claiming, or emphasizing?

## Response Handling

After collecting the answers, synthesize:

- A one-sentence goal statement.
- Proposed mission or decision framing.
- Candidate OKRs or KPIs.
- Recommended causal threshold and rationale.
- Recommended lens mode and rationale.
- Recommended output template and rationale.
- Constraints and assumptions that could affect interpretation.

## Approval Step

Present the synthesis back to the user in this format:

```markdown
## Proposed Framing

- **Goal**: ...
- **Audience**: ...
- **Primary KPI**: ...
- **[RECOMMENDED] Threshold**: ... because ...
- **[RECOMMENDED] Mode**: ... because ...
- **[RECOMMENDED] Template**: ... because ...
- **Assumptions to verify**: ...
```

If `threshold`, `mode`, or `template` is inferred, the skill must not begin lens planning until the user either approves this framing or corrects it. If the user explicitly supplied one of those fields, echo it without the `[RECOMMENDED]` label and do not block on that field.

## Shortcut Rule

If the user answers with a fully formed goal statement and also explicitly supplies `threshold`, `mode`, and `template`, skip the remaining questions and proceed. If any of those parameters is still inferred, move straight to the approval step and wait for confirmation.
