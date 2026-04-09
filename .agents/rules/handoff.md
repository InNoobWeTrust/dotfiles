# Handoff Context

This repo uses `{AGENT_DIR}/handoffs/` for cross-session, cross-device context
persistence, where `{AGENT_DIR}` is `.agents/` or `.agent/` at the workspace
root (the directory containing `.git`).
See `{AGENT_DIR}/handoffs/README.md` for full conventions.

## On Session Start

1. **Find the agent dir**: locate `.agents/` or `.agent/` at the workspace root
2. Check if `{AGENT_DIR}/handoffs/` contains any `.md` files (excluding README.md)
3. Get current branch: `git branch --show-current`
4. Filter files matching current branch slug prefix (e.g., `main--*` for `main`)
5. If matches found: read them and summarize what you found before proceeding
6. If no matches: check for any `status: in-progress` on other branches

## Auto-Save Triggers

Save or update a handoff (see `.agents/commands/handoff.md`) when:

- Completing a major subtask or milestone
- Conversation is getting long and context may be truncated
- Before a risky or destructive operation
- Switching to a substantially different topic
- User signals session end ("I'm done", "bye", "switching devices")

## Handoff Principle

The handoff file must be **self-contained**. Include all critical context
from your internal artifacts (plans, analyses, decisions). The next session
may be a different agent on a different device with no access to your storage.
