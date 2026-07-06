---
name: session-handoff
description: "Save, restore, and checkpoint agent session state across devices, agents, and branch transitions. Use when checkpointing progress, resuming from a prior state, backing up context, or clearing stale branches/sessions. Trigger phrases: 'save handoff', 'checkpoint', 'save context', 'I'm switching devices', 'what was I working on', 'resume', 'load context', 'session handoff'."
---

# Session Handoff & State Checkpointing

A standardized protocol to serialize current agent execution context, open plans, key design choices, blockers, recent branch status, and active files into a portable Markdown handoff that another agent (or the same agent in a future session) can immediately restore to ensure zero information loss.

---

## Phase 1: Directory & Branch Resolution

Always resolve the physical handoff storage path before reading or writing.

1. **Resolve Root Directory**:
   - Check if current work is within a git repository by executing `git rev-parse --show-toplevel`.
   - **Git Work**: Use `<git-root>/.agents/handoffs/` for project-local storage.
   - **Non-Git/Global Work**: Fall back to `~/.agents/handoffs/`.
   - Ensure the `handoffs/` and `handoffs/archive/` subdirectories exist.
2. **Resolve Branch & Topic**:
   - Capture current git branch name: `git branch --show-current`.
   - Formulate a clean branch slug: replace `/` characters with `-` (e.g. `feature/setup` -> `feature-setup`).
   - Extract a descriptive topic slug from the active user goal or task statement.
   - Combine to form target filename: `<branch-slug>--<topic-slug>.md`.

---

## Phase 2: Save Checkpoint (Serialization)

### Auto-Save Triggers
- Direct user requests ("save handoff", "checkpoint", "going AFK").
- Completion of major plan stages (e.g., in a Bounded Iteration run).
- Before highly risky commands or destructive edits.
- Long-running conversation warnings.

### Serialization Steps
1. Gather the current state of conversation:
   - **Key Decisions**: Document every engineering choice and design rationale.
   - **Blockers**: Note what is currently blocking progress (external APIs, pending approvals).
   - **Next Steps**: Detail concrete, actionable next steps.
   - **Git State**: Capture current branch, modified files, and unstaged changes.
2. Inline crucial state from internal artifacts (e.g. plans, review findings, or scratchpads) so the handoff is **fully self-contained** and readable without accessing internal DBs.
3. Capture **audit trail context** when the project handles financial data, customer PII, or business-critical operations. Determine applicability by checking: (a) does the project's AGENTS.md or `docs/engineering/quality-gates.md` list regulated/sensitive data? (b) did any data mutation operations occur in this session (inserts, updates, deletes on business entities, not schema changes)? If neither signal fires, skip this section entirely. When applicable, capture:
   - Which quality gates passed/failed in this session? (if applicable)
   - Which security checks were run, and with what results? (if applicable)
   - Were any compliance rules waived or exceptions granted? Document rationale. (if applicable)
   - Did any data mutation occur that requires audit log entries? (if applicable)
4. Write to `{HANDOFFS_DIR}/<branch-slug>--<topic-slug>.md`.

### Handoff Markdown Template
```markdown
---
branch: [current branch]
topic: [topic description]
status: in-progress
updated: [current ISO timestamp]
agent: [agent name]
---

# Handoff: [Topic Description]

## Current Status
- [ ] Completed items
- [/] Active/in-progress tasks
- [ ] Remaining items

## Key Decisions
1. **Decision Name**: Rationale and trade-offs weighed.
2. **Decision Name**: Rationale and trade-offs weighed.

## Technical Blockers
- [e.g., Undocumented API rate-limiting on endpoint X]

## Next Steps
1. [Actionable step 1]
2. [Actionable step 2]

## Open Questions & Uncertainties
- [Questions requiring user feedback or exploratory spike research]

## Recent Changes & Git Context
- **Modified files**: [list paths]
- **Git diff status**: [uncommitted changes summary]

## Quality & Compliance (Audit Trail)
- **Quality gates passed**: [if applicable — e.g., make fix ✓, make lint ✓, make quality ✓, make test ✓]
- **Security checks run**: [if applicable — e.g., secret scan ✓, dependency audit ✓, SAST ✓]
- **Exceptions granted**: [list any waived rules with rationale, or "none"]
- **Data mutations requiring audit logs**: [if applicable — list write paths touched, or "N/A"]
- **Compliance gaps noted**: [list any unaddressed compliance issues, or "none"]
```

---

## Phase 3: Context Restoration

Restore active session context from a handoff.

1. **Resolve Handoff Directory**: Determine path (local git root vs. global).
2. **Locate Candidate Files**:
   - **Explicit path**: Use the exact file provided by the user.
   - **Branch-based**: Search for `handoffs/*.md` matching the current active branch, excluding `status: done` or archived files.
   - **Generic Resume**: If the user says "resume" or "what was I working on", list all non-archived handoffs sorted by update time.
3. **Conflict Resolution**: If multiple active handoffs are found, present their summaries and request the user to select the correct target.
4. **Context Load**: Parse the selected handoff, populate active plan states, and print a clear summary of restored Decisions, Status, and Next Steps to the user.

---

## Phase 4: Archiving & Stale Branch Cleanup

Prevent handoff pollution by maintaining hygiene.

1. **Archiving**:
   - When a branch is merged, or work is complete, update frontmatter to `status: done`.
   - Move the handoff file from `handoffs/` to `handoffs/archive/`.
   - If a duplicate filename exists in the archive directory, append the timestamp (e.g. `<filename>--2026-03-23.md`).
2. **Stale Branch Cleanup**:
   - Regularly audit the active handoffs directory.
   - Extract the branch name from each file's frontmatter.
   - Run `git branch --list <branch>` to check if the branch was deleted.
   - If the branch is missing, propose archiving its handoff to the user.
