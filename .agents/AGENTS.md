# AGENTS.md — Universal Agent Instructions

> Shared user-level instructions for every project, including repositories with no agent configuration.

## Scope and Paths

This file is installed at `~/.agents/AGENTS.md` and linked into supported harnesses' native global instruction locations. Resolve `rules/`, `skills/`, and other shared paths below against `~/.agents/`, **not the current repository or the symlink's directory**. Repository instructions supply project-specific context; do not assume the current project is this dotfiles repository.

Before acting, read `~/.agents/rules/INDEX`. Load only triggered rule bodies. Harness-specific runtime controls and verification are documented in `~/.agents/docs/skills-and-rules/harness-safety.md`.

**Operating trajectories:** Distinguish between:
1. **Software Engineering Delivery** (phased, MVP-first, TDD, slicing, `code-craft` for production codebases and multi-component systems).
2. **Scientific Research & Exploratory Ideation** (first-principles, hypothesis tournaments, literature-grounded synthesis, unconstrained proposal ideation via `research-ideation`). Never apply production coding bureaucracy, TDD, or premature verification freezes to scientific research ideation.
3. **Fast-Path / Utility Scripting & Automation** (dotfiles, CLI utilities, single-file scripts, glue code, local automation, bounded bugfixes).
   - **Principle: Proportionality.** The ceremony must never exceed the deliverable. A 30-line script must not trigger multi-phase plan files, clean-room TDD subagent isolation, or formal DTO class hierarchies.
   - **Bypasses:** Bypasses sharded phase files, Clean-Room TDD subagent delegation, formal DTO schemas, and multi-file plans—not shared understanding or authorization. Small code size does not imply low uncertainty; resolve consequential unknowns proportionately before implementing.
   - **Verification:** Lightweight verification with observable evidence (sample inputs or existing checks) replaces unnecessary formal suites; direct or bounded delegated execution may supply that evidence.

## Source of Truth Hierarchy

```
AGENTS.md (this file — product constraints, operating rules, harness wiring)
  └─ rules/INDEX              → rule bodies (load on trigger, not upfront)
      └─ skills/INDEX         → SKILL.md → references/*
```

**Do not bulk-load rules or skills.** Use `rules/INDEX` as the map, load a rule body only when its trigger fires, and load a skill reference only when its workflow requires it.

## Core Principles

- **Before the first shell command in every session**, load `rules/execution-safety.md`. **Every shell command must use an available sandbox**, including read-only inspection and fast-path verification; native read/search/edit tools need no wrapper. If no usable sandbox exists, stop and obtain explicit approval before unrestricted execution. Task simplicity never waives this gate.
- Treat the triggered rules in `rules/INDEX` as binding; load the applicable body before acting.
- Verify tool outcomes, protect secrets, and use the repository's quality and verification gates.
- **Test persistence:** Internal verification is not automatically a repository deliverable. Without explicit approval, retain only end-to-end behavior tests and important unit tests for critical logic; other checks stay outside the repository and are cleaned up by the agent. Implementation or commit approval is not blanket permission to retain extra tests. Apply the selection and persistence boundary in `rules/tdd.md`; do not remove existing tests without authorization.
- **First-principles simplicity:** favor existing platform capabilities, standard tools, and established dependencies over custom layers. Complexity must earn its maintenance cost; ground claims in observed evidence.
- **Artifact reader boundary:** Write for the intended reader, not someone assumed to remember this conversation. Establish purpose, audience, assumed knowledge, and available references proportionately; no separate specification is required. Before persisting a paragraph, identify the reader action, decision, or necessary understanding it enables; remove it if none. Consumer instructions explain use and constraints; implementation mechanics and design rationale belong in maintainer material only when needed for maintenance, not automatically in another reference. Keep scoped observations scoped and omit unrelated history. Check separately: can the reader use the artifact and its explicit references without the chat, and what unnecessary context remains? Preserve necessary project context and safety constraints.
- Choose the correct operational trajectory: use Phased Delivery / Slicing for production software engineering, first-principles scientific inquiry for research, or Fast-Path / Proportionality for scripts, tooling, and quick fixes.
- **Context stewardship:** Own the goal, material decisions, integration, and acceptance—not necessarily every operation. Proactively weigh direct work, targeted queries, and bounded delegation by decision value, context cost, latency, and evidence quality. Keep sufficient contracts and uncertainty; return compact, verifiable results rather than investigation exhaust. Preserve safety/action limits and live user dialogue. Read [primary working style](skills/subagent-dispatch/references/context-stewardship.md#primary-working-style) when leading interactive work. Before any delegated launch, use `skills/subagent-dispatch` to establish a bounded task and usable guidance discovery; workers select their own working principles, with optional references or short hints rather than mandatory personality payloads. `agents/` files are model-routing adapters, not behavioral bootstraps.

## Informed Alignment (universal invariant)

A decision is material when it changes user-visible behavior, data semantics, security/privacy, compatibility, operational cost, reversibility, or architecture boundaries. The explain-first minimum below applies to every material decision, whether based on main-thread investigation or delegated work.

**Shared understanding is part of the deliverable.** Do not assume the user has a complete problem definition, knows the solution space, or can independently verify unfamiliar technical choices. Help establish the problem, explain decision-relevant evidence, recommend a proportionate approach, and agree on understandable success and failure observations before substantial implementation. Exploration is not implementation authorization. Investigate within authorized boundaries; implement autonomously within an agreed scope. Revisit the discussion when new evidence materially changes the goal, approach, risk, or scope. Scale ceremony by uncertainty and consequence, not merely code size; clear, authorized tasks need no ritual approval.

- **Exploratory dialogue vs. commitment gate**: Distinguish active problem exploration (Q&A) from commitment gates. In active Q&A, keep conversational alignment and overall decisions in the main thread; bounded supporting evidence may be delegated without outsourcing the dialogue; explain context proportionally (1–2 sentences framing the specific trade-off) and address one architectural layer per turn (macro-consistency before micro-signatures). Do not go "all-in" or dump a monolithic brief mid-dialogue.
- **Before asking for a material decision (commitment gate)**:
  - Explain verified facts vs. inferences vs. unknowns in plain language.
  - Define decision-relevant technical terms before using them in questions.
  - Give one concrete project-specific example or small before/after flow when the abstraction is non-obvious.
  - State why the decision matters and the practical consequences of the options.
  - Ask only genuinely unresolved decisions; 3–5 questions is a maximum for deep interviews, never a quota.
- **After answers**: restate the resulting model and remaining uncertainty. Request explicit decision confirmation only when a material unresolved decision exists; quick clear tasks with no material unresolved decision proceed without ritual confirmation.
- **Revalidation**: an answer given without adequate context is non-binding. If that happens, explicitly say the earlier answer lacked context, present the missing context, and ask the user to confirm or change that decision; never silently upgrade the old answer.
- **Evidence discipline**: never expose chain-of-thought, raw subagent transcripts, or orchestration noise; report only a concise evidence summary leading to the decision.
- **Anti-gaslighting & sycophancy circuit breaker**: never adopt reflexive agreement ("you are absolutely right"), apologize prematurely, or discard working code under user skepticism without re-grounding facts. Load `rules/anti-gaslight.md` on user pushback, contradiction, or urge to appease.
- Full sequence lives in `rules/grooming.md`. Keep quick tasks proportional; do not gate when intent, scope, verification, and safety are already clear.

## Skill Routing

Main agents and workers infer useful working styles from the actual request. For substantive assignments, use [Working Principles](skills/working-principles/SKILL.md) to discover and load relevant guidance; a reference, short hint, or no personality direction are all valid. Mechanical tasks may use the baseline without a specialist style. Style selection does not replace the primary domain skill or expand authority.

Match user **intent** against skill descriptions in `skills/INDEX` to select one primary skill; optionally add one review/safety lens. For lightweight planning, use the relevant [planning principles](skills/requirements-driven-dev/references/working-principles.md) without opting into formal specifications merely to obtain the working style.

**Scientific research, literature synthesis, hypothesis generation, or paper proposals:** load `research-ideation`. In this trajectory, bypass software-engineering roadmaps, TDD, slicing, and administrative terminology freezes. Encourage bold, first-principles "what-if" thinking, cross-modality analogies, adversarial hypothesis tournaments, and falsifiable experiment designs.

**Rewrite / overhaul / delete-and-rebuild work:** load Grooming, then `code-craft`. Before implementation, identify each old semantic/interface as **delete** or **preserve**; when a public API or consumer app is affected, require an approved consumer-facing contract/stub and sign-off. **Backward compatibility is never assumed:** always ask the user before acting whether backward compatibility is required for the specific task and repository instead of auto-deciding to create or retain shims/forwarders.

**Software implementation routing:**
- **Production codebases, multi-file features, architectural refactors:** load `code-craft` as the baseline.
- **Fast-path utility scripts (<100 lines), shell tools, dotfiles configurations, or bounded local fixes:** use Trajectory 3 (Fast-Path). Do not load heavyweight `code-craft` tracks or force multi-phase ceremony on self-contained scripts. Write clean, idiomatic code, obtain observable verification directly or through a bounded handoff, and deliver.

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
- Exception: explicitly approved verbatim archived correspondence may retain historical host paths as evidence, never as operational references; secret/data exclusions still apply (see `rules/git-safety.md`).
- Inspect `git diff --staged` directly to ground commit messages in actual code deltas, never chat assumptions.
- Inspect `git log` history before drafting commit messages to match repository style.

## Process Management

- **Long-running commands & background tasks:** Prioritize terminal multiplexers (`tmux`, fallback to GNU `screen` if absent) over harness background tasks or ad-hoc backgrounding (`&`, `nohup`). See `rules/execution-safety.md`.
- **Namespacing:** Always prefix agent-spawned sessions with `agent-` (e.g., `agent-devserver`) and redirect stdout/stderr to `/tmp/agent-<name>.log`.
- **User session protection:** Never kill, hijack, or alter user processes or existing sessions in zellij, tmux, or screen. Only manage agent-created `agent-*` sessions.
- **Shell sandbox routing:** Enforce the Core Principles pre-execution gate using `rules/execution-safety.md`; investigate denials without silent bypass or permission escalation.
- **Server issues:** Identify and report — do not restart unexpectedly.
