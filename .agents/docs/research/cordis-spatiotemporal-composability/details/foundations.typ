// Definitions and mechanism boundaries; lifecycle and dataflow remain distinct.
= Two complementary questions

Cordis is a TypeScript plugin meta-framework with roots in Koishi. Its paper presents a calculus and an implementation for composing components through tracked effects and reactive environment requirements; it does not make every program reversible. @cordis @paper

#figure(
  table(
    columns: (auto, 1fr), inset: 8pt,
    table.header([*View*], [*Conceptual progression*]),
    [Lifecycle / dependency], [Provider becomes available → consumer can activate → dependent stops before provider disappears.],
    [Dataflow], [Producer output port → buffered connection → consumer input port.],
  ),
  caption: [Two explanatory views, not a proposed runtime architecture. The first concerns component availability and cleanup; the second concerns packet movement and flow control.],
)

== What “spatiotemporal” means here

*Spatial composition* concerns an environment's available dependencies: a component declares what it needs, activates when those requirements are satisfied, and deactivates before they cease to be satisfied. It is not geographic placement, deployment sharding or distributed scheduling. @paper

*Temporal composition* concerns a component's lifetime and the cleanup of its tracked effects. Removing a component should remove its mediated registrations and acquired resources within the model's boundary, rather than leave a listener, timer or handle behind; it is not a promise to reverse arbitrary external history. @paper

An *effect* describes what a computation does to its environment; a *coeffect* describes what it requires from that environment. Cordis uses a context to mediate both, connecting dependency resolution with effect ownership and lifecycle. @paper

== Cleanup ordering is narrower than “LIFO everywhere”

The inspected `packages/core/src/fiber.ts` collects disposers inside one `ctx.effect` execution and runs that registration's collected cleanup in reverse order, sequentially. At fiber unload, however, separate top-level effect disposers are started through `Promise.all`; paper §5.1.3, p. 63, explicitly describes concurrent effect disposal. @fiber @paper

These are different ordering scopes. A consumer must not rely on an unstated cross-effect teardown sequence merely because one registration has reverse-order cleanup; the atomic inverse itself remains an author obligation (§5.1.1, p. 59). @paper

== Canonical flow-based programming

Morrison's FBP describes independent asynchronous black-box process instances connected through named ports. Information packets travel through externally defined connections, with ownership/lifetime rules and bounded buffering; subnetworks support hierarchical composition. @fbp

The network definition describes connectivity rather than hiding it inside each component's code. Backpressure constrains a producer when its receiving connection cannot accept more data; concrete implementations can also expose dropping policies, so their actual contracts must be inspected rather than inferred from a diagram. @fbp

An arbitrary task DAG is not automatically FBP: it may describe finite task dependencies without asynchronous packet processes or bounded channels. An event bus, reactive stream or graph picture likewise does not establish the whole model; Morrison's deadlock discussion includes I/O and external coordination, so FBP should not be read as universally prohibiting side effects. @fbp @deadlock

== Complementarity, not an integration theorem

Lifecycle/dependency composition asks when a component may exist and what must be cleaned up when it leaves. FBP asks how data moves among active components and what happens when consumers are slower than producers. @paper @fbp

Calling these a “control plane” and “data plane” can help explain the distinction, but that is an analytical analogy, not a proof that Cordis plus an FBP runtime forms a safe or useful combined system. Neither source establishes the combined agent architecture or its benefit to this setup.
