---
metadata:
  prototype-desk-cases-added: "2026-10-28"
  review-after: "1–2 authorized uses or 2027-01-15"
  maintenance-review: "Review after 1–2 authorized uses; retain counterexamples."
---

# Compute integration: make parallelism pay

Apply to an already-chosen local pool, task runtime, HPC allocation or data engine. [Sources](sources.md) distinguish verified platform semantics from engineering guidance. Establish the [run contract](run-contract.md) first.

## 1. Partition by correctness and cost

### Output and decision contract — before fan-out

Write what must survive: **one aggregate decision**, **every qualifying item**, or
**complete counts/diagnostics**. In a filter collecting every match, short-circuit
the checks *within one item*, not the stream of other items. A rejected item may
skip expensive encoding, but a required full rejection histogram still needs all
relevant observations. Inspect existing lazy/native predicates before claiming
short-circuiting is absent; eager materialization can defeat it [C13].

For independent, pure boolean observations, record the identity, merge and decisive
value: AND (`all`) starts true and stops on false; OR (`any`/existence) starts false
and stops on true. These identities also define empty input. Clarify whether
"some" means existence or **at least k**: with s confirmed matches and r known
remaining observations, true when `s >= k`, false when `s + r < k`. Validate k and
the observation universe; unknown remaining size cannot justify that false bound.
Merge counts (or counts saturated at k), not per-partition threshold booleans.
Parallel regrouping needs an associative merge with a compatible identity; preserve
ordering/tie rules when returning a particular witness, not merely existence [C13].

Push cheap, likely-decisive checks before expensive transforms and near the data
only when dependencies, side effects, ordering and required evidence allow it.
Measure cost/selectivity rather than declaring a universal predicate order. Remote
filtering may require local rechecks when data can change [C16]. A timeout/error
is not false or an empty partition: retain explicit unresolved state and the
declared failure policy. Even a decisive boolean cannot waive separately required
coverage, audit, errors or commit checks.

Use the coverage/halo and batching checks below before splitting an item. Bound
outstanding work (§2); once a permitted decision is final, stop submitting that
item's unnecessary pieces. Running work may need cooperative checks, and a generic
future cancellation need not stop it [C14]. Keep item/task identities on results,
ignore late results only where the output contract permits, and reconcile effects
under §4. Do not kill an entire shared worker/pool to reject one item.

- Extract the existing computation into an explicit input → result boundary before distributing it. Keep worker inputs serializable and small: immutable IDs, paths and configuration rather than live database connections, clients, locks or large closures. Initialize process-local clients/models/resources in workers as required by the platform.
- Partition on meaningful units; verify coverage, ordering, joins, overlap/halos and reduction semantics. Floating-point reductions may change with execution order; compare with a declared tolerance rather than promising byte identity.
- Measure task-duration distribution. Batch tiny units to amortize scheduling, serialization and initialization; split large/skewed partitions to avoid one straggler dominating the run. Do not hardcode a universal minimum task duration.
- Reuse costly immutable assets at the appropriate worker/process/node level; account for one copy per process and initialization concurrency. Stateful actors retain memory, not inherently durable application state.

## 2. Bound both execution and demand

Running slots and outstanding submissions are different controls. Resource declarations limit scheduling; a bounded submission window limits queued descriptors, futures and retained results. Stream/consume completed results and persist needed output descriptors instead of collecting everything in coordinator RAM. With Ray, `ray.wait` supports a pending-work window [C1]; calling `ray.get` immediately on each submission serializes the loop.

For an allocation of C cores, begin with a budget such as `worker_processes × native_threads_per_process ≤ C`, then account for coordinator/other load. It is a budget check, not a throughput theorem. Bound nested BLAS/OpenMP/data-loader threads, ranks, GPU processes and simultaneous jobs. Scheduler CPU/GPU labels are not proof of hard memory isolation or enough VRAM: verify enforcement and measure RSS/VRAM.

Budget peak concurrent chunks, temporary copies, serialization buffers, object store, shuffle/spill and result retention—not input file size alone. Bound shared-storage readers/writers and metadata operations. A thousand workers loading the same model or creating tiny files can stall the filesystem despite spare CPU.

## 3. Move references, minimize transfers

Map data paths from each worker's perspective. Stage explicitly; distinguish shared filesystem, node-local scratch and object storage. Copy durable results/checkpoints before scratch eviction under the site's lifecycle policy. A path valid on the submit host may refer to unrelated or missing bytes remotely.

Load data on workers or use the runtime's supported data placement. Avoid embedding huge client objects in task graphs [C2]. Persist intermediate results only when measured reuse justifies memory/storage pressure; cache is not a recovery copy. Partition/layout changes can outperform adding workers; change one lever at a time and record the effect.

## 4. Treat failures by effect, not exception name alone

| Observation | Safe next action |
|---|---|
| Transient read/network failure, no visible effect | Bounded retry with deadline/backoff if policy permits |
| Bad input/schema, deterministic code exception | Record failing identity; stop/quarantine per declared completeness policy; do not retry unchanged forever |
| OOM or worker killed repeatedly | Inspect resource/partition evidence; do not expand a cluster or migrate the same crashing task across all workers blindly |
| Timeout/lost connection during write | Outcome is unknown; reconcile commit/request ID before replay |
| Coordinator/driver loss | Reconstruct from durable manifest/commits/checkpoints; runtime in-memory futures are not the sole resume record |
| Cancelled job/task | Determine which descendants/attempts remain and whether effects may arrive late; do not label cancellation as rollback |

Make side effects idempotent or controlled by an established sink commit protocol. Framework retries, user retry wrappers, scheduler requeues and speculative attempts can multiply execution; bound the combined policy. Separate logical task identity, attempt count and scientific replicate identity.

## 5. Observe useful work and tune one bottleneck

Record input/code/config identity, queue delay, staging/startup, compute, shuffle/transfer, publication/aggregation, task skew, errors/retries and committed-valid outputs. Measure steady-state throughput and end-to-end latency/cost; include failed and duplicate attempts. A busy dashboard is not progress.

When workers wait, distinguish input starvation from blocked result sends, ordered
draining, slow reducers/writers and coordinator housekeeping. Audit frequent-path
cost as **calls × cost per call**, including scans of growing retained state,
metadata/accounting, logging and progress reporting. Treat this as a hypothesis
to measure, not proof that the coordinator is always the bottleneck. A cheaper
O(N) scan still scales with N. Incremental accounting or batched checks require a
correctness/reconciliation contract and a proven worst-case overshoot within the
declared reserve; never disable a safety check merely to improve throughput.

Tune partition/batch size, concurrency or placement one at a time. Watch memory, disk capacity/inodes, object-store/spill growth, I/O latency and oldest pending task. Set stall/failure thresholds and a stop-submitting action within the contract. If increased concurrency reduces useful throughput, roll back the tuning change rather than raising every limit.

## 6. Resume without repeating the whole experiment

Inventory expected units, valid commits, active attempts and incomplete work. Verify input/config/environment compatibility before reusing checkpoints or cached outputs; a changed command can invalidate resume assumptions. Resume only reconciled missing/failed units according to policy, and validate the complete aggregate again.

Local execution follows the same semantics: protect multiprocessing entrypoints and verify the actual process start method/runtime requirements, choose threads only when library/GIL/I/O behavior fits, and cap nested threads. Do not replace a working environment or install a runtime simply to follow this checklist. See [platform quirks](platform-quirks.md) for the chosen deployment.

## Desk cases

- **Representative:** retain all windows whose symbols are valid. Reject each
  window on the first invalid symbol and skip its encoding, but process every
  other window. Split-window OR-of-invalid flags preserves original boundaries;
  it does not permit deleting symbols or independently retiling pieces.
- **Boundary:** the same output also requires exact counts of every invalid
  symbol. A boolean verdict is insufficient; finish the counting work. If workers
  already do this correctly but block sending results, inspect the downstream
  path before reducing task size.
- **Unavailable runtime:** return the proposed partition/merge, cancellation and
  measurement checks as UNVERIFIED; source algebra is not executed integration.

These are interface walkthroughs, not benchmark or automatic-routing evidence.
