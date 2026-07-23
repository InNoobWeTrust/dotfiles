# Dream Cycle — Consolidation

The dream cycle is the only path from short-term memory to long-term memory. It runs on **explicit request** or a **git commit signal**. It never runs silently on every message.

The cycle has four phases. Phases run in order; do not skip.

---

## Triggers

Trigger the cycle when any of these fire:

- User says "consolidate memory", "dream cycle", "run consolidation", "review my notes".
- User says "save handoff" or "checkpoint" **and** more than one short-term entry has `consolidated: false`.
- A git commit is about to be made and short-term memory has `consolidated: false` entries. Detect by:
  - `git diff --cached --name-only` returns non-empty, **or**
  - User typed a commit command in the same message ("commit this", "make a commit").
- `long-term/INDEX.md` frontmatter `last_dream_cycle` older than 7 days and short-term has any `consolidated: false` entry. This is advisory — offer the cycle, do not auto-run.

Do **not** trigger on:

- Every Capture.
- Individual short-term captures that add a single line to an existing entry.
- Session start.

---

## Phase 1 — Gather

1. Resolve `MEMORY_DIR` (see `hierarchy-and-storage.md`).
2. List all short-term entries with `consolidated: false`, **including entries where the field is missing entirely** — apply the fallback table in `hierarchy-and-storage.md` §Frontmatter resilience rather than skipping them. Include archive if the user asked to "reconsolidate everything".
3. Read `long-term/INDEX.md` and every bucket file.
4. If any entry is long, repetitive, or mixes multiple failed branches, compact it first using `references/compaction-and-step-recall.md` before extracting durable candidates.
5. Print a one-line summary per short-term entry: file, topic, decisions count, blockers count. Flag any entry where a fallback was applied.

Stop if there is nothing to consolidate.

---

## Phase 2 — Extract candidates

For each short-term entry, extract candidate long-term rows:

| From short-term section | Goes to bucket | Type |
|---|---|---|
| Key Decision marked `(finalised)` | `project.md` §Decisions | `project_decision` |
| Constraint the team must respect | `project.md` §Constraints | `project_constraint` |
| Stable fact about the codebase | `project.md` §Facts | `project_fact` |
| Command / path / tool discovery | `environment.md` | `environment_*` |
| Explicit user correction ("no, don't...", "actually X") | `corrections.md` | `correction` |
| Deep topic detail worth its own file | `topics/<topic>.md` | `topic_note` |
| Open question the user still owes | `project.md` §Open Questions | `open_question` |

Do not extract:

- Decisions marked `(fluid)`.
- Blockers — they belong in the short-term entry only.
- Next Steps — same.
- Raw diffs, transcripts, or tool output.

Each candidate gets a **stable key** in `snake_case`. Reuse an existing key when the candidate refines the same fact; otherwise mint a new one.

Print the candidate table before writing anything.

---

## Phase 3 — Score and write long-term

Score each candidate using `eviction-scoring.md` §Scoring function. Same function is used to score existing long-term entries in Phase 4.

Write rules:

1. **Merge over duplicate**: if a candidate's key already exists in long-term, present a diff. Prefer replace when the new entry is a refinement; prefer append when both variants remain relevant.
2. **Never touch `corrections.md` without a Correction candidate**. Corrections are user-owned. Adds only; no rewrites.
3. **Topic files split** at 8 KB soft / 16 KB hard. When splitting, keep the shared key prefix and append `-part-2` etc.
4. After writes, regenerate `long-term/INDEX.md` from the buckets. Every long-term row must appear in INDEX.
5. Bump `last_dream_cycle` in INDEX frontmatter.
6. In each source short-term file, set `consolidated: true` and `consolidated_at: <now>`. Do not delete short-term files here — archiving is a separate step in `hierarchy-and-storage.md`.

**Single source of truth**: `long-term/INDEX.md` and its buckets are canonical. Do not fan out writes to any external environment-managed memory store — that couples memory to a specific vendor and breaks portability.

---

## Phase 4 — Score existing long-term, propose evictions

1. Re-score every existing long-term row using the same scoring function.
2. Check size limits from INDEX frontmatter (see `SKILL.md` §Size limits table).
3. If any soft limit is passed, list the lowest-scored rows with their scores and the size reduction each eviction would achieve.
4. Present the eviction proposal:

```
DREAM CYCLE — EVICTION PROPOSAL
==============================
Limits: index_entries_soft=40 (current 43), total_kb=132 (soft 128)
Ranked candidates (low score first):
1. env_old_docker_flag         score=0.12  bucket=environment.md  Save ~90 B
2. legacy_api_shape             score=0.18  bucket=topics/api.md    Save ~1.4 KB
3. deprecated_deploy_playbook   score=0.22  bucket=topics/deploy.md Save ~2.1 KB
Action requested: approve to move to archive/<bucket>/<key>.md
```

5. Wait for human approval. In AFK / autonomy-safety mode, move the lowest-scored candidates to `archive/` but **do not delete**; the human confirms deletion on return. See `SKILL.md` §Stop conditions.
6. On approval, follow `eviction-scoring.md` §Archive-then-delete protocol.

Never evict from `corrections.md` without an explicit user request naming the correction key.

---

## Commit-signal integration

When the trigger is a pending commit:

1. Coverage first: if no active short-term entry covers the commit's workstream, suggest a Capture (`hierarchy-and-storage.md` §Capture mode) before running the cycle — there is nothing to consolidate from a conversation that was never recorded. Suggestion, not a block. See `rules/memory-checkpoint.md` §Procedure, step 2.
2. Run Phases 1–3 first. This may take a minute; tell the user.
3. Show the eviction proposal from Phase 4 but do **not** block the commit on eviction. Eviction can defer to the next dream cycle.
4. If any long-term files were changed, add them to the commit **only if the user asked to include memory changes**. Do not silently stage `.agents/memory/**`.

This keeps the "human dreams after a day of work" behaviour: commit closes the day, consolidation curates memory for the next one.

---

## Stop conditions

- Nothing to consolidate → stop after Phase 1 with a one-line report.
- Correction extraction is ambiguous (was the user disagreeing or brainstorming?) → stop and ask.
- Conflicting keys in short-term entries → stop and present both to the user; do not auto-merge.
- Phase 4 would evict from `corrections.md` → stop; require an explicit correction-key argument.

---

## Deliverable

- [ ] Trigger named (explicit request / commit signal / soft-limit advisory).
- [ ] Candidate table printed before writing (Phase 2).
- [ ] Long-term writes listed with keys, buckets, and score.
- [ ] `long-term/INDEX.md` regenerated; `last_dream_cycle` bumped.
- [ ] Short-term entries flipped to `consolidated: true`.
- [ ] Eviction proposal presented (Phase 4); no deletions without approval.
