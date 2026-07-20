# Memory Checkpoint Rule

Run this rule before every git commit. It ensures the conversation that formed the commit is captured in short-term memory and that unconsolidated entries are promoted to long-term memory before the commit boundary.

This rule is called from `git-safety.md` §Pre-commit. Committing without running this checkpoint risks losing session knowledge.

---

## Procedure

1. Resolve `MEMORY_DIR`: if `git rev-parse --show-toplevel` succeeds, use `<git-root>/.agents/memory/`; otherwise `~/.agents/memory/`.
2. **Coverage check** — is the work in this commit represented in short-term memory at all? Look for an active (non-`done`) entry in `MEMORY_DIR/short-term/` matching the current branch and the commit's workstream. If no such entry exists, or the matching entry predates the current conversation's substance (goal, decisions, blockers not reflected), **suggest running Capture** (`../skills/memory/SKILL.md` Capture mode) before committing — the conversation that formed this commit is otherwise recorded nowhere. Present this as a suggestion, not a block: the user may decline and commit anyway.
3. **Consolidation check** — check for entries in `MEMORY_DIR/short-term/` with `consolidated: false` in their frontmatter. Treat a **missing** `consolidated` field as `false` too — do not skip entries just because they predate the field (see `../skills/memory/references/hierarchy-and-storage.md` §Frontmatter resilience).
4. If any unconsolidated entries exist, load `../rules/memory.md` and run the Consolidate (dream cycle) from `../skills/memory/references/dream-cycle.md` §Commit-signal integration.
5. This captures session learnings into `MEMORY_DIR/long-term/` as a pre-commit checkpoint.
6. **Do not block the commit on eviction** — eviction can defer to the next dream cycle.
7. **Do not silently stage `.agents/memory/**`** into the commit. Only include memory files if the user explicitly approves.

If coverage exists and no unconsolidated entries remain, proceed without loading the memory skill.

---

## Why a separate rule?

Separating the checkpoint from `git-safety.md` keeps each rule focused: `git-safety.md` owns git-specific mechanics and approvals; `memory-checkpoint.md` owns the "human dreams after a day of work" boundary at commit time. The checkpoint can evolve (new heuristics, new signals) without complicating git safety.

---

## Principle

A commit closes a unit of work. Before that boundary, capture what happened and consolidate what matters — otherwise the conversation behind the commit evaporates.
