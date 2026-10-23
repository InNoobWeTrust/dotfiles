---
name: team-operating-model
description: "Use proactively for non-trivial delivery, ambiguous planning, architecture trade-offs, cross-cutting implementation, difficult diagnosis, high-stakes decisions, independent review, second opinions, swarm/party mode, cross-validation, and team-based 'work until done' or implement-verify-correct loops. Activation REQUIRES a real team: a primary plus at least one separately executed worker with task-relevant evidence. Never run this skill solo or simulate workers; if permitted delegation cannot form or maintain the team, stop and report the blocker. Trivial single-pass tasks stay outside this skill. Unifies team delivery/release evaluation, multi-perspective deliberation, and persistent roles/plans/checkpoints. Autonomous delivery has no default aggregate turn/time cap; jobs, resources, authority, and spending remain bounded. Supports collaborative/HITL and AFK only with verified isolation and resumable state. Does not grant implementation, launch, or billing authority."
---

# Team Operating Model

Activation requires a real team. Own authorized delivery with complementary workers and preserve continuity.
Domain skills govern work. Permitted delegation interfaces govern launches; the selected scoped-memory store governs storage. This bundle's contracts remain usable without those capabilities; a mandatory absent capability blocks only its affected step and is reported, never simulated.

**Inputs:** outcome, uncertainty, sources, authority/resource boundaries, mode, permitted workers, bindings, plans, and state.
**Outputs:** real team, scoped assignments, evidence/dissent synthesis, plans/checkpoints, current proof, and acceptance handoff.

## 1. Form a real team on activation — no exception

Exclude trivial single-pass work **before loading**; use its domain workflow directly.
Once loaded, do not switch paths or unload the skill to continue the same task solo.
A real team is the primary plus at least one separate worker instance with a bounded
assignment and observed task-relevant contribution. Personas in one context, a
tool call, a reserved slot, or an uncompleted launch alone are not a team.

Check actual capability **and permission**, establish records, and dispatch through
an available permitted delegation interface under the bounded handoff contract in §2
before substantive work. Preparatory guidance, role/plan setup,
and bounded capability checks are allowed; implementation is not preflight.
If delegation is unavailable/denied or cannot produce required worker evidence,
stop with a blocker. Never continue solo, simulate workers, or broaden authority.

| Team path | Choose when | Required next step |
|---|---|---|
| Bounded team | One coherent delivery, investigation, or decision | Primary plus real worker(s); apply coordination guards even for one-off teams |
| Continuing team | Roles continue, hand off, or are replaced | Restore [Persistent coordination](references/persistent-coordination.md) before role task-source reads |

The minimum is not a review quorum; add complementary roles as risk requires.
Workers can contribute sequentially. Each substantive delivery iteration needs
current bounded contribution, not token/stale evidence. Required worker failure
blocks affected work until permitted replacement/recovery supplies missing evidence.
Deliberation is optional **within the real team**; it never grants implementation authority.

## 2. Establish roles and a proportionate contract

Keep live user dialogue, integration, execution, and acceptance with the primary;
consequential direction follows the active eligibility gate and is recorded, not
self-ratified. Choose complementary jobs from actual uncertainty, not a fixed cast or
worker quota. Distinguish runtime main/worker capability from permanent job roles.

Before every launch, apply an available dispatch/worker-contract capability, or this
inline contract: supply the goal, sources, scope, READ/WRITE/RUN/network boundaries,
evidence/output contract, job/resource limits, stop behavior, and accessible guidance.
An absent dispatch capability blocks the affected launch; do not emulate a worker
in the primary context. Parallelize only
independent work with disjoint write ownership; sequence dependencies.

Work across multiple sessions or contributors requires immutable `task_id` +
`role_id` bindings, single active ownership, role-first restoration, approved scope, and
append-only checkpoints. A new review/test/consolidation job needs a fresh role
and session, not re-scoping a bound coder. Apply the persistent reference in full.
An assigned worker joins the existing primary/worker team; it must not recursively
spawn another team unless its bounded handoff separately authorizes delegation.

Assign a **dedicated user-requirement conformance subagent**, separate from the primary and artifact authors. Follow this conformance contract: independently reconcile original user instructions with a cumulative baseline and check every active point, including audience, assumed knowledge, writing style, format, and constraints. One stable checker job covers all points; an existing goal-alignment reviewer qualifies only with this contract. Preserve its role/binding across repeated checks under the persistent rules.

## 3. Deliberate and synthesize when needed

Load [Deliberation](references/deliberation.md) for panel setup, engineering/finance
lenses, persona discovery, dialogue rounds, and the synthesis shape. Use separate
permitted workers for the chosen perspectives; no single-context fallback.
One worker instance supplies one perspective; independence requirements still apply.

Challenge assumptions and have perspectives respond to each other's concerns.
Keep concise evidence summaries, not raw transcripts or internal reasoning.
Preserve meaningful disagreement; load [Branch-graft synthesis](references/branch-graft-synthesis.md)
when multiple viable branches conflict. A vote is not proof.

The primary owns the final synthesis and records choices settled through the
eligible proposal/validation/authority path; it does not resolve consequential direction. Distinguish
facts, inferences, and unknowns; return unresolved user-owned decisions with plain
context and consequences. Required independent challenge gates still apply.

After eligible proposal/validation, use an available decision-support capability
(a configured evaluation service or an explicitly delegated decision role) for
meaningful in-scope alternatives, recommendations before asking the user, or
worker continue/return uncertainty, when available and authorized. If none is
available, decide only mechanics and return the consequential choice to its
authority. Consultation informs the applicable authority; estimates neither supply
a real worker nor waive authority, evidence or stop gates. Deterministic steps need
no consultation.

## 4. Approve the plan and execute only authorized work

For execution, use a jointly crafted plan with direction settled through the
eligibility gate, proportionate to the task; the primary records its revision.
Bound-role execution pins its revision and unit; read and revalidate a new
approved revision before continuing. Never silently change scope or contracts.
Decision-only deliberation does not authorize implementation.

Before affected implementation, independently challenge **material cross-component
designs**, whether authored by the primary or a worker. Apply [Design acceptance](references/design-acceptance.md)
to responsibility/dependency direction, shared contracts, orchestration and state ownership.
Primary recording or a compromise register alone does not satisfy this gate. Reuse a
current revision's receipt; mechanical edits with no changed design are exempt.

The primary retains architecture stewardship across workers: maintain the bounded source-backed map, pass relevant structure/flow knowledge in handoffs, and verify combined placement, dependency deltas and human understandability at integration under that design-acceptance reference. Consequential architecture direction follows the eligibility gate.

For software work, consequential library/tool/API selections are settled through
the eligibility gate using repository constraints and applicable code guidance; local mechanics within the settled stack remain with the implementer. Keep the materialization contract in the existing plan/phase file (inline for an atomic patch): for each affected capability, record the selected library/tool/API, compatibility, accessible reference source, dependency-edit scope, justified exceptions, prohibited substitutions and actual reuse evidence. Carry its unit-relevant rows into worker handoffs, and revalidate changed choices on replacement/revision. Acceptance checks actual API use and behavior, not imports alone; workers report missing/incompatible choices rather than silently reverting to learned patterns.

Load [Delivery](references/delivery.md) before authorized build/fix/work-until-done loops.
It governs autonomous/collaborative/HITL mode, bounded jobs, criteria, correction, and release.
No default total turn/time cap; quotas, costs, permissions, and job controls still apply.
Apply the domain workflow; prove current outcomes and required independent reviews.
Machine PASS is not release readiness; return ready for user acceptance, never accepted.
Load [Procedure](references/delivery/procedure.md) before a verifier/controller/state or AFK.

## 5. Checkpoint and close

When new information or revised artifacts arrive, preserve earlier compatible requirements; record only source-supported supersessions. Recheck affected rows and regressions, especially audience/style, and require the dedicated checker's current whole-baseline receipt before final handoff. Primary self-review, general quality review, or technical PASS cannot substitute; unresolved requirements remain visible blockers.

When periodic monitoring is requested, assign one owner and record the target, interval, endpoint, last observation, outstanding timer identifier, and next check due in the existing task checkpoint. Apply this periodic-check contract: arm the wait or supported background timer **before** returning to other work, consume each result, and rearm while monitoring remains in scope. Bounded sleeps/simple shell checks use native background execution with completion notifications; substantive check reasoning may use a permitted worker, but waiting stays in a command. Do not assume another teammate is checking, or claim monitoring continues after losing its wake-up mechanism.

Persistent contributors append a checkpoint after every completed/interrupted
slice under the persistent reference; do not rewrite earlier captures. Missing or
failed capture blocks substantive continuation pending authorized recovery.

Only **recorded user acceptance** enables accepted-task consolidation: a fresh
dedicated consolidator's pass is report-only. It cannot write long-term knowledge,
flip markers, archive/evict, run Git, or cause external effects. Apply proposals
only after subsequent explicit human approval through the selected memory capability's approval gate; do not replace
the consolidator with the primary silently.

## Stop conditions

- Missing required eligible direction proposal, original-source validation or applicable authority → block affected work; primary status is not a fallback.
- Missing authority, unsafe/unbounded execution, or unavailable mandatory evidence → stop affected work; never broaden permissions.
- No permitted real worker or missing current required worker contribution → block affected work; no solo/simulated fallback.
- A required independent review cannot run → report UNVERIFIED/blocker, not simulated PASS.
- Missing dedicated conformance evidence, stale/omitted requirements, or FAIL/UNVERIFIED rows → block unqualified readiness; repair/recheck or report exact gaps, never silently waive user instructions.
- Unverified AFK isolation/state/cancellation/cleanup, a real resource boundary, or broken required verification → stop affected execution; diagnose before retrying or raising budgets.
- Persistent role/task/approved-plan records missing or stale, identity mismatch, retired binding, duplicate ownership, or prior-worker quiescence unproven → block restoration/execution.
- Capture failed → `CHECKPOINT_PENDING`; no substantive continuation before authorized recovery.
- Cross-task reuse or coder-to-tester re-scoping → fresh role/session required.
- Consolidation would apply/archive/evict without later human approval → stop.

## Examples

| Request | Route |
|---|---|
| “Rename this config key” | Do not load this skill; if explicitly activated, form a real team anyway |
| “Work until this is ready; don't ask about implementation details” | Team delivery with current worker evidence; honor human-reserved approvals |
| “Compare rollout designs with security and recovery trade-offs” | Bounded deliberation with relevant independent lenses, if permitted |
| “Fix a failure spanning auth, storage, and retries” | Form complementary diagnostic/check roles; keep integration with primary |
| “Resume the implementation team with a replacement tester” | Persistent route; restore tester role/task/plan before task sources |
| “Challenge this allocation memo” | Deliberation using finance lenses after the investment domain skill |

## Deliverable check

- [ ] Consequential direction has an eligible proposal, current original-source validation receipt and applicable authority; the primary only recorded and executed the settled choice.
- [ ] Real team formed and current worker contribution recorded; launch permission verified.
- [ ] Assignments, ownership, limits, dependencies, and evidence are explicit.
- [ ] Dedicated conformance subagent checked original-source baseline completeness and every active user requirement against the current revision, including earlier audience/style constraints after adaptation; no FAIL/UNVERIFIED rows hidden by technical success.
- [ ] Software plans and implementer handoffs retain approved materialization choices/exception rationale; current call-site and behavior evidence confirms actual reuse.
- [ ] Material cross-component design has a revision-linked independent challenge receipt; integration checks actual dependency direction and consumer wiring, not runtime success alone.
- [ ] Synthesis preserves dissent and separates evidence from assumptions.
- [ ] Applicable persistent guards, plan revision, and checkpoints are intact.
- [ ] Authorized delivery has current required proof/reviews, usable guides, observed cleanup, and an honest readiness or blocker handoff.
- [ ] Acceptance and consolidation approval boundaries remain human-owned.

## Anti-patterns

| Temptation | Correct path |
|---|---|
| Wait for explicit team tags on difficult work | Activate proactively, then form the required real team |
| Load the skill but choose solo or simulated execution | No exception; form the team or report the blocker |
| Treat skill selection as permission to spawn | Preserve runtime restrictions; stop rather than bypass them |
| Count one context's personas or a token launch as workers | Require separate instances and actual criterion-linked contribution |
| Reuse a coder's bound session as tester/consolidator | Assign a fresh role and session |
| Manufacture consensus or acceptance from green checks | Preserve dissent; wait for recorded user acceptance |
| Adapt to new facts and forget earlier audience or writing style | Keep cumulative source-linked requirements; obtain the dedicated checker's point-by-point current receipt |

## ACI pass and prototype

- **Evidence:** distinguish source/worker checks from runtime behavior; automatic activation, blocked-team recovery, and AFK lifecycle require real-use validation.
- **Upgrades:** mandatory real-team activation, current worker evidence, fail-closed delegation, preserved coordination/release guards, and on-demand references.
- **Lifecycle:** merged prototype, 2026-10-11; review routing/overhead after 1–2 real uses or the next quarterly audit (2027-01-11).

## References

- [Deliberation](references/deliberation.md) — panel method, finance cast, persona discovery
- [Persistent coordination](references/persistent-coordination.md) — binding, restoration, replacement, checkpoints, plans, consolidation
- [Branch-graft synthesis](references/branch-graft-synthesis.md) — preserve competing branches
- [Subagent dispatch capability] — permitted launches and bounded handoffs; use an available dispatch interface or the inline §2 contract, and block the launch if neither exists
- [Scoped memory/checkpoint capability] — storage and task-role record schema; use the selected store or this bundle's persistent-coordination records, and report an unwritable required scope
- [Delivery](references/delivery.md) — ownership, evaluator–optimizer loop, release gates, and stops
