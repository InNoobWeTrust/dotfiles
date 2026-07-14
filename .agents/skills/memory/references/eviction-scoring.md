# Eviction Scoring

Every promotion to long-term and every eviction proposal uses the same scoring function. Scoring is transparent, reproducible, and always presented to the human before any archive/delete.

---

## Scoring function

For a candidate or an existing long-term row, compute:

```
score = w_recency * recency
      + w_frequency * frequency
      + w_authority * authority
      + w_reach * reach
      + w_stability * stability
      - w_stale * staleness
```

Default weights (sum ≈ 1.0 on the positive side):

| Weight | Value | Meaning |
|---|---|---|
| `w_recency` | 0.20 | How recently the entry was touched or referenced |
| `w_frequency` | 0.20 | How often the entry has been referenced across sessions |
| `w_authority` | 0.25 | Corrections and explicit user-approved decisions rank highest |
| `w_reach` | 0.15 | How many other entries / rules / skills reference this key |
| `w_stability` | 0.20 | Facts about invariants (paths, commands, contracts) that rarely change |
| `w_stale` | 0.30 | Penalty for entries the score model thinks are outdated |

All inputs are normalised to [0, 1]. Final score is a real number in roughly [-0.3, 1.0].

### Inputs

| Input | How to compute |
|---|---|
| `recency` | `1.0 - min(1.0, days_since_updated / 90)` |
| `frequency` | `min(1.0, ref_count / 5)` where `ref_count` = mentions across short-term files, session digests, and grep hits in the repo |
| `authority` | `1.0` for `correction` type, `0.8` for `project_decision`, `0.6` for `project_constraint`, `0.4` for `project_fact`, `0.3` for `environment_*`, `0.2` for `topic_note`, `0.1` for `open_question` |
| `reach` | `min(1.0, grep_hits_in_docs_and_code / 5)` — how many docs, rules, skills, or source files still reference the key |
| `stability` | `1.0` if the entry hasn't been rewritten in the last 3 dream cycles, else `1.0 - rewrite_count/3` |
| `staleness` | `1.0` when the entry contradicts a newer short-term decision; `0.5` when a referenced file no longer exists; `0` otherwise |

Print the input vector next to the score whenever you propose eviction. No hidden math.

---

## Type-specific rules

- **`correction`** — floor score is `authority * w_authority = 0.25`. Never evict without explicit user confirmation naming the key.
- **`project_decision`** — evict only after a superseding decision is captured. Otherwise the new session will re-derive the same decision.
- **`environment_*`** — high staleness if the referenced path/command has changed (probe with `command -v` or file existence).
- **`topic_note`** — split before evicting when a file exceeds the size soft limit; splits preserve information.
- **`open_question`** — decay faster: `w_stale` doubles for questions older than 30 days that the user has not returned to.

---

## Ranking

1. Sort candidates by score ascending (lowest first — those are the eviction targets).
2. Break ties by size: prefer evicting larger entries when scores are within 0.03.
3. Group by bucket in the proposal so the human sees where the cuts land.

---

## Proposal format

Always print this exact structure before touching disk:

```
EVICTION PROPOSAL
=================
Limits: <which soft/hard limit is over budget>
Total to reclaim: <bytes / rows>

Ranked (low score first):
  1. <key>  score=<f2>  type=<type>  bucket=<file>  size=<bytes>
     inputs: recency=<f2> freq=<f2> auth=<f2> reach=<f2> stab=<f2> stale=<f2>
     reason: <one-line summary>
  2. ...

Not eligible (locked):
  - <key>  reason=<correction | supersedes-nothing | ...>

Action requested: approve list, edit list, or cancel.
```

If the user edits the list, re-print the proposal before proceeding.

---

## Archive-then-delete protocol

Eviction is two-step. Never delete on the first pass.

### Step 1 — Archive (this dream cycle)

1. Move the row from its bucket file to `archive/<bucket>/<key>.md` with full context:
   ```markdown
   ---
   key: <key>
   type: <type>
   evicted_at: <ISO>
   evicted_from: <bucket>
   final_score: <f2>
   inputs: {...}
   ---

   <original entry body>
   ```
2. Remove the row from `long-term/INDEX.md`.
3. Bump `last_dream_cycle`.
4. Commit the archive move as part of the memory changes if the user is committing memory.

### Step 2 — Delete (next dream cycle at earliest)

- On the next cycle, list archived entries older than `archive_retention_days` (default 30).
- Present them to the user for permanent deletion.
- Only then remove the archive file.

**AFK / autonomy-safety exception**: If the user is AFK and a hard limit is breached, run Step 1 for the lowest-scored entries so the workspace stays functional, but do not proceed to Step 2 without human approval. Log the archive action in the next handoff/short-term entry.

---

## Restoration

An archived entry can be restored:

1. Copy the entry body back to its original bucket.
2. Add a `restored_at` line to the frontmatter with reasoning.
3. Regenerate `long-term/INDEX.md`.
4. Delete the archive file only after the restoration is verified.

Restoration is common — treat archive as a soft delete.

---

## Stop conditions

- Any candidate is missing an input value → stop; compute the missing input or exclude the candidate from ranking.
- Weights don't sum to a value within [0.9, 1.1] on the positive side → stop; the weight overrides in INDEX frontmatter are malformed.
- User approval received but the archive directory is unwritable → stop and report; do not swallow the failure.

---

## Deliverable

- [ ] Score printed with input vector for every candidate.
- [ ] Ranked list grouped by bucket.
- [ ] Locked entries listed with reason.
- [ ] Archive move completed and verified before removing from bucket.
- [ ] `long-term/INDEX.md` regenerated.
