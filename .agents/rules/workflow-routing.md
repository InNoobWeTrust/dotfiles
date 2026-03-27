# Workflow Routing

This repo has reusable workflows at `{AGENT_DIR}/workflows/`, where `{AGENT_DIR}`
is `.agents/` or `.agent/` at the workspace root.

## When to Check

When the user requests a multi-step procedure that sounds like it could be templated:

1. Read `{AGENT_DIR}/workflows/index.md` for the full catalog
2. If a matching workflow exists, follow its steps rather than improvising
3. Workflows may reference skills — load those skills as needed

## Common Routing

| User says | Route to |
| --- | --- |
| "review this", "check this" | `workflows/skills/review.md` |
| "sync mcp", "update mcp config" | `workflows/mcp/sync-mcp.md` |
| "brainstorm", "ideate" | `workflows/ideation/brainstorming.md` |
| "save handoff", "checkpoint" | `workflows/context/handoff.md` |
| "sync skills" | `workflows/skills/sync-skill-dna.md` or `sync-remote-skills.md` |
| "screen CVs", "review candidates" | `workflows/hiring/cv-screening.md` |
