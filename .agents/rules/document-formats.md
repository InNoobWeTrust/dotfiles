---
description: "Choose Typst by default for saved human-facing documents; preserve formats required by actual consumers, repository conventions, or explicit user requests. Distinguish editable sources from verified delivery artifacts."
globs: "*"
alwaysApply: false
trigger: model_decision
---

# Document Format Selection

Load before creating, saving, substantially revising, or sharing a document. Identify its audience, reading/publishing/revision workflow, and any required consumer format; ordinary chat responses do not require document files.

## Default and Exceptions

**Default:** author new human-facing documents in **Typst (`.typ`)** and compile **PDF** for sharing or printing. This covers reports, proposals, guides, assessments, and human-readable specifications where no required consumer prevents it.

Use Markdown only when an identified requirement cannot be satisfied by Typst/PDF: a Markdown-only renderer/parser, a repository convention that requires Markdown, or an explicit output request. Name that requirement when selecting the exception; familiarity, ordinary text diffs, old examples, and the mere presence of other `.md` files are not sufficient.

| Intended use / required consumer | Format |
|---|---|
| Standalone human report, proposal, guide, or assessment | `.typ` source + compiled `.pdf` |
| GitHub-rendered README, issue, PR, or repository navigation | Required Markdown |
| Markdown documentation site, wiki, or mandated rendered-review workflow | Its required native format |
| Agent instructions and skill/rule references (`AGENTS.md`, `SKILL.md`, etc.) | Required Markdown and supported metadata |
| Agent memory, execution plans, phase files, consensus records | Required Markdown/YAML per `memory` and planning contracts |
| Parsed specs, `UX-SPEC.md`, linted `DESIGN.md`, canonical QA records | Preserve the declared consumer contract |
| Notebook cells, JSON/YAML, spreadsheets, HTML applications, executable BDD | Their native formats, not a typeset replacement |

**Template precedence:** Markdown examples in skills describe information structure, not the default syntax of saved human documents. This policy governs serialization unless a concrete consumer requires the example's format; it does not override machine/agent protocols. Use format-native headings, tables, callouts, and diagrams rather than copying Markdown syntax into `.typ`.

## Source and Delivery Contract

- **One source per narrative:** Maintain its editable Typst source tree and derive its PDF. Do not maintain a parallel Markdown prose mirror or introduce conversion adapters merely to retain the old default; canonical evidence and distinct required audience summaries remain separate.
- **Migration scope:** Do not bulk-convert existing files or rename consumer interfaces. Editing an existing document preserves its contract unless a format migration is authorized; new documents do not inherit Markdown by habit.
- **Reader access:** Deliver a current PDF for PDF consumption, with editable source when requested or part of the handoff. A recipient must not need Typst to read the PDF; a source-only handoff is not completed PDF delivery.
- **Verification:** Compile the final revision and inspect layout, diagrams, links in the distributed context, metadata, and accessibility. Any later source/asset edit invalidates that check; never present an older PDF as current after a failed build.
- **Blocked tooling:** Report an unavailable compiler/package and any undelivered PDF explicitly. Do not silently substitute Markdown, install tooling, upload content, or search for a converter to conceal the blocker.

For commands, a dependency-light starter, diagrams, and delivery checks, read [Typst workflow](../skills/doc-craft/references/typst-workflow.md). Existing [execution safety](execution-safety.md) and authorization boundaries apply; local compilation is the default, not automatic permission to use a cloud editor.
