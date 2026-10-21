# Document Format Selection

Load before creating, saving, substantially revising, or sharing a document. Identify its audience, reading/publishing/revision workflow, and any required consumer format; ordinary chat responses do not require document files.

## Repository Pattern and Standalone Documents

**Repository documentation:** keep entry pages and concise main points in **Markdown** for reading and navigation on GitHub. Put comprehensive human-facing explanations, details and expansions in **Typst (`.typ`)**, assembling related chapters into one readable **PDF** beside the source; the entry links to that PDF.

**Standalone documents:** reports, proposals, guides, assessments and human-readable specifications default to Typst/PDF unless a required consumer or explicit output request dictates otherwise. A short repository summary does not need a companion book; conversely, an existing Markdown wiki is not by itself a reason to keep adding long human-facing detail in Markdown.

| Intended use / required consumer | Format |
|---|---|
| Standalone human report, proposal, guide, or assessment | `.typ` source + compiled `.pdf` |
| Repository index, topic entry, concise main points, GitHub issue or PR | Markdown; link comprehensive detail as a PDF when present |
| Comprehensive repository narrative, chapters or appendices | `main.typ` including `details/*.typ` → one `main.pdf` |
| Bibliographic source records and citation metadata | Prefer `.bib`; generate the reference list in Typst. Use `.typ` only where `.bib` is unsuitable or cannot represent the information adequately |
| Documentation site/parser or mandated rendered-review workflow requiring Markdown detail | Its required native format; record the specific consumer |
| Agent instructions and skill/governance references (`AGENTS.md`, `SKILL.md`, etc.) | Required Markdown and supported metadata |
| Agent memory, execution plans, phase files, consensus records | Required Markdown/YAML per `memory` and planning contracts |
| Parsed specs, `UX-SPEC.md`, linted `DESIGN.md`, canonical QA records | Preserve the declared consumer contract |
| Notebook cells, JSON/YAML, spreadsheets, HTML applications, executable BDD | Their native formats, not a typeset replacement |

**Template precedence:** Markdown examples in skills describe information structure, not the default syntax of saved human documents. This policy governs serialization unless a concrete consumer requires the example's format; it does not override machine/agent protocols. Use format-native headings, tables, callouts, and diagrams rather than copying Markdown syntax into `.typ`.

## Source and Delivery Contract

- **One source per narrative:** Maintain the comprehensive narrative in its editable Typst tree and derive its PDF. The Markdown entry is a distinct summary/navigation layer, not a prose mirror; keep essential conclusions and caveats there without duplicating chapters.
- **Migration scope:** Do not bulk-convert existing files or rename consumer interfaces. Editing an existing document preserves its contract unless a format migration is authorized; new documents do not inherit Markdown by habit.
- **Reader access:** Keep the current PDF beside its source and link it from the Markdown entry for GitHub PDF viewing/download. Retain the editable source/assets for rebuilding; readers must not need Typst or browse separate source chapters to read the whole book. Source-only handoff is not completed PDF delivery.
- **Verification:** Compile the final revision and inspect layout, diagrams, links in the distributed context, metadata, and accessibility. Any later source/asset edit invalidates that check; never present an older PDF as current after a failed build.
- **Blocked tooling:** Report an unavailable compiler/package and any undelivered PDF explicitly. Do not silently substitute Markdown, install tooling, upload content, or search for a converter to conceal the blocker.

For commands, a dependency-light starter, diagrams, and delivery checks, read [Typst workflow](typst-workflow.md). Existing execution safety and authorization boundaries apply; local compilation is the default, not automatic permission to use a cloud editor.
