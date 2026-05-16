---
description: >
  Scan a directory, read each file to understand its purpose, and generate an
  organized index with links and descriptions. Use when a documentation folder
  needs a table of contents, when you want a quick LLM-scannable overview of
  available docs, or when a folder has grown and needs organization.
---

## Inputs

- **Target directory**: Path to the folder to index
- **Output location** (optional): Where to write index. Options:
  - Agent artifacts directory (default — no repo writes)
  - Same directory as `index.md` (only if user explicitly requests repo storage)
  - Custom path
- **Depth** (optional): How deep to scan (default: 1 level, recursive optional)

## Process

1. **Scan** — List all non-hidden files in the target directory
2. **Read** — Open each file and understand its actual purpose (not just filename)
3. **Group** — Organize files by:
   - Type (specs, configs, docs, code)
   - Purpose (if groupable)
   - Subdirectory (for recursive scans)
4. **Describe** — Write a concise description for each file (3–10 words)
5. **Generate** — Produce the index

## Output Format

```markdown
# Index: [Directory Name]

Generated: [date]
Files: [N] | Directories: [M]

## [Group Name]

| File | Description |
|---|---|
| [filename.md](./filename.md) | Brief purpose description |
| [other.md](./other.md) | Brief purpose description |

## [Another Group]

| File | Description |
|---|---|
| ... | ... |
```

## Rules

- **Descriptions must reflect actual content** — read the file, don't guess from filename
- **Empty directories** — If no indexable files found, report "No files to index" and exit
- Skip binary files, hidden files, and `node_modules`/`.git` type directories
- If an `index.md` already exists, show a diff of changes and ask before overwriting
- Group intelligently — don't create a group for a single file
- Relative links only — index should work regardless of where the repo lives

---

## Invocation Arguments

Additional command input, if any, appears below exactly as provided:

```text
$ARGUMENTS
```

Use the block above as raw additional user input. Preserve whitespace, blank lines, and quoting exactly. If the block is empty, rely on the conversation context instead.

Follow the instructions above to work on the user's indexing request right below.

---
