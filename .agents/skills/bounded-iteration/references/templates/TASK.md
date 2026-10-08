# Task: <user-visible outcome>

## Ownership and outcome
- Ownership mode: autonomous (default) / collaborative / approval-gated
- Execution: attended / AFK (requires verified isolation, state, cancellation, cleanup)
- Authority source: <user request + project constraints; no assumed approval>
- Goal and must-ship behavior: <what the user can do when complete>
- Final gate: ready for user acceptance; only actual user feedback marks accepted
- Non-goals: <adjacent work excluded>
- Fixed user requirements/hard invariants: <never weaken to obtain PASS>
- Agent-owned decisions: <researched technical/UX choices the primary may approve>
- Human-reserved decisions: <safety/public compatibility/spending/other explicit gates>

## Scope and execution envelope
- In-scope boundary and owned writable paths: <explicit>
- Out-of-scope/user work: <explicit; other paths unchanged>
- Active contract/phase/file tree: <existing domain packet; proportionate for small tasks>
- Compatibility: <preserve/delete classification; public promises protected>
- Allowed actions/dependencies/services/network: <explicit authority; no global installs>
- Forbidden: secrets, production/shared-data mutation, destructive Git, unapproved scope/spending
- Environment/isolation and controls proof: <sandbox/workspace and observed controls>
- Per-job bounds: <watchdog, concurrency, relevant CPU/memory/PID/storage/network controls>
- Cancellation/cleanup and owned resource identifiers: <exact, no user-process cleanup>
- Aggregate limits: MAX_ITER=null, MAX_ELAPSED_SEC=null, MAX_COST=null unless specified
- Actual quota/cost/resource observations: <receipts; unknown is not zero>

## Research and decision record
- Consequential questions/sources/experiments: <repository + authoritative current docs>
- Decision-note location: <product docs/README; concise evidence, alternatives, risks>
- Approval owner/revision: <primary within delegated scope; user for reserved boundary>
- Task/state/progress location: <task/memory area, not consumer docs>

## Evaluator contract — before the first slice
- Contract revision and current artifact identity: <controller binds receipts>
- Machine checks: <commands + required observable proof + environment>
- Candidate failure classification: <known product failures vs broken infrastructure>
- E2E/integration journeys: <primary use + important failure/recovery cases>
- Release rubric: <criterion → evidence → evaluator; include first-use/docs UX>
- Independent perspectives: <distinct relevant reviewers; bounded actions>
- Freshness: <invalidate affected checks/reviews on artifact/contract change>
- Success streak: 1 (increase for known flakiness; does not replace release gate)

| Verdict | Controller action |
|---|---|
| Machine 0 / PASS | Record positive proof; continue outstanding release evaluation |
| Machine 2 / candidate FAIL | Correct the implicated in-scope slice |
| Machine 3 / broken verifier | Pause optimizer; diagnose/repair verifier with negative checks |
| Machine 4 / UNVERIFIED | Obtain predeclared independent evidence or report blocker |
| Reviewer PASS | Accept only evidence-backed rubric items, never override required machine checks |
| Reviewer FAIL | Fix evidenced must-ship/invariant blockers; recheck affected criteria |
| Reviewer UNVERIFIED | Obtain missing evidence; never count as PASS |

## Release and stops
- Release requires: all must-ship/hard-invariant evidence current and PASS; required independent reviews PASS; guides usable; owned resource cleanup observed
- Safe deferrals: <only outside required outcome/invariants; rationale + revisit trigger>
- Stops: unsafe/unauthorized boundary; required evidence unavailable with no safe alternative; actual resource/quota boundary; configured aggregate cap; no supported path after diagnosis; unsafe context continuation; user cancellation/requested checkpoint
- Repeated/alternating fingerprint: pause blind retries, diagnose, resume only with a supported changed approach; no automatic human question after N turns
- Checkpoint/resumption: <last known good or none, owned changes/resources, next safe action>
- Handoff: <artifact, usage/startup, acceptance journey, proof, limitations, deeper docs>

Acceptance/contract changes require a versioned evidence-backed decision **before** the next slice. The primary can correct in-scope contracts; it cannot delete requirements or weaken safety to manufacture success. Delivery does not authorize commit, push, publish, or deploy.
