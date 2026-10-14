# Operational source ledger

Checked **2026-10-15**. These are primary product documents except the first-party incident account. They verify stated platform behavior, not this skill's runtime effectiveness or a reader's deployment. `latest`/`stable` URLs can change; recheck installed-version documentation before using defaults or issuing commands. Engineering integration patterns and the synthetic region example are author synthesis, not executed benchmarks or independently proven protocols.

## Compute

| ID | Source | Checked behavior / limit |
|---|---|---|
| C1 | [Ray pending-task backpressure](https://docs.ray.io/en/latest/ray-core/patterns/limit-pending-tasks.html) | `ray.wait` pending window; separate running-resource control |
| C2 | [Dask best practices](https://docs.dask.org/en/stable/best-practices.html) | Chunk memory, graph overhead, data placement; workload-dependent tuning |
| C3 | [Ray task fault tolerance](https://docs.ray.io/en/latest/ray-core/fault_tolerance/tasks.html) | Crash retries vs application exceptions; lost-result reconstruction can rerun completed work |
| C4 | [Ray actor fault tolerance](https://docs.ray.io/en/latest/ray-core/fault_tolerance/actors.html) | Restart/constructor vs checkpoint recovery; method retries and creator lifetime differ |
| C5 | [Dask resilience](https://distributed.dask.org/en/stable/resilience.html) | Worker lineage/recomputation, scatter limits, scheduler state, disruptive restart; rendered 2026.8.0 |
| C6 | [Slurm sbatch](https://slurm.schedmd.com/sbatch.html) | Submission vs completion, resource/task distinctions, directives, files and dependencies; rendered 26.05 |
| C7 | [Slurm arrays](https://slurm.schedmd.com/job_array.html) | Index identity, concurrency caps, output naming and dependencies |
| C8 | [MPI Forum documents](https://www.mpi-forum.org/docs/) | Standard-version discovery only; does not verify a site implementation's fault-recovery behavior |
| C9 | [Spark cluster overview](https://spark.apache.org/docs/latest/cluster-overview.html) | Driver/executor/cluster-manager separation and connectivity |
| C10 | [Spark Structured Streaming](https://spark.apache.org/docs/latest/streaming/apis-on-dataframes-and-datasets.html#using-foreach-and-foreachbatch) | Source/sink-dependent guarantees; `foreachBatch` at-least-once and batch-ID deduplication; rendered 4.2.0 |
| C11 | [Hadoop documentation](https://hadoop.apache.org/docs/stable/) | HDFS/YARN/MapReduce separation and insecure-cluster warning; resolved 3.3.5, not a newest-release claim |
| C12 | [Nextflow executors](https://docs.nextflow.io/en/latest/executor.html) | Executor launch/resource/storage boundary; exact cache/retry behavior not checked here |

## State and integrity

| ID | Source | Checked behavior / limit |
|---|---|---|
| S1 | [etcd API guarantees v3.5](https://etcd.io/docs/v3.5/learning/api_guarantees/) | KV/read/watch guarantees differ; recheck deployed version |
| S2 | [IPFS pinning and persistence](https://docs.ipfs.tech/how-to/pin-files/) | Default add pinning, GC/retention and availability limits |
| S3 | [Automerge introduction](https://automerge.org/docs/hello/) | Offline edits, convergence and merge/conflict references; no application-invariant proof |
| S4 | [etcd runtime reconfiguration v3.6](https://etcd.io/docs/v3.6/op-guide/runtime-configuration/) | Sequential changes, functioning majority, learner then catch-up/promotion |
| S5 | [etcd disaster recovery v3.6](https://etcd.io/docs/v3.6/op-guide/recovery/) | Snapshot/restore tools, WAL/integrity caveats, new cluster identity, revision bump/compaction for watch consumers |
| S6 | [Rekor overview and auditing](https://docs.sigstore.dev/logging/overview/) | Inclusion/consistency evidence, monitoring/witnessing; not truth or universal nonrepudiation |
| S7 | [Cloudflare incident and corrected classification](https://blog.cloudflare.com/a-byzantine-failure-in-the-real-world/) | Partial connectivity and recovery-automation cascade; omission fault, not evidence for mandatory BFT |

## Evidence gaps and promotion criteria

- No jobs, benchmarks, restores, network partitions, CRDT applications or ledger transactions were run for this skill. No user platform's effective settings were inspected.
- MPI fault recovery, Nextflow cache details, HDFS administration, BFT membership, validator/signing recovery and public compute/storage provider guarantees need further version-specific research before those actions.
- First use should record the selected platform/version, actual integration, bounded checks, failures, overhead and unknowns. Promote only guidance supported by that evidence; retain untested branches as conditional discovery gates, not generic repair commands.
