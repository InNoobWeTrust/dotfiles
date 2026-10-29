// Optional research questions and a bounded pilot, not promoted agent policy.
= Conditional lessons for design and materialization

*Status:* these questions are optional research guidance, not accepted production instructions or a new approval gate. Apply them when component/plugin lifetimes, changing dependencies, streaming channels or rollback claims are actually involved; skip the extra machinery for straightforward linear code.

Existing implementation guidance remains the owner of ordinary execution-flow practice: inspect component/channel ownership, buffer bounds, backpressure, ordering and termination inside an approved stack. The research does not authorize replacing that stack, adopting Cordis/NoFlo, adding a second orchestrator or implementing a custom runtime.

== Questions to carry through the work

#table(
  columns: (1.1fr, 1fr, 1.3fr, 1fr),
  inset: 5pt,
  table.header([*Check*], [*Apply when*], [*Evidence to record*], [*Stop signal*]),
  [Separate the axes], [A design invokes spatiotemporal composition.], [Which claim concerns dependencies/lifetimes, and which concerns packet flow.], [The term means scheduling or geography without qualification.],
  [Declare requirements], [Effects need context or services.], [Dependencies and required capabilities at the relevant effect boundary.], [A required dependency is hidden in global state.],
  [Explain lifecycle order], [Providers can appear, disappear or reload.], [Load dependencies before consumers; stop dependents before providers.], [A dependent can outlive an unavailable provider without a defined contract.],
  [Name cleanup scope], [An implementation relies on teardown ordering.], [Actual selected API/version; distinguish within-effect order from cross-effect concurrency.], [Assumed cross-effect LIFO without source evidence.],
  [Bound the inverse claim], [A feature promises rollback or cleanup.], [Exact inverse, compensation, or explicitly unrestorable effect; equivalence used.], [An external emission is described as automatically undone.],
  [Locate durable state], [A component owns state or reloads.], [Exclusive/restorable versus shared/external state; what reload loses.], [Required state has no surviving owner or recovery contract.],
  [Separate security claims], [A component is untrusted.], [External execution boundary and its actual protection, separately from dependency controls.], [Contexts or packet ownership are called a sandbox.],
  [Check compatibility], [A service provider is selected or replaced.], [Required structural/behavioral contract, not merely matching service names.], [Name/version equality is treated as proof of behavior.],
)

These checks are derived from the inspected paper and implementation, not measured guidance effectiveness. They do not require a universal form or a separate report: preserve relevant observations in the work's existing design/implementation handoff. @paper @fiber

== Dataflow questions remain separate

For a concurrent streaming workload, the existing execution-flow lens already asks about component boundaries, ownership, buffer bounds, backpressure, ordering and termination. Canonical FBP provides vocabulary for that inspection; a bounded queue or a DAG diagram alone supplies none of the missing behavioral evidence. @fbp

For example, the count-before-records case in the preceding chapter disconfirms “bounded means safe.” Removing a lifecycle-managed consumer also says nothing, by itself, about pending packets or in-flight work: the communication and shutdown contracts still have to be known, rather than inferred from the two models' names.

== One bounded pilot before any promotion

*Comparison:* on one authorized real design/materialization task, apply the existing guidance and these optional questions to the same source inputs and acceptance contract. Include a relevant failure case, such as irreversible emission or an unavailable component; do not execute unsafe effects merely to test the questions.

*Observations:* record any concrete defect the baseline missed, any false alarm or unnecessary machinery the questions added, and whether the evidence was obtainable. A source walkthrough can check comprehension, but must remain labeled a walkthrough rather than an executed lifecycle test or proof of improved agent behavior.

*Decision boundary:* retain research status until independent review and an accepted use support promotion under the setup's existing promotion process. There is no accepted local use yet; absence of an observed defect or successful document compilation does not establish effectiveness.

== Disconfirming examples

- *No rollback:* unloading a plugin after sending an email does not unsend it.
- *No global LIFO:* two separate fiber effects may begin cleanup concurrently.
- *No progress proof:* a count-before-records protocol can block despite bounded channels.
- *No behavioral proof:* equal service names do not establish compatible behavior.
- *No output determinism:* equivalent lifecycle configurations need not generate the same model response.

These examples are desk checks of the interpretation, not results from running a Cordis/FBP agent system.
