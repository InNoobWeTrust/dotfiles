# Inspectable, Flow-Oriented Code

Use when implementing non-trivial orchestration, branching, stateful or effectful behavior, or responding to requests such as "readable rather than cryptic," "less messy code," "flow-based programming," "inspect and audit," or "make the execution flow visible."

This extends Code Craft, not its delivery phases. For small linear patches or utility scripts, apply the readability preference without loading a framework or creating extra artifacts. Analytical stack selection remains in the [dataflow guide](../../architecture-design/references/dataflow-stack-selection.md).

## Scope and contract

- **Inputs:** approved behavior and failure contracts, repository conventions, the entry point and relevant implementation, and applicable safety/performance constraints.
- **Output:** readable implementation plus proportionate, source-linked inspection evidence in the existing change summary or module README.
- **Exclusions:** no mandatory DAG, new runtime, tracing system, diagram, class hierarchy, or rewrite of adjacent code. Research-only requests stop at findings and suggestions.
- **Stops:** clarify ambiguous caller-visible behavior; obtain informed agreement before changing stack or execution semantics; follow Code Craft's rewrite/consumer gates before replacing existing interfaces. This guide does not grant refactoring authority.

## 1. Make the real flow visible

Follow one representative input from entry to result. Locate consequential decisions, external reads/writes, state owners, and failure exits. For stateful or concurrent work, also locate cancellation, ordering, retry, partial-result, and cleanup behavior where applicable.

Prefer flow visible in ordinary code: meaningful domain names, named intermediate values, explicit branches, and a cohesive orchestration entry point. Preserve existing framework conventions; do not add a second orchestrator merely to obtain a picture.

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

Classic FBP involves autonomous components, ports and buffered communication; borrowing explicit connections does not require adopting that runtime. A DAG must be acyclic, but can still contain conditional logic and repeated executions. Do not disguise stateful loops as a DAG or hide important conditions inside opaque nodes.

A graph shows a particular abstraction, not every dependency or effect. Prefer code-derived views when they represent the relevant flow faithfully; label a manual map as a summary, link it to source, and update it when behavior changes. Neither a static map nor a few runtime traces prove all paths correct. Inspect node bodies, guards, routers, state merges and effect contracts where they matter.

For retry/resume, inspect which work may repeat and how effects remain safe; a checkpoint alone does not prove exactly-once execution. For concurrent streaming, inspect backpressure, buffer bounds, ordering and termination rather than assuming a graph supplies them.

Keep inspection artifacts and traces local by default. Do not collect sensitive payloads or upload source, inputs, checkpoints or telemetry without authorization.

## 4. Demonstrate inspectability before delivery

Use the Phase 4 audit in [write standards](write-standards.md). For a non-trivial behavior change, provide a compact walkthrough in the existing change summary or module README, using repository-relative source references. Do not create a second documentation system.

Copyable shape; omit inapplicable items rather than inventing behavior:

```text
Flow: <entry file:symbol> -> <important decisions/stages> -> <result>
Effects/state: <read/write boundaries; state and resource owners>
Failure path: <rejection/error/cancellation/partial result; cleanup or retry if relevant>
Evidence: <tests or observed outputs for these paths; what remains unverified>
```

- **Small script or linear patch:** understandable code plus a brief change explanation; no separate flow artifact required.
- **Non-trivial branching or stateful behavior:** the compact walkthrough above; add a small flow/state view only when text and source do not make it clear.
- **Complex concurrency or replay:** document consequential execution contracts and use targeted runtime evidence where needed. Preserve required tests and safety gates; do not add tracing merely for ceremony.

A structural clarity failure requires a structural fix: comments can explain rationale, but cannot make hidden flow, surprising effects or excessive indirection pass the audit. Leave unrelated code untouched and report material limitations rather than broadening the task.

## Anti-patterns

| Shortcut | Why it fails | Prefer |
|---|---|---|
| Compress everything into a one-liner | Fewer lines can conceal decisions and intermediate meanings | Explicit statements with domain names |
| Turn every operation into a node or helper | Wiring and navigation can exceed the logic being explained | Meaningful boundaries; inline cohesive trivial work |
| Put huge opaque functions behind a three-node graph | A small picture does not make the internals inspectable | Readable stages and visible consequential decisions |
| Add a manager or strategy for every mutation or parameter | More objects and files can increase review effort | Owned local state and straightforward interfaces unless complexity justifies more |
| Show only the happy-path diagram | Failure, partial completion and effect ordering remain hidden | Include consequential failure/state transitions and ownership |
| Present traces as complete proof | Only instrumented, executed paths are observed | Label coverage and unverified paths; retain tests and source review |

## Sources and prototype check

- [Classic FBP concepts](https://jpaulm.github.io/fbp/concepts.html): ports, independent processes and bounded buffers.
- [Functional core / imperative shell: Boundaries](https://www.destroyallsoftware.com/talks/boundaries): separate decisions from external effects.
- [XState](https://stately.ai/docs): state/actor modeling; verify the selected version before adoption.
- [LangGraph graph API](https://docs.langchain.com/oss/python/langgraph/graph-api) and [persistence](https://docs.langchain.com/oss/python/langgraph/persistence): graph execution and checkpoint semantics.
- [OpenTelemetry sensitive-data guidance](https://opentelemetry.io/docs/security/handling-sensitive-data/): minimize collection and protect telemetry.

**Prototype (2026-10-07):** routing and scenario checks are not proof of faster auditing. On the first representative implementation, check whether a reader can locate decisions, effects and failure behavior with fewer file jumps and less explanation; record observed results before claiming improvement.

## ACI Pass

- Result: PASS for the guidance interface; audit-speed benefit remains unverified pending a representative pilot.
- Main risks: framework over-adoption, helper/documentation proliferation, graphs mistaken for execution evidence, hidden replay effects.
- Interface upgrades applied: bounded inputs/output, explicit stops, conditional tool selection, proportional evidence, source-linked example and failure path.
