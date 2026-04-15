# Template: Analyst Deep-Dive

## Use When

- Audience is analyst, operator, or reviewer.
- The goal requires evidence traceability.
- The user wants more than the headline.

## Required Sections

```markdown
# Analyst Deep-Dive: <topic>

## Goal
<decision or question>

## Answer
| Claim | confidence_label | confidence_basis | claim_ceiling |
| --- | --- | --- | --- |
| <answer-first claim> | <very_low|low|medium|high|very_high> | <why the evidence is or is not strong> | <maximum language allowed> |

## Data And Method Notes
- <grain>
- <coverage>
- <known limitations>

## Ranked Insights
| Rank | Insight | Baseline or comparator | confidence_label | confidence_basis | claim_ceiling | Why it matters |
| --- | --- | --- | --- | --- | --- | --- |

## Lenses Used
| Lens | Signal revealed | Baseline or comparator |
| --- | --- | --- |

## Evidence By Lens
### <Lens Name>
- **Baseline or comparator**: ...
- **Method parameters and choices**: ...
- **Evidence**: ...

## Caveats And Alternative Explanations
- <caveats>

## Next Checks
- <follow-up analysis or action>
```

## Rules

- Preserve metric names and baselines.
- Keep the method note readable, not academic.
- Show why weaker signals were deprioritized when it matters.
- Ensure the `Answer` claim matches a row in `Ranked Insights` or repeats the same confidence fields inline.
- If the audience is `customer`, apply customer-safe redactions and never include blocked internal metrics or speculative internal-cause claims in final output. Human approval cannot override a blocked claim; only stronger evidence or compliant rewritten language may appear.
