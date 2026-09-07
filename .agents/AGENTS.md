# AGENTS.md — Universal Agent Instructions

> Universal entry point for all AI agent harnesses (Kilo, Claude, Codex, Gemini/Antigravity, Hermes, etc.) working in this repository.

## Project

Personal dotfiles and AI-agent infrastructure (rules, skills, workflows, memory) for cross-harness agent development.

**Operating principle:** Software delivery is phased and MVP-first; load the
Phased Delivery rule only when its delivery trigger applies.

## Source of Truth Hierarchy

```
AGENTS.md (this file — product constraints, operating rules, harness wiring)
  └─ rules/INDEX              → rule bodies (load on trigger, not upfront)
      └─ skills/INDEX.md      → SKILL.md → references/*
```

**Do not bulk-load rules or skills.** Use `rules/INDEX` as the map, load a rule body only when its trigger fires, and load a skill reference only when its workflow requires it.

## Core Principles

- Treat the triggered rules in `rules/INDEX` as binding; load the applicable body before acting.
- Verify tool outcomes, protect secrets, and use the repository's quality and verification gates.
- Delivery is phased and MVP-first; load Phased Delivery only when its trigger applies.

## Skill Routing

Match user **intent** against skill descriptions in `skills/INDEX.md` to select one primary skill; optionally add one review/safety lens.

**Rewrite / overhaul / delete-and-rebuild work:** load Grooming, then `code-craft`. Before implementation, identify each old semantic/interface as **delete** or **preserve**; when a public API or consumer app is affected, require an approved consumer-facing contract/stub and sign-off.

**Default for implementation tasks: load `code-craft`.** It is the baseline for ANY non-trivial code write, feature, refactor, or restructuring. Do not skip it because the task seems simple — if it touches logic, load it.

**Modifying `.agents/`, skills, or rules: load `skill-author`.** Whenever creating, modifying, editing, or auditing skills, rules, or governance files under `.agents/`, you MUST load `skill-author` as your primary skill and follow official specs at https://agentskills.io and https://agents.md.

**High-frequency skills** (load on matching intent):
- `systematic-investigation` — debugging, root cause, "why is this broken"
- `codebase-exploration` — unfamiliar repo, "where is X," trace call chains
- `reviewer` — explicit review/audit/check requests, security lens, edge-case analysis
- `skill-author` — creating/modifying/auditing skills, rules, or `.agents/` governance

Activating a skill by reading its `SKILL.md` is a binding commitment to execute its smallest applicable workflow. Catalog/index inspection for routing is not activation. See `rules/skill-compliance.md`.

## Git Safety (summary — full rule in `rules/git-safety.md`)

- Never stage, commit, push, or use destructive Git actions without the required explicit approval; inspect status and diffs first.
- Stage explicit non-secret files only; never use `git add .` or `git add -A`.

## Process Management

- Do not kill or restart processes in zellij, tmux, or screen sessions.
- Do not start background processes with `&` or `nohup`.
- For server issues, identify and report — do not restart.
