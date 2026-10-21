---
audience: Agent-workflow maintainers and engineering leads without aviation prerequisites
purpose: Navigate the DO-178 research and its cautious application to agent workflows
scope: Public-source learning and provisional practices; not certification guidance
---

# DO-178B/C: lessons for agent assurance

[**Read the complete guide (PDF)**](./main.pdf) · [Editable Typst source](./main.typ)

The eight-page guide explains the standards, their core assurance principles, the local review practices and the limits of the experiments.

## Main points

- **Requirements before evidence:** verify intended behavior, not merely what the implementation happens to do.
- **Review both directions:** find unsupported requested outcomes and unjustified changes, while allowing necessary implementation details.
- **Independent judgment:** assess sources before the author's interpretation, then reconcile; disclose when separation was impossible.
- **Consequences guide optional checks:** prioritize important, hard-to-reverse or poorly observable failures without waiving mandatory gates.
- **Keep ideation causal:** connect source principles to mechanisms, user outcomes and falsifiers; avoid leaf-detail drift without discarding necessary measurements.

## Evidence boundary

The three review practices and ideation drift guard are implemented provisionally. Small exploratory comparisons found **no demonstrated advantage over baseline**; the checksum recipe was withdrawn. Aggregate findings and limitations are in the guide; superseded notes and raw receipts were moved to task-private research records.

Normative standards were not inspected, and direct retrieval of FAA AC 20-115D failed. Public-source learning is not aviation compliance or proof of agent safety.

## For maintainers

The guide uses built-in Typst features and Libertinus Serif, verified with Typst 0.15.1. From this directory, rebuild with `typst compile main.typ main.pdf`; the chapters and bibliography render together, not as separate PDFs. Source records live in [references.bib](./references.bib), not a hand-maintained Typst source catalog.

[Back to research index](../INDEX.md)
