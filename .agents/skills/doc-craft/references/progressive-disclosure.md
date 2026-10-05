# Progressive Disclosure for Documentation

Documentation becomes unreadable when too much information is loaded at once. The **Index → Entry → Leaf** pattern bounds reader cognitive load and agent context windows by enforcing strict information layering.

---

## The Three-Layer Shape (Human-Facing)

> [!IMPORTANT]
> The layers below govern **human-facing documentation** (`docs/`, `<module>/README.md`). Internal agent coordination artifacts (atomic plans, sequential vertical slice phase files, inter-agent consensus boards) do NOT belong in `docs/` — they route to `MEMORY_DIR` per [`document-routing-and-audience.md`](document-routing-and-audience.md).

```
INDEX (Always loaded / Top-level overview)
 └─ ENTRY (Loaded on topic selection / Router & core flow)
     └─ LEAF (Loaded on demand / Deep technical details)
```

| Layer | Responsibility | Typical Size | Example |
|---|---|---|---|
| **Index** | Maps the domain; routes reader to topics based on intent | < 40 rows | `docs/README.md`, `docs/<section>/INDEX.md` |
| **Entry** | Core workflow, high-level architecture, decision router | < 8 KB | `docs/<section>/<topic>.md`, `<module>/README.md` |
| **Leaf** | Deep dive, edge cases, schema tables, parameter reference | < 16 KB | `docs/<section>/details/<leaf>.md` |


---

## The Four Invariants of an Index

A file qualifies as an Index only when it satisfies all four:
1. **Small**: Rows are bounded (under 40 rows per table).
2. **Complete**: Every entry it governs is listed. No orphan files.
3. **Actionable**: Every row provides a crisp "When to read / Trigger" column, not just a bare title.
4. **Regenerable**: The index can be reconstructed by inspecting the entry files.

---

## Sharding Large Documents (The Shard-Doc Recipe)

When a document exceeds **12 KB** or addresses multiple distinct audiences / concerns, shard it using one of two patterns:

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
  5. **Prompt User About Original**: Ask whether to keep, archive, or delete the source document.
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

### Human-Facing Repository Documentation (`docs/`)
```
docs/
├── README.md                     # Top-level index: catalog of sections & reader journeys
├── <section>/
│   ├── INDEX.md                  # Section index (when section has 3+ entries)
│   ├── <topic-1>.md              # Topic entry
│   ├── <topic-2>.md
│   └── details/
│       ├── <leaf-a>.md           # Deep leaf details (parameters, schemas, edge cases)
│       └── <leaf-b>.md
└── glossary.md                   # Shared terminology (optional)
```

### Human-Facing Code Module Documentation (`<module>/README.md`)
Placed directly inside each code package or subsystem directory (e.g. `src/auth/README.md`, `packages/parser/README.md`) to document module role, mental model, primary usage, exported abstractions, and invariants at the appropriate abstraction level.

### Agent Coordination Memory (`MEMORY_DIR` — Not `docs/`)
Atomic execution plans, vertical slice phase files (`phases/01-*.md`), consensus boards, and session checkpoints live under `MEMORY_DIR` (`.agents/memories/`, `.serena/memories/`), preserving clean human documentation while keeping internal agent tracking file-based and git-committable.

