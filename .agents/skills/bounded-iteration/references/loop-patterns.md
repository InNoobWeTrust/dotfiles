# Controller patterns

This is controller **pseudocode**, not a runnable shell loop. Build an adapter for the actual harness; do not paste naked CLI commands into a shared workspace. See [Procedure](procedure.md) for verifier/state semantics and containment.

## Unlimited aggregate iterations, bounded jobs

```text
load TASK, PROMPT, persisted state
revalidate authority, workspace ownership, contract, available controls
limits = configured total iteration/time/cost caps, else null

while useful safe work remains:
    enforce explicit aggregate caps and actual resource/permission boundaries
    select one bounded job with watchdog, cancellation, scope, cleanup
    run via authorized sandbox/native worker tools
    on cancellation or containment loss:
        cancel owned jobs; observe cleanup; checkpoint; stop with exact reason

    validate current evaluator receipt (run + contract + artifact identity)
    if broken/missing/stale: pause optimizer; diagnose verifier
    if UNVERIFIED: obtain predeclared independent evidence, never assume PASS
    if candidate FAIL: record fingerprint; choose grounded correction
    if repeated/alternating failure: diagnose; require a supported new approach
    if machine PASS: evaluate outstanding user-perspective release criteria

    atomically persist state, proof references, decision and next safe action
    if release criteria all PASS and owned resources cleaned:
        mark ready_for_user_acceptance; user_acceptance = pending
        deliver usage + proof + acceptance journey; STOP_SUCCESS
    if approval-gated checkpoint: checkpoint and return for requested approval
    if no safe authorized path: checkpoint; report exact blocker; stop
```

## Required adapter behavior

- Run one supervisor per task; prevent concurrent owners/overlapping writes. Persist ownership and detect stale leases safely before resuming.
- Distinguish job timeout, cancellation, tool/configuration failure, known candidate failure, and actual aggregate-cap exhaustion. A nonzero CLI exit is not automatically TIMEOUT.
- Enforce watchdogs through the available executor; do not assume GNU `timeout` exists or a shell trap controls escaped process trees. Sandbox controls and ownership-scoped cleanup are prerequisites.
- Invalidate previous release/reviewer proof after relevant artifact or contract changes. Build the evidence freshness binding outside the generic verifier template.
- Never treat an unset total cap as zero, or insert a hidden default of 10 iterations/900 seconds for total delivery. Select **individual job** watchdogs explicitly from workload needs and existing authorized limits.
- Observe available cost/quota signals; unknown is not zero. Do not infer permission to buy capacity. Optional caps are additional restrictions, not replacements for real limits.
- Checkpoint before context loss/disconnect; resumption requires current permissions, exclusive ownership, and verified cleanup/control state.
- Cleanup only owned resources; no shared-workspace reset or broad process killing. Do not claim AFK lifecycle guarantees an adapter has not tested.

## Stop mapping

| Observation | Handling |
|---|---|
| All release gates PASS; final human acceptance pending | `STOP_SUCCESS` |
| Missing user-only outcome or authority | `STOP_INPUT_AMBIGUOUS` / `STOP_MANUAL_INTERVENTION` |
| Unsafe action or lost containment | `STOP_UNSAFE_ACTION` |
| Broken evaluator without a safe authorized repair | `STOP_VERIFY_BROKEN` |
| Required criterion cannot be evidenced | `STOP_NOT_VERIFIABLE` |
| Actual quota/resource boundary | `STOP_RESOURCE_BOUNDARY` |
| Configured aggregate iteration/cost limit exhausted | `STOP_MAX_ITER` / `STOP_MAX_COST` |
| Configured total deadline, or job timeout blocking further progress | `STOP_TIMEOUT` with the exact cause |
| No supported alternative after repeated failures | `STOP_OSCILLATION` |
| Safe continuation cannot survive context loss | `STOP_CONTEXT_LIMIT` |

Read-only/native-only reviewers do not need fabricated OS-process bounds. Any worker that runs commands must receive the appropriate verified execution envelope. Human feedback is a new loop; never synthesize a user's acceptance from your state file.
