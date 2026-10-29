# Flow and Effect Assessment

Use when assessing changed working orchestration, branches, state or effects.
Follow [Code Maintainability](../SKILL.md): report-only by default, supplied
snapshot and check limits, no runtime installation or code edits. A flow picture
or header is an entry point, not proof of correct execution.

## Trace only the consequential path

Follow a representative input from its actual entry point through decisions to
the result. Inspect relevant callers and implementations, not just supplied maps.
Identify external reads/writes, resource/state owners and failure exits. For
stateful or concurrent behavior, check applicable ordering, cancellation, retry,
partial-result, cleanup and replay boundaries.

Compare the normal and failure paths. An innocently named helper that hides a
write or retry may impose a real maintenance cost; a violated transaction or
failure contract is a correctness/integrity blocker, not optional readability
debt. Neither checkpoints nor a few traces prove exactly-once behavior.

## Compact evidence shape

Put this in the authorized assessment record where useful; omit inapplicable
items rather than inventing behavior. Paths are relative to the supplied root.

```text
Snapshot/files: <assessed revision and changed surface>
Flow: <file:symbol> -> <consequential decision/stage> -> <result>
Effects/state: <read/write boundaries; state and resource owners>
Failure: <rejection/error/cancellation/partial result; cleanup or retry>
Evidence/limits: <supplied or authorized checks; unobserved paths>
Suggestion: <location, class (structural | optional | out-of-footprint), violated rule/cost, smallest adjustment, risk>
Blockers: <actual defects separate from cleanup/optional items, or none>
```

A small linear script may need only a sentence and a nothing-to-clean conclusion.
For complex flow, add a small manual view only when it answers the inspection
question; label its limits and use actual source anchors. Do not require a DAG,
state-machine framework, new orchestrator, telemetry or a second documentation
system. The header holds file navigation; the assessment record holds findings
and evidence; a module README serves its consumers when needed.

Keep sensitive inputs and traces local unless separately authorized. Structural
findings inside the footprint are mandatory cleanup after the user locks behavior;
optional items wait for explicit approval.
