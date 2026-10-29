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

## Real-first execution

- Default to exercising the actual implementation with real dependencies and
  observing relevant effects. Direct pure-function calls and deterministic input
  fixtures are real execution, not dependency substitution.
- Determine ownership by who defines the interface, not by transport, process,
  deployment or repository boundaries. Code, services and databases the current
  system owns stay owned when reached over HTTP or run separately. Organisational
  membership or deployment topology alone does not establish ownership; what
  governs is whether the current system defines and controls the contract.
- Owned and standalone interfaces require actual execution. Do not replace them
  with a double to avoid setup, isolation or cost. If an owned component is
  unavailable or unsafe to run, report that behavior UNVERIFIED; do not invent a
  fake under a feasibility or side-effect exception.
- For an external service we do not control, use a contract-derived mock, stub,
  fake or fixture first once it has an established contract. Establish that
  contract from an external specification, published schema, or provider
  documentation — not from client code or a model's guess. Recorded provider
  responses are sample fixtures only: they evidence observed behavior at one point
  in time and do not certify the full interface, error contract, or provider
  availability. Unknown or missing authoritative contract evidence blocks the
  mock rather than authorizing an invented interface.
- State what was substituted and the contract source. A contract-derived double
  verifies only behavior attributed to that external contract; it does not verify
  the provider's availability, authentication, real responses or failure modes
  and is not real provider integration. It may exercise genuine local logic, but
  keep that evidence separate from boundary verification.
- Establish expected results and a disconfirming condition from requirements,
  specifications, invariants or independently verified facts before judging the
  run. Do not copy the implementation's current output into expected values or
  use a model's plausible guess as the oracle. Exercise a relevant failure path
  that would expose incorrect behavior; do not weaken assertions to obtain green.
- Match the claimed engine, version or platform. A different real target verifies
  only that target: SQLite results do not establish PostgreSQL behavior. If the
  required target is unavailable, report that coverage as UNVERIFIED.
- Apply this selection policy to new or changed checks. Preserve existing suites
  and report their actual coverage limits; do not delete, weaken or relabel them.
  Keep execution within existing authority, data and resource bounds, clean up
  owned state, and do not assume a local machine or test database is disposable.
  Missing real resources do not authorize installs, safety bypasses or a simulated
  pass.

## Optional test-first loop

Use a failing check first when it clarifies the contract or guards a regression.
Observe the intended failure, then implement the smallest correct change. Adjust
structure as needed for that authorized behavior, keeping checks intact; once
behavior is locked, structural findings inside the task footprint are mandatory
cleanup while optional refinements require explicit approval. Test-first is not
mandatory for documentation, trivial edits or exploratory research.

## Optional clean-room verification

Use independent fresh contexts when blindness materially strengthens evidence.
Give implementers only the approved specification and permitted sources, not
hidden tests; give verifiers the acceptance contract and authorized check surface.
Specify allowed commands, diagnostics, actions and resource limits. An interface
or specification mismatch returns to the primary instead of an unchanged retry
loop. Claim blindness only when context/source access can actually be verified;
otherwise label the independence limit. Missing runtime capability means
UNVERIFIED, not a simulated pass or permission to install/bypass controls.
