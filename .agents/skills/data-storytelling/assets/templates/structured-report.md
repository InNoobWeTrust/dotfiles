# Template: Structured Report

## Use When

- Audience is mixed or unknown.
- The user wants a neutral reusable report structure.
- The output may feed another tool or workflow.

## Required Sections

This outline specifies sections and evidence fields, not serialization. Saved human reports follow [Document format selection](../../../../rules/document-formats.md): Typst + PDF by default; use required Markdown/other syntax for an identified downstream consumer.

```markdown
# Data Story: <topic>

## Goal
<goal statement>

## Answer
| Claim | confidence_label | confidence_basis | claim_ceiling |
| --- | --- | --- | --- |
| <answer-first claim> | <very_low|low|medium|high|very_high> | <why the evidence is or is not strong> | <maximum language allowed> |

## Key Insights
| Insight | Baseline or comparator | confidence_label | confidence_basis | claim_ceiling |
| --- | --- | --- | --- | --- |
| <insight 1> | <baseline> | <...> | <...> | <...> |
| <insight 2> | <baseline> | <...> | <...> | <...> |
| <insight 3> | <baseline> | <...> | <...> | <...> |

## Lenses Used
| Lens | Signal revealed | Baseline or comparator |
| --- | --- | --- |

## Evidence
| Evidence item | Supports claim | Baseline or comparator |
| --- | --- | --- |
| <supporting evidence> | <answer or insight claim> | <baseline> |

## Caveats
- <caveats>

## Recommended Next Steps
- <action or open question>
```

## Rules

- Keep section names stable.
- Keep tone neutral.
- Preserve section names and evidence fields; if a downstream parser is required, retain its actual input format rather than treating a PDF as parse-equivalent.
- Render `confidence_label`, `confidence_basis`, and `claim_ceiling` on each answer or insight row rather than once for the whole story.
- If the audience is `customer`, apply customer-safe redactions and never include blocked internal metrics or speculative internal-cause claims in final output. Human approval cannot override a blocked claim; only stronger evidence or compliant rewritten language may appear.
