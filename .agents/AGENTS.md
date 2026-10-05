# AGENTS.md — Universal Agent Instructions

> Universal entry point for all AI agent harnesses (Kilo, Claude, Codex, Gemini/Antigravity, Hermes, etc.) working in this repository.

## Project

Personal dotfiles and AI-agent infrastructure (rules, skills, workflows, memory) for cross-harness agent development.

**Operating trajectories:** Distinguish between:
1. **Software Engineering Delivery** (phased, MVP-first, TDD, slicing, `code-craft` for production codebases and multi-component systems).
2. **Scientific Research & Exploratory Ideation** (first-principles, hypothesis tournaments, literature-grounded synthesis, unconstrained proposal ideation via `research-ideation`). Never apply production coding bureaucracy, TDD, or premature verification freezes to scientific research ideation.
3. **Fast-Path / Utility Scripting & Automation** (dotfiles, CLI utilities, single-file scripts, glue code, local automation, bounded bugfixes).
   - **Principle: Proportionality.** The ceremony must never exceed the deliverable. A 30-line script must not trigger multi-phase plan files, clean-room TDD subagent isolation, or formal DTO class hierarchies.
   - **Bypasses:** Bypasses sharded phase files, Clean-Room TDD subagent delegation, formal DTO schemas, and multi-file plans.
   - **Verification:** Direct execution with observable output (`run_command` with sample inputs) replaces formal test suites.

## Source of Truth Hierarchy

```
AGENTS.md (this file — product constraints, operating rules, harness wiring)
  └─ rules/INDEX              → rule bodies (load on trigger, not upfront)
      └─ skills/INDEX         → SKILL.md → references/*
```

**Do not bulk-load rules or skills.** Use `rules/INDEX` as the map, load a rule body only when its trigger fires, and load a skill reference only when its workflow requires it.

## Core Principles

- Treat the triggered rules in `rules/INDEX` as binding; load the applicable body before acting.
- Verify tool outcomes, protect secrets, and use the repository's quality and verification gates.
- Choose the correct operational trajectory: use Phased Delivery / Slicing for production software engineering, first-principles scientific inquiry for research, or Fast-Path / Proportionality for scripts, tooling, and quick fixes.

## Informed Alignment (universal invariant)

A decision is material when it changes user-visible behavior, data semantics, security/privacy, compatibility, operational cost, reversibility, or architecture boundaries. The explain-first minimum below applies to every material decision, whether based on main-thread investigation or delegated work.

- **Exploratory dialogue vs. commitment gate**: Distinguish active problem exploration (Q&A) from commitment gates. In active Q&A, keep turns conversational ("ping-pong") in the main thread (never delegate collaborative discovery); explain context proportionally (1–2 sentences framing the specific trade-off) and address one architectural layer per turn (macro-consistency before micro-signatures). Do not go "all-in" or dump a monolithic brief mid-dialogue.
- **Before asking for a material decision (commitment gate)**:
  - Explain verified facts vs. inferences vs. unknowns in plain language.
  - Define decision-relevant technical terms before using them in questions.
  - Give one concrete project-specific example or small before/after flow when the abstraction is non-obvious.
  - State why the decision matters and the practical consequences of the options.
  - Ask only genuinely unresolved decisions; 3–5 questions is a maximum for deep interviews, never a quota.
- **After answers**: restate the resulting model and remaining uncertainty. Request explicit decision confirmation only when a material unresolved decision exists; quick clear tasks with no material unresolved decision proceed without ritual confirmation.
- **Revalidation**: an answer given without adequate context is non-binding. If that happens, explicitly say the earlier answer lacked context, present the missing context, and ask the user to confirm or change that decision; never silently upgrade the old answer.
- **Evidence discipline**: never expose chain-of-thought, raw subagent transcripts, or orchestration noise; report only a concise evidence summary leading to the decision.
- Full sequence lives in `rules/grooming.md`. Keep quick tasks proportional; do not gate when intent, scope, verification, and safety are already clear.

## Skill Routing

Match user **intent** against skill descriptions in `skills/INDEX` to select one primary skill; optionally add one review/safety lens.

**Scientific research, literature synthesis, hypothesis generation, or paper proposals:** load `research-ideation`. In this trajectory, bypass software-engineering roadmaps, TDD, slicing, and administrative terminology freezes. Encourage bold, first-principles "what-if" thinking, cross-modality analogies, adversarial hypothesis tournaments, and falsifiable experiment designs.

**Rewrite / overhaul / delete-and-rebuild work:** load Grooming, then `code-craft`. Before implementation, identify each old semantic/interface as **delete** or **preserve**; when a public API or consumer app is affected, require an approved consumer-facing contract/stub and sign-off. **Backward compatibility is never assumed:** always ask the user before acting whether backward compatibility is required for the specific task and repository instead of auto-deciding to create or retain shims/forwarders.

**Software implementation routing:**
- **Production codebases, multi-file features, architectural refactors:** load `code-craft` as the baseline.
- **Fast-path utility scripts (<100 lines), shell tools, dotfiles configurations, or bounded local fixes:** execute directly under Trajectory 3 (Fast-Path). Do not load heavyweight `code-craft` tracks or force multi-phase ceremony on self-contained scripts. Write clean, idiomatic code, run it to verify output, and deliver.

**Modifying `.agents/`, skills, or rules: load `skill-author`.** Whenever creating, modifying, editing, or auditing skills, rules, or governance files under `.agents/`, you MUST load `skill-author` as your primary skill and follow official specs at https://agentskills.io and https://agents.md.

**High-frequency skills** (load on matching intent):
- `research-ideation` — scientific research, paper reproduction, hypothesis tournaments, research proposals
- `systematic-investigation` — debugging, root cause, "why is this broken"
- `codebase-exploration` — unfamiliar repo, "where is X," trace call chains
- `reviewer` — explicit review/audit/check requests, security lens, edge-case analysis
- `skill-author` — creating/modifying/auditing skills, rules, or `.agents/` governance

Activating a skill by reading its `SKILL.md` is a binding commitment to execute its smallest applicable workflow. Catalog/index inspection for routing is not activation. See `rules/skill-compliance.md`.

## Git Safety (summary — full rule in `rules/git-safety.md`)

- Never stage, commit, push, or use destructive Git actions without the required explicit approval; inspect status and diffs first.
- Stage explicit non-secret files only; never use `git add .` or `git add -A`.
- Never commit host-specific absolute paths (`/Users/...`, `/home/...`, `file:///...`); all internal links and references in committed files must be portable and relative.
- Inspect `git diff --staged` directly to ground commit messages in actual code deltas, never chat assumptions.
- Inspect `git log` history before drafting commit messages to match repository style.

## Process Management

- **Long-running commands & background tasks:** Prioritize terminal multiplexers (`tmux`, fallback to GNU `screen` if absent) over harness background tasks or ad-hoc backgrounding (`&`, `nohup`). See `rules/execution-safety.md`.
- **Namespacing:** Always prefix agent-spawned sessions with `agent-` (e.g., `agent-devserver`) and redirect stdout/stderr to `/tmp/agent-<name>.log`.
- **User session protection:** Never kill, hijack, or alter user processes or existing sessions in zellij, tmux, or screen. Only manage agent-created `agent-*` sessions.
- **Read-Only Sandboxing (`bwrap`):** Default to wrapping shell commands with read-only intentions in `bwrap` whenever available (Linux/WSL/Devcontainer). Sandbox write violations (`Read-only file system`) are positive proof of unexpected side-effects—halt and debug the command rather than bypassing the sandbox. See `rules/execution-safety.md`.
- **Server issues:** Identify and report — do not restart unexpectedly.
