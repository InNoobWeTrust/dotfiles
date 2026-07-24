---
name: memory
description: "Use this skill to save, restore, or manage agent memory across sessions. Handles session checkpoints, context handoffs, progress saves, and session resumption. Also runs dream-cycle consolidation (promoting short-term notes to curated long-term memory) and memory eviction. Use when the user says \"save this,\" \"checkpoint,\" \"remember,\" \"resume,\" \"what was I working on,\" \"consolidate memory,\" or \"forget.\" Also applies progressive-disclosure structuring to docs and code modules."
---

# Memory

Working memory and consolidated long-term memory for agents, plus the same progressive-disclosure pattern applied to docs and code. Session checkpoints are one kind of short-term memory entry — this skill is the single home for anything an agent needs to remember, recall, consolidate, or forget.

Two hard rules:

1. **Short-term is unbounded and append-only during a session.** Long-term is size-limited and only grows through a consolidation pass.
2. **Eviction and long-term writes are proposals, not autonomous actions.** Score and rank; the human approves.

Storage, protocol, and templates live in `references/hierarchy-and-storage.md`. Load it before any read/write.

For recall shaping and context compaction tactics, load `references/compaction-and-step-recall.md` only when Recall or Consolidate needs it.

---

## When to load this skill

- Save, checkpoint, or restore session state
- User says "remember this", "note this", "save context", "resume", "what was I working on"
- User says "consolidate memory", "dream cycle", "prune memory", "forget X"
- User asks to apply progressive disclosure to a docs directory or code module ("shard doc", "split module", "structure this")
- Before a git commit if unsummarized short-term entries exist (auto-trigger — see `references/dream-cycle.md`)

Do **not** load this skill for:

- Simple typo/format/config edits
- Trivial one-shot fact captures that do not need consolidation, scoring, or an INDEX entry (a passing note in the current message is enough).

---

## Modes

Pick one mode per invocation. Modes are separate procedures; do not interleave.

| Mode | Purpose | Reference |
|---|---|---|
| **Capture** | Write a new short-term entry (session checkpoint, working note, scratchpad, decision-in-progress) | `references/hierarchy-and-storage.md` §Capture |
| **Recall** | Find and load prior short-term or long-term entries | `references/hierarchy-and-storage.md` §Recall + `references/compaction-and-step-recall.md` when the query needs a similar prior trace |
| **Consolidate (Dream Cycle)** | Promote hot short-term entries to long-term, re-score long-term, propose evictions | `references/dream-cycle.md` + `references/compaction-and-step-recall.md` when context needs compaction |
| **Consolidate via Subagent** | Same as Consolidate, but delegated to a subagent so the main agent only captures the current work and lets a fresh context do the heavy consolidation pass | `references/dream-cycle.md` §Subagent consolidation + `references/compaction-and-step-recall.md` when needed |
| **Evict** | Standalone pruning of long-term when size limits are exceeded | `references/eviction-scoring.md` |
| **Structure** | Apply the same hierarchy pattern to docs (`references/pattern-docs.md`) or code (`references/pattern-code.md`) | `references/progressive-disclosure-pattern.md` |

### Mode router

- One entry to write or read now → **Capture** or **Recall**.
- End-of-work signal (commit, "save memory", session close) → **Consolidate**; default to **Consolidate via Subagent** and fall back to in-agent Consolidate only when delegation is unavailable.
- Long-term INDEX exceeds size budget → **Evict**.
- User asks to organize a docs tree or a source module using the same pattern → **Structure**.

### Capture + Subagent consolidation (default path)

To avoid turning every commit into a heavy main-agent consolidation:

1. Main agent performs **Capture**: write a short, self-contained short-term entry covering the current work (goal, decisions, files, next steps). This is the only memory work the main agent must do.
2. The main agent or the pre-commit checkpoint **must** invoke a subagent to run **Consolidate** on the newly captured note and any unconsolidated short-term entries.
3. The subagent does not need prior context — it reads the capture note, scans short-term/long-term, extracts candidates, scores, and proposes evictions.
4. Main agent surfaces the subagent's report and asks for approval before writing anything to long-term or archiving.

---

## Storage (repo-local first, global fallback)

Resolve `MEMORY_DIR` before any read or write:

1. `git rev-parse --show-toplevel` succeeds → `MEMORY_DIR=<git-root>/.agents/memory/`
2. Otherwise → `MEMORY_DIR=~/.agents/memory/`

`MEMORY_DIR` is created lazily on the first Capture mode call or pre-commit memory checkpoint. A missing directory on Recall means no prior memory exists yet.

Layout:

```
<MEMORY_DIR>/
├── README.md                    # directory protocol
├── short-term/                  # unbounded, append-only per session
│   └── <created-stamp>--<branch>--<topic>.md  # session checkpoints + working notes
├── long-term/                   # size-limited, INDEX-gated
│   ├── INDEX.md                 # topic map + entry catalog (the "consolidated" view)
│   ├── project.md               # facts / decisions / constraints
│   ├── environment.md           # commands / paths / tooling
│   ├── corrections.md           # user corrections (never auto-evict without confirmation)
│   └── topics/<topic>.md        # topic-scoped long-term entries
└── archive/                     # evicted long-term entries (kept for audit trail)
```

Full contract, filename rules, frontmatter, and templates: `references/hierarchy-and-storage.md`.

---

## Size limits (defaults, project-overridable)

Set in `<MEMORY_DIR>/long-term/INDEX.md` frontmatter. Defaults:

| Bucket | Soft limit | Hard limit | Action when reached |
|---|---|---|---|
| `long-term/INDEX.md` entries | 40 | 60 | Consolidate then propose eviction |
| Any single `topics/<topic>.md` | 8 KB | 16 KB | Split topic or evict weakest entries |
| Total `long-term/` size | 128 KB | 256 KB | Full eviction pass |
| `short-term/` entries older than merged branch | — | — | Auto-propose archive |

Size limits are the constraint that forces curation — matching the "human dream cycle" you specified.

---

## Progressive disclosure — the meta pattern

Working memory (leaf) ↔ long-term memory (index) is one instance of the same shape used across the repo:

| Layer | Leaf (short-term) | Index / entry point (long-term) |
|---|---|---|
| Agent memory | `short-term/<created-stamp>--<branch>--<topic>.md` | `long-term/INDEX.md` |
| Docs | `docs/**/detail-*.md` | `docs/README.md` + section indexes |
| Code | Individual functions, files | Module `index.ts` / `__init__.py` / `mod.rs` |
| Rules | `rules/<name>.md` | `rules/INDEX` |
| Skills | `skills/<name>/references/*.md` | `SKILL.md` |

**Rule**: the index carries only the smallest key facts + pointers. The leaf carries detail and is loaded on demand. This is exactly the routing pattern the project already uses for skills (`skills/INDEX.md` → `SKILL.md` → `references/*`).

Apply it to docs: `references/pattern-docs.md`. Apply it to code: `references/pattern-code.md`.

---

## Stop conditions

- **No `MEMORY_DIR` resolvable and repo not git**: fall back to `~/.agents/memory/`. If the directory does not exist, **create it** (this is the bootstrap case, not an error). If the path exists but is unwritable, stop and report.
- **Eviction proposal has no scored ranking**: do not evict. Return to `references/eviction-scoring.md` and score first.
- **Consolidation would rewrite `corrections.md` without an explicit correction request**: stop. Corrections are user-owned; only add, never silently rewrite.
- **Long-term hard limit hit and human is unavailable (AFK)**: do not delete. Move the lowest-scored candidates to `archive/` with a note; a human approves the final removal on return.
- **Subagent consolidation requested but subagent unavailable**: the main agent must run Consolidate directly. Do not treat delegation failure as permission to skip consolidation.
- **Structure Mode would move or rename source files that are imported elsewhere**: stop and produce an impact list first; do not execute the move until the human confirms.

---

## Deliverable

For every invocation:

- [ ] Mode named up front (Capture / Recall / Consolidate / Consolidate via Subagent / Evict / Structure)
- [ ] `MEMORY_DIR` resolved and printed
- [ ] Files written listed with paths
- [ ] If compaction was used: compact state persisted to short-term memory or included in a handoff artifact that was itself saved to short-term memory
- [ ] If similar-trace recall was used: searched buckets + top matches (or `NONE FOUND`) reported
- [ ] For Consolidate/Evict: scored ranking + explicit human-approval prompt before any archive/delete
- [ ] For Consolidate via Subagent: subagent prompt scope and output contract documented
- [ ] `long-term/INDEX.md` updated last (single source of truth for what exists)

---

## Anti-patterns

| Temptation | Why wrong | Correct path |
|---|---|---|
| Auto-evict old long-term entries during Consolidate to "stay tidy" | User specified human-approved eviction. Silent deletion breaks trust and audit trail. | Score, rank, propose. Human approves. Archive first, delete only on second pass. |
| Skip short-term and write directly to long-term for a "clean" workflow | Bypasses working memory, so context under construction has no home; also skips the scoring gate. | Write to short-term first. Long-term only through Consolidate. |
| Treat every session as a Consolidate trigger | Runs the dream cycle constantly, evictions become noise. | Consolidate only on explicit request or commit signal. |
| Rewrite `corrections.md` during Consolidate because an entry "seems outdated" | Corrections encode the user's authority. Silent edits erase that. | Only append. Only edit on an explicit correction request from the user. |
| Apply Structure Mode aggressively across a whole repo in one pass | Wide file moves collide with in-flight branches. | Scope Structure Mode to one directory or module per invocation. |
| Load every reference file at once "to be safe" | Defeats the progressive-disclosure design this skill teaches. | Load `hierarchy-and-storage.md` first. Load others only when the selected mode requires them. |
| Run the full dream cycle inside the main agent on every commit | Wastes context and slows the main agent; prior conversation can leak into consolidation. | Capture first, then delegate Consolidate to a subagent. |
| Ask the subagent to read the entire conversation transcript | The subagent only needs the capture note and the memory directories; transcripts are noise. | Pass the capture note path and `MEMORY_DIR` to the subagent. |

---

## References

- `references/hierarchy-and-storage.md` — storage layout, frontmatter, capture/recall procedure, filename rules
- `references/dream-cycle.md` — consolidation workflow, commit-signal trigger, scoring inputs
- `references/eviction-scoring.md` — scoring function, ranking, archive-then-delete protocol
- `references/progressive-disclosure-pattern.md` — the leaf/index abstraction and the four properties an index must have
- `references/pattern-docs.md` — applying the pattern to a docs directory (shard-doc / index-docs style)
- `references/pattern-code.md` — applying the pattern to a code module (public surface vs internals)

Base directory: `file:///home/innoobwetrust/Developer/InNoobWeTrust/dotfiles/.agents/skills/memory`
