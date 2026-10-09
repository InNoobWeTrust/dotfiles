---
name: memory
description: "Use this skill to save, restore, or manage agent memory, execution plans, and consensus across sessions. Handles session checkpoints, context handoffs, atomic feature plans, vertical slice phase specs, and inter-agent consensus boards in memory dirs, leaving docs/ for human-facing documentation. Also runs dream-cycle consolidation and memory eviction. All files remain file-based, human-traceable, and git-committable plain text."
---

# Memory

Working memory, execution tracking, consensus boards, and consolidated long-term memory for agents. Session checkpoints, atomic feature plans, and inter-agent consensus boards are managed here — this skill is the single home for anything agents need to coordinate, remember, recall, consolidate, or track internally.

Four hard rules:

1. **Short-term is unbounded and append-only during a session.** Long-term is size-limited and only grows through a consolidation pass.
2. **Eviction and long-term writes are proposals, not autonomous actions.** Score and rank; the human approves.
3. **Agent coordination and execution documents belong in `MEMORY_DIR`, not `docs/`.** Atomic feature plans, vertical slice phase files (`phases/01-*.md`), inter-agent consensus boards, and scratchpads must be stored in memory directories, leaving `docs/` exclusively for feature-level human documentation.
4. **File-based, human-traceable, and Git-committable formats are mandatory.** Storing agent-focused documents in memory does not permit opaque, binary, or ephemeral stores. All files must remain plain text Markdown with structured YAML frontmatter so humans can inspect, trace, and commit them to Git when version control tracking is desired.

Storage, protocol, and templates live in `references/hierarchy-and-storage.md`. Load it before any read/write.

For recall shaping and context compaction tactics, load `references/compaction-and-step-recall.md` only when Recall or Consolidate needs it.

---

## When to load this skill

- Save, checkpoint, or restore session state
- Storing or updating atomic feature plans (`plans/<feature>/plan.md`) or vertical slice phase files (`phases/01-*.md`)
- Recording inter-agent consensus boards or swarm deliberation records (`consensus/<topic>.md`)
- User says "remember this", "note this", "save context", "resume", "what was I working on"
- User says "consolidate memory", "dream cycle", "prune memory", "forget X"

Do **not** load this skill for:

- Simple typo/format/config edits
- Writing human-facing documentation, architecture guides, or module READMEs (use `doc-craft`)
- Trivial one-shot fact captures that do not need consolidation, scoring, or an INDEX entry (a passing note in the current message is enough).

---

## Modes

Pick one mode per invocation. Modes are separate procedures; do not interleave.

| Mode | Purpose | Reference |
|---|---|---|
| **Capture** | Write a new entry: session checkpoint (`short-term/`), atomic feature plan (`plans/`), slice phase spec (`phases/`), consensus board (`consensus/`), or working note | `references/hierarchy-and-storage.md` §Capture |
| **Recall** | Find and load prior short-term, plans, consensus, or long-term entries | `references/hierarchy-and-storage.md` §Recall + `references/compaction-and-step-recall.md` when the query needs a similar prior trace |
| **Consolidate (Dream Cycle)** | Promote hot short-term entries to long-term, re-score long-term, propose evictions | `references/dream-cycle.md` + `references/compaction-and-step-recall.md` when context needs compaction |
| **Consolidate via Subagent** | Same as Consolidate, but delegated to a subagent so the main agent only captures the current work and lets a fresh context do the heavy consolidation pass | `references/dream-cycle.md` §Subagent consolidation + `references/compaction-and-step-recall.md` when needed |
| **Evict** | Standalone pruning of long-term when size limits are exceeded | `references/eviction-scoring.md` |

### Mode router

- User says "save", "checkpoint", "note this", "remember this", "save handoff", "save plan", "record consensus" → **Capture**.
- User says "resume", "restore", "load context", "what was I working on", "load plan" → **Recall**.
- User says "consolidate memory", "dream cycle", "run consolidation", "review my notes" → **Consolidate**; prefer **Consolidate via Subagent** when delegation is available; if unavailable, report to the user and ask before switching to in-agent Consolidate.
- User says "prune memory", "forget X", "evict Y" → **Evict**.

### Capture + Subagent consolidation (recommended path)

To keep the main agent focused when consolidation is requested:

1. Main agent performs **Capture**: write a short, self-contained short-term entry covering the current work (goal, decisions, files, next steps). This is the only memory work the main agent does first.
2. The main agent should invoke a subagent to run **Consolidate** on the newly captured note and any unconsolidated short-term entries.
3. The subagent does not need prior context — it reads the capture note, scans short-term/long-term, extracts candidates, scores, and proposes evictions.
4. Main agent surfaces the subagent's report and asks for approval before writing anything to long-term or archiving.

---

## Storage & Backend Resolution

Always prefer an **existing repo-local, file-based memory system** to avoid maintaining duplicate stores.

Resolve `MEMORY_BACKEND` and `MEMORY_DIR` before any read or write:

1. **Existing Repo-Local Memory (Highest Priority)**:
   - If `<git-root>/.serena/memories/` exists (or Serena MCP is available), select `MEMORY_BACKEND=serena` and `MEMORY_DIR=<git-root>/.serena/memories/`. Memories are stored as Markdown documents in the repository, with `mem:core` (`core.md`) as the root entry point.
   - If another documented repo-local, file-based memory directory exists (e.g. `.docs/memory/`), select `MEMORY_BACKEND=custom`.
2. **Default `.agents/memories/` (Fallback)**:
   - If in a git repository and no existing memory system is present: `MEMORY_BACKEND=default` and `MEMORY_DIR=<git-root>/.agents/memories/`. Created lazily on first Capture.
3. **Global Fallback**:
   - If outside a git repository and no repo-local system exists: `MEMORY_BACKEND=default` and `MEMORY_DIR=~/.agents/memories/`.


### Layout by Backend

**Serena Backend (`MEMORY_BACKEND=serena`)**:
```
<git-root>/.serena/memories/
├── core.md                      # Graph root entry point (references domain memories)
├── memory_maintenance.md        # Discovery model and style guidelines
├── plan_<feature-slug>.md       # Atomic feature implementation plans
├── phase_<feature>_<##>.md      # Vertical slice execution phase specs
├── consensus_<topic-slug>.md    # Inter-agent consensus boards
└── <topic>.md                   # Focused domain memories (e.g., project_governance.md)
```
*Operations adapt*: Capture/Recall read and write markdown files directly under `.serena/memories/` (or via Serena MCP tools `read_memory`/`write_memory` when active).

**Default Backend (`MEMORY_BACKEND=default`)**:
```
<MEMORY_DIR>/
├── README.md                    # directory protocol
├── short-term/                  # unbounded, append-only per session
│   └── <created-stamp>--<branch>--<topic>.md  # session checkpoints + working notes
├── plans/                       # atomic feature plans and execution phase specs
│   └── <feature-slug>/
│       ├── plan.md              # atomic plan index (scoped boundaries, locked contracts)
│       └── phases/              # sequential vertical slice phase files
│           ├── 01-<slice>.md
│           └── 02-<slice>.md
├── consensus/                   # inter-agent consensus boards & deliberation records
│   └── <topic-slug>.md
├── long-term/                   # size-limited, INDEX-gated
│   ├── INDEX.md                 # topic map + entry catalog
│   ├── project.md               # facts / decisions / constraints
│   ├── environment.md           # commands / paths / tooling
│   ├── corrections.md           # user corrections
│   └── topics/<topic>.md        # topic-scoped long-term entries
└── archive/                     # evicted long-term entries
```

Full contract, filename rules, backend adaptation, and templates: `references/hierarchy-and-storage.md`.

---

## Size limits (defaults, project-overridable)

Set in `<MEMORY_DIR>/long-term/INDEX.md` frontmatter. Defaults:

| Bucket | Soft limit | Hard limit | When reached |
|---|---|---|---|
| `long-term/INDEX.md` entries | 40 | 60 | Report to user; consolidate/evict only on explicit request |
| Any single `topics/<topic>.md` | 8 KB | 16 KB | Report to user; split/evict only on explicit request |
| Total `long-term/` size | 128 KB | 256 KB | Report to user; eviction pass only on explicit request |
| `short-term/` entries older than merged branch | — | — | Report to user; archive only on explicit request |

Size limits are informational. They may be surfaced as part of an already-requested Consolidate or Evict operation, but crossing a limit alone never triggers any automatic action.

---

## Progressive disclosure — the meta pattern

Working memory (leaf) ↔ long-term memory (index) is one instance of the same shape used across the repo:

| Layer | Leaf (execution & memory) | Index / entry point (human & router) |
|---|---|---|
| Agent execution | `plans/<feature>/phases/*.md`, `consensus/*.md` | `plans/<feature>/plan.md` |
| Agent memory | `short-term/<created-stamp>--<branch>--<topic>.md` | `long-term/INDEX.md` |
| Human documentation | `docs/<section>/details/*.typ` (or required `.md`) | Typst index/entry + PDF; required repository README/index stays Markdown per [format policy](../../rules/document-formats.md) |
| Code | Individual functions, private helpers | Module `README.md` & `index.ts` |
| Rules | `rules/<name>.md` | `rules/INDEX` |
| Skills | `skills/<name>/references/*.md` | `SKILL.md` |

**Rule**: the index carries only the smallest key facts + pointers. The leaf carries detail and is loaded on demand. This is exactly the routing pattern the project already uses for skills (`skills/INDEX` → `SKILL.md` → `references/*`).

Apply it to code: `references/pattern-code.md`.

---

## Stop conditions

- **Attempting to write atomic plans or consensus boards into `docs/`**: Stop immediately. Route to `MEMORY_DIR/plans/` or `MEMORY_DIR/consensus/`.
- **Storing agent-focused documents in non-text or opaque formats**: Stop. All artifacts must be file-based plain Markdown with YAML frontmatter.
- **No `MEMORY_DIR` resolvable and repo not git**: fall back to `~/.agents/memories/`. If the directory does not exist, **create it** (this is the bootstrap case, not an error). If the path exists but is unwritable, stop and report.

- **Eviction proposal has no scored ranking**: do not evict. Return to `references/eviction-scoring.md` and score first.
- **Consolidation would rewrite `corrections.md` without an explicit correction request**: stop. Corrections are user-owned; only add, never silently rewrite.
- **Long-term hard limit hit**: do not delete or archive automatically. Report the overrun to the user; consolidation and eviction require explicit user request regardless of context or availability.
- **Subagent consolidation requested but subagent unavailable**: report the limitation to the user and ask whether to proceed with in-agent consolidation or defer. Do not automatically switch to in-agent Consolidate.
- **Structure Mode would move or rename source files that are imported elsewhere**: stop and produce an impact list first; do not execute the move until the human confirms.

---

## Deliverable

For every invocation:

- [ ] Mode named up front (Capture / Recall / Consolidate / Consolidate via Subagent / Evict / Structure)
- [ ] `MEMORY_DIR` resolved and printed
- [ ] Files written listed with paths (stored in `MEMORY_DIR`, never `docs/`)
- [ ] Stored in file-based, human-traceable, git-committable plain Markdown with YAML frontmatter
- [ ] If compaction was used: persist the compact state to short-term only if the user also explicitly requested Capture; otherwise include it in the current response only — do not write to memory automatically
- [ ] If similar-trace recall was used: searched buckets + top matches (or `NONE FOUND`) reported
- [ ] For Consolidate/Evict: scored ranking + explicit human-approval prompt before any archive/delete
- [ ] For Consolidate via Subagent: subagent prompt scope and output contract documented
- [ ] `long-term/INDEX.md` updated last when long-term memory changes (single source of truth for what exists)

---

## Anti-patterns

| Temptation | Why wrong | Correct path |
|---|---|---|
| Dump atomic task plans, phase files, or consensus boards into `docs/` | Pollutes human documentation with transient or task-level agent execution trivia | Store atomic plans and consensus boards in `MEMORY_DIR` (`plans/`, `consensus/`) |
| Store agent memory in opaque, binary, or untracked formats | Prevents human developers from auditing, reading, or committing to git | Store in file-based plain Markdown with clean YAML frontmatter |
| Auto-evict old long-term entries during Consolidate to "stay tidy" | User specified human-approved eviction. Silent deletion breaks trust and audit trail. | Score, rank, propose. Human approves. Archive first, delete only on second pass. |
| Skip short-term and write directly to long-term for a "clean" workflow | Bypasses working memory, so context under construction has no home; also skips the scoring gate. | Write to short-term first. Long-term only through Consolidate. |
| Treat every session as a Consolidate trigger | Runs the dream cycle constantly, evictions become noise. | Consolidate only on explicit user request. |
| Rewrite `corrections.md` during Consolidate because an entry "seems outdated" | Corrections encode the user's authority. Silent edits erase that. | Only append. Only edit on an explicit correction request from the user. |
| Apply Structure Mode aggressively across a whole repo in one pass | Wide file moves collide with in-flight branches. | Scope Structure Mode to one directory or module per invocation. |
| Load every reference file at once "to be safe" | Defeats the progressive-disclosure design this skill teaches. | Load `hierarchy-and-storage.md` first. Load others only when the selected mode requires them. |
| Run Consolidate on every Capture or session event | Conflates two separate operations; causes implicit dream-cycle noise. | Consolidate only on explicit user request; Capture does not trigger Consolidate. |
| Ask the subagent to read the entire conversation transcript | The subagent only needs the capture note and the memory directories; transcripts are noise. | Pass the capture note path and `MEMORY_DIR` to the subagent. |

---

## References

- `references/hierarchy-and-storage.md` — storage layout, frontmatter, plans & consensus storage, capture/recall procedure, filename rules
- `references/dream-cycle.md` — consolidation workflow and scoring inputs
- `references/eviction-scoring.md` — scoring function, ranking, archive-then-delete protocol
- `references/progressive-disclosure-pattern.md` — the leaf/index abstraction and the four properties an index must have
- `references/pattern-code.md` — applying the pattern to a code module (public surface vs internals)
