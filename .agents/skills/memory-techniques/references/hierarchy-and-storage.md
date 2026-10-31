# Hierarchy and Storage — Capture and Recall

Every read or write goes through this file first. Storage layout, filename rules, frontmatter, and the Capture / Recall procedures live here.

---

## Resolve scope and `MEMORY_DIR`

Load [Scopes](scopes.md) before any operation. Project knowledge is managed directly in `<git-root>/.agents/memories/` (`MEMORY_BACKEND=project-files`). Prefer an available external-memory capability for short-lived or sensitive shared-global, harness-global, repository-private, repository-task and harness-session context; direct access to an explicitly selected external directory works without any integration (`MEMORY_BACKEND=resolved-files`). All global/shared notes use the same external store, never `~/.agents/memories/`. No MCP dependency, opaque authority or implicit store switching.

Resolve only the selected scope and required identities; print scope and selected absolute path. Missing integration does not block direct-file operation; missing identity or an inaccessible selected root blocks only affected persistence. Do not create a second store inside Git. Root paths are host-local; remote files need an explicitly shared filesystem for direct editing.

Project layout: `core.md`/`README.md` → `knowledge/<topic>.md`, approved `long-term/INDEX.md` → bucket/topic files. Private scopes may use `short-term/`, `plans/`, `consensus/`, `long-term/` and `archive/` as needed. Create only the needed subtree, not an empty scaffold.

A selected task root is the task directory itself: `TASK_DIR=MEMORY_DIR`, with `task.md`, `request.md`, `plan.md`, `roles/`, optional `phases/` and `consensus/`. In the templates below, historical `tasks/<task-id>/...` means this logical task subtree; do not append another task directory. Sessions contain `scratchpad.md` and optional role/consensus leaves. New notes include scope identity metadata per Scopes; existing records retain provenance and approval state during migration.

All authoritative entries remain Markdown with YAML frontmatter. Direct edits are supported; indexes are disposable and must be rebuilt/refreshed by the search capability. Text format permits human review, not permission to commit private/task/session notes. Never scan another scope merely because its directory is reachable. Discovery begins at the selected root's entry point and loads only relevant leaves; repair active pointers after moves, and report pre-existing missing sources separately.

---

## Short-term entries

Short-term sources/history are unbounded during a session and append-only. Session checkpoints are one kind of short-term entry; working notes and scratchpads are others. Board projections may be refreshed from recorded events; this exception never permits rewriting historical entries or checkpoints.

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
| deliberation_mode_router | project.md | project_decision | 0.88 | 2026-07-14 | Router rule for concurrent delegated vs simulated dialogue — read bucket when choosing deliberation mode |
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

- **Rename**: when an entry key, topic file, or index row is renamed, use the environment's reference-aware migration tool if one exists; otherwise search the selected scope's `long-term/` and indexes for the old name and update its active pointers in the same bounded change. External memory does not require a Git commit. Never rename in isolation or sweep unrelated scopes.
- **Delete**: after removing any entry, scan `long-term/INDEX.md` and all bucket/topic files for pointers to the deleted key. Remove or redirect stale rows before the next dream cycle.

---

## Agent Coordination & Execution Storage (Plans, Phases, Consensus Boards)

This storage area holds artifacts shared between agents and used internally to follow tasks, keeping `docs/` clean and dedicated to human-facing mental models.

### 1. Atomic Feature Plans (`MEMORY_DIR/plans/<feature-slug>/plan.md`)
The orchestrator plan that coordinates vertical slices for a feature:

```yaml
---
kind: plan
feature: user-authentication
status: in-progress            # in-progress | completed | abandoned
created: 2026-10-03T20:00:00+07:00
updated: 2026-10-03T20:15:00+07:00
---
```
**Required Content**:
- **Executive Summary & Scope Boundary**: In-scope vs out-of-scope files.
- **Scoped Target File Tree**: Annotated with `[CREATE]`, `[MODIFY]`, `[DELETE]`, `[CLEANUP]`.
- **Locked Interface Contracts**: Exact code signatures and DTO schemas.
- **Phase Execution Index**: Links to sequential phase files (`phases/01-<slice>.md`).

### 2. Vertical Slice Phase Specs (`MEMORY_DIR/plans/<feature-slug>/phases/<##>-<slice-name>.md`)
Self-contained, executable specifications for individual tracer-bullet slices:

```yaml
---
kind: phase
feature: user-authentication
phase: 1
slice: session-token-validation
status: in-progress            # in-progress | completed
updated: 2026-10-03T20:15:00+07:00
---
```
**Required Content**:
- **Slice Objective & File Delta**: Target files touched in this slice.
- **Locked Phase Contracts**: Concrete interfaces implemented.
- **Step-by-Step TDD Steps**: RED (test) → GREEN (code) → REFACTOR (polish).
- **Verification Command & Exit Criteria**: Exact command to prove slice completion.

### 3. Inter-Agent Consensus Boards (`MEMORY_DIR/consensus/<topic-slug>.md`)
Shared boards for multi-agent deliberation, delegated coordination, and design consensus:

```yaml
---
kind: consensus
topic: caching-strategy
status: resolved               # active | deliberating | resolved
updated: 2026-10-03T20:15:00+07:00
---
```
**Required Content**:
- **Deliberation Topic & Context**: The architectural or implementation question.
- **Positions & Critique**: Stances taken by different agents/personas.
- **Consensus / Locked Decisions**: Agreed invariants and trade-offs.
- **Action Items**: Next steps mapped to specific agent tasks or plans.

---

## Session request continuity

Before organizing or resuming session requests, resolve the **originating** harness-session root and bind `SESSION_DIR`. Use the actual identity and selected authorized external store; do not guess IDs or create a duplicate store. Create `SESSION_DIR/board.md` when request tracking is needed. One file initially suffices:

1. YAML: `kind: session-board`, `memory_scope: session`, actual `harness`, `session_id`, and designated `owner`.
2. `## Kanban`: mutable Mermaid projection of recorded lifecycle events.
3. `## Request and task/team links`: mutable index of request ID, owning board, task scope identities and resolved paths; include team ID/root/board when applicable.
4. `## Requests and history`: append-only source and event entries, kept at the end.

**Ingest before acting.** Assign each substantive request a stable session-local ID (`R001`, then `R002`); its full identity includes the originating harness/session pair. Never reuse or renumber IDs. Append the source/faithful quotation, constraints, affected task links, evidence/blocker and next action. Compare with earlier requests: preserve compatible requirements; append only source-supported corrections, cancellations or supersessions naming affected IDs. Carry changes into affected task requirements/plans through their existing authority gates. A shared constraint can link several tasks without becoming several requests.

**Route, do not relocate.** Each request has exactly one owning board, even when it affects several tasks or teams. Resolve linked task roots in their own scopes before access. Keep canonical task records there; links provide organizational containment without copying or moving them. Links never grant read/write permission. Start with the session board; add team-owned boards only for independent work streams, under `teams/<team-id>/` or existing authorized roots. Teams are not a new scope. Session history retains original sources and request-to-board links; team boards reference those sources. Team lifecycle events are authoritative for their requests. Any session-level display of team status is a read-only derived projection with source links, never a second independently edited progress record.

**Update and close.** Append lifecycle evidence before refreshing current status/column, owner or links. Use `Inbox`, `Active`, `Blocked`, `Review`, `Closed`. Machine completion goes to Review. A request closes only when all linked tasks have recorded closure by explicit acceptance, cancellation or supersession, with the request closure reason/source recorded; partial completion is insufficient. For requests without tasks, record the same explicit closure source directly. Cancellation/supersession never sets `accepted_by_user: true`. Keep closed cards and history discoverable; closure does not authorize archival or consolidation.

**One writer.** Designate one owner per board file/history. Contributors return receipts or use separately owned role files. Record a writer transfer and establish outgoing-writer quiescence before replacement writes; direct files do not lock or merge concurrent edits.

**Restore and reconcile.** Read the resolved session entry and relevant history, follow relevant links, then within a task read own role → task/roster → current approved plan. Reconcile all request IDs, including closed ones, with their owning boards before handoff; repair stale projections from recorded sources, never recollection. A session backlog does not authorize cross-task worker reuse. Missing identity/source, conflicting metadata, inaccessible required storage, duplicate ownership or failed capture blocks only affected continuation; retain the unsaved payload in the conversation and report the gap.

Minimal diagram (example labels, not live state); keep ordinary Markdown task/team links beneath it:

```mermaid
kanban
  inbox[Inbox]
    R002[Follow-up request]
  active[Active]
    R001[Original request]
  blocked[Blocked]
  review[Review]
  closed[Closed]
```

Column/card IDs must be unique within the diagram. Use short plain labels; preserve exact request text in history. No custom ticket-link configuration is needed. Syntax reference: [Mermaid Kanban](https://mermaid.ai/open-source/syntax/kanban.html). Validate with an available parser; otherwise report manual syntax review separately from rendering verification. Prototype audit after 1–2 uses: new unrelated/shared requests, stale projection after compaction, two teams, linked existing tasks, partial closure and failed capture. Source walkthroughs do not prove future runtime compliance.

## Capture mode

Use when the user explicitly asks to save a checkpoint, note, plan, or working state, or the active authorized workflow requires request ingestion or a checkpoint. No extra “save this” utterance is needed for session continuity.

1. Choose scope and resolve `MEMORY_BACKEND`/`MEMORY_DIR` using Scopes. For a task also bind `TASK_DIR=MEMORY_DIR`.
2. Select the smallest destination:
   - Session requests → resolve `SESSION_DIR` first and follow §Session request continuity; other working state → `scratchpad.md` or `short-term/<created-stamp>--<branch>--<topic>.md`.
   - Task request/plan/role checkpoint → `TASK_DIR/{task,request,plan}.md` or `TASK_DIR/roles/<role-id>.md`; follow [task-role records](task-role-records.md).
   - Task phases/consensus → `TASK_DIR/phases/` or `TASK_DIR/consensus/`. Do not duplicate role working state in flat short-term notes.
   - Standalone private feature plans → selected private scope `plans/<feature-slug>/plan.md` with optional phases.
   - New durable candidate → selected external short-term/role entry first. Promotion into project `knowledge/` or any long-term bucket needs requested Consolidate plus human approval. Existing knowledge moves preserve status/body and do not promote it.
3. Create only required directories, append the capture with normal frontmatter plus scope identity, and register a scope-local pointer when needed. Keep raw task/private pointers out of the project index.
4. Print scope, file paths, sections touched and whether consolidation is pending. Do not change accepted/consolidated markers as a side effect.

Never treat Capture as a Consolidate trigger. Consolidate has its own rules in `references/dream-cycle.md`.
Never dump atomic feature plans, slice phase files, or consensus boards into `docs/` — they must always land in `MEMORY_DIR`.


---

## Recall mode

Use when the user asks to restore, resume, load context, or lists prior notes.

1. Choose scope/identities and resolve the root. Missing selected scope means no prior memory there; never search a broader scope automatically.
2. For session work, resolve the originating session first, read `board.md` and relevant history, then follow relevant task/team links. Otherwise read the selected root's `core.md`, `README.md` or `long-term/INDEX.md` when present. Within a task, first read own bound role → task/roster → approved plan, before task sources. Session quorum recall uses the originating harness-session pair.
3. Search only that scope/subdirectory: optional scoped BM25 for text relevance; ordinary file/shell tools are sufficient for reading, names and literal patterns. For similar traces load [compaction and step recall](compaction-and-step-recall.md). Do not union external namespaces or load every file.
4. Verify matching Markdown sources and provenance, not just ranking. Report no matches explicitly. Load clearly relevant matches autonomously; ask only when unresolved user intent decides between distinct tasks/topics. Print minimal useful summaries (goal/status/decisions/next steps/blockers), not unrelated private context.
5. Files in the resolved scope are authoritative; external/vendor indexes or model recollection cannot override their facts or approval gates.

---

## Archiving short-term

- When a branch merges or work is done, set `status: done` and move the file to `short-term/archive/`, keeping the full `<created-stamp>--<branch-slug>--<topic-slug>.md` name unchanged (the stamp is what keeps archive entries sortable and collision-resistant).
- If a duplicate name still exists in archive (same branch+topic captured and archived twice at the same minute-precision stamp), suffix `--<n>` (e.g. `--2`) rather than a date — the stamp already encodes the date.
- Never delete short-term files; archive only. The archive is the audit trail for later dream cycles.

---

## Stop conditions

- `MEMORY_DIR` cannot be created or is unwritable → stop and report.
- Attempting to write atomic plans, vertical slice phase files, or consensus boards into `docs/` → stop and redirect to `MEMORY_DIR`.
- Attempting to store agent coordination in non-text or binary formats → stop; only plain Markdown with YAML frontmatter is allowed.
- Multiple active short-term files match a Recall query and the user did not disambiguate → stop and list them.
- Capture would overwrite a `status: done` file → stop; require the user to reopen or start a new topic.

---

## Deliverable

- [ ] `MEMORY_DIR` resolved and printed.
- [ ] Bucket chosen and justified (short-term, plans, consensus, or long-term).
- [ ] Agent-internal artifacts placed in `MEMORY_DIR`, leaving `docs/` strictly for human mental models.
- [ ] Stored in file-based, human-traceable, git-committable plain Markdown.
- [ ] File path + affected sections printed.
- [ ] Frontmatter valid; `updated` bumped; `consolidated: false` on writes to short-term.
