---
name: doc-craft
description: "Use this skill when designing, writing, restructuring, or auditing human-facing technical documentation — Typst-first guides and architecture overviews with PDF delivery, required Markdown READMEs and documentation sites, topic entries, and docs directories. Enforces audience/format routing, progressive disclosure (Index → Entry → Leaf), visual rhythm, and appropriate abstraction levels without jargon. Do not use for code implementation, formal PRD/TRD/BDD, UI wireframing, or internal agent execution/consensus tracking (use memory)."
---

# Document Craftsmanship (`doc-craft`)

Technical documentation exists to build shared mental models, communicate decisions, and enable immediate action. Unstructured walls of text, discursive essays, nested bullet points, and confusing low-level execution minutiae undermine human readability.

This skill enforces three primary disciplines:
1. **Audience & Destination Routing**: Route human-facing mental models to `docs/` and `<module>/README.md`; route internal agent task tracking, atomic plans, and consensus boards to `memory` (`MEMORY_DIR`).
2. **Abstraction Level & Plain Language**: Keep human docs concise, to-the-point, and jargon-free. Provide high-level architecture, mental models, and conceptual pseudocode rather than bombarding readers with low-level execution trivia.
3. **Visual Rhythm & Scannability**: Replace verbose prose with structured tables, 3-sentence paragraph limits, bold lead-in lists, diagram anchors, and progressive disclosure (**Index → Entry → Leaf**).

---

Before editing, read [Editorial working principles](references/working-principles.md#editing). The principles are reusable for non-technical writing or governance without imposing this technical-document workflow; keep the task's owning skill and audience contract.

Apply [Document format selection](../../rules/document-formats.md) before choosing a filename or template. Use [Typst workflow](references/typst-workflow.md) for the default `.typ` → PDF path; retain Markdown only for an identified required consumer.

## When to Load This Skill

- User asks to write, rewrite, format, or clean up documentation ("write a guide", "document this architecture", "clean up the docs", "make this easier to read").
- Authoring or auditing a code module's `README.md` to communicate purpose, usage, and invariants to human engineers.
- Sharding, organizing, or refactoring a documentation directory ("shard doc", "structure docs", "index docs").
- Polishing technical notes or system overviews to eliminate walls of text and unneeded jargon.

Do **not** load for:
- Writing code, refactoring modules, or fixing bugs
- Formal requirements definitions like PRDs, TRDs, or BDD specs
- UI/UX visual mockups or design tokens
- Internal agent execution tracking, atomic feature plans, vertical slice phase specs, or inter-agent consensus boards (route directly to `memory`)

---

## Workflow Phases

### Phase 1 — Audience Routing & Information Layering
1. **Audience & Destination Gate**:
   - **Human-Facing**: General architecture, guides, API references → `docs/`. Module role, public surface, usage → `<module>/README.md`.
   - **Agent-Facing / Internal**: Atomic implementation plans (`plan.md`), sequential vertical slice phase files (`phases/01-*.md`), inter-agent consensus boards, or execution checkpoints → **STOP and route to `memory`** (`MEMORY_DIR`). Do NOT dump execution tracking into `docs/`.
   - Reference: [`references/document-routing-and-audience.md`](references/document-routing-and-audience.md).
    - **Reader contract**: Record `audience` (who uses it), `purpose` (what it enables), and `scope` (coverage/exclusions). In Typst, use a short visible summary plus supported document metadata, not YAML frontmatter. In Markdown, use concise YAML frontmatter where supported; preserve existing metadata and verify permitted fields for tool-consumed files such as `SKILL.md`. Do not bulk-retrofit unrelated files.
2. **Determine the Document Layer**:
    - **Index**: Router/catalog or document outline; use `.typ` by default, `README.md`/`INDEX.md` where repository navigation requires Markdown. Must stay under 40 rows.
    - **Entry**: Primary guide/topic overview (`<topic>.typ`, `.md` for a required consumer) or module `README.md`. Focuses on core flow and common paths (< 8 KB of source).
    - **Leaf**: Deep details, edge cases, full parameter schemas (`details/<leaf>.typ`, or required `.md`); include relevant Typst leaves in a self-contained PDF.
3. **Apply Size Limits & Progressive Splitting**: If an existing document exceeds **12 KB**, shard it into leaves (Pattern A) or ordered sequential files (Pattern B). For directory indexing ("index docs") or document sharding ("shard doc"), follow [`references/progressive-disclosure.md`](references/progressive-disclosure.md).

### Phase 2 — Abstraction Calibration & Visual Scaffolding
Before drafting sentences, calibrate abstraction and build the visual skeleton:
1. **Calibrate Abstraction Level**: Ensure content targets human comprehension (what it is, why it matters, how to use it). Replace low-level implementation details with high-level architecture and concise pseudocode at appropriate abstraction levels. Eliminate jargon.
2. **Top Metadata Block**: Anchor the document with a concise summary table (Objective/Goal, Prerequisites, Boundaries).
3. **Diagram Anchor**: If explaining multi-component interaction or state flow, draft a diagram first. Validate Mermaid sources and render them to SVG/PNG for Typst; include a caption and text alternative.
4. **Table Allocation**: Convert parameter lists, configuration matrices, status listings, and trade-off comparisons into native tables (`#table` in Typst; Markdown tables only for Markdown output).
5. Reference: [`references/visual-rhythm-and-scannability.md`](references/visual-rhythm-and-scannability.md).

### Phase 3 — Drafting with Canonical Templates
1. Select the matching template from [`references/templates.md`](references/templates.md):
    - Technical Guide / How-To (`docs/guides/<topic>.typ`)
    - System Architecture Overview (`docs/architecture/<system>.typ`)
    - Section Index (`docs/<section>/index.typ`; required `INDEX.md` for Markdown navigation)
    - Deep Leaf Detail (`docs/<section>/details/<leaf>.typ`)
   - Code Module README (`<module>/README.md`)
2. **Enforce the 3-Sentence Rule**: Keep all prose paragraphs to a maximum of 3 sentences.
3. **Bold Lead-Ins**: Ensure every list item begins with a bold action or concept keyword.
4. **Alert Hygiene**: Use native callouts only for critical details; never stack them. GitHub alerts such as `> [!WARNING]` are Markdown-specific, not Typst syntax.

### Phase 4 — Scannability, Abstraction, & Link Audit
1. **The 5-Second Scan Test**: Can a reader glance at the page and immediately identify the goal, components, and primary command/table?
2. **Abstraction & Jargon Audit**: Confirm no low-level agent execution noise, raw task checklists, or unexplained jargon leaked into the document.
   - Compare the prose against the declared audience, purpose, and scope: flag both unnecessary context and missing explanation. Check the declaration itself against the requested document; metadata is not proof that the content belongs.
3. **Link Verification**: Verify source references and distributed links. A detached PDF must not depend on the author's checkout; use internal labels/references, accessible URLs, or an explicitly tested distribution bundle.
4. **No Orphan Leaves**: Ensure every leaf in `details/` is referenced from its parent entry.
5. **Typst Delivery Check**: Compile and inspect the final PDF per [Typst workflow](references/typst-workflow.md); report blockers and invalidate the check after later source/asset edits.

---

## Stop Conditions

- **Agent Execution Artifacts in `docs/`**: If the document being created is an atomic feature plan, phase breakdown, or inter-agent consensus board, halt immediately and route to `memory` (`MEMORY_DIR`).
- **Uncalibrated Abstraction Level**: If the document bombards human readers with low-level execution minutiae, commit logs, or heavy internal jargon instead of high-level architecture and clear usage, halt and recalibrate.
- **Unclear Audience or Goal**: If the target reader (beginner vs maintainer) or primary objective is ambiguous, stop and clarify.
- **Monolithic File Creep**: If an entry exceeds 16 KB and has not been sharded into `details/`, halt writing and extract leaves first.
- **Invented / Unverified Commands**: Never document commands, flags, or configuration keys without verifying they exist in the repository.
- **Unbuilt or Stale PDF**: If compilation or delivery checks fail, report the blocker and incomplete artifact; do not silently install, upload, substitute Markdown, or ship an older PDF as current.

---

## Deliverables Checklist

- [ ] Audience verified as human; agent task/phase/consensus artifacts routed to `memory`.
- [ ] Typst selected by default; any other format tied to a concrete consumer requirement or explicit request.
- [ ] Reader contract recorded in frontmatter where supported, otherwise in the body; content checked against it.
- [ ] Appropriate abstraction level maintained (concise, jargon-free, high-level choices with pseudocode).
- [ ] Clear layer established (Index, Entry, or Leaf; or module README).
- [ ] Top metadata summary table present.
- [ ] Visual diagram anchor included for multi-component flows.
- [ ] No prose paragraph exceeds 3 sentences.
- [ ] Parameter lists, comparisons, and status sets formatted as native tables.
- [ ] All list items feature bold lead-in keywords.
- [ ] All relative links tested and verified.
- [ ] Final PDF compiled and inspected when required; any undelivered output explicitly marked blocked.

---

## Anti-Patterns

| Temptation | Why Wrong | Correct Path |
|---|---|---|
| Dump atomic task plans, phase files, or consensus boards into `docs/` | Pollutes human documentation with transient or task-level agent execution trivia | Route atomic plans, phase files, and consensus boards to `MEMORY_DIR` via `memory` skill |
| Write discursive essays with background history | Readers need actionable information immediately | Open with a metadata summary table; move background to a 1–2 sentence note |
| Bombard human readers with low-level code trivia or heavy jargon | Obscures purpose and usage; creates cognitive fatigue | Stick to high-level architecture, mental models, and concise pseudocode |
| Write module READMEs as internal task checklists or change logs | Fails to teach engineers how or why to consume the module | Document purpose, mental model, quick-start usage, exported surface, and invariants |
| Stack bullet points 4 levels deep | Creates visual chaos; destroys scannability | Flatten to max 2 levels; convert deep sub-lists into tables or leaf files |
| Dump extensive reference tables in the main guide | Bloats the guide; obscures the critical path | Move schemas to leaves in the selected format; include required detail in the shared PDF |
| Rely on italicized text for emphasis | Poor visual contrast on screens | Use bold lead-in words or a dedicated `> [!NOTE]` callout |
| Put a blank line inside a raw HTML block (tables, callouts) | CommonMark ends the HTML block at the blank line; renders as literal text | Blank lines only BETWEEN the HTML block and surrounding Markdown |
| Skip verification of commands in examples | Breaks user trust when copy-pasted | Ground all examples in actual codebase scripts, configs, and CLI tools |
| Treat Markdown examples or compiler absence as a format exception | Reinstates converter hunting or hides failed delivery | Apply the consumer gate; report build blockers separately |

---

## References

- [Document format selection](../../rules/document-formats.md) — Shared default, consumer exceptions, and source/delivery contract.
- [Typst workflow](references/typst-workflow.md) — Local build, starter, diagrams, safety, and PDF verification.
- [`references/document-routing-and-audience.md`](references/document-routing-and-audience.md) — Boundary between human docs (`docs/`, module READMEs) and agent memory (`MEMORY_DIR`), abstraction rules, and routing tree.
- [`references/progressive-disclosure.md`](references/progressive-disclosure.md) — The Index → Entry → Leaf architecture, sizing thresholds, and sharding workflow.
- [`references/visual-rhythm-and-scannability.md`](references/visual-rhythm-and-scannability.md) — Anti-wall-of-text guidelines, table transformations, and typography.
- [`references/templates.md`](references/templates.md) — Canonical templates for guides, architecture docs, indices, deep leaves, and code module READMEs.
