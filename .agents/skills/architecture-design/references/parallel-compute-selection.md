# Parallel compute selection

Source-backed **prototype selection brief**, checked 2026-10-15. For agents choosing how to execute an existing workload, not permission to install, submit jobs, rent machines, or send data elsewhere. No performance benchmark or cluster recovery test informed this brief. Use it for a narrow recommendation without the full architecture workflow.

## 1. Frame the workload before choosing a runtime

Obtain the task, current implementation, representative input, output-equivalence criterion, bottleneck evidence, available CPU/RAM/GPU/storage, data-access policy, scheduler and resource/cost limits. If timings are absent, recommend a bounded profiling check rather than asserting a speedup.

Separate the layers: a **runtime** executes tasks; a **scheduler** allocates resources; a **workflow engine** tracks dependencies and runs; **storage** holds inputs and outputs. These can compose: Nextflow → Slurm jobs → a tool using local threads. Adding a DAG library does not automatically distribute execution; see [dataflow selection](dataflow-stack-selection.md).

Classify the work:
- Independent inputs or parameter sweeps: each unit can finish without talking to peers.
- Partitioned arrays/tables: operations need chunking, joins or reductions.
- Stateful services/tasks: workers retain state between calls.
- Tightly coupled numerical work: ranks exchange data frequently.
- Model training: distinguish independent runs from one distributed training run; use [ml-training](../../ml-training/SKILL.md).

## 2. Choose the smallest fitting layer

These are conditional candidates, not a benchmark ranking. Verify installed versions, site support and workload fit before execution.

| Observed need | Candidate | Condition / reason not to choose it |
|---|---|---|
| Fits one machine | Existing vectorized engine (e.g. DuckDB), native threads, bounded process pool | First establish whether CPU, I/O, RAM or GPU is limiting. Python threads depend on GIL/native-code behavior; processes add serialization and memory cost. |
| Independent batch jobs on an existing HPC cluster | Slurm job arrays [S1] | Cap simultaneous jobs; each task writes separate outputs. An array is not cross-node shared memory or a distributed reduction. |
| Reproducible multi-tool scientific pipeline | Nextflow with local/Slurm executor [S2] | Workflow orchestration, not replacement for each tool's algorithm; confirm supported storage and resume semantics. |
| Chunked arrays/dataframes or Python task graphs | Dask [S3] | Chunk sizes must fit worker RAM; shuffle, graph size and transfer overhead can erase gains. |
| General remote tasks or stateful actors | Ray [S4] | Batch fine-grained work; actor/state placement and object transfers need measurement. Not a universal improvement over a process pool. |
| Existing large distributed SQL/ETL ecosystem | Spark [S5] | Driver/executors and shuffle require operational capacity. Not a default for small local data. |
| Existing Hadoop ecosystem | HDFS + YARN + MapReduce as separately justified layers [S6] | HDFS is storage, YARN resource management, MapReduce execution. Do not deploy the bundle merely because processing is parallel. |
| Frequent inter-process numerical communication | Site-supported MPI implementation [S7] | Requires algorithm decomposition, compatible launch stack and interconnect measurements; MPI is a messaging standard, not a batch scheduler. |
| Public/decentralized paid compute | Separate provider diligence | No provider evaluated here. Payment/ledger consensus does not prove correct computation, confidentiality, availability or useful performance. |

## 3. Bound execution and recovery before any trial

1. Keep a sequential or existing-engine baseline. Record input identity, environment, task duration distribution, wall time, peak RAM, I/O and output correctness; include staging, queue wait and startup in end-to-end comparisons.
2. Estimate the serial fraction and transfer overhead. More workers cannot remove serial work; tiny remote tasks can be slower [S3, S4]. Avoid nested oversubscription (array jobs × worker processes × BLAS threads).
3. Put reads near data. Avoid serializing entire datasets from the coordinator; budget chunk size and simultaneous resident chunks, not just file size [S3].
4. Assume retries may repeat side effects unless the selected API proves otherwise. Use stable task IDs, isolated temporary outputs, validation and storage-appropriate atomic publication. Do not equate successful scheduling with exactly-once effects.
5. Define worker-loss behavior, retry cap, timeout, cancellation, checkpoint/resume, partial-output cleanup and final aggregation. Scheduler job order must not encode correctness; Slurm array index order is not guaranteed [S1].
6. Keep credentials scoped; worker endpoints execute code. Do not expose unauthenticated clusters [S6]. External compute requires explicit data-transfer, billing and security approval.

Capabilities are discovered, not assumed: native profiler/CLI or an authorized integration may supply evidence. If neither exists, return the required measurements and a bounded proposed check; do not install tools or manufacture results.

## 4. Desk cases and next discriminating check

**Representative (inference, not executed):** a sequence-analysis project already using Slurm and local analytical tools could partition independent regions into bounded array tasks, publish per-region outputs, then aggregate. First check whether regions really are independent, whether reference/model loading dominates, and whether output equivalence survives changed ordering. Keep controlled data and model assets on approved infrastructure. This does not select a distributed training strategy.

**Boundary:** millions of tiny function calls, one large shared mutable object, or a workload limited by shared storage may become slower with remote workers. Batch or improve the local engine first. If one computation needs frequent rank communication, an array alone does not solve it.

**Next authorized attempt:** compare baseline and one candidate on the same small approved input, with fixed resource/concurrency limits and correctness checks; add a bounded worker-failure check only with permission. No attempt has been performed for this brief.

## Handoff and maintenance

Return: workload/evidence, chosen layer and rejected alternative, data placement, resource bound, correctness/retry contract, proposed measurement, unknowns and authority needed. Stop a recommendation when input privacy, output semantics, resource limits or necessary evidence remain unresolved.

ACI desk check: inputs and output are explicit; missing tools/timings return a measurement proposal; no-provider evaluation stays out of scope. This checks the interface, not runtime competence. Review after 1–2 authorized uses or by 2027-01-15; retain failure evidence before promoting to an operational playbook.

## Sources and limits

Primary documentation checked 2026-10-15; performance examples are vendor illustrations, not measurements of the reader's workload. No compute-specific practitioner incident was validated in this pass; runtime selection remains provisional.

- **S1** [Slurm job arrays](https://slurm.schedmd.com/job_array.html): concurrency caps, dependencies, ordering constraints.
- **S2** [Nextflow executors](https://docs.nextflow.io/en/latest/executor.html): workflow/executor separation and storage requirements.
- **S3** [Dask best practices](https://docs.dask.org/en/stable/best-practices.html): profiling, chunk memory, task/graph overhead and data loading.
- **S4** [Ray: too-fine-grained tasks](https://docs.ray.io/en/latest/ray-core/patterns/too-fine-grained-tasks.html): scheduling overhead and batching.
- **S5** [Spark cluster overview](https://spark.apache.org/docs/latest/cluster-overview.html): driver, executors, cluster managers and networking.
- **S6** [Hadoop documentation](https://hadoop.apache.org/docs/stable/): component separation and cluster authentication warning. The stable URL resolved to 3.3.5 when checked; not a latest-release claim.
- **S7** [MPI Forum documents](https://www.mpi-forum.org/docs/): standard and implementation-version discovery; site runtime compatibility still needs checking.
