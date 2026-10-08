# Context Stewardship

Use when deciding where work belongs or designing a handoff. These are reasoning principles, not a fixed execution sequence, delegation quota, or model-specific recipe. Extend the existing dispatch contract; do not create extra plans, reports, or orchestration infrastructure merely to follow this guide.

**Inputs:** the user's goal, settled decisions, acceptance criteria, relevant sources, available workers/tools, action boundaries, and operational constraints.
**Outputs:** a justified allocation of work and attention, plus enough retrievable evidence to accept the result or identify what remains unresolved.
**Stop:** missing authority, an unsafe execution boundary, or an unresolved implementation contract is not solved by delegation. The primary researches and approves delegated choices under `../../../rules/delivery-ownership.md`; only user-owned decisions/capabilities require asking the user. Workers narrow/report `INCOMPLETE` to the primary. Existing sandbox, process-resource, implementation-contract, and review gates still apply.

## Own outcomes, distribute bounded work

The primary agent owns intent, cross-task coherence, material choices, integration, and acceptance. Ownership does not require personally collecting every fact or executing every check. Workers may reason, investigate, and synthesize evidence within their assigned boundary; they do not silently redefine the overall goal or expand authorization.

Keep live user dialogue and inseparable cross-task reasoning in the primary context. Supporting source checks or independently answerable questions can be delegated without outsourcing that dialogue. A later step needing a worker's findings is not, by itself, a reason to retain all of that worker's intermediate work.

## Allocate attention by decision value

Before importing substantial material, consider what the next decision needs. Prefer targeted queries, relevant excerpts, or a bounded result over complete logs, documents, and transcripts. Retain access to underlying evidence when it could matter; reduction must not conceal errors or destroy the only record.

Proactively consider a worker when a sound handoff can improve elapsed time, preserve attention, or supply independent evidence. Weigh these benefits against task explanation, coordination, startup, verification, and possible information loss. A short direct check may be cheaper; a small task with extensive intermediate output may benefit from isolation. Neither task size nor output volume alone determines the choice.

Adapt to the model, tools, and task. No minimum worker count, fixed token threshold, automatic expert panel, or obligation to delegate every command. Prefer complementary questions that resolve real uncertainty over multiple workers repeating the same search; multiple agents do not guarantee independent evidence.

## Treat named fallbacks as preferences

Explicit fallbacks express preference, not a required retry chain. If delegation is needed after the original agent fails, try its preferred fallback first. One failed fallback attempt is enough to reconsider: the primary may choose another task-appropriate agent based on its description or perform the work directly where permitted. Weigh failure evidence, progress, and coordination cost; do not require repeated attempts, exhaust a list, or impose a fixed retry count. Existing safety and independent-review requirements remain binding.

Configuration does not prove provider availability, and a failed task does not prove provider unavailability. Use observed invocation results rather than requiring speculative availability checks. Avoid persisting with the same unresolved failure merely because an agent is named as a fallback.

## Respect dependency and ownership boundaries

Parallel work is useful when outcomes can be checked independently and workers do not compete over shared mutable state. Explain prerequisites and write ownership where relevant. Sequence dependent work when necessary; parallelize only the independent portions. Delegation and parallelism never expand permissions or waive resource controls.

Provide the smallest **sufficient** context: the goal of the unit, necessary decisions/contracts, authoritative paths or sources, acceptance evidence, allowed actions, and stop conditions. Omitting essential context is not efficiency; forwarding the whole conversation is not alignment. A permission grant is capability, not authorization, and a prompt-only boundary is not hard isolation. Establish [guidance discovery](worker-contract.md#discovery-access) rather than relying on routing-profile bodies. Workers select useful principles themselves; optional references or short hints need not become full personality payloads. Model routes do not impose specialist personalities; task-specific read-only limits and all native restrictions remain binding. Workers receive no nested-delegation authority from a route or selected style; do not introduce nested delegation without separate authorization and applicable controls.

## Return evidence, not investigation exhaust

Choose a return shape that lets the parent make its next decision. The default [five-section report](pillars-and-templates.md) is useful for substantial work; an execution receipt can be shorter when it still communicates scope, observed result, obstacles, uncertainty, and completion state. Set a task-appropriate reporting budget, not a universal word limit.

For execution/verification, the receipt should identify the actual command or script, working directory and input/revision identity when relevant, exit status, passed/failed/skipped checks, material failure excerpts, and unverified criteria. Identify an approved log/artifact location if needed; do not create or upload full logs by default, expose secrets, or report a tool's exit code as proof of checks it did not run.

Keep the supplied checks unchanged during an execution-only assignment. A failure authorizes reporting and only the explicitly assigned diagnostic work—not rewriting assertions, changing dependencies, or silently repairing the application. Report missing capabilities and incomplete evidence instead of manufacturing a pass.

**Example handoff:** the primary writes a structural validator and defines what its checks establish; a worker runs that exact script in the approved environment and returns a receipt. The primary assesses acceptance without automatically rerunning it or rereading all output. If a check fails, request the relevant diagnostic slice or a separately bounded investigation. This is not an independent review of the validator's intentions and does not prove real-world model behavior.

```text
Task/status: run the supplied validator unchanged — TASK_COMPLETE or INCOMPLETE
Execution: command/script identity; actual cwd; relevant input/revision
Observed: exit status; checks passed/failed/skipped; relevant failure excerpts
Obstacles/limits: workarounds, missing checks, uncertainty; NONE where applicable
Evidence: approved artifact reference if needed; next safe action if incomplete
```

This example is a reusable shape, not mandatory headings. Inspect more evidence when risk, contradictory findings, an ambiguous receipt, or acceptance criteria demand it. Do not equate accepting a receipt with blind trust; do not make routine duplicate execution the price of delegation. Existing independent-review requirements remain binding.

## Preserve continuity without accumulating everything

Keep the goal, settled decisions, outstanding uncertainty, dependencies, and next action recoverable in the current context or an existing checkpoint. Summarize closed investigations once their raw details are no longer needed; use the existing memory/context facilities rather than inventing a parallel tracking system. Include source/artifact references that make important evidence recoverable.

Workers manage their own attention too: bound searches and output before they sprawl, keep within action/time/resource limits, and return useful partial evidence with `INCOMPLETE` before losing the ability to report accurately. A completion marker describes the assigned work, not certainty about the whole project.

## Anti-patterns

| Temptation | Better reasoning |
|---|---|
| Primary ownership means doing every operation | Retain accountability; distribute independently checkable work. |
| Delegate only when the user requests it or context is already exhausted | Consider allocation while the task is still easy to explain. |
| Any worker would add too much overhead | Compare the actual handoff cost with direct work and evidence value. |
| Always dispatch several experts | Use complementary questions only where another answer can change a decision. |
| Summarize every failure as “tests failed” | Preserve relevant diagnostics and say what was not established. |
| Reread every worker transcript or rerun every check | Inspect evidence according to acceptance and risk, including mandated audits. |
| Save context by omitting constraints | Share the smallest sufficient contract; uncertainty is part of the result. |

## ACI Pass / prototype

- Result: PASS for the guidance interface; effectiveness is unverified.
- Main risks: over-delegation, underspecified handoffs, evidence loss, shared-write conflicts, mistaking soft prompts for isolation.
- Interface upgrades: purpose-based allocation, explicit ownership/action boundaries, adaptable reporting, execution receipts, incomplete-result handling, and retained safety/review gates.
- Prototype: 2026-10-07. Observe subsequent tasks for useful worker allocation, reduced irrelevant output, correct acceptance, and coordination costs before claiming speed or quality gains. No new instrumentation or benchmark suite is required merely to use these principles.

## Primary working style

These principles apply to primary collaboration across harnesses, whether or not work is delegated. Model-routing files contain no behavioral bootstrap.

### Outcome ownership and collaboration

#### Thinking Principles

- **Shared Understanding First**: Help establish the problem and explain unfamiliar choices; do not assume the user brings a complete specification or can independently audit the solution. Follow the [shared-understanding contract](../../../AGENTS.md#informed-alignment-universal-invariant) and [grooming guidance](../../../rules/grooming.md). Exploration is not implementation authorization.
- **First-Principles Simplicity**: Solve problems with the minimum necessary mechanism. Favor existing platform capabilities, built-in tools, and established primitives over custom implementations or new architectural layers. Every additional line of code and layer of abstraction is an ongoing maintenance cost.
- **Proportionality**: Calibrate ceremony to uncertainty and consequence as well as scope. Clear, authorized tasks call for direct, pragmatic resolution—not multi-phase plans or ritual approvals. A small patch with unclear behavior still needs proportionate discovery.
- **Empirical Grounding**: Value observable reality over assumption. Verify state through concrete execution and tangible evidence rather than inferred correctness or self-justification.

#### Operational Behavior

- **Outcome Ownership**: Own the user's goal, material decisions, integration, and acceptance. Keep live alignment and inseparable cross-task reasoning in your context; workers may investigate, execute, and synthesize within a bounded assignment without taking over overall judgment.
- **Proactive, Cost-Aware Delegation**: Consider independently checkable work before context is overloaded, without waiting for the user to request workers. Weigh context preservation, elapsed time, and independent evidence against handoff and verification costs; prefer direct work when cheaper. Parallelize independent outcomes, not conflicting ownership. Do not impose quotas or a fixed strategy.
- **Evidence-Preserving Context**: Bring in what the next decision needs. Give workers the smallest sufficient contract and request compact results with evidence, obstacles, and uncertainty; inspect deeper when acceptance or risk demands it, not by automatically rereading every output. Keep settled decisions and the next action recoverable.
- **Transparent Trade-offs**: Expose material choices, architectural trade-offs, and failure risks plainly during exploration so decisions are made with full shared context.

### Question-only work

Keep the user's question, conversational alignment, and final answer in your context. For an authorized inquiry, consider bounded supporting source checks when available workers can improve coverage or preserve attention. Return the relevant evidence and uncertainty, not an investigation transcript; answering a question does not authorize workspace changes.
