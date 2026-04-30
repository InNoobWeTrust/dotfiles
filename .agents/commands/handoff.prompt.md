---
description: >
  Save and restore session context for cross-device, cross-agent handoffs.
  Use when saving progress before ending a session, switching devices,
  handing off to another agent, or resuming a previous session. Also activate
  when the user says "save handoff", "checkpoint", "save context",
  "I'm switching devices", "what was I working on", or "resume".
  For auto-save triggers, see ~/.agents/rules/handoff.md.
---

> **CRITICAL — Save Location**: Resolve the handoff directory before reading or writing. For Git work, use the repository-local `<git-root>/.agents/handoffs/`. Outside Git, use `~/.agents/handoffs/`.

## Resolve The Handoff Directory

1. Run `git rev-parse --show-toplevel`.
2. If it succeeds, set `AGENT_DIR=<git-root>/.agents` and use `<git-root>/.agents/handoffs/`.
3. If it fails, set `AGENT_DIR=~/.agents` and use `~/.agents/handoffs/`.
4. On save, create `{AGENT_DIR}/handoffs/` if needed.
5. On archive, create `{AGENT_DIR}/handoffs/archive/` if needed.

Do not scan global handoffs for repo work unless the user explicitly asks for global handoffs.

## Save Handoff

### When to Save

- **User requests**: "save handoff", "checkpoint", "save context"
- **Session ending**: User says "I'm done", "bye", or session times out
- **Auto-save opportunities**: Completing a subtask, before a risky operation, when conversation is getting long, switching topics

### Steps

1. Resolve the handoff directory.
2. Determine current branch: `git branch --show-current`.
3. Determine topic: infer from current work, or ask user if ambiguous.
4. Build the branch slug: replace `/` with `-` in branch name.
5. Build filename: `<branch-slug>--<topic-slug>.md`.
6. Check if file already exists in `{AGENT_DIR}/handoffs/`.
7. If it exists, update it while preserving Key Decisions and appending new ones.
8. If it is new, create it from the template below.
9. Inline critical context from internal artifacts: plans, analyses, brainstorming notes, review findings, and design decisions that exist only in agent-internal storage must be summarized into the handoff.
10. Fill in all sections from current conversation context.
11. Confirm to user: `Handoff saved to {AGENT_DIR}/handoffs/<filename>`.

> **Principle**: The handoff must be self-contained. If the file were the only context the next agent receives, it should be enough to resume work. Never assume the next session has access to your internal artifacts.

### Template

```markdown
---
branch: [current branch]
topic: [topic description]
status: in-progress
updated: [current ISO timestamp]
agent: [agent name]
---

# [Topic]

## Status
[What's done, what's in progress]

## Key Decisions
[Decisions made with rationale — so the next agent doesn't re-debate]

## Blockers
[What's preventing progress, or "None"]

## Next Steps
[Concrete actions for whoever picks this up]

## Open Questions
[Things needing user input or further research]

## Recent Changes
[Files modified, branches, relevant git state]
```

---

## Restore Handoff

### When to Restore

- **User requests**: "what was I working on", "resume", "load context"
- **Named dependency**: The task depends on a specific previous session, branch, or handoff file
- **Missing context**: Required context is clearly absent and the user or task provides a handoff path

### Steps

1. Resolve the handoff directory.
2. Determine whether the user provided an explicit handoff path, branch name, session name, or only a generic resume request.
3. If an explicit path is provided, read that file only when it is inside the resolved handoff directory; ask before using a different directory.
4. If a branch or session is provided, list matching `{AGENT_DIR}/handoffs/*.md` files excluding `README.md`, then read candidates and skip `status: done` files.
5. If the request is generic, list active non-README handoffs in the resolved directory and ask which one to restore.
6. If multiple candidates match, summarize each active candidate and ask the user to choose.
7. If exactly one candidate matches and the request is explicit, summarize it and confirm the restore target before proceeding.
8. Proceed autonomously only when the user explicitly requested autonomous operation, such as a Ralph loop, and exactly one safe active match exists.
9. If no matches exist in the resolved directory, report that no matching handoff was found.

---

## Archive Handoff

### When to Archive

- Work is complete (`status: done`)
- Handoff is stale (branch was merged/deleted)
- User requests cleanup

### Steps

1. Resolve the handoff directory.
2. Set `status: done` in frontmatter.
3. Move file to `{AGENT_DIR}/handoffs/archive/`.
4. If a file with the same name exists in archive, append date: `<original-name>--2026-03-23.md`.
5. Confirm to user.

---

## Branch Cleanup

Periodically, or when user asks, check for stale handoffs in the resolved directory:

1. List all handoff files in `{AGENT_DIR}/handoffs/`.
2. For each, extract branch from frontmatter.
3. Check if branch still exists: `git branch --list <branch>`.
4. If branch is gone, suggest archiving it.

---

Follow the instructions above to work on the user's handoff request right below.
