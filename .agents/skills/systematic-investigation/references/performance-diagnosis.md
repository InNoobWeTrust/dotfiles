---
metadata:
  prototype-added: "2026-10-28"
  sources-checked: "2026-10-28"
  review-after: "1–2 authorized uses or 2027-01-28"
  maintenance-note: |-
    Curated prototype. Existing generic debugging required tracing and a
    minimal test but did not explicitly audit required work or retained-state growth;
    this addition makes those checks discoverable. This paired source walkthrough
    does not prove improved agent behavior. Review after 1–2 authorized uses;
    no automatic activation or workload-performance gain is established.
---

# Performance diagnosis: avoid work before adding workers

For agents investigating slow batch jobs, pipelines or reductions. Input: expected
outputs (including audit/error behavior), current flow, representative input and
retained-state size, observed timings, and authorized inspection/resource bounds.
Output: evidence-ranked limiting-path hypothesis, a discriminating check, and a
correctness-preserving candidate only when evidence supports it. No profiler,
deployment or workload access is assumed; absent access means UNVERIFIED plus the
exact proposed check, never installation, a restart or an unapproved rerun.

## 1. Locate time and waiting, not just busy resources

Define useful committed-output throughput and end-to-end latency. Map read/decode
→ filter/transform → transfer/drain → reduce/write → publish/accounting, including
feedback/backpressure. Inspect actual call sites: a diagram's stages need not be
independently executing processes, and one publication authority need not perform
all computation or file writing.

Measure stage service time, calls, queue depth/age and CPU versus waiting. Use
utilization/saturation/errors for resources and thread-state analysis for the
reader, coordinator and workers [P1, P2]. A sleeping worker may lack input or be
blocked sending results; a full result queue points downstream, not automatically
to insufficient workers. Distinguish resource throttling, I/O, locks and useful
compute. Trace the limiting dependency; overlapping stage times cannot simply be
added into wall time. Aggregate CPU utilization alone can hide one saturated core.

## 2. Audit the algorithm and required work

- Specify whether the answer is one decision, every matching record, a particular
  ordered witness, or complete counts/evidence. Check existing lazy predicates
  and pushed-down filters before diagnosing missing short-circuiting.
- Ask what work can be skipped without changing that contract: cheap decisive
  predicates before expensive transforms, reusable summaries, local partial
  aggregation, and appropriate native/vectorized operations. Predicate reorder
  is conditional on dependencies, effects and evidence requirements [P3, P4].
- For every frequent-path operation, estimate **invocations × cost per call** as
  input AND accumulated output/cache/catalog size grow. Look for repeated global
  scans, reconstruction, sorting, copying, serialization, metadata, logging or
  accounting. A small fixture with an empty cache cannot refute a state-size
  bottleneck. A faster implementation of the same growing scan may be only an
  interim correction.
- Compare rival explanations: worker compute, source starvation, coordinator
  housekeeping, ordered-result head-of-line blocking, reducer/writer capacity or
  shared-storage saturation. Name the observation that would disprove each leading
  hypothesis. More workers or smaller tasks may increase pressure on the same sink.

If a parallel reduction is a candidate, require partition coverage, associative
merge/identity, empty-input behavior, per-item versus global stopping, unknown/error
policy and required-output completeness. Transfer this contract and evidence to an
available compute design/operations capability; without one, keep execution
UNVERIFIED. Do not assume a different scheduler repairs an inefficient algorithm.

## 3. Test one supported change, preserving safeguards

Within approved bounds compare the existing path and one candidate with identical
input, output criteria, environment, resource limits and accumulated-state size.
Include startup, transfer, draining, publication and validation—not just worker
kernel time. Record work avoided (calls/bytes/observations), wall time, peak memory,
queue waits and valid output equivalence. Include no-match/late-decision and skewed
cases where applicable. Choose bounded small/large retained-state cases to expose
scaling without silently launching a full run.

Do not disable quotas, validation, full diagnostics or recovery bookkeeping to win
a benchmark. Incremental summaries need reconciliation; less frequent guard checks
need a proven bound on worst-case overshoot within their declared reserve. If that
contract is absent, return the unresolved design—not an approximate safety check.
Reprofile end to end after the change; the limiting path may move. A local speedup
is not full-scale resolution. Report NOT RUN branches and residual complexity.

## Desk check and limits

Representative: workers run a correct lazy rejection predicate but wait on result
sends while a per-item guard scans all accumulated outputs. Check guard call counts
and cost versus state size before proposing more predicate workers. Counterexample:
the output requires every invalid-symbol count; stopping at the first rejection
loses required information, even though its boolean verdict is already known.
Missing tools/access: return these measurements as a bounded proposal, not a root
cause confirmation. These are generic interface walkthroughs, not executed trials.

## Sources

- **P1:** [Gregg, USE](https://www.brendangregg.com/usemethod.html): resource-oriented
  utilization, saturation and errors; limited to that lens, not an algorithm proof.
- **P2:** [Gregg, TSA](https://www.brendangregg.com/tsamethod.html): per-thread state
  time, CPU/lock/I/O/idle distinctions. Its practitioner example finds CPU-limit
  throttling rather than presumed application compute. P1/P2 share an origin.
- **P3:** [PostgreSQL FDW planning](https://www.postgresql.org/docs/current/fdw-planning.html):
  cost-based pushdown, clause ordering and recheck constraints.
- **P4:** [Java SE 21 Stream](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html):
  short-circuit matching, associative reductions, ordering/side-effect limits.

The diagnostic sequence and repeated-state cost model are
engineering synthesis, not a universal finding or a measured deployment result.
