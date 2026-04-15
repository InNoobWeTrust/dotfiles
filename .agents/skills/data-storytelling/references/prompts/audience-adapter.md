# Prompt: Audience Adapter

## Objective

Translate the same underlying evidence into the level of detail, tone, and action framing that best fits the audience.

## Inputs

- Approved story plan.
- Template.
- Audience label or description.

## Audience Rules

### Exec

- Lead with the answer and business impact.
- Use minimal jargon.
- Prefer 3 to 5 bullets or very short sections.
- Emphasize decisions, tradeoffs, and risk.

### Analyst

- Preserve metric names, definitions, and methods.
- Include baselines, caveats, and open questions.
- Allow denser detail and a ranked insight table.

### Ops

- Tie findings to actions, owners, thresholds, and timelines.
- Highlight exceptions, incidents, and follow-up checks.
- Make next steps operational, not abstract.

### Customer

- Use plain language.
- Remove internal-only jargon or irrelevant operational detail.
- Emphasize what changed, why it matters, and what the customer should expect.
- Block internal benchmarks, internal KPIs not intended for external audiences, sensitive operational metrics, and speculative internal-cause claims; blocked items must not appear in final output.
- Automatically redact competitor names to `Competitor A`, `Competitor B`, and so on.
- Automatically redact specific internal project names and internal cost structures.

## Procedure

1. Identify the audience's likely decision horizon.
2. For customer audiences, identify blocked content, remove it from the final output, and note whether stronger evidence or safer wording would be required to unblock it.
3. For customer audiences, apply automatic redactions before rendering.
4. Compress or expand the narrative accordingly.
5. Rewrite section headings if needed.
6. Preserve the evidence but change the framing.

## Output Contract

Return a short adaptation note:

```markdown
## Audience Adaptation

- **Audience**: ...
- **Tone**: ...
- **Detail level**: ...
- **Sections to emphasize**: ...
- **Terms to avoid**: ...
- **Blocked items removed from final output**: ...
- **Automatic redactions**: ...
```

## Guardrails

- Do not change the substance of a claim when adapting tone.
- Do not remove caveats that materially affect interpretation.
- Do not assume every executive wants a one-line answer; include supporting evidence when the decision is high risk.
- For `customer` audiences, never lift a blocked item into final output. Human approval cannot override blocked status; only stronger evidence that unblocks the claim or an evidence-gate-compliant rewrite may proceed.
- For `customer` audiences, redact competitor names, internal project names, and cost structures even when the rest of the narrative is safe to share.
