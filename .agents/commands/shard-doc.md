---
description: >
  Split large markdown documents into organized section files with an index.
  Use when a document exceeds ~500 lines or becomes hard to navigate, when you
  need separate sections for parallel editing or LLM context management, or
  when preparing docs for downstream consumption.
---

# Shard Document

Split a large markdown file on `##` headers into numbered section files
with an organized index.

## Inputs

- **Source file**: Path to the markdown file to split
- **Destination** (optional): Where to write output. Options:
  - Agent artifacts directory (default — no repo writes)
  - Repo directory (only if user explicitly requests)
  - Custom path

## Process

1. **Validate** — Confirm source file exists and contains text content
   (accepts `.md`, `.mdx`, `.txt`, or any text file with markdown syntax)
2. **Detect heading level** — Find the primary section delimiter:
   - Use `##` headers if present (default)
   - Fall back to `#` headers if no `##` found
   - If heading structure is inconsistent, warn user before proceeding
3. **Split** — On the detected heading level into numbered files:
   - `01-section-name.md`
   - `02-section-name.md`
   - etc.
   - Content before the first `##` becomes `00-preamble.md` (if any)
4. **Create index** — Generate `index.md` with:
   - Section manifest (number, title, description, link)
   - Line count per section
   - Original source file path for reference
5. **Ask about original** — Prompt user: keep, archive, or delete the source

## Output Format

```
destination/
├── index.md
├── 00-preamble.md (if applicable)
├── 01-problem-definition.md
├── 02-architecture-overview.md
├── 03-implementation-plan.md
└── ...
```

### index.md format

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
| ... | ... | ... | ... |
```

## Rules

- **Never force repo writes** — Default to agent artifacts. Only write to repo if user explicitly asks.
- **Check before overwriting** — If destination already contains numbered section files, warn user and ask before replacing.
- Section names are slugified from the `##` header text
- Preserve all content — no information loss during splitting
- Each section file stands alone (includes any needed context from headers above)
