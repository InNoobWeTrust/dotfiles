# Template: Ops Action Brief

## Use When

- Audience is operations, support, or delivery teams.
- The goal is short-cycle action.
- Exceptions and thresholds matter more than narrative polish.

## Required Sections

```markdown
# Ops Action Brief: <topic>

## Situation
| Claim | Baseline or comparator | confidence_label | confidence_basis | claim_ceiling |
| --- | --- | --- | --- | --- |
| <what changed> | <baseline> | <very_low|low|medium|high|very_high> | <why the evidence is or is not strong> | <maximum language allowed> |

## Most Likely Explanation
| Claim | Baseline or comparator | confidence_label | confidence_basis | claim_ceiling |
| --- | --- | --- | --- | --- |
| <supported explanation> | <baseline> | <...> | <...> | <...> |

## Lenses Used
| Lens | Signal revealed | Baseline or comparator |
| --- | --- | --- |

## Immediate Actions
| Action | Owner | Due | Trigger |
| --- | --- | --- | --- |

## Watch List
- <metric, threshold, segment>

## Caveats
- <what could change the interpretation>
```

## Rules

- Use operational language.
- Tie each action to an owner, due date, or trigger when available.
- Prefer thresholds and alerts over abstract recommendations.
- Render `confidence_label`, `confidence_basis`, and `claim_ceiling` with each situation or explanation claim rather than as a single global block.
- If the audience is `customer`, apply customer-safe redactions and never include blocked internal metrics or speculative internal-cause claims in final output. Human approval cannot override a blocked claim; only stronger evidence or compliant rewritten language may appear.
