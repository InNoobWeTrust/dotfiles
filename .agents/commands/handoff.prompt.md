---
description: >
  Save and restore session context for cross-device, cross-agent handoffs.
  Use when saving progress before ending a session, switching devices,
  handing off to another agent, or resuming a previous session. Also activate
  when the user says "save handoff", "checkpoint", "save context",
  "I'm switching devices", "what was I working on", or "resume".
  For auto-save triggers, see ../rules/handoff.md.
---

## Setup
You are executing a session context transition or progress checkpoint.

To ensure your checkpoints, status tracking, and restore logic are executed with absolute integrity, **load and adhere to the `session-handoff` skill**.

## Execution Protocol
1. **Resolve Storage**: Execute **Phase 1: Directory & Branch Resolution** of the `session-handoff` skill. Dynamically discover whether to use the repository-local git folder or global user-level storage.
2. **Save Checkpoint**: If saving, serialize the current decisions, plans, blockers, and git state using the checklists in **Phase 2: Save Checkpoint (Serialization)** and write to disk using the standard template.
3. **Restore Context**: If resuming or loading context, follow the search, conflict resolution, and parsing steps in **Phase 3: Context Restoration**.
4. **Archive & Clean**: If archiving stale files or checking deleted branches, run the maintenance steps in **Phase 4: Archiving & Stale Branch Cleanup**.

---

## Invocation Arguments

Additional command input, if any, appears below exactly as provided:

```text
$ARGUMENTS
```

Follow the instructions above to work on the user's handoff request right below.
