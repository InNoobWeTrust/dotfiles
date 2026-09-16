---
name: doc-craft
description: "Use this skill when designing, writing, restructuring, or auditing technical documentation — READMEs, developer guides, architecture overviews, topic entries, and docs directories. Enforces progressive disclosure (Index → Entry → Leaf), visual rhythm (tables over prose, max 3-sentence paragraphs, diagram anchors), and anti-wall-of-text discipline. Do not use for pure code implementation, formal PRD/TRD/BDD requirements, UI wireframing, or session memory persistence."
---

# Document Craftsmanship (`doc-craft`)

Technical documentation exists to build shared mental models, communicate decisions, and enable immediate action. Unstructured walls of text, discursive essays, and nested bullet points undermine readability.

This skill enforces two primary disciplines:
1. **Visual Rhythm & Scannability**: Replace verbose prose with structured tables, 3-sentence paragraph limits, bold lead-in lists, and visual diagram anchors.
2. **Progressive Disclosure**: Structure documentation into three clear layers (**Index → Entry → Leaf**) so readers load only what their current goal requires.

---

## When to Load This Skill

- User asks to write, rewrite, format, or clean up documentation ("write a guide", "document this architecture", "clean up the docs", "make this easier to read").
- Sharding, organizing, or refactoring a documentation directory ("shard doc", "structure docs", "index docs").
- Polishing technical notes or system overviews to eliminate walls of text.

Do **not** load for:
- Writing code, refactoring modules, or fixing bugs
- Formal requirements definitions like PRDs, TRDs, or BDD specs
- UI/UX visual mockups or design tokens
- Session checkpoints, state saves, or memory consolidation

---

## Workflow Phases

### Phase 1 — Information Architecture & Layering
1. **Determine the Document Layer**:
   - **Index**: Router/catalog for a directory (`README.md`, `INDEX.md`). Must stay under 40 rows.
   - **Entry**: Primary guide or topic overview (`<topic>.md`). Focuses on core flow and common paths (< 8 KB).
   - **Leaf**: Deep technical details, edge case catalogs, full parameter schemas (`details/<leaf>.md`).
2. **Apply Size Limits**: If an existing document exceeds **12 KB**, prepare to shard deep sections into `details/`.
3. Reference: [`references/progressive-disclosure.md`](references/progressive-disclosure.md).

### Phase 2 — Visual Rhythm & Scaffolding
Before drafting sentences, build the visual skeleton:
1. **Top Metadata Block**: Anchor the document with a concise summary table (Objective/Goal, Prerequisites, Boundaries).
2. **Diagram Anchor**: If explaining multi-component interaction or state flow, draft a Mermaid diagram first.
3. **Table Allocation**: Convert any parameter list, configuration matrix, status listing, or trade-off comparison into a Markdown table.
4. Reference: [`references/visual-rhythm-and-scannability.md`](references/visual-rhythm-and-scannability.md).

### Phase 3 — Drafting with Canonical Templates
1. Select the matching template from [`references/templates.md`](references/templates.md):
   - Technical Guide / How-To
   - System Architecture Overview
   - Section Index
   - Deep Leaf Detail
2. **Enforce the 3-Sentence Rule**: Keep all prose paragraphs to a maximum of 3 sentences.
3. **Bold Lead-Ins**: Ensure every list item begins with a bold action or concept keyword.
4. **Alert Hygiene**: Use `> [!NOTE]` or `> [!WARNING]` only for critical callouts; never stack consecutively.

### Phase 4 — Scannability & Link Audit
1. **The 5-Second Scan Test**: Can a reader glance at the page and immediately identify the goal, components, and primary command/table?
2. **Link Verification**: Verify all relative file links (`[text](../path.md)`) exist and resolve correctly.
3. **No Orphan Leaves**: Ensure every leaf in `details/` is referenced from its parent entry.

---

## Stop Conditions

- **Unclear Audience or Goal**: If the target reader (beginner vs maintainer) or primary objective is ambiguous, stop and clarify.
- **Monolithic File Creep**: If an entry exceeds 16 KB and has not been sharded into `details/`, halt writing and extract leaves first.
- **Invented / Unverified Commands**: Never document commands, flags, or configuration keys without verifying they exist in the repository.

---

## Deliverables Checklist

- [ ] Clear layer established (Index, Entry, or Leaf).
- [ ] Top metadata summary table present.
- [ ] Visual diagram anchor included for multi-component flows.
- [ ] No prose paragraph exceeds 3 sentences.
- [ ] Parameter lists, comparisons, and status sets formatted as Markdown tables.
- [ ] All list items feature bold lead-in keywords.
- [ ] All relative links tested and verified.

---

## Anti-Patterns

| Temptation | Why Wrong | Correct Path |
|---|---|---|
| Write discursive essays with background history | Readers need actionable information immediately | Open with a metadata summary table; move background to a 1–2 sentence note |
| Stack bullet points 4 levels deep | Creates visual chaos; destroys scannability | Flatten to max 2 levels; convert deep sub-lists into tables or leaf files |
| Dump extensive reference tables in the main guide | Bloats the guide; obscures the critical path | Move full schemas to `details/<leaf>.md`; leave a router link in the guide |
| Rely on italicized text for emphasis | Poor visual contrast on screens | Use bold lead-in words or a dedicated `> [!NOTE]` callout |
| Skip verification of commands in examples | Breaks user trust when copy-pasted | Ground all examples in actual codebase scripts, configs, and CLI tools |

---

## References

- [`references/progressive-disclosure.md`](references/progressive-disclosure.md) — The Index → Entry → Leaf architecture, sizing thresholds, and sharding workflow.
- [`references/visual-rhythm-and-scannability.md`](references/visual-rhythm-and-scannability.md) — Anti-wall-of-text guidelines, table transformations, and typography.
- [`references/templates.md`](references/templates.md) — Concrete templates for guides, architecture docs, indices, and leaf deep-dives.
