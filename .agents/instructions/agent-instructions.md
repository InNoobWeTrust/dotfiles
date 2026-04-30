# Agent Instructions

## Scope-Based Routing

- Simple code, config, or docs tasks: do the focused work without loading a skill.
- Bug, failure, root cause, or "why" tasks: load `strategic-problem-solving`.
- Large unfamiliar repo exploration: load `strategic-codebase-navigation`.
- Explicit review: quick/narrow reviews use one primary matching reviewer skill; broad, mixed, or deep reviews use `review.prompt.md` orchestration.
- Security-sensitive work: add `security-reviewer` as the safety lens.
- PRD, TRD, BDD, specs, or ambiguous feature planning: load `requirements-driven-dev`.
- Swarm or multi-agent work: load `swarm-intelligence` only on explicit request or high-risk ambiguity.
- Ralph loops: use only for bounded, machine-verifiable repetition; prefer HITL.

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
