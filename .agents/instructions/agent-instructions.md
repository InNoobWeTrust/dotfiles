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
```bash
zsh -l -c "echo 'Analyze git changes: staging scope, secret risks, unrelated file risks' | kilo-swarm -d ~/.agents/skills/swarm-intelligence/references/domains/code/config.json"
```

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
zsh -l -c "kilo-swarm -d domain/config.json -i input.txt"

# INCORRECT — may miss ~/.local/bin
kilo-swarm -d domain/config.json -i input.txt
```

---

## Fallback Agent Modes

Use only when task is simple and well-scoped (neither pillar applies):

| Task | Agent | Model |
|------|-------|-------|
| Serious coding | `code` | `openai/gpt-5.4`, xhigh |
| Trivial edits (typos, tiny refactors) | `fastcode` | `minimax-coding-plan/MiniMax-M2.5-highspeed` |
| Critical review | `review` | `openai/gpt-5.4`, xhigh |
| Architecture / design | `senior-architect` | `github-copilot/claude-sonnet-4.6` |
| Debugging / root cause | `debug` | `minimax-coding-plan/MiniMax-M2.7-highspeed` |
| Research / exploration | **Use swarm** | `kilo-swarm -d domains/code/config.json` |

For research and exploration: do NOT use dedicated agents — use `kilo-swarm` with `code` domain instead.