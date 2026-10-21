---
description: "Markdown repository entries and summaries; Typst/PDF depth with native-consumer and existing-contract exceptions."
globs: "*"
alwaysApply: false
trigger: model_decision
---

# Document Formats

- New human-facing reports, proposals, guides and specifications default to Typst
  source and a compiled PDF. Deliver a readable PDF, not only source requiring
  the recipient to install tooling.
- Keep repository entry pages, indexes and concise main points in Markdown for
  GitHub reading. Assemble comprehensive detail/expansions as Typst chapters in
  one book-like PDF beside its source, linked from the Markdown entry.
- Preserve existing document contracts and identified consumer formats: repository
  READMEs, Markdown sites/reviews, issues/PRs, agent instructions, memory/plans,
  parser inputs such as UX-SPEC/DESIGN/BDD, notebooks and native data/application
  artifacts. Templates describe content structure, not mandatory serialization.
- Maintain one narrative source, not parallel Markdown prose mirrors. Compile
  the final source revision and inspect layout, links, diagrams and readability.
  Missing tooling/packages is a reported blocker, not permission to install,
  upload to a cloud converter or silently substitute formats.

Methods: [Document format selection](../skills/doc-craft/references/document-formats.md),
[Typst workflow](../skills/doc-craft/references/typst-workflow.md).
