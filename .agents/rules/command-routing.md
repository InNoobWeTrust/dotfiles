# Command Routing

This repo has reusable commands at `{AGENT_DIR}/commands/`, where `{AGENT_DIR}`
is `.agents/` or `.agent/` at the workspace root.

## When to Check

When the user requests a multi-step procedure that sounds like it could be templated:

1. Read `{AGENT_DIR}/commands/index.md` for the full catalog
2. If a matching command exists, follow its steps rather than improvising
3. Commands may reference skills — load those skills as needed

## Common Routing

| User says | Route to |
| --- | --- |
| "review this", "check this" | `commands/review.md` |
| "sync mcp", "update mcp config" | `commands/sync-mcp.md` |
| "brainstorm", "ideate" | `commands/brainstorming.md` |
| "save handoff", "checkpoint" | `commands/handoff.md` |
| "sync skill dna", "sync local skills" | `commands/sync-skill-dna.md` |
| "sync remote skills", "pull remote skills" | `commands/sync-remote-skills.md` |
| "screen CVs", "review candidates" | `commands/cv-screening.md` |
