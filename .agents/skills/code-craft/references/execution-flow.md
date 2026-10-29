---
metadata:
  maintenance-review: |-
    Prototype: on representative use, check whether a reader can locate decisions, effects and failure behavior with fewer file jumps and less explanation; source checks alone do not establish improvement.
    ACI Pass:
    - Result: PASS for the guidance interface; real-use benefit remains unverified pending a representative pilot.
    - Main risks: framework over-adoption, helper/documentation proliferation, graphs mistaken for execution evidence, hidden replay effects.
    - Interface upgrades applied: implementer-only scope, bounded inputs/output, explicit stops, conditional tool selection and example failure path; assessment record shape is owned separately.
---
# Implementing Explicit Execution Flow

Use for a concrete implementation problem involving orchestration, branching, state or effects. Assessment questions and walkthrough records belong to Code Maintainability, not this implementation guide.

For small linear patches or utility scripts, prefer the smallest suitable existing
native/standard-library or established capability. Research and present it before
design/code, obtain explicit human stack approval, and justify custom orchestration
with evidenced insufficiency of existing solutions plus human exception approval.
Do not require a framework for simple work or treat simple work as permission to
write a custom scheduler. For analytical stacks, establish workload, formats,
transformations, scale, quality/privacy and operational constraints before proposing
the engine. Missing current dependency/API evidence remains explicit; OLTP defaults
do not apply to analytics.

## Scope and contract

- **Inputs:** approved behavior and failure contracts, repository conventions, the entry point and relevant implementation, and applicable safety/performance constraints.
- **Output:** working implementation with visible consequential decisions and effects, plus actual check results in the existing handoff. [File navigation](file-navigation.md) supplies local symbol/flow orientation, not task evidence or a replacement module entry point.
- **Exclusions:** no mandatory DAG, new runtime, tracing system, diagram, class hierarchy, or rewrite of adjacent code. Research-only requests stop at findings and suggestions.
- **Stops:** clarify ambiguous caller-visible behavior; obtain the human-approved
  researched stack receipt before any design/code, not merely before a stack change.
  Reuse only an unchanged same-task approval; material changes/custom exceptions
  require human reapproval, not primary/tool approval. Follow the rewrite/consumer
  contract; no refactor permission is granted here.

## 1. Make the real flow visible

Follow one representative input from entry to result. Locate consequential decisions, external reads/writes, state owners, and failure exits. For stateful or concurrent work, also locate cancellation, ordering, retry, partial-result, and cleanup behavior where applicable.

Within the human-approved stack, keep meaningful names, intermediate values,
branches and orchestration boundaries visible. Delegate scheduling/lifecycle to
the approved APIs where suitable; visible ordinary code is not a custom-runtime
default. Preserve existing framework conventions; do not add a second orchestrator
merely to obtain a picture. Library-free glue/domain code still needs flags and
numerical reuse-policy deductions even when approved.

An illustrative submission flow—not an instruction to extract one function per arrow:

```text
request -> validate input -> evaluate policy -> commit approved change -> return result
invalid input -> explicit rejection
policy denial -> rejection without a write
commit failure -> propagate/report failure, never fake success
```

Make the commit's transaction ownership and failure contract inspectable at its boundary. Do not claim every helper is pure or every operation is atomic without checking its implementation.

## 2. Reduce reader effort, not just line count

- Use explicit statements and named intermediate values when nested expressions, comprehensions, or clever chaining conceal domain decisions. Idiomatic concise code is fine when immediately understandable.
- Keep linear code linear. Extract a step when it owns a meaningful responsibility, invariant, effect boundary, or substantial algorithm—not because it crosses an arbitrary line count.
- Keep simple calculations and lookups inline. A short helper can still be justified by a meaningful contract; a long function can still be cohesive. Neither length alone nor reuse alone decides the boundary.
- Prefer existing functions/modules and domain types over new manager classes, strategy hierarchies, generic engines, registries, flags, or extension points. Introduce machinery only when it reduces the complexity a reader must understand.
- Separate business decisions from I/O where practical: pure value-to-value decisions, with visible effectful orchestration. Local algorithmic mutation is acceptable when it is owned, understandable, and does not mutate caller-owned data unexpectedly.
- For shared state, identify its owner and synchronization. At important effect boundaries, expose dependencies, transaction/resource ownership, and the failure contract; do not bury writes, retries, or fallbacks inside innocently named helpers.
- Prefer named fields for domain results and lengthy constructions. Preserve approved interfaces; this preference does not authorize renaming contracts or adding DTOs to simple scripts.

## 3. Choose the view that answers the inspection question

| Behavior to inspect | Start with | Add machinery only when justified |
|---|---|---|
| Straightforward request, command, or algorithm | Explicit orchestration, branches, meaningful sections and contracts | Usually no graph runtime needed |
| Stateful lifecycle, legal transitions, cancellation | States/events and transition logic in ordinary code | An established state-machine tool such as XState when it simplifies the actual lifecycle |
| Concurrent streaming components | Component boundaries, channels, ownership, bounded buffering and termination contracts | An FBP runtime when its communication/scheduling model is actually needed |
| Agent routing, loops, checkpoint/resume | Routers, state updates and explicit tool/effect boundaries | A tool such as LangGraph when persistent execution or graph coordination is required |
| Analytical transformations and lineage | Existing SQL/Ibis/Python flow and materialization boundaries | Use the separate dataflow stack-selection guide for Hamilton/dbt |
| What happened in one execution | Existing logs, receipts or targeted local traces | Additional instrumentation only for a concrete observation gap |

This table describes inspection views **inside an already human-approved stack**,
not an instruction to implement the listed scheduler/state/router mechanics by
hand. Established tools are researched before custom exceptions; all library-free
authored units remain visible in the reuse assessment.

Classic FBP involves autonomous components, ports and buffered communication; borrowing explicit connections does not require adopting that runtime. A DAG must be acyclic, but can still contain conditional logic and repeated executions. Do not disguise stateful loops as a DAG or hide important conditions inside opaque nodes.

A graph shows a particular abstraction, not every dependency or effect. Prefer code-derived views when they represent the relevant flow faithfully; label a manual map as a summary, link it to source, and update it when behavior changes. Neither a static map nor a few runtime traces prove all paths correct. Inspect node bodies, guards, routers, state merges and effect contracts where they matter.

For retry/resume, inspect which work may repeat and how effects remain safe; a checkpoint alone does not prove exactly-once execution. For concurrent streaming, inspect backpressure, buffer bounds, ordering and termination rather than assuming a graph supplies them.

Keep inspection artifacts and traces local by default. Do not collect sensitive payloads or upload source, inputs, checkpoints or telemetry without authorization.

Use [testing guidance](testing.md) for authorized verification. Explain relevant limitations in the ordinary handoff, not a mandatory inspection report. Comments do not repair incorrect ordering, hidden writes or violated contracts; fix in-scope defects and return broader scope questions to the primary. Discretionary readability refinement is not an extra implementation phase.

## 4. Lifecycle, cleanup and streaming boundaries

Apply when implementing component lifetimes, dynamic dependencies, cleanup or rollback claims, or bounded streaming channels. Skip for straightforward linear code with no acquired resources and no dynamic dependencies.

**Evidence limit:** these are source-derived patterns, without an accepted local use or measured improvement in this setup. They do not require adopting Cordis or an FBP runtime.

### Effect teardown ordering

Do not assume global LIFO across separate registration contexts.

| Scope in the inspected Cordis implementation | Ordering |
|---|---|
| Within one effect registration block | Collected disposers run in reverse sequential order |
| Across separate top-level effect registrations | Teardown may start concurrently |

If cross-effect ordering matters to correctness, make the sequence explicit — sequenced awaits or an explicit dependency between registrations — not an assumed global ordering.

**Source limit:** ordering from the inspected Cordis `fiber.ts` snapshot (4.0.0-rc.12) and paper arXiv 2608.25512 §5.1.3. Verify the actual API for your framework; other runtimes may differ.

### Dependency init and stop ordering

- **Initialize providers** before consuming components.
- **Stop consumers** before providers leave or become unavailable.
- **Define dependency-loss behavior** if a consumer can outlive an unavailable provider; silence is not a contract.

### Reversibility contracts

**Decide the tracked boundary.** A state location is inside it only when the component can modify it exclusively **and** restore its pre-modification state. If either ability fails, the operation is outside the lifecycle model's tracked/reverted state (paper §6.1).

Before implementing cleanup or rollback, classify each effect:

- **Reversible acquisition** — paired open/close, register/deregister: cleanup is the explicit authored inverse.
- **Irreversible emission** — sent message, published event, external write: not automatically retractable on component unload; do not describe it as automatic rollback.
- **Compensation** — restores a chosen business equivalence, not necessarily original state: the equivalence must be established explicitly, and the lifecycle metatheory re-established rather than assumed to transfer.

**Separate the handle from what it sends.** The acquired resource can be the channel for an emission; closing a descriptor releases it but does not retract bytes already written. Authorship alone is not proof of a correct inverse: check that it actually reverses the acquisition, such as close releasing the acquired resource (paper §5.1.1, p. 59).

**Withhold or compensate.** Withhold emissions until the producing state is certain to persist, or define application-level compensation; neither route is automatic retraction on unload.

State that must survive a reload needs a longer-lived owner or an explicit migration contract; reload does not preserve arbitrary component-local memory. Nominal service names across a reload do not establish behavioral or state compatibility.

### Bounded buffer contracts for streaming

A bounded queue creates flow control; it does not guarantee progress or deadlock freedom.

Require explicit contracts for: EOS/completion signaling; cancellation and abort propagation; error propagation across buffer boundaries; drain behavior; and packet ordering.

**Check count-before-records deadlock.** If a consumer requires a count before accepting records and the count is emitted only after all records are sent, a full record buffer will deadlock both sides — the producer cannot finish, so the count never arrives. Feedback loops and split/recombine topologies need explicit packet-count and receive-order reasoning. A buffer bound alone does not prevent this class of deadlock.

## Anti-patterns

| Shortcut | Why it fails | Prefer |
|---|---|---|
| Compress everything into a one-liner | Fewer lines can conceal decisions and intermediate meanings | Explicit statements with domain names |
| Turn every operation into a node or helper | Wiring and navigation can exceed the logic being explained | Meaningful boundaries; inline cohesive trivial work |
| Put huge opaque functions behind a three-node graph | A small picture does not make the internals inspectable | Readable stages and visible consequential decisions |
| Add a manager or strategy for every mutation or parameter | More objects and files can increase review effort | Owned local state and straightforward interfaces unless complexity justifies more |
| Show only the happy-path diagram | Failure, partial completion and effect ordering remain hidden | Include consequential failure/state transitions and ownership |
| Present traces as complete proof | Only instrumented, executed paths are observed | Label coverage and unverified paths; retain tests and source review |

## Sources

- [Classic FBP concepts](https://jpaulm.github.io/fbp/concepts.html): ports, independent processes and bounded buffers.
- [Functional core / imperative shell: Boundaries](https://www.destroyallsoftware.com/talks/boundaries): separate decisions from external effects.
- [XState](https://stately.ai/docs): state/actor modeling; verify the selected version before adoption.
- [LangGraph graph API](https://docs.langchain.com/oss/python/langgraph/graph-api) and [persistence](https://docs.langchain.com/oss/python/langgraph/persistence): graph execution and checkpoint semantics.
- [OpenTelemetry sensitive-data guidance](https://opentelemetry.io/docs/security/handling-sensitive-data/): minimize collection and protect telemetry.
- [Cordis paper (arXiv 2608.25512)](https://arxiv.org/abs/2608.25512): lifecycle effect ordering and reversibility boundaries; source-derived, not verified runtime behavior.
- [FBP deadlock chapter](https://www.jpaulmorrison.com/fbp/deadlock.shtml): count-before-records bounded-buffer deadlock.
