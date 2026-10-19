# Proportionate Verification and Testing

Select meaningful checks and their persistence category before writing them.
Use existing repository gates and protect established suites: never delete,
weaken or bypass them without explicit user authorization.

## Behavior and acceptance

For acceptance criteria, user stories or BDD examples, establish the actor,
preconditions, action and externally observable outcome. Include meaningful
negative paths, permissions, invalid inputs and recovery where relevant. Use
Given/When/Then only when it clarifies a scenario; prose or a small example table
is sufficient otherwise. Resolve contradictory outcomes with the authorized owner.

Specification-only work ends with agreed behavior, open questions and how the
outcome could be checked; it does not require implementation or test execution.
Before calling implemented behavior complete, an agent compares each in-scope
criterion with actual code paths and observed checks, noting missing or stale
evidence. Exercise checks only within authorization. No mandatory traceability
matrix, status-symbol parser or extra commit gate is needed. Status labels alone
never establish coverage or readiness to commit.

## Evidence and persistence

- Retain without extra approval only meaningful end-to-end behavior tests and
  important unit tests for critical logic: authorization, financial calculations,
  integrity invariants and state transitions.
- Other leaf-unit checks, exploratory assertions and one-off harnesses remain
  outside the repository in approved scratch and are cleaned up before handoff.
  Implementation or commit approval does not authorize retaining extra tests.
- Prefer direct execution or existing checks when those establish the outcome.
  Exercise relevant negative/failure paths, not only the happy path.
- Define acceptance criteria and a disconfirming check before judging the result.
  Report PASS, FAIL or UNVERIFIED with observed evidence and limitations. A green
  test does not prove that its asserted behavior is the right contract.

## Optional test-first loop

Use a failing check first when it clarifies the contract or guards a regression.
Observe the intended failure, then implement the smallest correct change. Adjust
structure as needed for that authorized behavior, keeping checks intact; green
tests do not authorize discretionary cleanup. Later maintainability refinement
requires usefulness and explicit approval. Test-first is not mandatory for
documentation, trivial edits or exploratory research.

## Optional clean-room verification

Use independent fresh contexts when blindness materially strengthens evidence.
Give implementers only the approved specification and permitted sources, not
hidden tests; give verifiers the acceptance contract and authorized check surface.
Specify allowed commands, diagnostics, actions and resource limits. An interface
or specification mismatch returns to the primary instead of an unchanged retry
loop. Claim blindness only when context/source access can actually be verified;
otherwise label the independence limit. Missing runtime capability means
UNVERIFIED, not a simulated pass or permission to install/bypass controls.
