# Prompt: Goal Interpreter

## Objective

Turn the user's request into an explicit analysis brief that the rest of the skill can execute against.

## Inputs

- Raw user request.
- `goal`, `data`, `audience`, `threshold`, `mode`, and `template` arguments if provided.
- Output from `strategic-problem-solving`, if available, using this import contract:
  - `goal`: string
  - `key_results`: string[]
  - `audience`: string
  - `constraints`: string[] (optional)
  - `assumptions`: string[] (optional)
- Answers from `questionnaire/goal-framing.md`, if used.

## Procedure

1. Rewrite the request as a decision or insight question.
2. Normalize upstream `strategic-problem-solving` fields when present and merge them with explicit user inputs.
3. If required upstream fields are missing, fall back to the raw request and questionnaire answers instead of failing.
4. Identify the audience and the action they should be able to take after reading the output.
5. Extract or infer the primary KPI, supporting KPIs, and success window.
6. Identify any known context that could change interpretation: targets, launches, policy changes, outages, seasonality, market shifts.
7. Recommend a causal threshold if the user did not provide one.
8. Recommend a mode if the user did not provide one.
9. Recommend an output template if the user did not provide one.
10. State the assumptions that require user confirmation.
11. If `threshold`, `mode`, or `template` was inferred, label it `[RECOMMENDED]` and stop for human confirmation before lens planning. If the user explicitly provided the value, proceed without blocking on that field.

## Recommendation Rules

- Recommend threshold `1` to `2` for descriptive reporting or weak evidence.
- Recommend threshold `3` to `4` for diagnostic analysis with meaningful comparative support.
- Recommend threshold `5` to `6` only when the user explicitly wants intervention claims and the data plausibly supports them.
- Recommend `adaptive` unless the user asks for full coverage or a compliance-style sweep.
- Recommend `executive-summary` for decisions, `analyst-deep-dive` for diagnosis, `ops-action-brief` for ongoing execution, and `structured-markdown` when audience is mixed or unclear.
- When a value is inferred rather than explicit, prefix it with `[RECOMMENDED]` in the analysis brief.

## Output Contract

Return a brief using this structure:

```markdown
## Analysis Brief

- **Goal**: ...
- **Decision question**: ...
- **Audience**: ...
- **Primary KPI**: ...
- **Supporting KPIs**: ...
- **Known context**: ...
- **Recommended threshold**: ...
- **Recommended mode**: ...
- **Recommended template**: ...
- **Assumptions to confirm**: ...
```

## Guardrails

- Do not silently invent a KPI if the user already supplied one.
- Do not block on `threshold`, `mode`, or `template` when the user already supplied them explicitly.
- If `strategic-problem-solving` is missing `goal`, `key_results`, or `audience`, recover from the raw request or questionnaire instead of treating the prerequisite as mandatory.
- When goal context is weak, mark assumptions clearly instead of pretending certainty.
- Keep the brief short enough that the user can approve it quickly.

## Example

Input:

```text
Goal: explain why onboarding conversion dropped after the new signup flow shipped
Audience: exec
Data: weekly funnel metrics and support tickets
```

Output:

```markdown
## Analysis Brief

- **Goal**: Explain the post-launch onboarding conversion drop and identify the most likely contributors.
- **Decision question**: Should the team roll back, patch, or monitor the new signup flow?
- **Audience**: exec
- **Primary KPI**: onboarding conversion rate
- **Supporting KPIs**: step completion, support ticket rate, mobile error rate
- **Known context**: recent signup flow launch
- **Recommended threshold**: [RECOMMENDED] 4, because the goal is diagnostic but not yet intervention-proven
- **Recommended mode**: [RECOMMENDED] adaptive, because the question is focused
- **Recommended template**: [RECOMMENDED] executive-summary
- **Assumptions to confirm**: launch date, target conversion baseline, whether mobile and desktop should be split
```
