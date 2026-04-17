# Prompt: Signal Miner

## Objective

Run the selected lenses and produce evidence-backed candidate insights.

## Inputs

- Approved analysis brief.
- Data profile.
- Lens plan.
- Approved causal threshold.
- The causal evidence gate from `../../SKILL.md` (`Causal Evidence Gate For Levels 5-6`) for levels 5 and 6.

## Minimal Causal Threshold Scale

| Level | Label | Allowed phrasing | Minimum evidence bar |
| --- | --- | --- | --- |
| 1 | Descriptive | "X changed alongside Y" | Observation only |
| 2 | Temporal | "X preceded Y" | Ordered sequence with timestamps |
| 3 | Correlational | "X correlated with Y" | Stable association with stated limitations |
| 4 | Inferential | "X may help explain Y" | Strong correlation plus mechanism or comparative support |
| 5 | Causal (guarded) | "X may have contributed to Y" | Accepted evidence class, documented confounder analysis, human approval, and no observational-only fallback |
| 6 | Causal (strong) | "X likely drove Y" | Experimental or strong quasi-experimental evidence, documented confounder analysis, counterfactual logic, human approval, and explicit caveat path |

## Procedure

For each lens:

1. State the question the lens is trying to answer.
2. Inspect the relevant metrics, dimensions, dates, or benchmarks.
3. Quantify the strongest supported observations.
4. Record the baseline, comparator, or denominator used.
5. Record method parameters and choices that materially affect interpretation.
6. Record contradictory or weakening evidence.
7. Assign the full confidence profile: `confidence_label`, `confidence_score`, `confidence_basis`, `limitation_notes`, and `claim_ceiling`.
8. If the draft language reaches level 5 or 6, state the evidence class and confounder analysis required by the causal evidence gate.
9. Cap the language at the approved threshold and at the evidence gate.
10. Mark whether the signal is descriptive, diagnostic, or action-relevant.

## Output Contract

Return a signal list using this schema:

```markdown
## Candidate Signals

### Signal <N>
- **Lens**: ...
- **Claim**: ...
- **Evidence**: ...
- **Baseline or comparator**: ...
- **Method parameters and choices**: ...
- **Magnitude**: ...
- **Confidence label**: ...
- **Confidence score**: ...
- **Confidence basis**: ...
- **Limitation notes**: ...
- **Alternative explanations**: ...
- **Goal relevance**: ...
- **Evidence class**: ...
- **Confounder analysis**: ...
- **Claim ceiling**: ...
```

## Guardrails

- No claim without a stated comparator, denominator, or baseline.
- No causal phrasing above the approved threshold.
- For level 5 or 6 language, cite an accepted evidence class from the causal evidence gate and document the confounder analysis.
- If the evidence is purely observational, cap the claim at level 4 even if the user asks for stronger language.
- No hidden suppression of contradictory evidence.
- When data is sparse, say so directly.

## Example

```markdown
### Signal 2
- **Lens**: `anomaly-context-breach-changepoint`
- **Claim**: Onboarding conversion shifted downward immediately after the signup launch.
- **Evidence**: Weekly conversion fell from 42.1% pre-launch average to 35.4% in the two weeks after launch; changepoint detection aligns with launch week.
- **Baseline or comparator**: Eight-week pre-launch average.
- **Method parameters and choices**: contextual baseline window=eight weeks pre-launch; changepoint logic=launch-aligned structural break check.
- **Magnitude**: -6.7 points, or -15.9% relative.
- **Confidence label**: high
- **Confidence score**: 0.77
- **Confidence basis**: timing is clear, the baseline is stable, and segment coverage is complete.
- **Limitation notes**: marketing mix changed in the same week, so causal language stays below level 5.
- **Alternative explanations**: marketing mix changed in the same week; mobile traffic share increased.
- **Goal relevance**: high; directly informs rollback versus patch decision.
- **Evidence class**: observational time-series with changepoint support.
- **Confounder analysis**: unresolved confounders include marketing mix and traffic composition; no quasi-experimental control is available.
- **Claim ceiling**: inferential.
```
