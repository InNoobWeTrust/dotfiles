# Optional diagnostics, run identity and recovery

Source lineage: [sources](sources.md), “Diagnostics and reproducibility.” The
manifest/verification recipes here are conditional synthesis, not guarantees from
one workflow product. Existing domain owners retain their execution contracts.

## Choose diagnostics from a question

Start with “which operation failed?”, “where was time spent?” or “which boundary
lost context?” Inspect existing errors/logs first. **Event logs and distributed
tracing are optional**, not prerequisites for DX or reproducibility.

- Add structured events when a bounded operation history answers the question; add spans/context propagation when crossing boundaries needs causal/latency visibility. Reuse existing instrumentation before adding a backend or signal family.
- Define event/operation name, time/duration, outcome, useful correlation and schema/version as needed. Document missing sampling/propagation coverage rather than calling a partial trace complete.
- Use allowlisted context and redaction before emission. No raw config/environment/credentials or sensitive payload dumps. Propagated baggage can travel in headers to unintended destinations.
- Bound retention/volume, attribute cardinality and overhead to the actual use case; measure if performance claims matter. No universal numeric budgets are implied.
- Instrumentation does not authorize collection/export, a new service or production access. Use local inspection or report the gap when those capabilities are absent.

Verify that a representative failure is actionable and correlated as promised;
inspect emitted fields for leakage. Test propagation/overhead only when claimed
and authorized. A trace is evidence of an observed path, not replayable state.

## Declare the promise before capturing state

Distinguish **fresh rerun** (repeat inputs), **checkpoint resume** (continue saved
progress), **event-history replay** (engine-specific), cache reuse and rollback.
None automatically implies the others. State the environment scope, expected
output/equivalence tolerance and what cannot be reproduced. Bitwise output is a
separate promise requiring evidence; a seed/lockfile alone does not establish it.

### Run identity / manifest

Scale the record to the job; use existing run metadata rather than inventing a
platform. For meaningful reproduction, identify the following or state the gap:

| Input/state | Record safely |
|---|---|
| Code | Revision plus clean/dirty state; dirty runs need a durable authorized snapshot/patch and relevant untracked content, not only the base commit |
| Configuration | Effective values/provenance from the [configuration owner](configuration-and-tasks.md), with schema/version and safe overrides |
| Toolchain/dependencies | Runtime/tool versions and lock/resolution/container identity sufficient to resolve the environment |
| Inputs/external state | Content hashes or immutable, resolvable snapshot/version references; mutable URLs/tags/current DB state are gaps |
| Execution | Command/task, relevant working directory, run identity and pertinent seeds/environment/hardware where outcomes depend on them |
| Results/recovery | Output identities, declared equivalence check, checkpoint/version/location and restore procedure when applicable |

An identity/hash without access to the corresponding content is not sufficient to
rerun. Do not capture all host state by default. Snapshot/export can expose user
work or sensitive data and requires authorization; mark missing identities instead.

Keep redacted inspection records distinct from replay-complete records. Omitted
secret inputs may need access-controlled versioned references and authorized
re-acquisition; never publish values to make a manifest “complete.” If references
or dirty/input content are unavailable, label replay incomplete and name the gap.

### Checkpoints: conditional, explicit and tested

Assess checkpointing for long, expensive or stateful jobs and recovery needs.
For a cheap/stateless task, record why fresh rerun is sufficient; the skill does
not require implementing checkpoints everywhere. If resume is promised:

1. Identify the complete resumable state/progress boundary, input/config/code compatibility, checkpoint format/version and integrity. Saved metadata or model weights alone may omit required state.
2. Use the existing runtime/domain's durable checkpoint mechanism. Define interruption/write-completeness handling; reject incomplete/incompatible state safely. Never deserialize untrusted checkpoint content merely to inspect it.
3. Identify externally visible writes/notifications/payments. Restore can repeat them: require appropriate idempotency/reconciliation or an explicit safe manual boundary before resuming. Checkpointing alone is not exactly-once execution.
4. Interrupt at a representative supported boundary, restore in a **fresh process**, and compare completion with the declared uninterrupted-run outcome. Exercise failures before/after relevant external effects to check duplicate handling; disclose untested boundaries.

For model state/evaluation, require the training workflow's explicit dataset,
configuration, checkpoint, evaluation and reproducibility contract. For a chosen
distributed runtime, require its versioned retry/commit/effect/recovery contract;
for a transactional sink, require its unit-of-work, idempotency and consistency
contract. If any required domain contract is unavailable, limit the replay claim
and mark it UNVERIFIED. Do not generalize Temporal's history/replay guarantees to
an ordinary script or runner.

## Verification receipt

Record the manifest's scope and omissions, declared promise, commands/context,
observed rerun/restore comparison, external-effect checks and tolerated variance.
Missing required inputs or restore evidence blocks that replay/resume claim, not
unrelated safe source inspection. Do not launch an expensive rerun, overwrite an
existing checkpoint, contact a service or repeat a write simply to satisfy a check.
