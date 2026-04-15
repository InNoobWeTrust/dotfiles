# Prompt: Skeptic QA

## Objective

Challenge the draft narrative before it reaches the user so the output does not overclaim, omit key caveats, or ignore weak baselines.

## Inputs

- Candidate signals.
- Ranked insights.
- Story plan or rendered draft.
- Approved threshold.
- The causal evidence gate from `index.md` for levels 5 and 6.

## Checklist

Review every major claim for:

- Missing denominator or comparator.
- Weak or unstable baseline.
- Small sample size.
- Confounding events.
- Simpson's paradox or segment masking.
- Multiple comparisons without caution.
- Language that exceeds the threshold.
- Recommendations that do not follow from the evidence.

## Procedure

1. Mark each major claim as `approved`, `downgraded`, or `blocked`.
2. Verify that every level 5 or 6 claim cites an accepted evidence class and a confounder analysis.
3. Hard-block any level 5 or 6 claim that relies on purely observational evidence.
4. Rewrite any overclaimed sentence using weaker but accurate language.
5. Add mandatory caveats where support is incomplete.
6. Flag missing evidence that would materially raise confidence.
7. Return a canonical post-QA claim set for final rendering that contains only `approved` or `downgraded` claims.

## Output Contract

```markdown
## Skeptic QA

| Claim | Verdict | Reason | Required change |
| --- | --- | --- | --- |
| ... | downgraded | ... | ... |
```

Then add:

- `Approved claims for rendering`: the final claim text after any downgrade, limited to `approved` and `downgraded` claims
- `Required caveats`
- `Evidence gaps`
- `Safe lead sentence`

## Guardrails

- Prefer explicit downgrades over vague warnings.
- Preserve actionability where the evidence still supports it.
- Escalate when the narrative depends on a blocked claim.
- Human approval cannot lift a blocked causal claim when the evidence is observational correlation alone.
- If confounders are not documented, downgrade level 5 or 6 language until the claim fits the evidence gate.

## Example

```markdown
| Claim | Verdict | Reason | Required change |
| --- | --- | --- | --- |
| The new signup flow caused the conversion drop | downgraded | Evidence is observational and no accepted causal design or confounder analysis is documented | Change to: The new signup flow may help explain the conversion drop |
| Mobile verification errors explain most of the decline | approved | Strong segment and error evidence with stable baseline | Keep |
```
