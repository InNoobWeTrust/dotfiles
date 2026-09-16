# Hierarchy and Storage — Capture and Recall

Every read or write goes through this file first. Storage layout, filename rules, frontmatter, and the Capture / Recall procedures live here.

---

## Resolve Memory Backend & `MEMORY_DIR`

Run once per invocation. Print the resolved backend and path before any file operation. Always prefer an **existing repo-local, file-based memory system** (such as Serena) over creating duplicate infrastructure.

```
if git rev-parse --show-toplevel succeeds:
    if <git-root>/.serena/memories exists or serena MCP is available:
        MEMORY_BACKEND = serena
        MEMORY_DIR = <git-root>/.serena/memories
    elif <other-repo-local-file-memory-exists>:
        MEMORY_BACKEND = custom
        MEMORY_DIR = <custom-path>
    else:
        MEMORY_BACKEND = default
        MEMORY_DIR = <git-root>/.agents/memory
else:
    MEMORY_BACKEND = default
    MEMORY_DIR = ~/.agents/memory
```

### Backend Selection & Behavior

#### 1. Serena Backend (`MEMORY_BACKEND = serena`)
When the repository already maintains a Serena file-based memory system under `<git-root>/.serena/memories/`:
- **Single Source of Truth**: Do not create or scaffold `.agents/memory/`. Use `.serena/memories/` exclusively.
- **Discovery Root**: `core.md` (`mem:core`) serves as the graph root, pointing to domain memories via `` `mem:<name>` `` references.
- **Storage Layout**: Flat markdown files inside `<git-root>/.serena/memories/<topic>.md`.
- **Capture**: Write or update topic-specific Markdown files directly in `<git-root>/.serena/memories/<topic>.md` (or call Serena MCP `write_memory`). When adding a new domain memory, register its reference in `core.md`.
- **Recall**: Inspect `core.md` to discover domain pointers, then load the relevant `<topic>.md` files (or call Serena MCP `read_memory`).
- **Conventions**: Follow `memory_maintenance.md` style — dense invariant bullets, durable non-obvious conventions, zero conversational filler.

#### 2. Default Backend (`MEMORY_BACKEND = default`)
Used as fallback when no established repo-local memory system exists.
Maintains the two-tier layout:
```
<MEMORY_DIR>/
├── README.md
├── short-term/
│   └── archive/                # done / merged session entries
├── long-term/
│   ├── INDEX.md
│   ├── project.md
│   ├── environment.md
│   ├── corrections.md
│   └── topics/                 # created on first topic write, not pre-scaffolded
└── archive/                    # evicted long-term entries only (not session archive)
```

Never scan a `MEMORY_DIR` outside the repo when working in a repo unless the user asks for global memory explicitly.
Repo-local `.agents/memory/` is runtime state first: keep it gitignored by default unless the repository explicitly decides to version selected scaffolding or long-term memory files.

---

## Short-term entries

Short-term memory is unbounded during a session and append-only. Session checkpoints are one kind of short-term entry; working notes and scratchpads are others.

### Filename

```
<created-stamp>--<branch-slug>--<topic-slug>.md
```

- `created-stamp`: UTC timestamp at minute precision, compact form `YYYYMMDDTHHmmZ` (e.g. `20260714T0912Z`). No colons, no `+`/`-` offset — those break on some filesystems and in URLs. **Set once at file creation; never changes**, even when the entry is updated across many sessions. This is what makes the filename itself audit-usable without opening the file.
- `branch-slug`: current git branch, `/` replaced with `-`. If not in git, use `nogit`.
- `topic-slug`: short kebab-case descriptor of the workstream.
- Double dash `--` separates all three segments.

Lookup and updates key off `branch-slug` + `topic-slug` only — the timestamp prefix is identity metadata, not part of the lookup key. See §Capture mode and §Recall mode for the glob patterns.

### Frontmatter

```yaml
---
kind: short-term
branch: feature/auth
topic: login flow
status: in-progress            # in-progress | paused | blocked | done
created: 2026-07-14T09:12:00+07:00
updated: 2026-07-14T09:12:00+07:00
agent: <optional identifier, e.g. author or execution environment>
consolidated: false
consolidated_at: null
tags: [session, decision, blocker]
---
```

`created` is set once at file creation and never rewritten — it must always match the filename's `created-stamp` (same instant, filename in UTC compact form, frontmatter in ISO 8601 with offset). `updated` continues to bump on every touch. If the two ever disagree (e.g. a hand-edited file), the filename stamp wins for audit/sort purposes and the frontmatter `created` should be corrected to match on next write — see §Frontmatter resilience.

### Frontmatter resilience

Frontmatter drifts over time — entries get created by different tools, hand-edited, or predate a field being added. Any process that scans `short-term/` (Consolidate gather, Recall listing, or any explicit user-requested memory operation) must fail open toward inclusion, never fail closed toward silent skipping:

| Missing / malformed field | Treat as | Why |
|---|---|---|
| `consolidated` absent | `consolidated: false` | Unreviewed entries must surface, not disappear from scans. |
| `consolidated_at` absent while `consolidated: true` | Leave `null`; not an error | Backfill on next touch; doesn't block anything. |
| `updated` absent or unparseable | Oldest possible timestamp | Forces the entry to sort as stale so it gets attention, not ignored. |
| `status` absent | `in-progress` | Never assume `done` by default — that would wrongly exclude it from Recall/archival logic. |
| `created` absent | Filename's `created-stamp` if present; else same fallback as `updated` (oldest) | Filename is the more durable source once it exists; degrade gracefully for pre-stamp files. |
| Filename has no `created-stamp` prefix (pre-existing files, e.g. legacy `<branch>--<topic>.md`) | Not an error; treat as an old-format name | Do not force a rename during a read. Rename only on next explicit write to that file (§Self-heal). |
| Unknown extra fields | Ignore | Forward-compatible; don't error on fields a newer template adds. |

Rules:

1. **Self-heal on next write.** Whenever Capture, Recall, or Consolidate touches a file that used a fallback, write the missing/corrected field(s) back explicitly. Do not require a separate migration pass.
2. **Report, don't block.** When a fallback is used, add one line to the mode's output (e.g., "note: `<file>` had no `consolidated` field, treated as false") so the human sees the drift, but continue the workflow.
3. **This is not the schema-version gate.** A missing/malformed *individual field* is minor drift — heal and continue. A `schema_version` older than current (see §Schema versioning) is a structural mismatch — stop and report instead of guessing field meanings.
4. **Rename legacy filenames on next write, not on read.** A file without a `created-stamp` prefix gets renamed to `<created-stamp>--<branch-slug>--<topic-slug>.md` the next time Capture or Consolidate writes to it (`git mv` if the file is tracked, plain rename otherwise). Use the earliest known timestamp for the stamp: existing frontmatter `created`, else frontmatter `updated`, else the file's mtime. Print the rename (old path → new path) in that mode's output. Do not batch-rename the whole `short-term/` directory as a side effect of an unrelated Capture/Recall/Consolidate call — only the file actually being written.

### Body sections

The short-term entry must be self-contained enough to resume without the original transcript. Required sections:

1. **Goal** — one paragraph.
2. **Current Status** — checklist of done / in-progress / remaining.
3. **Key Decisions** — decisions made this session with rationale. Mark `(finalised)` or `(fluid)` — only finalised ones consolidate.
4. **Blockers** — concrete blockers.
5. **Next Steps** — actionable, numbered.
6. **Open Questions** — need user input.
7. **Files & Git Context** — modified files, key paths, useful commands, tool discoveries.
8. **Quality & Compliance** — only when the project handles regulated / sensitive data. Trigger: `AGENTS.md` or `docs/engineering/quality-gates.md` lists regulated data, OR this session performed a data mutation on business entities. When applicable, record: quality gates passed/failed, security checks run, exceptions granted (with rationale), data mutations requiring audit logs, and unaddressed compliance gaps.

Reuse this template for both "checkpoint" and "working note" modes; a working note simply has fewer filled sections.

---

## Long-term entries

Long-term memory is size-limited and only grows through the Consolidate mode. Each entry has a stable **key** and a **type** so entries stay portable across agents and machines — the file layout is the source of truth, not any environment-specific store.

### Bucket files

Each bucket file is a flat list of records. Order: `updated` descending.

**`long-term/project.md`** — facts, decisions, constraints, open questions about the project.

```markdown
# Project Memory

## Facts
- <key> :: <one-line fact>

## Decisions
- <key> :: <one-line decision with rationale>

## Constraints
- <key> :: <one-line constraint>

## Open Questions
- <key> :: <one-line question>
```

**`long-term/environment.md`** — commands, paths, tooling.

```markdown
# Environment Memory

## Commands
- <key> :: <command>

## Paths
- <key> :: <path>

## Tooling
- <key> :: <note>
```

**`long-term/corrections.md`** — explicit user corrections. Append-only. Silent rewrites forbidden.

```markdown
# Corrective Memory

## Corrections
- <key> :: <what was wrong, what is right>
```

**`long-term/topics/<topic>.md`** — topic-scoped detail. One topic per file. Split when a single topic file exceeds 8 KB.

### Entry format for INDEX

`long-term/INDEX.md` is regenerated from bucket files. Every entry gets one row:

```markdown
| Key | Bucket | Type | Score | Updated | Summary |
|---|---|---|---|---|---|
| swarm_intelligence_mode_router | project.md | project_decision | 0.88 | 2026-07-14 | Router rule for Single-Node vs Full Swarm — read bucket when choosing between orchestration modes |
```

**Summary field contract**: one sentence that (a) identifies the covered content or decision and (b) states the condition that warrants descending to the bucket or topic detail (pattern: `<what it covers> — read <bucket> when <condition>`). A row whose Summary only names the entry is not actionable; an agent cannot decide whether to descend without opening the file.

INDEX.md also carries the size-limit frontmatter (defaults live in the main `SKILL.md` §Size limits — override here per project):

```yaml
---
schema_version: 1
limits:
  index_entries_soft: 40
  index_entries_hard: 60
  topic_kb_soft: 8
  topic_kb_hard: 16
  total_kb_soft: 128
  total_kb_hard: 256
last_dream_cycle: 2026-07-14T09:12:00+07:00
---
```

---

## Schema versioning

`long-term/INDEX.md` carries a `schema_version` field in its frontmatter. Bump it when changing:

- Frontmatter fields on short-term or long-term entries
- INDEX row columns
- Bucket file section structure

When reading a `MEMORY_DIR` whose `schema_version` is older than the current skill expects, stop and report the mismatch. Do not silently read or write entries in an outdated format. Migration scripts live outside this skill — the skill's job is to detect the drift.

Current version: **1** (initial format).

---

## Content quality

Applies at every Capture and every Consolidate extraction. Non-negotiable gates, not suggestions.

### Style

Dense agent notes. Terse bullets. Invariants and constraints first. Omit obvious context and rationale unless their absence would cause a likely mistake. Guidance must be durable and generalizable — no task-local color, no prose narrative.

### Add / update threshold

Add or update a long-term entry only when the candidate is **stable and non-obvious** and its absence would force complex rediscovery later. Exclude:

- Quick-read facts (look them up each time; memorizing them adds noise)
- Generic language, framework, or tool knowledge
- One-off task notes and session-local observations
- Volatile line-level details (file paths, line numbers, transient config values)
- Behavior likely to change before the next recall

When in doubt, leave it in short-term. Consolidate promotes only what clears this bar.

### Maintenance — rename and stale-pointer hygiene

- **Rename**: when an entry key, topic file, or index row is renamed, use the environment's reference-aware migration tool if one exists; otherwise search `long-term/` and every index for the old name and update all pointers in the same commit. Never rename in isolation.
- **Delete**: after removing any entry, scan `long-term/INDEX.md` and all bucket/topic files for pointers to the deleted key. Remove or redirect stale rows before the next dream cycle.

---

## Capture mode

Use when the user explicitly asks to save a checkpoint, note, or working state.

1. Resolve `MEMORY_BACKEND` and `MEMORY_DIR`.
2. **When using Serena (`MEMORY_BACKEND = serena`)**:
   - For durable knowledge, decisions, or conventions: write or update `<MEMORY_DIR>/<topic>.md` (or call Serena MCP `write_memory`). Ensure `core.md` has a reference to the topic.
   - For temporary scratchpad/in-progress notes: write to `<appDataDir>/brain/<conversation-id>/scratch/` or maintain in conversation context.
   - Print: backend (`serena`), file path, memory name, whether `core.md` was updated.
3. **When using Default (`MEMORY_BACKEND = default`)**:
   - **If `MEMORY_DIR` or `short-term/` does not exist, create the full directory structure** (`short-term/`, `short-term/archive/`, `long-term/`, `long-term/topics/`, `archive/`) now.
   - Decide bucket: session state → `short-term/<created-stamp>--<branch>--<topic>.md`; durable fact → write to `short-term/` first (scored and promoted on Consolidate).
   - Look up existing entry by glob `short-term/*--<branch-slug>--<topic-slug>.md` and update or create with timestamp.
   - Print: backend (`default`), file path, sections touched, whether Consolidate is pending.

Never treat Capture as a Consolidate trigger. Consolidate has its own rules in `references/dream-cycle.md`.

---

## Recall mode

Use when the user asks to restore, resume, load context, or lists prior notes.

1. Resolve `MEMORY_BACKEND` and `MEMORY_DIR`. If `MEMORY_DIR` does not exist, report **"No memory directory found — this workspace has no prior memory. Use Capture mode to start recording."** and return.
2. **When using Serena (`MEMORY_BACKEND = serena`)**:
   - Read `core.md` (`mem:core`) to discover available domain memory references.
   - Load the relevant `<topic>.md` file (or call Serena MCP `read_memory`).
   - Print the matching memory content or present summaries if multiple topics are relevant.
3. **When using Default (`MEMORY_BACKEND = default`)**:
   - Choose search scope: explicit path, current branch (`short-term/*--<branch-slug>--*.md`), recent work summary, topic query via `long-term/INDEX.md`, or similar-trace query via `references/compaction-and-step-recall.md`.
   - If `short-term/` and `long-term/` both exist but contain no matching entries, report **"Memory directory exists but no entries match. Use Capture mode to record new knowledge."**
   - If multiple active short-term entries match, present summaries and ask which to load. Do not silently pick one.
   - Parse the selected file. Print Goal, Current Status, Key Decisions, Next Steps, Blockers. Long-term reads print the matching rows plus their bucket entries.

4. **Authority**: When using a file-based repo-local system (like Serena) or default `.agents/memory/`, the repo-local files are the source of truth. Do not delegate recall to external ungrounded environment stores.

---

## Archiving short-term

- When a branch merges or work is done, set `status: done` and move the file to `short-term/archive/`, keeping the full `<created-stamp>--<branch-slug>--<topic-slug>.md` name unchanged (the stamp is what keeps archive entries sortable and collision-resistant).
- If a duplicate name still exists in archive (same branch+topic captured and archived twice at the same minute-precision stamp), suffix `--<n>` (e.g. `--2`) rather than a date — the stamp already encodes the date.
- Never delete short-term files; archive only. The archive is the audit trail for later dream cycles.

---

## Stop conditions

- `MEMORY_DIR` cannot be created or is unwritable → stop and report.
- Multiple active short-term files match a Recall query and the user did not disambiguate → stop and list them.
- Capture would overwrite a `status: done` file → stop; require the user to reopen or start a new topic.

---

## Deliverable

- [ ] `MEMORY_DIR` resolved and printed.
- [ ] Bucket chosen and justified.
- [ ] File path + affected sections printed.
- [ ] Frontmatter valid; `updated` bumped; `consolidated: false` on writes to short-term.
