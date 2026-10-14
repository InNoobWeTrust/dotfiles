# Platform-specific integration traps

Load only the chosen platform section. Defaults change: confirm installed client/worker versions and effective settings against the matching [source](sources.md). The sequences below are integration checks, not authorization to submit jobs, restart services or alter infrastructure.

## Ray: tasks, actors and backpressure

- Tasks and actor methods have **different** retry settings. Tasks use `max_retries` and `retry_exceptions`; actors distinguish `max_restarts` from method `max_task_retries`. Record effective values and retryable exception classes explicitly [C3, C4]. Do not copy unbounded retries from documentation examples.
- A completed task can run again when its lost result must be reconstructed. A failed/timeout response can also leave effects already applied. Keep publication idempotent even if the usual execution succeeds [C3].
- Actor restart reruns its constructor; it does not restore application state. Persist/recover critical state explicitly from storage accessible on a replacement node. Non-detached actors can fate-share with their creator; detached lifetime is not durable cluster-independent storage [C4].
- Use scheduling resources to bound running tasks, and a `ray.wait`-based window to bound pending work; drain/inspect results so errors are not silently retained in futures [C1]. Budget object references retained by the driver. Spilling is not the same event as object loss; inspect actual evidence before diagnosing reconstruction.
- Verify cluster authentication, network exposure and user-code trust for the installed release. Recent authentication changes are not evidence that an older deployment is protected.

## Dask: lineage is not a database

- Worker loss can trigger recomputation from the task graph. Impure tasks may yield different results or repeat writes; isolate publication [C5].
- `scatter()` data lacks the computation lineage needed to regenerate it. Replicas can improve worker-loss tolerance, but keep an original/durable source for recovery; replication in worker memory is not backup [C5].
- Check scheduler/driver failure separately from worker failure. The documented scheduler does not persist its execution state for transparent continuation. Keep durable input manifests and completed output identities [C5].
- Do not call `Client.restart()` as a casual repair: it kills worker processes and flushes their state across that scheduler. On shared infrastructure that can disrupt unrelated work [C5].
- Avoid huge graphs and oversmall chunks; budget concurrent chunks and transfers. Diagnose worker-memory pressure and task skew before changing worker counts [C2].

## Slurm: allocation, launch, completion and files are separate

1. Verify site partition/account/QoS, allowed commands, time/memory/GPU units, environment policy and scratch lifecycle. Do not assume local Pixi/Conda, GPU visibility or internet access on compute nodes.
2. Distinguish `--ntasks` (process/task count) from `--cpus-per-task` (threads/cores per task). `sbatch` runs the script once; allocating several tasks does not by itself launch several program ranks. Use the site's supported launcher and MPI environment [C6].
3. Stage data/environment explicitly: `sbatch` transfers the script, not arbitrary input files. `#SBATCH` directives are parsed literally; shell variables inside them are not expanded as shell code. Supply resolved submission options or an approved rendered script [C6].
4. Bind `SLURM_ARRAY_TASK_ID` to a frozen manifest entry, not a mutable directory listing. For illustration, `--array=0-15%4` admits at most four simultaneous array tasks, not four total CPU threads [C6, C7]. Cap each task's internal concurrency too.
5. Create approved output/log directories before submission; array logs may use `%A_%a` to distinguish array/job indices. Do not let retries overwrite the only prior evidence; use an explicit attempt/log retention policy.
6. Capture the job identity and query permitted scheduler/accounting interfaces. `sbatch` exit success means submission accepted, not computation completed. Inspect job/step states and exit evidence, then verify outputs; scripts must propagate command failure instead of exiting successfully after a failed step [C6].
7. Match dependencies to semantics: `afterok` requires success, `afterany` only termination, `aftercorr` corresponds array indices. Requeuing a predecessor does not automatically revive a dependent job whose dependency already failed; reconcile before resubmitting [C6, C7].
8. Record requeue/preemption/signal policy and application checkpoint behavior. Resume only verified checkpoints; cancellation/requeue can leave partial files or repeated effects. Cancel exact owned job/array IDs, never every job belonging to the user.

## MPI and tightly coupled HPC

Match rank/thread/GPU placement to the actual allocation and site launcher. All participating ranks must follow compatible collective communication order; a rank taking a different error path can leave peers hanging. Define coordinated failure propagation, timeouts and application checkpoints rather than assuming ranks behave like independent retryable tasks. Verify the MPI implementation's supported fault behavior; the MPI standard/version listing alone does not prove transparent rank recovery [C8]. These are engineering checks, not a version-specific MPI recovery recipe.

## Spark/Hadoop and streaming sinks

- Distinguish driver, executors, cluster manager and storage. The driver must be reachable; coordinator collection of a large distributed result can exhaust driver memory [C9; capacity guidance]. Bound shuffle/partition skew, spill and tiny output files before adding executors.
- Inspect retries, speculative execution and the actual sink/output committer. Arbitrary external writes inside a distributed task are not made exactly-once by the scheduler. Use the selected sink's documented commit/deduplication protocol and test acknowledgement-loss behavior; do not invent a universal transaction across sinks.
- Structured Streaming `foreachBatch` is at-least-once by default. Its batch ID can support sink deduplication; scope that ID to the correct query/checkpoint lineage and make the sink operation atomic. It does not by itself atomically commit two independent destinations. `foreachBatch` is for micro-batch, not continuous mode [C10].
- Protect checkpoint/source-offset identity and schema/config compatibility; do not delete checkpoint directories to “unstick” a query without an explicit replay/data-loss assessment. Match failure guarantees to the actual source and sink, not the generic engine marketing claim [C10].
- Hadoop's HDFS/YARN/MapReduce layers have separate ownership and security. Inspect effective authentication/authorization; an unauthenticated execution cluster can expose both compute and data [C11]. No cluster administration or HDFS recovery procedure is supplied here.

## Workflow executors (e.g. Nextflow)

Verify the resolved executor, task resources, staging/work directory, environment/container identity and site limits [C12]. A workflow process requests resources; the chosen executor actually launches work. Keep work/cache metadata and immutable inputs needed for resume; confirm the selected release's cache keys and completion criteria before trusting reuse. Reconcile engine retries with scheduler requeues and tool-level retries. Exact cache/retry defaults need deployed-version documentation; this brief does not assert them.
