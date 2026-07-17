# AGENTS.md — Universal Agent Instructions

> Entry point for any AI agent harness working in this repository.
> Kilo uses `instructions/agent-instructions.md`; all other harnesses (Claude, Codex, Gemini/Antigravity, Hermes, etc.) use this file.

## Project

Personal dotfiles and AI-agent infrastructure (rules, skills, workflows, memory) for cross-harness agent development.

## Source of Truth Hierarchy

```
AGENTS.md (this file — product constraints, operating rules, harness wiring)
  └─ rules/INDEX              → rule bodies (load on trigger, not upfront)
      └─ skills/INDEX.md      → SKILL.md → references/*
```

**Do not bulk-load every rule or skill.** Use `rules/INDEX` as the map; load a rule body only when its trigger fires.

## Rules (always-on pointers)

These rules apply automatically. Read `rules/INDEX` for the full map; load a rule body only when its trigger fires or you must enforce a gate.

| Rule | Applies to | File |
|---|---|---|
| Code Quality Baseline | Every file you write or modify | `rules/code-quality.md` |
| Grooming (Reverse Interview) | Plans, complex tasks | `rules/grooming.md` |
| Ubiquitous Language | Logic modification | `rules/ubiquitous-language.md` |
| TDD | Logic modules, services, algorithms | `rules/tdd.md` |
| Vertical Slicing | Feature plans, checklists | `rules/slicing.md` |
| Skill Compliance | After loading any skill | `rules/skill-compliance.md` |
| Self-Grounded Verification | Verification, self-review, "done" claims | `rules/self-grounded-verification.md` |
| Autonomy Safety | Auto-approved tools, AFK, waived prompts | `rules/autonomy-safety.md` |
| Memory | Session save/restore, dream cycle, eviction | `rules/memory.md` |
| **Git Safety** | **All git operations (staging, committing, pushing)** | **`rules/git-safety.md`** |

## Skill Routing

**Default for implementation tasks: load `code-craft`.** Use `skills/INDEX.md` to select one primary skill; optionally add one review/safety lens.

Loading or reading a skill's `SKILL.md` is a binding commitment to execute its complete workflow. See `rules/skill-compliance.md`.

## Git Safety (summary — full rule in `rules/git-safety.md`)

- Inspect status and diffs before staging or committing.
- Stage explicit files only; never `git add .` or `git add -A`.
- Do not stage secret-bearing files (`.env`, `*.pem`, `*.key`, `auth.json`, `credentials.json`).
- No destructive git operations without explicit user approval.
- **Pre-commit memory checkpoint**: before committing, check for unconsolidated short-term memory and run the dream cycle. See `rules/git-safety.md` for the full procedure.
- Commit and push require separate user approvals.

## Process Management

- Do not kill or restart processes in zellij, tmux, or screen sessions.
- Do not start background processes with `&` or `nohup`.
- For server issues, identify and report — do not restart.

## Shell Invocation

Use a login shell for CLI commands when PATH or shell startup files matter:

```bash
$SHELL -l -c "command --help"
```
