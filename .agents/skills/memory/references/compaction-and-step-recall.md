# Compaction and Step Recall

Load this only when Recall or Consolidate needs more than a plain file lookup.

## Part 1 — Context compaction

Use compaction when the active context is long, repetitive, or starting to rot.

### Trigger signals

- More than ~5 meaningful tool turns on one thread
- Re-reading the same files or logs without new insight
- Competing candidate fixes are starting to blur together
- You need to hand work across sessions or subagents

### Compaction output

Produce a compact state block with exactly these sections:

```markdown
## Goal
## Confirmed Facts
## Decisions
## Open Risks
## Next Best Step
## Evidence Pointers
```

Rules:

1. Keep only durable facts, not raw transcript.
2. Preserve file paths, commands, and error fingerprints.
3. Separate **confirmed facts** from guesses.
4. Name unresolved forks explicitly instead of merging them into mush.
5. After compaction, continue from the compact state block, not the whole transcript.
6. The compact state must have a durable home: either append it to the active short-term entry under a `## Compact State` section, or include it verbatim in a handoff artifact that is itself saved to short-term memory.
7. The saved handoff artifact must live in `short-term/*--<branch-slug>--<topic-slug>.md` and include at least: topic, updated timestamp, the compact state block, and the intended recipient/session if one exists.
8. If neither write target exists yet, stop and create/choose one before claiming compaction is complete.

## Part 2 — Step-level similar-trace recall

Sometimes the right recall question is not "same topic?" but "have we seen this kind of step before?"

### Good similar-trace queries

- "Have we seen a verifier fail because the toolchain was missing?"
- "Have we already had a branch drift / stale diff problem like this?"
- "What prior session had the same kind of auth-edge-case blocker?"

### Search template

When a similar-trace query is requested, search memory using 3 buckets:

1. **Step shape** — what operation is being attempted? (review, refactor, migration, verifier repair, dispatch, consolidation)
2. **Failure / blocker shape** — what went wrong? (missing tool, stale context, oscillation, auth ambiguity, path confusion)
3. **Recovery shape** — how was it resolved? (narrow scope, add checkpoint, regenerate state, ask user, split work)

Concrete search boundary:

- Search active repo-local `short-term/*.md` first
- Then search `short-term/archive/*.md` if no active match is strong enough
- Then search `long-term/INDEX.md` and follow matching topic/bucket entries
- Normalize the query into 1 token for step shape, 1-3 tokens for blocker shape, and 1-3 tokens for recovery shape
- Score matches as: step-shape match = required, blocker-shape match = +1, recovery-shape match = +1, exact error/command/path overlap = +1
- Return at most 3 best candidates ranked by score desc, then `updated` desc as tiebreaker
- If no candidate matches the step shape plus at least one of blocker/recovery shape, return `NONE FOUND` and do not force analogy

Return results in this format:

```markdown
## Similar Trace Recall
- **Prior entry**: [path]
- **Why it matches**: [step shape + blocker shape]
- **What resolved it**: [recovery pattern]
- **What differs now**: [important mismatch]
- **Reuse recommendation**: [apply / adapt / do not reuse]
```

If nothing matches:

```markdown
## Similar Trace Recall
NONE FOUND
- Searched: [paths / buckets]
- Best next move: [continue current investigation / ask user / compact current thread first]
```

## Operator note

Compaction and similar-trace recall complement each other:

- **Compaction** keeps the current thread coherent.
- **Similar-trace recall** imports a prior pattern without dumping irrelevant history.
