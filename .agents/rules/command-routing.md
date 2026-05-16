# Command Routing

Canonical command prompts live in `~/.agents/commands/*.prompt.md`, or `commands/*.prompt.md` relative to the active agent config root. CLI-specific command discovery paths may symlink to that directory, but must not duplicate command content.

When invoked through Kilo/OpenCode custom commands, prompt bodies may use `$ARGUMENTS` and positional placeholders like `$1`, `$2`, and `$3`. `$ARGUMENTS` may be multi-line and should be treated as raw text.

Commands are entrypoints. Commands that wrap skills must stay thin and defer to the named skill for methodology, references, and detailed workflow. Standalone commands may keep their own procedure when no skill owns that domain.

## Routing Rule

Use the table first. Do not scan command bodies unless no route matches and the user explicitly asks for a command-like workflow; in that case, list command names only before choosing a route.

| User says | Command prompt |
| --- | --- |
| "review this", "check this" | `~/.agents/commands/review.prompt.md` |
| "requirements", "PRD", "TRD", "BDD", "spec this" | `~/.agents/commands/requirements-lifecycle.prompt.md` |
| "swarm", "multi-agent", "parallel agents" | `~/.agents/commands/swarm.prompt.md` |
| "ralph", "loop", "run until done" | `~/.agents/commands/ralph-loop.prompt.md` |
| "save handoff", "checkpoint", "resume" | `~/.agents/commands/handoff.prompt.md` |
| "benchmark", "optimize agents", "model comparison" | `~/.agents/commands/benchmark-agents.prompt.md` |
| "sync mcp", "update mcp config" | `~/.agents/commands/sync-mcp.prompt.md` |
| "brainstorm", "ideate" | `~/.agents/commands/brainstorming.prompt.md` |
| "sync skill dna", "sync local skills" | `~/.agents/commands/sync-skill-dna.prompt.md` |
| "sync remote skills", "pull remote skills" | `~/.agents/commands/sync-remote-skills.prompt.md` |
| "screen CVs", "review candidates" | `~/.agents/commands/cv-screening.prompt.md` |
| "shard doc", "split document", "chunk document" | `~/.agents/commands/shard-doc.prompt.md` |
| "index docs", "build doc index", "documentation index" | `~/.agents/commands/index-docs.prompt.md` |
| "party mode", "coordinate agents" | `~/.agents/commands/party-mode.prompt.md` |
