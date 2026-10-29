---
description: "Readable implementation, capability reuse, meaningful verification and test persistence."
globs: "*"
alwaysApply: true
trigger: always_on
---

# Implementation Baseline

- Before design or implementation, obtain the human-approved researched stack
  and custom-exception receipt; no primary, architect or tool can approve it for
  the user. Before custom logic, check repository capabilities, platform/standard libraries
  and established tools; for CLI/TUI discovery consult directories such as
  [Terminal Trove](https://terminaltrove.com/list/). Reuse suitable capabilities;
  justify custom replacements by an evidenced unmet requirement and obtain human
  approval. Selection does not authorize installation or network effects.
- **Mandatory reuse review:** trace each changed capability to actual approved
  library/native-tool APIs and relevant behavior. Standard libraries count;
  unused imports, incidental logging or library use elsewhere do not. Every
  library-free authored unit/location must be flagged directly to the user, even
  when custom code is approved. Group deductions by distinct capability, not
  helper count. Predeclare the **maintainability—reuse policy score**: default
  `max(0, 10 - distinct library-free capabilities)`, listing every unit and every
  deduction even at the floor. A project rubric replaces this component only if
  it retains these flags, explicit numerical deductions and floor reporting;
  otherwise report this component alongside it. This is a policy score, not an
  empirical quality rating or merge threshold. Never invent a conversion or
  double-count a capability. Unknown coverage/approval is `UNVERIFIED`; report
  observed flags regardless. Unapproved custom substitutions or proceeding without
  approval fail review despite green tests. Approved custom code still loses
  points but is not thereby a correctness defect. Reviews of preexisting code
  without historical receipts report approval unknown, not invented misconduct.
  See the [reuse audit](../skills/reviewer/references/reuse-review.md).
- Favor clear responsibilities, small useful interfaces, visible effects and
  idiomatic code. Settle affected consumer behavior/contracts before independent
  implementation; formal signatures/files only where coordination needs them.
  Numeric style thresholds, one-export files and README creation
  are contextual techniques, not universal gates. Do not overengineer utilities.
- Keep compact [file navigation](../skills/code-craft/references/file-navigation.md)
  in native docstrings/comments: purpose for new hand-maintained files; grouped
  symbols and consequential edges where needed. Refresh affected navigation when
  responsibilities, dependencies or consumer flows change. Tiny files need only
  one line; no unrelated retrofit or generated-file edits. Verify source/callers
  before trusting the map; a header does not establish codebase integrity.
- **Structure before volume:** Before generating new or changed capabilities or
  runtime/trust boundaries, settle source homes and allowed dependency direction,
  then materialize code there. Apply the [source-boundary contract](../skills/architecture-design/references/structural-integrity.md);
  green tests or an acyclic graph cannot replace actual placement review.
  Cohesive unchanged-boundary edits need only a brief existing-owner rationale,
  not new folders or forms.
- When current code conflicts with intent, establish affected behavior/consumers
  before choosing a patch or scoped refactor. Do not add compensating layers merely
  to preserve accidental behavior; surface unresolved consequential effects before
  implementation. Use [Code-intent fit](../skills/code-craft/references/code-intent-fit.md).
- Reconcile affected guidance, links, indexes and owned outputs with each change;
  place new material under its actual owner and keep drafts/history off the default
  requirement route. Tidiness is not a clean Git status or permission to discard
  user work, deduplicate blindly or clean unrelated areas.
- Honor an existing glossary and resolve conflicting critical business meanings;
  routine names need no user approval or unsolicited glossary bootstrap.
- Select meaningful verification and persistence before writing checks. Without
  extra approval retain only end-to-end behavior tests and important unit tests
  for critical authorization, financial, integrity or state-transition logic.
  Other checks stay in approved external scratch and are cleaned up before
  handoff. Build/commit approval is not permission to retain extra tests.
- **Ownership decides test doubles:** Exercise standalone code and interfaces
  owned by the current system with actual execution and real dependencies.
  Use a mock, stub, fake or contract fixture first only for an external service
  we do not control whose contract is established outside this system; cite that
  external contract rather than inventing it. HTTP, process or repository
  boundaries do not make an interface external. If an owned component is
  unavailable or unsafe, report that coverage UNVERIFIED instead of inventing a
  substitute; an unknown or missing contract is not permission to mock. Derive
  expected results from requirements, specifications or independently verified
  facts, never from the code's output or a model guess. Direct pure-function
  calls with deterministic fixtures are real testing. Report substituted
  boundaries as UNVERIFIED, never as real provider integration. See
  [Testing](../skills/code-craft/references/testing.md#real-first-execution).
- Honor existing suites and quality gates: never delete, weaken or bypass them
  without explicit user approval. TDD and clean-room testing are optional methods,
  not exemptions from outcome verification or test-retention boundaries.
- Scientific ideation is exempt from production roadmaps, TDD, modularity and
  terminology bureaucracy, not data integrity, safety or resource bounds.

Methods: [Implementation essentials](../skills/code-craft/references/implementation-essentials.md),
[Testing](../skills/code-craft/references/testing.md).
