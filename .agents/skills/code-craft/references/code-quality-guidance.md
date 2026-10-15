# Code Quality Guidance

Optimize for correctness and human understanding, not mechanical style metrics.
Follow repository conventions and expose only the interfaces callers need.

## Before writing

Check existing repository dependencies, standard libraries and platform tools
for each affected capability. For CLI/TUI capabilities, consult established
tool directories and package registries before inventing glue. Reuse suitable
capabilities; explain a custom implementation's unmet requirement and maintenance
trade-off. Selection does not grant install/network authority.

Settle behavior and important consumer contracts before independent implementation.
The autonomous primary may approve researched in-scope choices; workers return
unresolved choices or defects, and human-reserved decisions remain human-owned.
Use [Planning and shared understanding](../../working-principles/references/planning.md)
when those contracts or rewrite semantics need clarification.

## During implementation

- Give units one clear responsibility and make effects and dependencies visible.
- Prefer deep modules with small useful interfaces over shallow wrappers.
- Use idiomatic language constructs and meaningful domain names. Honor an
  existing glossary; resolve critical semantic ambiguity, not routine naming.
- Nesting depth, function length and export counts are readability signals,
  not numeric stop gates. Extract only when a named concept improves the flow.
- Do not add classes/DTOs, one-export files or forwarding helpers merely to
  satisfy a pattern. Small linear utilities can remain small and linear.
- Comments explain non-obvious constraints or rationale. Public documentation,
  module headers and README updates belong where consumers/maintainers need
  them, not automatically in every file or directory.
- Preserve error context; do not turn failure or ambiguous semantics into fake
  success. Make concurrency and resource ownership explicit.
- Track material deferred work with its consequence, owner and revisit trigger;
  do not generate speculative abstractions or mandatory debt-marker boilerplate.

Use [Testing](testing.md) for verification and test retention. Scientific ideation
is not production delivery: evaluate hypotheses and experiment validity without
forcing engineering roadmaps or TDD, while retaining data integrity and safety.
