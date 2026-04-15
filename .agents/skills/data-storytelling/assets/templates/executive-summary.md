# Template: Executive Summary

## Use When

- Audience is executive or mixed leadership.
- The goal is decision support.
- The output must be short and high signal.

## Required Sections

```markdown
# Executive Summary: <topic>

## Answer
| Claim | confidence_label | confidence_basis | claim_ceiling |
| --- | --- | --- | --- |
| <direct answer claim> | <very_low|low|medium|high|very_high> | <why the evidence is or is not strong> | <maximum language allowed> |
| <optional second answer claim> | <...> | <...> | <...> |

## Why It Matters
- <business impact tied to the answer claims>

## Key Evidence
| Supporting insight | Baseline or comparator | confidence_label | confidence_basis | claim_ceiling |
| --- | --- | --- | --- | --- |
| <supporting insight> | <baseline> | <...> | <...> | <...> |

## Lenses Used
| Lens | Signal revealed | Baseline or comparator |
| --- | --- | --- |

## Caveats
- <1 to 3 bullets>

## Recommended Action
- <decision, next step, or watch item>
```

## Rules

- Lead with the answer.
- Keep jargon minimal.
- Use short bullets or short paragraphs.
- Render `confidence_label`, `confidence_basis`, and `claim_ceiling` with each material claim rather than once for the whole document.
- If `Why It Matters` or `Recommended Action` introduces a new material claim, give it the same fields inline or move it into `Answer` or `Key Evidence`.
- If the audience is `customer`, apply customer-safe redactions and never include blocked internal metrics or speculative internal-cause claims in final output. Human approval cannot override a blocked claim; only stronger evidence or compliant rewritten language may appear.
