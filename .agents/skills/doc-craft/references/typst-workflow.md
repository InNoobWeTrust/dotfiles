# Typst Authoring and PDF Delivery

Use for human-facing documents selected by [Document format selection](../../../rules/document-formats.md). Keep the task's domain skill for content; this reference supplies authoring and delivery, not a second research/specification workflow.

## 1. Establish the Reader and Build Inputs

- **Reader contract:** State audience, purpose, scope, and assumed knowledge visibly. Set document title/author metadata where appropriate and the correct text language; do not add Markdown YAML frontmatter to `.typ`.
- **Dependencies:** Prefer built-in Typst features and local assets. Record the compiler version, required fonts, asset paths, and exact package versions when used; pinning a package does not make it available offline.
- **Local and bounded:** Follow [execution safety](../../../rules/execution-safety.md). Typst defaults its input root to the main file's parent; widen `--root` only to the smallest necessary, secret-free input tree. Root containment is a compiler restriction, not an OS sandbox or protection for secrets inside that tree.
- **Acquisition and privacy:** Uncached published packages download on demand; use approved network access and scratch/cache locations. Do not install tools or send content to the hosted editor without authorization. A missing compiler/package is a build blocker, not a reason to revert to Markdown.

## 2. Author Once, Compile Directly

From the document project directory, check the available compiler and build:

```sh
typst --version
typst compile report.typ report.pdf
```

For interactive local editing, Typst can rebuild on changes:

```sh
typst watch report.typ
```

Agent-managed watchers still follow the existing process-management rules. Prefer the repository's existing build command where one exists; do not add a converter service, custom wrapper, or second maintained prose format for a single document.

**Dependency-light starter (`report.typ`):** replace the example reader contract and content, and set the language for the actual audience.

```typst
#set document(title: "Technical Note")
#set text(lang: "en", size: 11pt)
#set page(paper: "a4", margin: 22mm, numbering: "1")

= Technical Note

#table(
  columns: (auto, 1fr),
  table.header([*Reader contract*], [*Value*]),
  [Audience], [Developers using the documented capability],
  [Purpose], [Complete the primary task and recognize failures],
  [Scope], [Supported use, prerequisites, and exclusions],
)

== Summary
Explain what the capability does and when to use it.

== Procedure
+ *Prepare:* Confirm the stated prerequisites.
+ *Act:* Follow the smallest working example.
+ *Verify:* Compare observable output with the expected result.

== Failure Modes
Describe the symptom, cause, and safe next action.
```

This is a content/layout starter, not evidence that a particular environment compiled it. For long documents, use native headings, an outline, and included `.typ` sections; judge source size separately from PDF size.

## 3. Include Visuals and Portable References

- **Tables and code:** Use native `#table` and raw/code blocks. Markdown tables, GFM alerts, and Mermaid fences are not Typst rendering instructions; check code copyability in the PDF.
- **Diagrams:** Validate Mermaid with the [Mermaid validation skill](../../mermaid-validation/SKILL.md), then export it with available authorized rendering tools to static SVG or PNG. Syntax validation alone does not render an image; unavailable export is an explicit blocker, not permission to show diagram code as the visual.
- **Embedding:** Keep editable visual source, the local exported asset, a caption, and meaningful alt text. Typst supports SVG/PNG images, for example:

```typst
#figure(
  image("assets/flow.svg", width: 100%, alt: "Input passes through validation to the report."),
  caption: [Document processing flow.],
)
```

- **Navigation:** Use internal labels/references for included sections. For external material, use stable accessible URLs or a tested bundle; relative repository `.md` links are not automatically usable in a detached PDF.
- **Repository entry points:** A required Markdown README/index may link to the PDF and editable source without duplicating the full narrative. Do not turn the navigation stub into a second authored report.

## 4. Verify the Final Revision and Deliver

| Check | Required observation |
|---|---|
| Fresh build | Compilation succeeds from final source/assets; no older output is passed off after failure |
| Layout and content | Pages open; no clipping, missing glyphs, broken tables, absent diagrams, or misplaced caveats |
| Reader workflow | Primary task, code copyability, navigation, and links work in the intended distribution context |
| Accessibility | Correct language, semantic headings/tables, figure alternatives, contrast, and reading order reviewed |
| Privacy | PDF metadata, links, attachments, and visible content contain only intended information |
| Rebuildability | Required source/assets and compiler/font/package assumptions are available to the intended maintainer |

PDF tagging is enabled by default, but successful compilation/tagging is not proof of accessibility. Use PDF/UA checks when required and supported by the installed version, plus appropriate manual review; do not disable tags by default.

Deliver the checked PDF and the source/assets needed for the agreed editable handoff. If compilation or inspection is unavailable, label the source **uncompiled/unverified**, state which requested output is missing and the exact next build/check step, and never present a stale PDF as current; do not silently install, upload, or substitute Markdown. Any subsequent source/asset edit requires rebuilding and rechecking.

## Sources and Prototype Audit

- [Official compiler and CLI](https://github.com/typst/typst) — Direct compile/watch workflow; no Markdown converter required.
- [PDF export and accessibility](https://typst.app/docs/reference/pdf/) — Default output/tagging and limitations of automated accessibility checks.
- [Paths and project roots](https://typst.app/docs/reference/foundations/path/) — Input-root semantics; not a claim of OS isolation.
- [Packages](https://github.com/typst/packages#downloads) — Exact-version imports, on-demand acquisition, cached offline use.
- [Images](https://typst.app/docs/reference/visualize/image/) — SVG/PNG embedding and alternatives.

**Lifecycle:** Prototype, 2026-10-09. Audit after the first 1–2 real document deliveries: compile the starter, inspect a table/code/diagram/link example, and exercise required-Markdown and missing-tooling controls. Local compilation, recipient usability, and accessibility have not yet been demonstrated by this guidance change.

### ACI Pass

- **Result:** PASS WITH GAPS — format/source/failure contracts are explicit; runtime delivery remains unverified.
- **Main risks:** Overbroad Markdown exceptions, unavailable tooling/assets, stale PDF, inaccessible or leaking output.
- **Interface upgrades:** Consumer gate, format-native templates, direct build, one source per narrative, explicit blocked delivery, bounded local execution, final-revision checks.
