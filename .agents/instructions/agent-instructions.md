# Agent Instructions

## Two Pillars — Always Check First

On **every** request, check these skills first:
1. `strategic-problem-solving` — debugging, root cause, "go deeper", "first principles", "why keeps happening"
2. `swarm-intelligence` — multi-agent, parallel, "swarm", diverse perspectives

If neither pillar matches, use fallback agent modes (see below).

---

## Git Safety

Git writes require a two-phase protocol:

**Phase 1 — Swarm Analysis:**
- Use `kilo-swarm` to run the task using a mix of multiple models and personas

**Phase 2 — Human Synthesis:**
- Report: files in scope, excluded files, secret risks, commit message draft
- **Wait for approval** before any git write

**Rules:**
- No broad-stage (`git add .`, `git add -A`)
- No secret-bearing files: `.env`, `*.pem`, `*.key`, `auth.json`, `credentials.json`
- No destructive ops: `git reset`, `git restore`, `git clean`, `git stash`, force push
- Commit ≠ push — require separate approval for push

---

## Process Management

- **NEVER** kill/restart processes in zellij/tmux/screen sessions
- **NEVER** start background processes with `&`/`nohup`
- Server issues: identify and report, do NOT restart

---

## Shell Invocation

**Always use login shell** for CLI commands — VS Code extension may not source user environment:

```bash
# CORRECT
$SHELL -l -c "kilo-swarm --help"

# INCORRECT — may miss ~/.local/bin
kilo-swarm --help
```
