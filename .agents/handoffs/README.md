# Handoffs

Cross-session, cross-device, cross-agent context persistence.
Works with any AI coding agent: Claude Code, Copilot, Cursor, Kilo, Gemini CLI, etc.

This README documents the `handoffs/` directory relative to the resolved `AGENT_DIR`.

## Directory Resolution

1. Run `git rev-parse --show-toplevel`.
2. If it succeeds, set `AGENT_DIR=<git-root>/.agents` and use `<git-root>/.agents/handoffs/`.
3. If it fails, set `AGENT_DIR=~/.agents` and use `~/.agents/handoffs/`.

When saving, create `{AGENT_DIR}/handoffs/` if needed. When archiving, move completed files to `{AGENT_DIR}/handoffs/archive/`.

Do not scan global handoffs for repo work unless explicitly requested.

## File Convention

```
handoffs/
├── README.md                        ← this file
├── <branch>--<topic>.md             ← active handoffs
└── archive/                         ← completed handoffs
```

### Naming

```
<branch-slug>--<topic-slug>.md
```

- **Branch slug**: branch name with `/` replaced by `-` (e.g., `feature/auth` -> `feature-auth`)
- **Topic slug**: short kebab-case descriptor of the workstream
- **Double-dash** `--` separates branch from topic

### File Format

```markdown
---
branch: feature/auth
topic: login flow
status: in-progress
updated: 2026-03-23T21:30:00+07:00
agent: claude-code
---

# Login Flow

## Status
Where things stand — what's done, what's in progress.

## Key Decisions
Decisions made with rationale.

## Blockers
What's preventing progress.

## Next Steps
Concrete actions for whoever picks this up next.

## Open Questions
Things that need user input or further research.

## Recent Changes
Files modified, relevant git state.
```

### Status Values

| Status | Meaning |
|---|---|
| `in-progress` | Actively being worked on |
| `paused` | Stopped intentionally, can resume |
| `blocked` | Waiting on external input |
| `done` | Complete; move to `archive/` |

## Discovery Protocol

When restoring a handoff:

1. Resolve `AGENT_DIR`.
2. Check whether `{AGENT_DIR}/handoffs/` contains any `.md` files excluding this README.
3. Get current branch: `git branch --show-current`.
4. Filter files matching current branch slug prefix.
5. Read matching files and summarize status to the user.
6. If no matches exist in the resolved directory, report that no matching handoff was found.

## Saving

Agents should write/update handoffs:

- **Auto-save**: At natural breakpoints, before a long operation, or when context is getting large
- **Manual**: When user says "save handoff", "checkpoint", "I'm switching devices", or "save context"
- **On exit**: Before session ends, if meaningful work was done

## Archival

When a handoff reaches `status: done`:

- Move the file to `archive/` with the same filename
- If an archived file with the same name exists, append a timestamp: `<branch>--<topic>--2026-03-23.md`

## Git

Commit the infrastructure (this README, `archive/`). Gitignore actual handoff files by default because they are ephemeral personal context:

```gitignore
# Handoff content (personal context, not project source)
handoffs/*.md
!handoffs/README.md
```

To share handoffs with a team, such as onboarding or leave handoff, remove the ignore rule and commit specific handoff files.

## Related

- Rule: `~/.agents/rules/handoff.md` — session save/restore triggers
- Command: `~/.agents/commands/handoff.prompt.md` — step-by-step save/restore procedure
