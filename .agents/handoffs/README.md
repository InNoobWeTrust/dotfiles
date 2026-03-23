# Handoffs

Cross-session, cross-device, cross-agent context persistence.

When a session ends, the agent writes what the next session needs to know.
When a session starts, the agent reads what the previous session left behind.

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

- **Branch slug**: branch name with `/` replaced by `-`
  (e.g., `feature/auth` → `feature-auth`)
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
| `done` | Complete — will be moved to `archive/` |

## Discovery Protocol

When starting a session:

1. Check if `handoffs/` contains any `.md` files (excluding this README)
2. Get current branch: `git branch --show-current`
3. Filter files matching current branch slug prefix
4. Read matching files, summarize status to user
5. If no matches: check for `status: in-progress` or `status: blocked` on
   other branches — user may have switched branches
6. If nothing found: fresh start

## Saving

Agents should write/update handoffs:

- **Auto-save**: At natural breakpoints (completing a subtask, before a long
  operation, when context is getting large)
- **Manual**: When user says "save handoff", "checkpoint", "I'm switching
  devices", or "save context"
- **On exit**: Before session ends, if meaningful work was done

## Archival

When a handoff reaches `status: done`:

- Move the file to `archive/` with the same filename
- If an archived file with the same name exists, append a timestamp:
  `<branch>--<topic>--2026-03-23.md`

## Git

Commit the infrastructure (this README, `archive/`). Gitignore actual handoff
files by default — they are ephemeral personal context:

```gitignore
# Handoff content (personal context, not project source)
.agents/handoffs/*.md
!.agents/handoffs/README.md
```

To share handoffs with a team (e.g., onboarding, leave handoff), remove the
ignore rule and commit specific handoff files.
