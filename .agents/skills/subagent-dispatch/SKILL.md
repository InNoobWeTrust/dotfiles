---
name: subagent-dispatch
description: "Use this skill before launching any delegated agent, background worker, or parallel task, or when asked to check periodically, monitor a long-running job, or remind the agent to check later. It routes delegation and periodic checks with bounded actions, output contracts, and explicit stop behavior. Do not use it to delegate sequential discovery whose intermediate work must remain in the main thread."
---

# Subagent Dispatch

Use this router before **every** delegated launch: named workers, model-route fallbacks, and workers defined on the fly. Routing profiles do not supply working principles. Read [Portable Worker Contract](references/worker-contract.md) to bound the assignment and establish usable guidance discovery. Workers select and load their own available working-style guidance; a reference or short hint is optional, and no personality direction is valid. Do not assume inherited skills, conversation, or system prompts.

## Allocation principle

Choose workers by task fit and available capability evidence, with selection effort proportionate to the assignment.

For provider retries, repeated tool failures, stalled workers, or model-route recovery, load [Worker Health Supervision](references/worker-health.md). Establish health bounds before launch; a foreground call that blocks the primary needs an independent runtime deadline or guard, not a promise to check later.

For periodic progress checks or delayed reminders, load [Periodic Progress Checks](references/periodic-checks.md). Prefer native background commands with completion notifications for bounded sleeps and simple shell checks; do not delegate merely to wait, execute supplied commands, or relay output. Assign an owner and arm a real wait or supported background wake-up before continuing other work; intent to remember is not monitoring. Neither synchronous nor native background checks require a subagent.

The primary owns intent, integration, execution, and acceptance—not every operation; consequential direction follows the active direction-eligibility policy. Proactively compare direct work, targeted queries, and bounded handoffs by context cost, latency, evidence quality, and coordination cost. Delegate when an independently checkable result is sufficient and the handoff helps; stay direct when intermediate interpretations are inseparable from current decisions or handoff overhead dominates. Later work needing a result does not require the primary to collect all its intermediate details.

Good candidates include bounded exploration, complementary research questions, approved implementation units, execution/verification, and independent review. Keep live user dialogue and cross-task judgment in the primary thread; workers may reason and synthesize within their assigned boundary. Choose parallelism by actual dependencies and ownership, not a quota. Named fallbacks express preferences, not mandatory retry chains; a failed attempt permits another suitable agent or direct work where allowed. For deeper guidance, fallback selection, or execution receipts, read [Context Stewardship](references/context-stewardship.md).

For substantive role selection or reuse after a quality incident, use targeted [Assignment outcomes](references/assignment-outcomes.md) recall from authorized existing memory. Capture a compact evidence-linked outcome when accepting, correcting, rejecting or interrupting an assignment; completion labels alone are not acceptance. Keep solution quality separate from provider health and primary-owned design choices.

For a requested cold-reader / “Goldfish” review, apply [fresh-context review dispatch](references/worker-contract.md#fresh-context-reviews-goldfish). A native child or external one-turn worker may qualify; verify the route and neutral inputs rather than equating a new session with isolation. This does not add a reviewer or stage to ordinary work.

## Four prompt pillars

1. **Precise scope**: exact deliverable, explicit out-of-scope boundary, and the smallest sufficient context with relevant contracts and sources.
2. **Structured output**: a task-appropriate result with observed evidence, obstacles, uncertainty, and completion state; the five-section report below is the default, not mandatory headings for a compact execution receipt.
3. **Obstacle reporting**: workarounds, environment quirks, and failed dependencies, or `NONE`.
4. **Allowed actions**: explicit READ, WRITE, RUN, forbidden-action, and network boundaries. This is a soft prompt contract; use environment permissions for hard isolation.

Read `references/pillars-and-templates.md` when wording a pillar or selecting a findings template.

## Dispatch routing and gates

Discover the current environment's available delegation interfaces and follow its applicable routing policy; this reusable skill does not prescribe a provider, transport or named worker. If that policy specifies a preferred route, use it when available and suitable; justify a fallback with observed failure, unavailability or a concrete capability/interface mismatch. Ordinary source reads or document checks do not need separately verified CPU/RAM/PID isolation merely because the worker is a CLI process. Bound scope, actions, concurrency, wall time and cancellation; retain any task-specific hard isolation requirements. Do not invent resource prerequisites for the assigned workload or expand it into recursive, fan-out or stress work without the required controls.

The primary may accept and version a plan/contract only after the active direction gate has settled consequential choices and, for implementation work, the human-approved stack receipt is present (researched proposal + explicit user approval + task/scope + approval source recorded); it records that direction and may not substitute its own. Workers cannot assume approval or invent changes. Direction-affecting contract defects return through the primary to the eligible authority, not automatically to the user. Human-reserved authority/safety gates remain with the user.

An assignment whose execution depends on settled direction must name the eligible proposal/validation/authority receipt, or the explicit source or confirmed contract that mechanically settles it; without one, return `INCOMPLETE`. Apply the planning source walkthrough before consequential implementation or dispatch: restate the original outcome and constraints, verify the factual claims, source versions and affected consumers from current sources, run a disconfirming check, and correct the contract before acting.

| Target | Mandatory gate | Read before launch |
|---|---|---|
| Planning | Name the desired depth and target; settle scope and affected consumer contracts. Use separate phases or exact file deltas only where handoff/resumption/ownership requires them. | `references/planning-payload-and-preflight.md` |
| Implementation | Select one approved coherent unit with a writable boundary, acceptance evidence and settled affected contracts. A broad plan is context, not executable scope. | `references/implementation-payload-and-preflight.md` |
| Review or exploration | Bound the question, context, actions, and evidence; do not implement adjacent findings. | `references/prompt-template-and-anti-patterns.md` |
| Execution / verification | Define the supplied check, expected evidence, authorized environment/actions, and failure boundary; do not silently alter checks or repair code. | `references/context-stewardship.md` |
| User-requirement conformance | For substantive delegated work or an explicit conformance request, assign a dedicated read-only subagent to check **every cumulative user requirement**, not just the latest instruction or the primary's checklist. | `references/worker-contract.md#dedicated-user-requirement-conformance` |

Planning and implementation must carry **human-approved materialization choices**—which libraries/tools and APIs implement each affected capability—not just core logic. Library/tool/API stack selections require the human stack gate (researched proposal presented, explicit user approval obtained, receipt recorded); the direction gate does not substitute for this human-owned approval. Local mechanics within the human-approved stack remain with the implementer. Read the [materialization contract](references/implementation-payload-and-preflight.md#materialization-choices--part-of-the-implementation-contract); preserve selections through decomposition, atomic patches, and fallback routes. Missing selections block implementation; incompatibility returns to the primary, never a silent substitution. Check actual reuse when accepting results.

For implementation, cite an approved plan/packet unit or an explicit inline atomic contract. Separate phase files are useful for independently resumable handoffs, not mandatory for every multi-file change. Respect approved behavior, consumer contracts and writable scope; return defects rather than inventing new business semantics or scope. Use exact signatures/schema where consumers need them and exact file deltas where ownership needs them. Classify rewrite semantics as **delete** or **preserve** and settle affected public consumer contracts before launch.

For phased work, use an available team-delivery contract or supply an inline phase contract with outcome, independently useful units, writable scope, evidence, stops and continuation state. Add delegation-specific writable scope, adjacent-finding handling, allowed actions and continuation state; do not duplicate the lifecycle.

## Cumulative requirement conformance

Implementation handoffs also carry the unit's current structural context and source-map freshness requirements under [Implementation payload](references/implementation-payload-and-preflight.md#structural-context--part-of-the-unit-handoff); unchanged boundaries need only a brief rationale. Return actual placement/dependency deltas for aggregate integration checks.

Preserve earlier compatible requirements when adapting to new information. The dedicated [conformance checker](references/worker-contract.md#dedicated-user-requirement-conformance) must cover audience, assumed knowledge, writing style, format, and constraints alongside functional goals. Recheck affected requirements after requirement/artifact revisions and require a current full receipt before final handoff; self-checks or generic quality reviews do not substitute.

## Host-side synthesis gate (mandatory before user-facing decision)

Delegated results are internal evidence, not shared context. Before synthesizing:

1. **Challenge gate (mandatory for plan/architecture/audit output).** Route delegated output through a **separate** challenger agent before synthesis. Select a capable listed model route from a **different provider family than the producer** (compare the provider prefix and the model family; same-prefix or same family challenger is a contract violation). `standard-review` is the working-principle identity, not an agent name. Plan/architecture/threat model → independent challenge with a pragmatic-triage lens (contract boundaries, realistic failure modes, evidenced blockers separate from optional refinements). Review/audit/scanner output → independent findings-skeptic challenge (independently verify cited defects against current source; expose false positives with evidence). Skip for factual research. Full routing table and procedure in `references/prompt-template-and-anti-patterns.md` step 4. When fanning parallel workers, span at least two provider families unless task constraints forbid it; never default all workers to the primary's own family.

2. **Synthesize.** Before requesting a material user decision grounded in delegated work, apply the planning source walkthrough above and the `Material decision brief` in `references/pillars-and-templates.md`. Use that brief for commitment gates, not active exploratory Q&A. Include challenge results and downgraded findings. Do not forward transcripts, expose chain-of-thought or ask questions dependent on unseen evidence. Verify unsupported claims or report gaps. Restate the chosen model and uncertainty after answers. Low-risk factual work needs only a proportional summary. Apply the receiving procedure in `references/prompt-template-and-anti-patterns.md`.

## Essential stop conditions

Do not launch without an unambiguous target, authorized scope, acceptance evidence and usable affected contracts, or to replace live user Q&A. Stop and report `INCOMPLETE` (`INCOMPLETE: CONTRACT_DEFECT` for unworkable contracts) when prerequisites or required approvals are missing, material decisions remain unresolved, or work would exceed the writable boundary. Never silently rescope or absorb adjacent units. Missing phase-file scaffolding alone is not a blocker for a bounded inline contract.

Missing required conformance capability, original requirement evidence, or a current all-requirement receipt blocks unqualified completion/readiness claims. Report gaps as `UNVERIFIED`; never silently drop a requirement to obtain PASS.

## Default report shape

For short execution-only work, a receipt may replace these headings if it preserves the same decision-relevant scope, evidence, obstacles, caveats, and completion state. Never reduce a failed run to an unexplained pass/fail label.

```markdown
## 1. Objective Recap
## 2. Findings
## 3. Obstacles Encountered (or NONE)
## 4. Confidence & Caveats
## 5. Done Signal
TASK_COMPLETE | INCOMPLETE + continuation/resumption state
```

`TASK_COMPLETE` means the assigned work is complete. `INCOMPLETE` must state completed work, current location, remaining steps, evidence, blockers, and the next safe action (for contract defects: use `INCOMPLETE: CONTRACT_DEFECT` with the flawed signature and proposed fix). Re-delegate only when missing evidence blocks the next decision or the output contract was materially violated.

## References

| Reference | Read when |
|---|---|
| `references/worker-health.md` | Before long/blocking delegation, or when provider retries, repeated tool calls, or fallback routes threaten productivity. |
| `references/periodic-checks.md` | Periodic checks, delayed reminders, or monitoring multiplexer/queue jobs while other work continues. |
| `references/worker-contract.md` | Before every named, fallback, or dynamic launch: establish task authority and guidance discovery; style direction is optional. |
| `references/worker-contract.md#dedicated-user-requirement-conformance` | Assigning the dedicated checker, preserving cumulative audience/style constraints, or rechecking after adaptation. |
| `references/planning-payload-and-preflight.md` | Preparing or validating an L0/L1/L2 planning dispatch. |
| `references/implementation-payload-and-preflight.md` | Preparing or validating an implementation dispatch, including rewrites. |
| `references/prompt-template-and-anti-patterns.md` | Assembling a full prompt, preflighting it, receiving results, or checking delegation anti-patterns. |
| `references/pillars-and-templates.md` | Writing pillar language or choosing domain-specific findings sections. |
| `references/context-stewardship.md` | Allocating context/work, parallel ownership, or compact evidence-preserving execution receipts. |
