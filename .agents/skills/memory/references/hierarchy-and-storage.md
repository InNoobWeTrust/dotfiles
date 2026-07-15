# Hierarchy and Storage — Capture and Recall

Every read or write goes through this file first. Storage layout, filename rules, frontmatter, and the Capture / Recall procedures live here.

---

## Resolve `MEMORY_DIR`

Run once per invocation. Print the resolved path before any file operation.

```
if git rev-parse --show-toplevel succeeds:
    MEMORY_DIR = <git-root>/.agents/memory
else:
    MEMORY_DIR = ~/.agents/memory
```

Create missing directories on first use:

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
<branch-slug>--<topic-slug>.md
```

- `branch-slug`: current git branch, `/` replaced with `-`. If not in git, use `nogit`.
- `topic-slug`: short kebab-case descriptor of the workstream.
- Double dash `--` separates them.

### Frontmatter

```yaml
---
kind: short-term
branch: feature/auth
topic: login flow
status: in-progress            # in-progress | paused | blocked | done
updated: 2026-07-14T09:12:00+07:00
agent: <optional identifier, e.g. author or execution environment>
consolidated: false
consolidated_at: null
tags: [session, decision, blocker]
---
```

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
| swarm_intelligence_mode_router | project.md | project_decision | 0.88 | 2026-07-14 | Router rule for Single-Node vs Full Swarm |
```

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

## Capture mode

Use when the user asks to save a checkpoint, note, or working state, or when a natural breakpoint is reached and the user opted into auto-save.

1. Resolve `MEMORY_DIR`.
2. Decide bucket:
   - Session state / active work → `short-term/<branch>--<topic>.md`.
   - One-shot durable fact / correction / command → still write to `short-term/` first (a dedicated `capture-notes.md` short-term file is fine). It will be scored and promoted on the next Consolidate. Never write to `long-term/` directly.
3. If `short-term/<branch>--<topic>.md` exists, update it (bump `updated`, set `consolidated: false`). Otherwise create it from the template.
4. Inline crucial state from plans, review findings, or scratchpads so the entry is self-contained.
5. Print: mode, file path, sections touched, whether Consolidate is now pending.

**Auto-save triggers** (only if the user has enabled autonomy for this session):

- Direct request ("save handoff", "checkpoint", "note this").
- Major milestone (bounded-iteration phase completes, feature slice merges).
- Before any destructive command.
- Context length near budget.

Never treat Capture as a Consolidate trigger. Consolidate has its own rules in `references/dream-cycle.md`.

---

## Recall mode

Use when the user asks to restore, resume, load context, or lists prior notes.

1. Resolve `MEMORY_DIR`.
2. Choose search scope:
   - Explicit path → load that file.
   - Current branch → glob `short-term/<branch-slug>--*.md`, exclude `status: done`.
   - "What was I working on" / generic resume → list non-archived short-term entries sorted by `updated` desc, plus `long-term/INDEX.md` topic summary.
   - Topic query → grep `long-term/INDEX.md` first, then follow to the bucket or topic file.
3. If multiple active short-term entries match, present summaries and ask which to load. Do not silently pick one.
4. Parse the selected file. Print Goal, Current Status, Key Decisions, Next Steps, Blockers. Long-term reads print the matching rows plus their bucket entries.

This skill is the source of truth. Do not delegate recall to external environment-managed memory stores or expect them to hold repo memory. If the current environment happens to expose its own memory, treat it as unrelated context — its entries are not authoritative here.

---

## Archiving short-term

- When a branch merges or work is done, set `status: done` and move the file to `short-term/archive/`.
- If a duplicate name exists in archive, suffix `--<YYYY-MM-DD>`.
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
