---
description: >
  Save, restore, consolidate, evict, or structure memory. Two-tier memory
  for AI agents (short-term + long-term with a dream-cycle consolidator).
  Use when saving progress, checkpointing, restoring a session, running the
  dream cycle, pruning long-term memory, or applying the same
  progressive-disclosure pattern to docs or code. Trigger phrases:
  "save handoff", "checkpoint", "save context", "resume", "restore",
  "what was I working on", "consolidate memory", "dream cycle",
  "prune memory", "forget", "structure docs", "split module".
  For auto-triggers, see ../rules/memory.md.
---

## Setup

You are executing a memory operation. To ensure Capture, Recall, Consolidate,
Evict, and Structure procedures are executed with integrity, **load and adhere
to the `memory` skill**.

## Execution Protocol

1. **Resolve `MEMORY_DIR`**: follow the resolution rule in
   `../skills/memory/SKILL.md` §Storage. Repo-local first, global fallback.
2. **Name the mode explicitly** before touching any file:
   - Capture — write a short-term entry.
   - Recall — restore a prior entry.
   - Consolidate — run the dream cycle.
   - Evict — prune long-term memory.
   - Structure — apply progressive disclosure to docs or code.
3. **Execute the mode**:
   - Capture / Recall → `../skills/memory/references/hierarchy-and-storage.md`.
   - Consolidate → `../skills/memory/references/dream-cycle.md`.
   - Evict → `../skills/memory/references/eviction-scoring.md`.
   - Structure → `../skills/memory/references/progressive-disclosure-pattern.md` + `../skills/memory/references/pattern-docs.md` / `../skills/memory/references/pattern-code.md`.
4. **Never evict or rewrite `corrections.md` silently.** Scored ranking + human approval.

---

## Invocation Arguments

Additional command input, if any, appears below exactly as provided:

```text
$ARGUMENTS
```

Follow the instructions above to work on the user's memory request right below.
