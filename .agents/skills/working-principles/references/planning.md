# Planning and Shared Understanding

Use this reference alone for lightweight discovery or planning. It does not
activate formal specifications, a delivery workflow or a real team. Scale effort
to uncertainty and consequence, not file count. Exploration and planning do not
authorize implementation; scientific exploration needs no software contract freeze.

## Validate understanding before action (source walkthrough)

Before substantial implementation or a consequential choice, reconcile the
working understanding with sources, not with the plan's own restatement:

1. Re-read the original and latest user instructions and restate the requested
   outcome faithfully; keep earlier compatible constraints active.
2. Separate the objective and hard invariants from the proposed mechanism; state
   what would count as success and failure.
3. Check the factual claims and source versions the plan depends on: current
   files, documentation, interfaces, behavior and applicability to this revision
   and environment. Record unavailable evidence as a gap.
4. For reused capabilities, patterns or prior decisions, state why they fit this
   problem and what was rejected; familiarity is not fit.
5. Run a disconfirming check for the strongest source-backed reason the
   interpretation or approach is wrong, including conflicting requirements and
   affected consumers.
6. Correct the understanding and plan before the affected action or code. If new
   information invalidates a settled choice, stop the affected unit and revise
   through its owner.

When the interpretation or direction is consequential, apply the active
direction-eligibility policy: an eligible proposal, a separate validation
reconciled to the original sources (or the deciding authority's own validation
when it did not author the proposal), then the applicable authority. The
validator receives the original sources and the proposal, not the primary's
summary alone. Record the confirmed choice, source revisions, conditions and
invariants, uncertainty, what would change it and validation evidence in existing
task context; keep it proportionate and inline. A mechanically settled step needs
no separate direction round; its explicit source reference and acceptance are
enough. This is bounded decision validation, not team activation; use the
applicable dispatch contract for the roles. It validates understanding and
decision authority, not permission; human-reserved decisions still require the
user.

## Primary Planning

- Establish the problem, affected people/consumers, current behavior, desired
  outcome, constraints, non-goals, authority and observable success before choosing
  a solution. A plan request does not mean the solution is settled.
- Research available facts before asking questions only the user can answer.
  Distinguish evidence, inference, reversible assumptions and unresolved decisions.
- Prefer the simplest adequate approach and existing capabilities. Respect real
  code, conventions, bounded contexts and data models; avoid hypothetical scale.
- Explain consequential choices in plain language: relevant facts and unknowns,
  terms, a concrete example, alternatives and practical consequences. Ask only
  unresolved questions, then summarize the chosen model and uncertainty. Revalidate
  agreement if important context was missing; clear authorized work needs no ritual gate.
- Retain intent, cross-boundary coherence and the settled record with the primary.
  Consequential interpretation or direction follows the active eligibility policy;
  workers return contract defects to that owner. New scope, broken public promises
  and reserved decisions still require human approval. AFK adds no authority.

## Tactical Planning

- Trace existing files, symbols and consumers before prescribing changes. Plan
  thin, independently useful outcomes with observable acceptance, including relevant
  failure/recovery behavior. Order dependencies so later work builds on verified results.
- State scope, non-goals, affected behavior, checks, cleanup and exit criteria.
  Use an inline checklist for a clear bounded task. Add exact file deltas, concrete
  interfaces, a roadmap or separate phase files only when consumers, disjoint
  ownership, risk or resumption need them—not for ordinary helper choices.
- Make integration risks and reversible assumptions visible. Leave local details
  to implementers within agreed scope and contracts; avoid speculative features
  and abstractions. A handoff should cost less than the independent work it enables.
- For milestones and dependencies that need that detail, use an available phased-delivery capability or an inline phase/slice contract: outcome, independently useful units, writable ownership, observable acceptance, dependency order, stops and continuation state. Both routes are usable without team activation.

## Discovery and consumer boundaries

Discuss one consequential layer at a time, outside-in. A small set of high-impact
questions is usually better than an exhaustive interview; three to five is a
ceiling for a deep round, not a quota. Respect an existing glossary and resolve
conflicting critical business meaning, not every variable name.

For rewrites, classify old semantics/interfaces as **delete** or **preserve**.
Show caller-visible before/after examples and settle compatibility with the
authorized owner. Where affected consumers need them, agree on signatures/schema,
errors and stubs before independent implementation. Do not invent hidden shims,
preserve behavior by reflex or break public promises without approval.

If evidence invalidates a plan or contract, stop only the affected unit, explain
the defect and revise through its owner. Verify outcomes against user-grounded
criteria, not solely tests derived from the implementation. Report missing evidence
instead of treating a plan, specification or status label as proof of delivery.
