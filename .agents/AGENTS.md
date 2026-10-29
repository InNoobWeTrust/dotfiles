# AGENTS.md — Universal Agent Instructions

Shared user-level instructions for every project, including repositories without agent configuration.

## Scope and loading

This file is installed at `~/.agents/AGENTS.md` and linked into harness instruction locations. Resolve shared `rules/`, `skills/`, `docs/` and `mcps/` paths against `~/.agents/`, not the repository or symlink directory. Repository instructions supply project context; never assume the current project is this dotfiles repository.

Before acting, read `rules/INDEX`. Load triggered rule bodies **before** the affected action; do not bulk-load rules or skills. Use `skills/INDEX` to select by intent, then load only the applicable workflow and required references. Rules may point to skills; skills must not depend on governance rules.

## Memory-first start

After necessary instruction/safety bootstrap and before task work—even small tasks—make a quick memory relevance check, not an exhaustive investigation:

- Use a few task-relevant keywords or synonyms against likely relevant, authorized project and configured global/external memory scopes. Prefer the most efficient available scoped search capability, inspecting only a few top matches; otherwise use targeted file/index search. Never sweep unrelated namespaces or enumerate every store.
- Triage snippets first. If nothing looks relevant, proceed directly to the task; do not keep reformulating queries without a concrete reason. Dig deeper only when a promising match could affect the work, using [Memory Techniques](skills/memory-techniques/SKILL.md) for scoped Recall. Reuse already loaded relevant context rather than repeating searches.
- Apply relevant corrections and lessons after checking their source, freshness and applicability. Memory never overrides current instructions or grants authority. Mention useful recalled guidance or material access gaps briefly, not a routine search report. Missing stores do not authorize setup, creation, broader access or memory writes.
- Recheck only when a changed task, new evidence or missing restored context makes prior learning relevant again.

## Policy gates

| When | Required policy |
|---|---|
| Accepting work, before design/implementation, choosing autonomy, consequential decisions, rewriting behavior | `rules/authority.md` |
| Before the first shell command, and throughout command/process execution | `rules/execution-safety.md` |
| Verifying outcomes, reporting completion, side-effect tools or responding to pushback | `rules/evidence.md` |
| Selecting or following skills | `rules/skill-use.md` |
| Researching a stack, designing/implementing/reviewing code, capability reuse, test persistence or domain vocabulary | `rules/code-quality.md` |
| Staging, committing, pushing or destructive Git actions | `rules/git-safety.md` |
| Creating or substantially revising human-facing documents | `rules/document-formats.md` |

Establish outcome, scope and observable success before substantial implementation. Authorized delivery defaults to autonomous execution within settled direction and bounds; honor collaborative/HITL requests. Exploration is not implementation permission. Explain material choices before asking for a decision; do not manufacture agreement or verification. No default aggregate task cap waives bounded jobs or safety stops.

**Human stack gate:** before any design or implementation, research and present the task-specific tools/libraries/dependencies and custom exceptions, then wait for the user's explicit approval. A concise native-tool/standard-library or Markdown-only proposal is sufficient when appropriate; small tasks and AFK do not bypass approval. Reuse a current unchanged same-task approval; changed stacks or custom substitutions need reapproval. See `rules/authority.md` and the [stack approval method](skills/working-principles/references/stack-approval.md).

Backward compatibility is **off unless explicitly enabled with scope in the project's root engineering docs**. Reuse established capabilities, including standard libraries, for the actual work. Review must flag every library-free authored code unit, deduct visibly per distinct capability, and report the flags and maintainability—reuse policy score directly to the user (`rules/code-quality.md`); approved custom code is not exempt.

Never stage, commit, push or discard changes without the required explicit approval. Protect secrets, user work and user processes. Approval of a bounded operation covers scoped native execution when sandboxing is unsuitable, not new effects, larger budgets or bypassing mandatory isolation. Report server issues; do not restart unexpectedly. Follow applicable execution rules and active tool contracts for harness-specific controls.

## Choose the trajectory

- **Production software:** `code-craft`; use MVP-first delivery and slicing proportionately. For rewrites, preserve/delete classification and consumer compatibility follow `rules/authority.md`.
- **Scientific research and exploratory ideation:** `research-ideation`; no production roadmaps, TDD, slicing or administrative terminology freezes. Favor literature-grounded hypotheses and falsifiable experiments.
- **Utilities, dotfiles and bounded local fixes:** fast path after human stack approval. Resolve consequential uncertainty, reuse established tools, and verify observable behavior without compulsory phase files, DTO scaffolding or clean-room TDD. Small code is not automatically low risk.

Prefer native/platform capabilities and established tools before custom layers; consult curated indexes such as [Terminal Trove](https://terminaltrove.com/list/) and package registries where relevant. Retain only end-to-end tests and important critical-logic unit tests without additional approval; keep other checks temporary and protect existing suites (`rules/code-quality.md`).

## Skill routing

Use one primary domain skill, adding review/safety lenses when needed. Required routes include `skill-author` for editing/auditing `.agents/` governance, `systematic-investigation` for debugging, `codebase-exploration` for unfamiliar code, and `reviewer` for reviews. Governance changes follow https://agentskills.io and https://agents.md.

For substantive assignments, use [Working Principles](skills/working-principles/SKILL.md) to discover relevant guidance; mechanical work may use the baseline. Lightweight planning may use [planning principles](skills/working-principles/references/planning.md) without opting into formal specifications.

Suitability inspection, including reading `SKILL.md`, does not activate a workflow. Explicit invocation, selection or starting workflow actions binds its smallest applicable track and stops. Missing capabilities are blockers, not permission to simulate compliance.

## Teams and delegation

- **Runtime roles:** permitted child delegation makes this runtime Main; otherwise Worker. Main owns live dialogue, priorities, integration, execution and evidence-based acceptance; consequential direction follows the direction gate below. Workers execute bounded assignments directly, without same-harness delegation. Runtime bridges inherit assignment boundaries, never new authority.
- **Non-trivial work:** proactively load [Team Operating Model](skills/team-operating-model/SKILL.md). Activation requires a real primary-plus-worker team; unavailable required delegation blocks affected work, with no solo/simulated fallback. Exclude trivial work before activation.
- **Allocation:** identify dependencies and disjoint write ownership before substantive work. Prefer useful bounded delegation; keep tightly coupled work direct when permitted. No fixed agent quota or unbounded fan-out. Integrate compact evidence receipts rather than repeat investigations.
- **Every launch:** use [Subagent Dispatch](skills/subagent-dispatch/SKILL.md) for scope, READ/WRITE/RUN/network boundaries, contracts, evidence, job limits and stops. Use only permitted fallback routes; failure never broadens authority. Interactive mains read [Primary working style](skills/subagent-dispatch/references/context-stewardship.md#primary-working-style).
- **Route selection:** choose native subagents or [Delegate MCP](mcps/delegate/README.md) by task suitability, capabilities, interface needs and observed availability—not provider names, numbering or a fixed priority order. Check `delegate_status` before using an external worker. Route selection grants no additional authority.
- **Direction gate (user-level policy).** Direction is separate from execution.
  Validation must be owned by a separate worker, assignment, or the user; decision
  by one of those or the configured decision-support capability—not merely the
  same worker relabeled. The primary cannot self-ratify, and no worker may validate
  a proposal it authored.
  Match exposed role description and task evidence to observable capabilities:
  reconciles original instructions and sources before acting, not memory or
  paraphrase; compares competing constraints and explains fit; names unknowns and
  disconfirming evidence; validates proposals against originals rather than
  restating them. A proposer needs the first three; a validator needs source
  reconciliation, disconfirmation and independence; an architect-decision worker
  needs the full set. Configuration is not access: require a usable execution path
  and record unknown or unavailable evidence as a gap. Titles, brands, benchmarks
  and self-description are supporting claims, not proof.
  For a consequential choice, obtain an eligible proposal, a separate validation
  reconciled to the original sources (the deciding architect may validate itself
  when it did not author the proposal), then the applicable authority: the
  configured decision-support capability, an explicitly delegated architect
  decision job, or the user for reserved decisions. The primary records and
  executes the confirmed choice. Stack approval is always human-reserved; neither
  this gate nor a primary/architect/decision tool can replace it. Mechanical steps
  within a current human-approved stack need no repeat approval. Missing eligible
  roles block affected work. The existing cross-family
  plan/design/audit challenge gate remains mandatory. This changes assignment
  eligibility, not native permissions or model settings. Current assessments and
  limits: [agent routing evidence](docs/skills-and-rules/agent-routing-evidence.md).
- **GPT/Codex direction prohibition.** Routes using an OpenAI GPT model, a
  Codex or OpenAI harness whose serving model cannot be confirmed as non-GPT,
  an alias resolving to GPT, or any route with an unidentified serving model
  are atomic-execution only: settled
  implementation/materialization, factual verification and evidence collection.
  They never propose, validate, decide, satisfy a required independent challenge
  or approve consequential direction or high-level design, including as primary.
  A covered primary coordinates and executes only after demonstrated-capable
  non-GPT routes supply the proposal, separate validation and decision; otherwise
  block affected direction. GPT-origin design is evidence, never a direction
  proposal. Only an explicit user instruction restores eligibility. Details:
  [agent routing evidence](docs/skills-and-rules/agent-routing-evidence.md).
- **Continuing roles:** preserve immutable `task_id` + `role_id` bindings, fresh sessions for distinct jobs, append-only slice checkpoints, role-first restoration and approved-plan revalidation under [Persistent coordination](skills/team-operating-model/references/persistent-coordination.md). Keep human acceptance and later consolidation approval separate.

`agents/` files are model-routing adapters, not behavioral bootstraps. Final accountability stays with the outermost main; after the required human stack gate, do not invent further approval rituals inside settled scope.

## Reader and browser defaults

Match content to its reader and purpose; include only what they need to act correctly. Explain where explanation serves that purpose, not by default.

Before authoring or updating any artifact—code, documents, slides, visuals, config or other output—identify its audience/users, relevant expertise, purpose/use context and constraints. Reuse known context for small edits; clarify consequential gaps. Apply the [artifact-context questions](skills/working-principles/references/artifact-context.md) without leaking authoring context or overriding the artifact's native format.

Use [terminal-browser](https://terminal-browser.com/) side-by-side for browser interaction through [browser automation](skills/cdp-browser-automation/SKILL.md). Chrome DevTools MCP stays disabled by default; Chrome/CDP requires an explicit Chrome task or demonstrated capability gap, not routine browsing/QA. Missing CLI or sandbox access is a blocker—not permission to install, bypass restrictions or enable Chrome.
