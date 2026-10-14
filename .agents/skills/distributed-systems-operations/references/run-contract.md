# Run contract and worked example

Use the fields relevant to the task in an existing run record or response. This is an input/output contract, not a required new file format. A local worker pool may need only a paragraph; a stateful deployment needs precise failure and recovery details.

## Contract before execution

| Field | Required operational answer |
|---|---|
| Target and authority | Platform/version, environment/cluster/chain identity; owner; read/write/run/network limits; explicit launch/change scope |
| Objective | Useful completed work or application invariant; baseline and acceptable error/tolerance |
| Input identity | Immutable snapshot/version/digest, schema, partition manifest, code/config/environment identity; no secrets |
| Unit identity | Stable logical task or request ID derived from the relevant inputs/config; attempt ID is separate |
| Partition/merge | Coverage, overlap/halos, skew, ordering, deterministic reduction or justified tolerance; aggregation owner |
| Data path | Worker-readable input, approved scratch, durable result/checkpoint storage, authoritative sink; filesystem/object-store semantics |
| Effects/commit | What may change; when it becomes visible; atomicity scope; duplicate detection; unknown-outcome reconciliation |
| Bounds | Running workers/ranks, threads per process, pending submissions, RAM/VRAM, scratch, I/O/network, time, retries and spend as applicable |
| Failure policy | Retryable/nonretryable errors, deadline, bounded backoff/jitter; loss of worker/coordinator/storage/quorum; stale writer handling |
| Evidence | Run/task/attempt IDs, statuses, expected output set, validation, metrics and sanitized logs |
| Recovery/lifecycle | Cancellation owner, drain/late-write behavior, resume source, retention/cleanup, recovery-point/time objectives |

`<PROJECT_ROOT>`, `<INPUT_ROOT>`, `<SCRATCH_ROOT>`, `<OUTPUT_ROOT>` and `<LOG_ROOT>` are named roots to resolve and verify in the deployment, not literal runnable paths. Bind writes to the approved run namespace. Never log credentials, signing material, patient identifiers or private input URLs as provenance.

## Worked integration: independent region processing

**Illustrative, not executed:** an already-chosen Slurm or Python-worker setup processes independent sequence regions. No training job or biological dataset access is implied.

1. Freeze an input manifest of region IDs, coordinates and reference identity, plus tool/config identity. Check whether context windows require overlap and how duplicate boundary results are removed. A scheduler cannot correct a scientifically invalid partition.
2. Give each logical region computation a stable ID incorporating the immutable inputs and relevant configuration. Record attempt IDs separately so a retried task maps to the same intended output, not another scientific sample.
3. Let workers read the reference from approved storage; stage reusable data once per appropriate node/process when beneficial. Return small result descriptors, not the entire reference or a huge result table through the coordinator.
4. Each attempt writes its own temporary artifact. Validate schema, region identity, counts and required checksums before publication. Distinct attempts never append to the same file.
5. A designated publisher accepts at most one valid result for each logical unit. On a filesystem use a supported, tested commit protocol in the same filesystem; ordinary rename may overwrite an existing destination and is not a universal no-clobber/durability primitive. On object storage use supported conditional writes/versioning or a transactional metadata record; do not emulate filesystem rename with copy/delete and call it atomic.
6. If publication wins but the acknowledgement is lost, retry first reads the authoritative commit record and verifies the artifact identity. A conflicting digest for the same deterministic unit is an error to investigate, not an overwrite. Intentional stochastic work includes seed/replicate identity in the contract and a defined acceptance policy.
7. Aggregate only after the manifest has exactly the required logical units and passes partition/merge checks. Scheduler status and artifact existence alone are insufficient. Resume submits missing/invalid units after reconciling active attempts; it does not blindly resubmit every region.

**Avoid a new publication framework by default:** reuse the engine/sink's established transactional or output-commit facility if it supplies the needed guarantees. An extra file-based “done” marker is not a transaction across storage systems. If object publication and metadata commit are separate, define reconciliation and orphan retention explicitly.

## The critical crash window

```text
request(task_id, attempt_id)
  → compute → write/validate temporary result
  → publish result under task_id
  → acknowledgement
```

Failure **before** publication permits replay if input/side effects are safe. Failure **after** publication but before acknowledgement leaves the caller uncertain; inspect authoritative state before replay. “Check if absent, then insert” without atomic conditional semantics still races. Record deduplication and the intended database effect in the same transaction when that is the chosen sink's guarantee; an external notification/payment needs its own idempotency or reconciliation mechanism.

## Example completion receipt

```text
Target/version and run identity: verified / missing evidence
Expected logical units: N; committed-valid: K; failed: F; unresolved/active: U
Reconciliation: IDs are disjoint and cover the manifest; extras/conflicts listed
Correctness: baseline/tolerance check and artifact validation evidence
Performance: completed units/time; staging/queue/compute/commit breakdown; peak resources
Fault checks: performed outcomes vs NOT RUN (with reason)
Outstanding effects/resources: owned jobs, leases, scratch, unconfirmed commits
Next action: safe resume/cancel/recovery step and required authority
```

Do not assign numbers or claim PASS without observed evidence. For an application service, replace unit counts with request/transaction identities, invariant checks and replica/client observations; the unknown-outcome rule still applies.
