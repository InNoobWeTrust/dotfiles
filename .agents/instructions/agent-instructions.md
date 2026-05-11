# Agent Instructions

## Scope-Based Routing

**Load skills selectively** — prefer no skill for straightforward edits. Use `~/.agents/skills/INDEX.md` to select one primary skill; optionally add one review/safety lens when clearly beneficial.

### High-Impact Daily Skills
- **Bug/failure/debug "why" tasks** → Load `structured-inquiry`
- **Unfamiliar codebase navigation** → Load `codebase-exploration`
- **Auth/secrets/data handling** → Add `security-reviewer` as safety lens
- **Parsers, validators, branching logic** → Add `edge-case-hunter` for boundary review
- **Explicit review requests** → Match narrow reviewer (adversarial-reviewer, editorial-reviewer, etc.)

### Specialized Skills (on explicit trigger)
- **Requirements/planning work** → Load `requirements-driven-dev`
- **Multi-agent exploration** → Load `swarm-intelligence`
- **Bounded repetitive tasks** → Load `ralph-loop`
- **UI/frontend polish** → Load `ui-ux` or `ai-ui-generation`
- **Browser automation** → Load `cdp-browser-automation`
- **Data narratives/charts** → Load `data-storytelling`
- **Video workflow** → Load `video-production`

**Do not load skills** for: simple edits, known config changes, straightforward implementation from existing plans.

Use `~/.agents/skills/INDEX.md` before loading skill bodies. Load one primary skill by default, plus at most one focused review or safety lens when justified.

## Git Safety

- Inspect status and diffs before staging or committing.
- Stage explicit files only; do not use `git add .` or `git add -A`.
- Do not stage secret-bearing files: `.env`, `*.pem`, `*.key`, `auth.json`, `credentials.json`.
- Do not run destructive operations such as `git reset`, `git restore`, `git clean`, `git stash`, or force push unless explicitly approved.
- Commit and push require separate user approvals.

## Process Management

- Do not kill or restart processes in zellij, tmux, or screen sessions.
- Do not start background processes with `&` or `nohup`.
- For server issues, identify and report the process or failure; do not restart it.

## Shell Invocation

Use a login shell for CLI commands when PATH or shell startup files matter:

```bash
$SHELL -l -c "swarminator --help"
```
