---
description: >
  Save and restore session context for cross-device, cross-agent handoffs.
  Use when saving progress before ending a session, switching devices,
  handing off to another agent, or resuming a previous session. Also activate
  when the user says "save handoff", "checkpoint", "save context",
  "I'm switching devices", "what was I working on", or "resume".
  For auto-save triggers, see .agents/rules/handoff.md.
---

> **CRITICAL — Save Location**: Handoff files go in the **workspace's** agent
> config directory, NOT in the conversation artifact directory. Locate the
> correct directory by searching for `.agents/` or `.agent/` at the workspace
> root (the directory containing `.git`). Save to `{agent_dir}/handoffs/`.
> Example: `/home/user/project/.agent/handoffs/main--feature.md`

## Save Handoff

### When to Save

- **User requests**: "save handoff", "checkpoint", "save context"
- **Session ending**: User says "I'm done", "bye", or session times out
- **Auto-save opportunities**: Completing a subtask, before a risky operation,
  when conversation is getting long, switching topics

### Steps

1. **Find the workspace agent directory**: look for `.agents/` or `.agent/`
   at the root of the git workspace most relevant to the current work.
   Use `find_by_name` or `list_dir` if unsure. Store this as `AGENT_DIR`.
2. Determine current branch: `git branch --show-current`
3. Determine topic: infer from current work, or ask user if ambiguous
4. Build the branch slug: replace `/` with `-` in branch name
5. Build filename: `<branch-slug>--<topic-slug>.md`
6. Check if file already exists in `{AGENT_DIR}/handoffs/`:
   - **Exists**: Update it (preserve Key Decisions, append new ones)
   - **New**: Create it from template below
7. **Inline critical context from internal artifacts** — any plans, analyses,
   brainstorming notes, review findings, or design decisions that exist only
   in the agent's internal storage (e.g., conversation artifacts, memory files)
   must be summarized into the handoff. The next agent may be a different tool
   on a different device with no access to your internal state.
8. Fill in all sections from current conversation context
9. Confirm to user: "Handoff saved to `{AGENT_DIR}/handoffs/<filename>`"

> **Principle**: The handoff must be _self-contained_. If the file were the
> only context the next agent receives, it should be enough to resume work.
> Never assume the next session has access to your internal artifacts.

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

- **Session start**: Check for existing handoffs on current branch
- **User requests**: "what was I working on", "resume", "load context"
- **Branch switch**: User switches branches, check for handoffs there

### Steps

1. **Find the workspace agent directory** (same as Save step 1)
2. List `{AGENT_DIR}/handoffs/*.md` (excluding `README.md`)
3. Get current branch: `git branch --show-current`
4. Filter files with matching branch slug prefix
5. For each match:
   - Read the file
   - Check `status` — skip `done` files (should already be archived)
6. Summarize findings to user:
   - Number of active handoffs on this branch
   - Brief status of each
   - Ask which to resume (if multiple), or confirm the single match
7. If no matches on current branch:
   - Check for `in-progress` or `blocked` handoffs on other branches
   - If found, mention them: "No handoffs on this branch, but found
     active work on `feature/auth` — want to switch?"

---

## Archive Handoff

### When to Archive

- Work is complete (`status: done`)
- Handoff is stale (branch was merged/deleted)
- User requests cleanup

### Steps

1. Set `status: done` in frontmatter
2. Move file to `.agents/handoffs/archive/`
3. If a file with the same name exists in archive, append date:
   `<original-name>--2026-03-23.md`
4. Confirm to user

---

## Branch Cleanup

Periodically (or when user asks), check for stale handoffs:

1. List all handoff files
2. For each, extract branch from frontmatter
3. Check if branch still exists: `git branch --list <branch>`
4. If branch is gone → suggest archiving: "Found handoff for deleted branch
   `feature/old`. Archive it?"

---

Follow the instructions above to work on the user's handoff request right below.

---
