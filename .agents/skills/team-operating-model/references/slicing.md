# Vertical Slicing

This reference is usable independently; it does not activate a real-team workflow.

Start with one observable user outcome and the smallest path through the
necessary layers that proves it. A database-only or UI-only layer is normally
a dependency task, not a shippable outcome. For infrastructure work, the consumer
can be another developer or service: define the observable usable capability.

1. State acceptance examples and hard invariants before decomposing.
2. Trace the minimum input → behavior → effect/output path.
3. Include necessary failure/recovery behavior; do not equate thin with unsafe.
4. Separate optional variants and later scale from the first usable result.
5. Order dependencies; parallelize only units with settled boundaries and
   disjoint write ownership.
6. Give each unit an outcome, scope/non-goals, prerequisites, contract, evidence
   and stop conditions. Keep it inline unless a separate handoff/resumption
   artifact provides real value.

Do not introduce generic frameworks, speculative flags, unused extension points
or alternate backends just to prepare later slices. Revisit the sequence when
evidence changes; preserve approved compatibility, integrity and safety promises.
