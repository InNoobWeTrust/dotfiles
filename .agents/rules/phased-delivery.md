# Rule: Phased Delivery (MVP-First)

Use this rule only for multi-step product or feature delivery, roadmap or
milestone planning, or explicitly phased execution. Do not load it for a
simple patch, isolated fix, or routine single-step edit.

## Principles

- Detail the active milestone only; keep later milestones as outcomes and
  dependencies, not implementation plans.
- Research shallowly: stop when the next decision, active-slice boundary, and
  safety/public-contract implications are clear. Escalate only for material
  uncertainty.
- Deliver a thin, end-to-end vertical slice before breadth, polish, or
  infrastructure for later slices.
- Do no speculative work: no future-slice scaffolding, abstractions, schema,
  integrations, or documents without a current demonstrated need.

## Lightweight Artifacts

- **Roadmap** — required only when work has multiple milestones. Capture the
  outcome, ordered milestones, dependencies, and decision points; do not turn
  it into a detailed backlog.
- **Active Milestone Packet** — the working source of truth. It embeds the
  lifecycle stage, phases and vertical slices, current architecture contract,
  acceptance criteria, compromises, evidence, feedback, and next decision.
- Keep both in the task context, existing delivery artifact, or handoff; do
  not create a document merely to satisfy this rule.

## Lifecycle

| Stage | Entrance | Exit |
|---|---|---|
| 0. Frame | Delivery trigger; outcome and authority known | Scope, non-goals, and stop conditions explicit |
| 1. Discover | Active problem framed | Shallow research resolves the next decision; unknowns are bounded or escalated |
| 2. Roadmap | More than one milestone | Ordered outcomes and active milestone selected; otherwise omit roadmap |
| 3. Calibrate | Active milestone selected | Smallest architecture contract and invariants fit the milestone |
| 4. Slice | Contract is clear | Value/risk-ranked, independently verifiable stopping slice selected |
| 5. Deliver | Slice has acceptance and verification | Slice works end to end; evidence and compromises recorded |
| 6. Learn | Slice evidence is available | Feedback yields KEEP, ADJUST, ADVANCE, STOP, or REDIRECT |

Do not advance a stage merely because a template section is filled. Stop or
escalate when its exit condition is not met.

## Architecture Calibration

Use the minimum reversible architecture that protects the active milestone's
invariants. Quick/MVP milestones may use direct, local composition; standard
milestones define explicit seams where change is likely; deep or irreversible
milestones justify broader boundaries and formal decisions. Recalibrate at
each milestone—do not pre-build the target architecture.

## Compromises

Allowed compromises are reversible reductions in breadth, automation, polish,
or internal generality that preserve active acceptance criteria and invariants.
They are prohibited when they weaken security, data integrity, destructive
operation safeguards, or a published/public compatibility contract.

Maintain one compromise register in the Active Milestone Packet (or its
explicitly linked shared artifact). Each entry uses this canonical schema:

| Field | Required content |
|---|---|
| ID | Stable, resolvable identifier |
| Decision | What is deferred, reduced, or deliberately not done |
| Why now / delivery benefit | Why this bounded compromise helps the current delivery |
| Invariant preserved | Security, integrity, compatibility, recovery, or other boundary that remains protected |
| Impact / risk and guardrail | Known downside plus the control that keeps it safe |
| Owner / authority | Accountable owner and authority that accepted it |
| Revisit trigger | Observable event, threshold, or decision point that reopens it |
| Target / status | Intended milestone/date and current state, when useful |

A missing register entry is not permission to defer work. Local mentions must
refer to this schema, not redefine it.

## Feedback and Trajectory

After every completed slice or material phase, compare evidence to the roadmap
outcome and select exactly one decision:

- **KEEP** — continue the current approach.
- **ADJUST** — change the active plan or contract without changing outcome.
- **ADVANCE** — accept the milestone and select the next one.
- **STOP** — end delivery because value, safety, or feasibility no longer holds.
- **REDIRECT** — change the outcome or milestone path with authorized rationale.

## Escalate Artifacts Only When Needed

Select each formal artifact independently for its own concrete need; never
promote a PRD into a TRD or BDD merely because it exists.

| Artifact | Create or expand when | Operational minimum / do not create solely because |
|---|---|---|
| **PRD** | Stakeholder outcome, product scope, or success measure remains materially contested | Durable outcome, scope, non-goals, stakeholders, and success alignment; not because a roadmap or packet already exists |
| **TRD** | A cross-system, operational, or technical contract needs durable coordination | Touched boundaries, interfaces/compatibility, ownership, failure or recovery behavior, security/data or migration implications, and verification responsibilities; not because multiple files change or a PRD exists |
| **BDD** | Observable behavior is highly ambiguous, regulated/public/contractual, safety-critical, or needs a shared executable specification | Concrete scenarios with observable outcomes and relevant boundary cases; not because a TRD or template exists when inline acceptance criteria already make the slice testable |
| **ADR** | A consequential, hard-to-reverse architecture choice has competing options | Decision, options, rationale, consequences, and revisit conditions; not for every significant decision |

These artifacts are independent escalation tools, not a delivery cascade. Their
absence never defers non-deferrable boundaries.

## Contract-Bounded Execution

Apply this section to every phased delivery, not tiny/simple edits. Before
dispatch or review, the orchestrator declares the active boundary using this
copyable template; it belongs in the Active Milestone Packet or handoff, not a
new artifact by default.

```markdown
### Delivery Contract
- Objective: [intended user/business result]
- Must Ship: [bounded deliverable and active slice]
- May Defer: [safe exclusions and revisit trigger, or none]
- Never Defer: [applicable protected boundaries and threshold evidence]
- Finding classification: [Never Defer blocker / Must Ship defect / May Defer / Out of Scope; map evidence to the contract threshold; orchestrator is final scope authority]
- Acceptance evidence: [observable criteria and required proof]
- Hard invariants / current public contract: [must-not-break properties]
- Authority: [orchestrator; who may accept, redirect, or change scope]
- Review budget: [default or explicitly predeclared specialist review]
- Corrective-change budget: [default or approved exception]
- Budget exhaustion / trajectory: [no new broad review after budget is spent; record/defer remaining non-blockers; only an evidenced Never Defer blocker may reopen; work outside budget requires explicit ship-with-debt, descope, or replan decision]
```

`Never Defer` includes a core-objective failure; security or privacy harm; data
integrity or loss; legal/compliance breach; irreversible harm; public
compatibility break; unrecoverability; and every declared hard invariant. A
Never Defer claim requires evidence tied to a threshold: a failed acceptance
criterion, violated invariant/public contract, applicable legal/security
standard, or concrete impact/recovery threshold. It is not a label for future
scale, preference, elegance, or hypothetical flexibility.

Reviewers classify every finding; they recommend, but the orchestrator decides:

| Classification | Meaning | Handling |
|---|---|---|
| **Never Defer blocker** | Evidenced Never Defer boundary is violated or cannot be evidenced | Resolve or escalate before acceptance |
| **Must Ship defect** | Bounded Must Ship or acceptance evidence is unmet | Correct within the contracted surface or escalate |
| **May Defer** | Safely postponable without violating the contract | Record through the existing compromise process when applicable |
| **Out of Scope** | Outside the declared boundary with no present material harm | Report only; do not implement or expand review |

Default review budget: small/governance/content work receives one bounded
acceptance review; a normal vertical slice receives one acceptance review plus
only predeclared specialist review. After a correction, allow one targeted
recheck of failed acceptance criteria and changed surface only. Exhausting the
budget forbids new broad reviews unless an evidenced Never Defer blocker arises.

Default corrective-change budget: one corrective pass on the contracted
surface only—no new architecture, dependency, or artifact family. If either
budget would be exceeded, stop and make an explicit trajectory decision using
the existing **KEEP / ADJUST / ADVANCE / STOP / REDIRECT** protocol. Do not
silently expand scope; changes that require another process area or files
outside the authorized boundary become a deferred next-milestone item unless an
evidenced Never Defer blocker requires escalation.

`subagent-dispatch` carries this Delivery Contract only when phased delivery
applies. Reviewers assess the declared contract and evidence, not imagined
future scope; the existing Compromises and Feedback and Trajectory sections
remain the canonical registers and decision protocol.

## ACI Pass
- Result: PASS
- Main risks: Over-formalizing an MVP or silently deferring a safety boundary.
- Interface upgrades applied: Trigger limits, lifecycle exits, compact packet,
  explicit handoff fields, trajectory enum, and escalation thresholds.
