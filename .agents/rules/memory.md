# Memory Rule

Two-tier memory for agents lives at `AGENT_DIR/memory/`. Resolve `AGENT_DIR` before any read or write: if `git rev-parse --show-toplevel` succeeds, use `AGENT_DIR=<git-root>/.agents`; otherwise use `AGENT_DIR=~/.agents`. Full procedure lives in `../skills/memory/SKILL.md`.

Memory operations are opt-in or threshold-based, never a startup scan. For repo work, look only in the resolved repo-local `memory/` directory unless the user explicitly asks for global memory.

## Capture triggers

Write to `memory/short-term/` when:

- The user says "save handoff", "checkpoint", "save context", "note this", "remember this".
- A major milestone completes and future continuation is likely.
- Context length is near budget or the user signals session end / device switch.
- Before any destructive command.
- A commit is about to be made and the pre-commit checkpoint (`memory-checkpoint.md`) finds no active short-term entry covering the commit's workstream — run Capture so the conversation behind the commit is recorded before consolidation starts.

## Recall triggers

Load from `memory/short-term/` or `memory/long-term/` when:

- The user says "resume", "restore", "load context", "what was I working on".
- The task depends on a named previous session or branch.
- Context is clearly missing and a memory path is provided.

## Consolidate (dream cycle) triggers

Run the consolidation flow in `../skills/memory/references/dream-cycle.md` when:

- The user says "consolidate memory", "dream cycle", "run consolidation", "review my notes".
- A commit is about to be made and any short-term entry has `consolidated: false`.
- The user asks to save a handoff and more than one short-term entry is unconsolidated.

**Default execution path:** run the report-only consolidation pass via subagent first, then apply approved writes. Fall back to in-agent consolidation only when delegation is unavailable.

Do **not** consolidate on every message, on session start, or on a single `kilo_memory_save` call.

## Evict triggers

Run eviction (scored + human-approved) when:

- `long-term/INDEX.md` size limits are passed.
- The user says "prune memory", "forget X", "evict Y".

Never silently delete. Archive first, delete on second-pass approval. Corrections are never evicted without an explicit correction key from the user.

## Principle

Short-term memory is unbounded and self-contained (goal, status, decisions, blockers, next steps). Long-term memory is size-limited and only grows through the dream cycle. The `memory` skill owns the workflow; this rule only tells you when to hand off to it.
