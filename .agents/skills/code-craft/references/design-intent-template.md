# Optional Implementation Intent

Use only when a concise contract helps clarify consequential behavior, ownership
or a handoff. Inline intent is enough; this is not Phase 1, a required form or an
upfront maintainability assessment. Reuse an existing approved plan when present.

```text
Outcome: <observable useful behavior; relevant failure outcome>
Scope: <affected source/consumers and writable boundary; non-goals>
Constraints: <required compatibility, safety and implementation choices>
Checks: <authorized repository commands or observable evidence; known limits>
```

Add only details that affect this change: new responsibility/state ownership and
source home, changed signatures/schemas, relevant dependency direction, approved
library/API choices, or known shortcuts for the later assessment. Unchanged
boundaries need only a brief rationale. No mandatory pattern query, complexity
budget, isolation score, module README or debt inventory.

The primary approves researched in-scope choices; human-reserved decisions remain
human-owned. For delegated or phased work, keep the actual unit, approved contract
and ownership references required by that handoff, not a second tracking system.

## Affected surface before simplification

Before locking scope or minimizing an implementation, inspect the affected callers,
tests, fixtures, configuration, exports and deployment entrypoints where relevant.
Include untouched consumers of changed contracts. Record a
brief surface map in the existing intent or change context, not a new plan file.
Prefer repository capabilities, then suitable platform/standard-library features,
then existing dependencies. Minimize the complete behavior, not just its edited
lines: preserve validation, failure handling, security and accessibility contracts.
If tracing reveals an out-of-scope dependency change, revise scope through its
authorized owner before editing it.

## Technology and dependency policy

Preserve the repository's established stack. Prefer a suitable standard library/platform capability; otherwise use a mature, maintained, production-proven ecosystem package rather than recreating an adequately supplied capability. Vendored third-party copies and deliberate dependency-free reimplementations require explicit user opt-in or an existing repository policy, and must record ownership, update, and security rationale.

When choosing a greenfield language/framework stack or adding a substantial platform capability, use the [language index](languages/README.md), then the smallest matching reference. Existing repository conventions and explicit project constraints always win.

## Stop conditions

- **Existing isolation limits:** preserve required behavior, state ownership and checks. Do not redesign a legacy layer merely because it is hard to isolate; return a necessary boundary change to the primary, or record an optional improvement for later assessment.
- **Required consumer contract or approval missing:** use [Planning and shared understanding](../../working-principles/references/planning.md) to clarify caller-visible behavior and consequences before affected implementation.
- **Contract defect:** if an approved contract is defective or unworkable, STOP immediately and report `INCOMPLETE: CONTRACT_DEFECT` with proposed adjustment; do not invent ad-hoc interfaces or alter signatures.
- **Scope violation:** modifying out-of-scope paths, violating an explicitly fixed file delta or leaving scratch artifacts; revise through the authorized owner and clean up.
- **Edge-case semantics unspecified:** stop the affected implementer; the primary researches and approves an in-scope contract. Ask the user only for user-only outcome or authority/safety decisions; AFK never invents a fallback while coding.
- **Proposed vendoring/reimplementation lacks explicit opt-in or documented repository policy:** choose the platform/established dependency or clarify.

For rewrite, overhaul, or delete-and-rebuild work, use [Planning and shared understanding](../../working-principles/references/planning.md). Record affected old semantics/interfaces as **delete** or **preserve**. Settle affected consumer contracts with the authorized owner using caller-visible examples and consequences; do not preserve behavior by reflex or patch code intended for deletion.
