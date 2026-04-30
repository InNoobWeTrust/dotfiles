# Handoff Context

Handoff context is repo-local for Git work and global only outside Git. Resolve `AGENT_DIR` before any save or restore: if `git rev-parse --show-toplevel` succeeds, use `AGENT_DIR=<git-root>/.agents` and `<git-root>/.agents/handoffs/`; otherwise use `AGENT_DIR=~/.agents` and `~/.agents/handoffs/`.

Handoff is opt-in or threshold-based, not a startup scan. For repo work, check only the resolved repo-local handoff directory unless the user explicitly asks for global handoffs.

## Restore Triggers

Restore a handoff only when:

- The user asks to resume, continue, restore, or load a handoff.
- The current task depends on a named previous session or branch handoff.
- Context is clearly missing and a handoff path is provided.

## Save Triggers

Save or update a handoff with `~/.agents/commands/handoff.prompt.md`, or the equivalent command prompt under the active agent config root, when:

- The user asks for a handoff, checkpoint, or session summary.
- A major milestone completes and future continuation is likely.
- Context length risk is high.
- The user signals session end or device switch.

## Principle

The handoff file must be self-contained: include the goal, current status, decisions, files touched, verification, blockers, and next actions.
