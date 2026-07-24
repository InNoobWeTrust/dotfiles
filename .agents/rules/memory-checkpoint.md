# Memory Checkpoint Rule

Run this rule before every git commit. It ensures the conversation that formed the commit is captured in short-term memory and then consolidated. Heavy consolidation is delegated to a subagent so the main agent stays focused.

This rule is called from `git-safety.md` §Pre-commit. Committing without running this checkpoint risks losing session knowledge.

---

## Procedure

1. Resolve `MEMORY_DIR`: if `git rev-parse --show-toplevel` succeeds, use `<git-root>/.agents/memory/`; otherwise `~/.agents/memory/`.
2. **Bootstrap check** — if `MEMORY_DIR` or its `short-term/` subdirectory does not exist, this is a fresh workspace. Create the directory structure per `../skills/memory/references/hierarchy-and-storage.md` §Resolve `MEMORY_DIR`, then proceed to step 3. **Do not skip the coverage check just because the directory is new** — the absence of any memory entry is itself a signal that Capture is needed.
3. **Coverage check** — is the work in this commit represented in short-term memory at all? Look for an active (non-`done`) entry in `MEMORY_DIR/short-term/` matching the current branch and the commit's workstream. If no such entry exists (including when the directory was just bootstrapped), or the matching entry predates the current conversation's substance (goal, decisions, blockers not reflected), **run Capture** (`../skills/memory/SKILL.md` Capture mode) before continuing. Do not proceed to the consolidation check until the current commit's workstream is recorded in short-term memory.
4. **Consolidation check** — check for entries in `MEMORY_DIR/short-term/` with `consolidated: false` in their frontmatter. Treat a **missing** `consolidated` field as `false` too — do not skip entries just because they predate the field (see `../skills/memory/references/hierarchy-and-storage.md` §Frontmatter resilience).
5. If unconsolidated entries exist, **consolidation is required**. Do not skip it. Use one of these paths:
   - **Default**: Delegate consolidation to a subagent using `../skills/memory/references/dream-cycle.md` §Subagent consolidation. The subagent needs only the capture note path and the memory directory paths.
   - **Fallback**: If subagent delegation is unavailable, load `../rules/memory.md` and run the Consolidate procedure in the main agent.
6. For the pre-commit checkpoint, consolidation counts as **run** when the consolidator completes the analytical pass and returns a report (candidate table, scores, proposed writes, eviction proposal if needed). Approval-gated writes to long-term and flipping short-term entries to `consolidated: true` may happen immediately after approval or in a follow-up apply pass, but the report itself is mandatory before the checkpoint is complete.
7. **Do not block the commit on eviction** — eviction can defer to the next dream cycle.
8. **Do not silently stage `.agents/memory/**`** into the commit. Only include memory files if the user explicitly approves.

If coverage exists and no unconsolidated entries remain, proceed without loading the memory skill.

---

## Why a separate rule?

Separating the checkpoint from `git-safety.md` keeps each rule focused: `git-safety.md` owns git-specific mechanics and approvals; `memory-checkpoint.md` owns the "capture before commit" boundary. The checkpoint can evolve (new heuristics, new signals) without complicating git safety.

---

## Principle

A commit closes a unit of work. Before that boundary, capture what happened and ensure consolidation runs. The important optimization is **who** performs consolidation (subagent by default), not whether consolidation happens at all.
