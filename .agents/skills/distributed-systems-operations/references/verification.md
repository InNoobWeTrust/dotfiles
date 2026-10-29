# Verification, scale-up and incident checks

Use existing tests/check tools when they cover the integration. Only execute within approved environments, job/resource/time/spending bounds and data policy. Destructive fault injection requires explicit isolated targets and authority; do not test failure by disrupting a shared cluster. Do not retain incidental test files in a repository without the applicable test-persistence approval.

## Per-use evidence ladder

1. **Inspection:** verify target identity, versions, effective config, ownership, credentials scope and input/output paths. Reading docs is not inspecting a live deployment.
2. **Single-unit execution:** verify imports/environment/data access, correctness and output commit. Compare with the existing baseline and declared tolerance.
3. **Bounded concurrency:** verify coverage, duplicates, skew and peak resources; compare useful throughput including staging/queue/startup/aggregation. Use a fixed representative input, not easier inputs for the parallel case.
   Match accumulated-state size too: an empty output/cache cannot expose repeated
   whole-state scans. Include late/no matches, early/late decisive observations,
   empty partitions, errors and required complete counts where applicable; verify
   both output equivalence and work actually avoided. Observe coordinator/drain
   waits as well as worker compute before claiming a bottleneck resolved.
4. **Failure/recovery:** exercise the relevant rows below on synthetic/non-sensitive data in an approved isolated environment. If not authorized/available, record NOT RUN and constrain claims/scale-up accordingly.
5. **Operational handoff:** reconcile effects, active work and artifacts; demonstrate the precise resume/cancel path and retained evidence. A required unperformed check remains UNVERIFIED, not PASS.

## Failure matrix (choose relevant rows)

| Check | Expected observable outcome |
|---|---|
| Duplicate logical task/request delivered twice | One intended visible effect or documented duplicate-tolerant result; attempt evidence retained |
| Crash before publication | No partial result accepted as complete; bounded replay allowed |
| Publication succeeds, acknowledgement lost | Authoritative reconciliation finds prior effect; no second charge/append/commit |
| Two attempts race / stale writer resumes | Conditional commit/fencing rejects incompatible late writer; no silent overwrite |
| Worker lost / actor restarts | Declared lineage/checkpoint recovery works, or explicit failure; no fabricated state recovery |
| Coordinator lost | Resume inventory can be reconstructed from durable state within the declared recovery scope |
| Slow/skewed task / pending queue grows | Submission/backpressure bound holds; progress/stall is observable |
| Cancellation with active tasks | Owned work stops/drains as specified; late effects are blocked or reconciled; partial artifacts not accepted |
| Quorum or storage unavailable | Declared failure/degraded behavior without unsafe write acknowledgement or unbounded retry storm |
| Offline concurrent edits / duplicate watch events | Application invariant and consumer deduplication hold, or semantic conflict is explicit |
| Watch history compacted / restore to older snapshot | Consumer detects invalid cursor and relists under the version-specific recovery procedure |
| Corrupted or missing stored bytes | Verification/retrieval fails visibly; valid surviving copy or tested backup restores the expected identity |
| Restore / schema/config change | Compatibility and state/invariants verified; clients point only to the approved recovered target |

For MPI, add rank-error propagation and collective ordering checks using the site's supported test environment. For a ledger, add the protocol-specific transaction finality/reorg and signer recovery checks; do not improvise validator faults or signing on a public network.

## Interpreting evidence

Report **performed**, **source-verified**, **desk-analyzed**, **not run** separately. A successful happy path cannot demonstrate duplicate safety or recoverability. One representative sample does not establish full-scale memory/I/O behavior; scale incrementally within the approved bound. Record exact inputs/config/version and failure points so another operator can reproduce the check without the chat.

## If something fails during real use

1. Stop new owned submissions/writes when the declared safety/budget threshold is crossed; preserve logs, identifiers and partial artifacts. Do not kill user sessions or every job on the cluster.
2. Establish whether the outcome is failed, committed or unknown. Query authoritative task/commit/transaction state through approved interfaces before replay.
3. Identify the limiting/failing layer from evidence: application, runtime, scheduler, network, storage, quorum or client recovery. Repeated retries with no changed evidence are not diagnosis.
4. Apply only the approved scoped recovery; membership/restore/signing actions need their specific operator procedure and authority. On missing evidence, return the exact blocker and safe next observation.
5. Revalidate outputs/invariants after recovery, reconcile active/late attempts, and record what the incident changed in the run contract. Do not silently promote this prototype based on a successful source lookup.
