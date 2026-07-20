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

## Memory Recall (Before Routing)

**Before selecting a skill, exploring the codebase, or planning any multi-step task, run the `memory` skill's Recall mode.** Prior sessions may have already mapped the repo, identified constraints, or recorded decisions that eliminate entire investigation phases.

This means reading the repo-local memory files directly (`.agents/memory/short-term/` and `.agents/memory/long-term/` per `skills/memory/references/hierarchy-and-storage.md`), not any harness-specific memory tool. Memory is portable file state owned by the `memory` skill — any harness-provided memory feature is unrelated context, not authoritative here.

1. Resolve `MEMORY_DIR` (`<git-root>/.agents/memory/` if in a repo, else `~/.agents/memory/`).
2. Grep `long-term/INDEX.md` and glob `short-term/*--<branch-slug>--*.md` for the current branch and 2-4 keywords from the request.
3. If a matching short-term entry or long-term topic is found, read it and use it to skip redundant file reads, inform skill selection, and surface prior constraints before planning.

This step is nearly free and can replace an entire codebase exploration phase. Do not skip it because a task "seems simple."

## Skill Routing

Match user **intent** against skill descriptions in `skills/INDEX.md` to select one primary skill; optionally add one review/safety lens.

**Default for implementation tasks: load `code-craft`.** It is the baseline for ANY non-trivial code write, feature, refactor, or restructuring. Do not skip it because the task seems simple — if it touches logic, load it.

**Modifying `.agents/`, skills, or rules: load `skill-author`.** Whenever creating, modifying, editing, or auditing skills, rules, or governance files under `.agents/`, you MUST load `skill-author` as your primary skill and follow official specs at https://agentskills.io and https://agents.md.

**High-frequency skills** (load on matching intent):
- `systematic-investigation` — debugging, root cause, "why is this broken"
- `codebase-exploration` — unfamiliar repo, "where is X," trace call chains (run Memory Recall first — prior sessions may have already mapped this)
- `reviewer` — explicit review/audit/check requests, security lens, edge-case analysis
- `skill-author` — creating/modifying/auditing skills, rules, or `.agents/` governance

Loading or reading a skill's `SKILL.md` is a binding commitment to execute its complete workflow. See `rules/skill-compliance.md`.

## Git Safety (summary — full rule in `rules/git-safety.md`)

- Inspect status and diffs before staging or committing.
- Stage explicit files only; never `git add .` or `git add -A`.
- Do not stage secret-bearing files (`.env`, `*.pem`, `*.key`, `auth.json`, `credentials.json`).
- No destructive git operations without explicit user approval.
- **Pre-commit memory checkpoint**: before committing, run `rules/memory-checkpoint.md` — suggest capturing session work not yet in short-term memory, then check for unconsolidated entries and run the dream cycle.
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
