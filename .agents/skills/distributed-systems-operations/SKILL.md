---
name: distributed-systems-operations
description: 'Integrate and operate already-chosen parallel runtimes, workers, HPC/Slurm/MPI, Hadoop/Spark, and distributed storage/sync/consensus systems. Use for "parallelize this workload", "integrate workers", "bound concurrency", "make retries safe", "resume distributed jobs", "sync replicas safely", or "operate a ledger network". Covers data placement, resource accounting, duplicate effects, backpressure, observation and recovery. Not tool selection, AI-subagent dispatch, model-specific training methodology, cryptographic protocol invention, or permission to deploy, spend or mutate live clusters.'
---

# Distributed Systems Operations

Make distributed execution useful end to end: productive throughput, correct visible results, and recoverable failures. A scheduler finishing, a replica responding, and an application succeeding are different observations.

## Contract

- **Reader:** an agent integrating an application with an existing/chosen platform; no particular harness, provider, CLI, filesystem layout or cluster is assumed.
- **Inputs:** workload/invariant, chosen platform and versions, deployment ownership, existing code/config, input/output identities, approved environments/actions, resource/cost bounds, failure and recovery expectations.
- **Outputs:** a proportionate integration/run contract, version-specific configuration/adapter changes when authorized, measured verification receipt, and a usable resume/cancel/recovery handoff. Reuse an existing run record; do not create a paperwork hierarchy for a local pool.
- Discover native tools or authorized integrations. No access means **UNVERIFIED** plus the exact next check, not an installation, credential request dump or invented result.
- Resolve project, input, scratch, output and log roots at runtime; confirm worker visibility. Never assume the agent's current directory exists on workers. Redact secrets and sensitive dataset identifiers from receipts.
- This skill grants no launch, data-transfer, billing, destructive, cluster-admin, key-custody or signing authority. A read-only command may still contact a live service; honor network/access boundaries.

## 1 — Inspect and pin the operational surface (mandatory)

Choose **integration**, **observe/tune**, or **recovery**. Identify actual cluster/chain identity, scheduler allocation, client/worker versions, environment lock or image digest, storage semantics, ownership and existing running work. Read effective settings, not just repository defaults.

For recovery, preserve evidence and load the relevant track before changing anything; do not rerun the workload or restart services as diagnosis. Missing permissions block that action, not safe analysis.

## 2 — Establish the execution/state contract (mandatory)

Use [Run contract and worked example](references/run-contract.md), inline for small work. Fix the unit of work, partition coverage, stable identity, side effects, commit point, retry/timeout policy, resource bounds, observable success and cancellation owner **before** parallel fan-out or state mutation.

Choose only the required track:

| Situation | Load |
|---|---|
| Local/distributed workers, batch/HPC, data engines | [Compute integration](references/compute-integration.md) |
| Ray/Dask, Slurm/MPI, Spark/Hadoop, workflow executors | Also the matching section of [Platform quirks](references/platform-quirks.md) |
| Replicated storage, sync, locks, consensus, ledgers | [State integration and recovery](references/state-integration.md) |
| Checking a guarantee or using an unfamiliar version | Matching entry in [Source ledger](references/sources.md); retrieve deployed-version docs before relying on defaults |

For a combined pipeline, both tracks apply at the task-to-storage commit boundary. If correctness depends on semantics not yet known, stop that implementation and obtain evidence; do not substitute a familiar platform.

## 3 — Integrate the smallest bounded path (mandatory for changes)

Adapt existing entrypoints and libraries rather than introducing another scheduler/queue or generic adapter framework. Separate pure work from publication where practical. Keep data local to workers, submissions bounded, outputs isolated, and credentials scoped. Configure retry classes and cancellation explicitly.

Start with one approved input/partition and one worker, then a bounded concurrent sample. The purpose is to validate imports, access, resource accounting, output publication and failure behavior—not to launch the full run silently. Production code changes follow the applicable implementation workflow.

## 4 — Prove correctness and useful throughput (mandatory before scale-up)

Use [Verification and incident checks](references/verification.md). Compare against the declared correctness baseline; include staging/queue/startup/aggregation costs. Exercise duplicate delivery and recovery in an authorized isolated test when these guarantees are needed. A source citation or desk walkthrough is not runtime evidence.

Increase one limit at a time only within the approved budget. If no failure test is authorized, report that guarantee **UNVERIFIED** and do not claim failure-safe or broaden the run on that assumption. Do not inject faults into shared services.

## 5 — Observe, reconcile and hand off (mandatory)

Track running and pending work separately, failures/retries, committed outputs, resource saturation and progress age. On timeout or lost acknowledgement, reconcile the sink/transaction identity before resubmitting. Cancel only owned work; account for already-running tasks and late writes.

Return observed status, output/commit identities, measurements, incomplete units, retained artifacts, resume/cancel instructions and untested recovery branches. If ongoing monitoring is requested, establish a real owner and wake-up mechanism; do not imply observation continues after the session ends.

## Stop conditions

- Wrong/unknown target, missing authorization, secret exposure or unresolved data residency → stop affected access/mutation and clarify.
- Unknown duplicate/commit semantics or partition correctness → no fan-out or write retry until resolved.
- Budget, disk, memory, queue or retry bound exceeded → stop new submissions; reconcile and cancel owned work as authorized, not unlimited retries or resource escalation.
- Quorum/validator safety, signing identity, conflicting histories, or restore authority uncertain → preserve evidence; no force flags, automated membership repair or live restore.
- Verification contradicts the contract → do not scale or label success; investigate and return the supported next action.

## Completion receipt

- [ ] Target, versions, ownership and allowed actions verified or explicitly missing.
- [ ] Unit/invariant, partition coverage, side effects and commit/retry semantics recorded.
- [ ] Data placement and running/pending/resource/cost limits explicit.
- [ ] Correctness and performance evidence separated from source/desk claims.
- [ ] Duplicate, cancellation and recovery coverage stated, including untested branches.
- [ ] Outputs reconciled; only owned temporary work cleaned up under retention policy.
- [ ] Resume/cancel/recovery handoff works without this chat; no unsupported success claim.

## Anti-patterns

| Temptation | Consequence | Instead |
|---|---|---|
| Turn a loop into unlimited remote calls | Queue/object-store exhaustion | Bounded outstanding work and result consumption |
| Retry every error/timeout | Repeated effects or retry storm | Classify failure; reconcile unknown outcomes |
| More workers means more throughput | Oversubscription, shuffle or storage collapse | Measure completed useful work per resource/cost |
| One shared output file/counter | Races, duplicates, corruption | Per-unit artifacts and controlled publication |
| Scheduler success means valid data | Missing/partial/incorrect outputs | Validate expected outputs and commit state |
| Restart/reset a shared runtime to repair one task | Destroys unrelated state/work | Scope diagnosis and recovery to owned units |
| Replica count or CID equals backup | Unrecoverable deletion or missing bytes | Independent retained recovery copy and retrieval test |
| Lock/ledger/signature makes effects correct | Stale writers or agreed bad data | Fence writes; validate application invariants |

## Prototype and ACI evidence

**Stage 1: Prototype**, created 2026-10-15; review after 1–2 real uses or by 2027-01-15. Source-backed operational checklist, not a validated deployment runbook. Protocol-specific BFT/public-network operations require additional evidence.

ACI desk cases: native CLI access → inspect approved target and bounded sample; configured integration → require equivalent identity/config/status evidence; absent tools/access → return **UNVERIFIED** and a scoped check request. Examples cover duplicate effects and partial outputs. These are interface walkthroughs, not executed jobs, fault injection or proof of protocol safety.
