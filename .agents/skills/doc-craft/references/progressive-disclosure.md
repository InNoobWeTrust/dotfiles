# Progressive Disclosure for Documentation

Documentation becomes unreadable when too much information is loaded at once. The **Index → Entry → Leaf** pattern bounds reader cognitive load and agent context windows by enforcing strict information layering.

Apply [Document format selection](document-formats.md) before choosing extensions. Repository indexes, entries and concise summaries stay Markdown; substantial human-facing detail is assembled from Typst chapters into a single PDF. Agent memory and required native consumers retain their protocols.

Before splitting files, establish the [main reading path and supporting layers](reader-path.md). Index → Entry → Leaf organizes the document collection; contents, notes, and appendices organize attention within a document, without hiding essential qualifications.

---

## The Three-Layer Shape (Human-Facing)

> [!IMPORTANT]
> The layers below govern **human-facing documentation** (`docs/`, `<module>/README.md`). Internal agent coordination artifacts (atomic plans, sequential vertical slice phase files, inter-agent consensus boards) do NOT belong in `docs/` — use the explicitly scoped coordination-memory contract in [`document-routing-and-audience.md`](document-routing-and-audience.md).

```
INDEX (Always loaded / Top-level overview)
 └─ ENTRY (Loaded on topic selection / Router & core flow)
     └─ LEAF (Loaded on demand / Deep technical details)
```

| Layer | Responsibility | Typical Size | Example |
|---|---|---|---|
| **Index** | Maps the domain; routes reader to topics based on intent | < 40 rows | `docs/README.md`, `<section>/INDEX.md` |
| **Entry** | Main points, core workflow, caveats and link to comprehensive PDF | < 8 KB source | `<topic>.md`, `<topic>/README.md`, module `README.md` |
| **Leaf** | Deep dive, edge cases, schema tables, parameter reference | < 16 KB source | `<topic>/details/<leaf>.typ`, included in `<topic>/main.pdf`; required native formats preserved |


---

## The Four Invariants of an Index

A file qualifies as an Index only when it satisfies all four:
1. **Small**: Rows are bounded (under 40 rows per table).
2. **Complete**: Every entry it governs is listed. No orphan files.
3. **Actionable**: Every row provides a crisp "When to read / Trigger" column, not just a bare title.
4. **Regenerable**: The index can be reconstructed by inspecting the entry files.

---

## Sharding Large Documents (The Shard-Doc Recipe)

When document source exceeds **12 KB** or addresses multiple distinct audiences / concerns, extract appropriate leaves. This is not a PDF-file-size limit; apply the Markdown recipes below only when Markdown is selected.

For substantial human-facing detail, keep the Markdown entry concise and use `main.typ` to compose chapters with native includes, such as `#include "details/leaf.typ"`, into one `main.pdf`. Preserve valid markup/code boundaries rather than splitting on Markdown headings; the delivered book includes the chapters, contents and appendices so navigation does not depend on the author's checkout.

Patterns A/B below apply to existing or explicitly required Markdown detail, not the default for new comprehensive books. They do not authorize a bulk format migration.

### Pattern A: Leaf Extraction (`details/<leaf-name>.md`)
Use for modular guides where deep sections are moved out of the primary reading path.

1. **Identify Leaf Candidates**: Deep edge cases, failure matrices, extensive parameter/schema tables, or specialized configuration guides.
2. **Extract Leaves**: Move deep content to `details/<leaf-name>.md`. Include backlink to parent entry. Ensure each leaf is self-contained.
3. **Replace Detail with Scannable Router**: In the parent entry, replace extracted prose with a 1–2 sentence conceptual summary and an actionable router link:
   > For low-level timeout configuration and TCP socket tuning under high load, see [`details/socket-tuning.md`](details/socket-tuning.md).
4. **Validate Navigation**: Link audit to confirm no broken relative paths; confirm parent entry is under the 8 KB soft limit.

### Pattern B: Sequential Numbered Sharding (`00-preamble.md`, `01-*.md`)
Use when decomposing a long linear document (architecture note, system specification, or chaptered guide) into ordered, numbered section files.

- **Inputs & Output Location**:
  - Source file (`.md`, `.mdx`, `.txt`)
  - Destination: Defaults to **agent artifacts directory** (never force repository writes without explicit user confirmation; write to repo or custom path only if requested).
- **Execution Steps**:
  1. **Validate**: Confirm source file exists and contains text content.
  2. **Detect Heading Level**: Identify primary section delimiter (`##` headers default, fallback `#`). Warn if heading structure is inconsistent.
  3. **Split**: Split on detected heading level into numbered files:
     - `00-preamble.md` (content before the first section header, if any)
     - `01-<slugified-title>.md`
     - `02-<slugified-title>.md`, etc.
     Preserve all content without information loss. Ensure each section file stands alone.
  4. **Create Manifest (`index.md`)**:
     ```markdown
     # [Original Document Title]

     Sharded from: `[source path]`
     Date: [date]
     Sections: [N]

     | # | Section | Lines | Description |
     |---|---|---|---|
     | 00 | Preamble | 12 | Frontmatter and introduction |
     | 01 | Problem Definition | 45 | Requirements and constraints |
     | 02 | Architecture Overview | 120 | System design and components |
     ```
   5. **Honor Source Disposition**: Carry out an already-approved keep/archive/delete decision. For approved replacement and deletion, verify the replacement, update/remove in-scope references and remove the original; do not leave a pointer-only stub instead of deleting it. Ask about disposition only when it remains unresolved.
  6. **Overwrite Check**: If destination already contains numbered section files, warn and ask before replacing.

---

## Directory Indexing Procedure (The Index-Docs Recipe)

Use when a documentation folder needs an organized table of contents, a quick LLM-scannable overview, or when a folder has grown and needs organization.

- **Inputs & Output Location**:
  - Target directory: Path to folder to index.
  - Destination: Defaults to **agent artifacts directory** (write to repository directory as `index.md` or `README.md` only when explicitly requested).
  - Depth: 1 level by default (recursive optional).
- **Execution Steps**:
  1. **Scan**: List non-hidden files in the target directory (skip binary files, hidden files, and `node_modules`/`.git`).
  2. **Read**: Open and inspect each file to understand its actual purpose (descriptions must reflect actual content, never guessed from filename alone).
  3. **Group**: Group files by type, purpose, or subdirectory (avoid creating single-file groups).
  4. **Describe**: Write a concise purpose description (3–10 words) for each file.
  5. **Generate**: Produce the organized index table using relative links only.
- **Output Format**:
  ```markdown
  # Index: [Directory Name]

  Generated: [date]
  Files: [N] | Directories: [M]

  ## [Group Name]

  | File | Description |
  |---|---|
  | [filename.md](./filename.md) | Brief purpose description |
  | [other.md](./other.md) | Brief purpose description |
  ```
- **Rules**:
  - If no indexable files exist, report "No files to index" and exit.
  - If `index.md` already exists, show diff and prompt before overwriting.
  - Relative links only so the index remains portable.

---

## Directory Layout Standards

### Human-Facing Repository Documentation (`docs/`, Markdown entry + Typst book)
```
docs/
├── README.md                     # GitHub-readable map / reader journeys
├── <section>/
│   ├── INDEX.md                  # Section router
│   ├── <short-topic>.md          # Main points; no book needed
│   └── <comprehensive-topic>/
│       ├── README.md             # Summary, caveats, link to main.pdf
│       ├── main.typ              # Layout, contents and chapter includes
│       ├── main.pdf              # Whole readable book, beside source
│       └── details/
│           ├── foundations.typ
│           └── applications.typ
└── GLOSSARY.md                   # Optional repository glossary
```

### Human-Facing Code Module Documentation (`<module>/README.md`)
Placed directly inside each code package or subsystem directory (e.g. `src/auth/README.md`, `packages/parser/README.md`) to document module role, mental model, primary usage, exported abstractions, and invariants at the appropriate abstraction level.

### Agent Coordination Memory (Not `docs/`)
Atomic execution plans, vertical slice phase files (`phases/01-*.md`), consensus boards, and session checkpoints belong in an explicitly resolved scope selected through an authorized coordination-memory capability—not an assumed project or host path. Supply record type and privacy scope; require a Markdown/YAML destination and write authorization. If unavailable, stop and report without placing internal tracking in human documentation. Keep authorized records human-traceable and avoid leaking private task context into Git.
