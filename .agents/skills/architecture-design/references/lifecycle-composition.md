# Lifecycle and Composition Patterns

Load when a design involves plugin lifetimes, dynamic component dependencies, cleanup or rollback claims, or concurrent streaming among components. Skip for ordinary linear code with no acquired resources and no dynamic dependencies.

**Source status:** patterns derived from arXiv preprint 2608.25512 and the inspected upstream Cordis implementation (4.0.0-rc.12, API marked unstable). The mechanisms are source-grounded; their benefit in this setup has not been demonstrated by an accepted local use. Apply conditionally; neither Cordis nor an FBP runtime is required.

## 1. Separate the two axes

| Axis | Concerns | Does not mean |
|---|---|---|
| Spatial (dependency availability) | A component declares requirements; activates when satisfied; deactivates before they cease | Geographic placement, deployment sharding, scheduling |
| Temporal (effect lifetime) | Tracked effects cleaned up when a component leaves; listeners, timers, handles released | Reversing arbitrary external history |

Apply when a design explicitly invokes one or both axes. A component that acquires a resource it later releases exercises temporal composition. A component that activates only when another is present exercises spatial composition.

## 2. Dependency ordering

**Initialize providers before consumers.** A consumer that activates before its declared dependency is available creates an ordering contract that must be explicit in the design.

**Stop consumers before providers.** A provider that leaves while consumers are still active leaves them without a required resource. Catch this at the dependency boundary; silence is not a contract.

**Applicability:** plugin loaders, service registries, agent frameworks where components register at runtime, tool/capability registries.

**Failure mode:** a dependent outlives an unavailable provider without a defined contract; in systems without a boundary check, the consumer can receive stale or missing state mid-operation.

## 3. Cleanup ordering scope

Do not assume global last-in-first-out (LIFO) teardown across separate registrations.

| Scope in the inspected Cordis implementation | Ordering |
|---|---|
| Within one effect registration block | Collected disposers run in reverse sequential order |
| Across separate top-level effect registrations | Teardown may start concurrently |

If cross-effect ordering matters to correctness, make the sequence explicit — sequential awaits or an explicit dependency between effects — not an assumed global ordering.

**Source limit:** this ordering is from the inspected Cordis `packages/core/src/fiber.ts` snapshot (4.0.0-rc.12) and paper §5.1.3, p. 63. DSH's vendor fork is rc.7 with 24 local modifications, not interchangeable. Other frameworks may differ; verify the actual API before relying on ordering.

## 4. Reversibility boundary

**Decide the boundary first.** A state location is inside the tracked boundary only when the component can modify it exclusively **and** restore its pre-modification state. If either ability fails, the operation lies outside the boundary and is not tracked or reverted by the lifecycle model (paper §6.1, pp. 70–71).

Classify effects before claiming cleanup or rollback:

| Class | Reversal | Example |
|---|---|---|
| Reversible acquisition | Explicit inverse authored and checked for the effect | Open file descriptor → close |
| Irreversible emission | Not automatically retracted once sent | Sent email, published event, external API write |
| Compensation | Restores chosen business equivalence, not original state | Refund a charge; compensating transaction |

**Separate acquisition from emission.** An acquired handle can also be the channel through which data leaves. Closing a descriptor releases the resource; it does not retract bytes already written through it.

**Check the inverse, not just its presence.** Authorship alone is not proof: the authored inverse must actually revert the effect it accompanies (paper §5.1.1, p. 59). Verify, for example, that close actually releases the acquired resource; the lifecycle model does not generate or establish correct inverses automatically.

**Withhold or compensate — never assume automatic retraction.** For emissions, withhold output until the producing state is certain to persist, or define compensation against an application-supplied equivalence. A compensation restores a coarser equivalence, not necessarily the original state; the lifecycle metatheory must be re-established for that equivalence rather than assumed to transfer.

**Failure mode:** a feature promises automatic rollback for an external emission, or labels compensation as an exact inverse.

## 5. Reloads and nominal keys

Classify state as exclusive/restorable or shared/external using the boundary test above, and identify which owner survives a reload. A reload by revert-and-reapply does not preserve arbitrary component-local memory. State that must survive needs a longer-lived owner or an explicitly established migration or recovery contract (paper p. 79).

A nominal service key matching across a reload does not establish structural or behavioral compatibility (paper §6.6, pp. 75–76). Semantic-version conventions help coordinate versions but do not constitute a general compatibility proof.

## 6. Guarantee limits

| Claim | Why it does not follow |
|---|---|
| Lifecycle confluence → deterministic agent output | Confluence covers lifecycle transitions under fixed orchestration inputs; it does not prove deterministic LLM responses, exactly-once effects or distributed consistency (paper §4.3.5, p. 51) |
| Context/dependency controls → code sandbox | Dependency restrictions address declared access, not malicious code in the host runtime; hostile code can bypass language-level mediation (paper §6.3, pp. 72–73) |
| Matching service names → behavioral compatibility | Nominal keys do not establish structural or behavioral contracts |
| Bounded queues → no deadlock | A buffer bound constrains storage and creates flow control, not a progress proof |

## 7. FBP vocabulary for streaming architecture

Use this vocabulary when designing concurrent streaming components. It describes properties to verify, not an instruction to adopt an FBP runtime.

| Term | Meaning |
|---|---|
| Process instance | An independent, autonomous component with its own lifecycle |
| Port | A named typed connection point on a process |
| Information packet (IP) | The unit of data passed between processes; ownership transfers with the packet |
| Connection | Externally defined (not inside either component's code); bounded buffer |
| Backpressure | A producer blocks when the receiving buffer is full |
| Subnetwork | Hierarchical composition of process networks |

**A task DAG is not automatically FBP.** A DAG describes acyclic task dependencies; it does not necessarily provide named ports, IP ownership, or bounded buffering contracts. An event bus or reactive stream also does not establish the full model without these properties.

**FBP does not prohibit all side effects.** Morrison's deadlock chapter includes I/O and external coordination; FBP is not a no-side-effect guarantee.

**Define bounded-buffer contracts:** EOS/completion signaling, cancel/abort propagation, error propagation across buffer boundaries, drain behavior, and packet ordering.

**Check count-before-records deadlock.** A consumer requires a count before accepting records; the count is emitted only after all records are sent. When the record buffer fills, the producer cannot finish and cannot emit the count — deadlock despite bounded buffers. Feedback loops and split/recombine topologies require explicit packet-count and receive-order reasoning.

## 8. Disconfirming examples (desk checks, not runtime evidence)

- **No automatic rollback:** unloading a plugin after sending an email does not unsend it.
- **No global LIFO:** two separate fiber effects may begin cleanup concurrently.
- **No progress proof:** count-before-records can deadlock despite bounded channels.
- **No compatibility from names:** equal service names do not establish behavioral compatibility.
- **No output determinism:** equivalent lifecycle configurations do not guarantee the same LLM response.

These are source-grounded checks of the interpretation, not results from running a Cordis/FBP system in this setup.

## Sources and limits

- **Paper:** [arXiv 2608.25512 v1](https://arxiv.org/abs/2608.25512), submitted 26 August 2026, 92 pages. Proofs not independently mechanized.
- **Cordis implementation:** [upstream `fiber.ts`](https://github.com/cordiverse/cordis/blob/main/packages/core/src/fiber.ts), inspected with upstream 4.0.0-rc.12; moving branch, API marked unstable. The [DSH vendor manifest](https://github.com/deepseek-ai/deepseek-harness/blob/master/vendor/README.md) describes 4.0.0-rc.7 with 24 local modifications, not interchangeable with upstream.
- **FBP:** Morrison's [conceptual guide](https://jpaulm.github.io/fbp/concepts.html) and [deadlock chapter](https://www.jpaulmorrison.com/fbp/deadlock.shtml) support the model and counterexample, not claims about every current runtime.
- **Evidence boundary:** no Cordis or FBP runtime was installed or run for this research. These are source interpretations, not verified runtime behavior or accepted local use.
