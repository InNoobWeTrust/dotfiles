---
metadata:
  prototype: "2026-10-28"
  aci-pass: |-
    Result: PASS for the source interface; live implementer compliance remains unverified.
    Main risks: inherited-guidance assumptions, vague dependency lists, unused imports, silent
    fallback, and selection mistaken for installation authority.
    Upgrades: capability/API mapping, compatibility and accessible sources, explicit exception owner,
    scoped dependency edits, and call-site/behavior evidence.
    Prototype: inspect the next 1–2 real implementation handoffs for choice retention and actual
    reuse before claiming effectiveness.
---

# Implementation Dispatch Payload and Preflight

Read this reference before dispatching to a code implementer. The main orchestrator selects one approved functional unit; a full plan may be provided only as context and is never executable scope.

## Accepted dispatch basis

Use exactly one basis:

| Basis | Use when |
|---|---|
| Approved plan / Active Milestone Packet | Cite the specific approved unit; a separate phase file is useful for persistent/resumable handoffs, not mandatory for file count. |
| Atomic patch exception | One coherent, independently verifiable outcome has a fully known scope and evidence, and no design or contract decision remains open. |

## Required unit payload

Bound all fields before launch:

1. Approved plan-unit citation or explicit inline atomic contract.
2. Unit ID and one-sentence outcome.
3. Approved writable surface, exclusions and cleanup: use exact file deltas when ownership needs them; otherwise a bounded directory/component surface may suffice.
4. Approved behavior and affected consumer contracts: concrete signatures/schema/errors where consumers need them. Internal helper choices need not be frozen; business semantics and public contracts cannot be invented.
5. Prerequisites already satisfied.
6. Explicit out-of-scope list.
7. Acceptance criteria and required evidence.
8. Stop conditions.
9. Human-approved materialization choices and receipt: task/scope, proposal revision,
   human approval source and unit-relevant capability/API mapping. `N/A` new choices
   can describe unchanged mechanics, never waive the current human stack receipt.
   Required for both dispatch bases, even prose, utilities and atomic patches.

## Structural context — part of the unit handoff

For new or changed responsibilities/boundaries/dependencies, include the relevant slice of the current source-boundary contract and map: settled capability home paths and public boundary, split-or-keep rationale, allowed dependency direction, proposed edge delta, state/lifetime and consumer/normal-error flow, and source revision/coverage. Settle this before the worker's first affected source write or generator invocation; a broad writable directory is not a placement decision. Link an accessible scoped source-map record or provide a compact inline map; require freshness checks before reuse. No mandatory full-repo inventory or new memory store. If these surfaces are unchanged, briefly name the existing owner instead.

Workers return actual placement and edge changes, relevant source/check evidence, unknowns and invalidated map entries. An architectural defect or needed out-of-scope extraction returns to the primary; do not evade it by growing an allowed file. The primary checks the combined graph and reader-visible flow, not just individual worker PASS labels. Internal helper choices remain flexible within the approved responsibility/contract.

## Materialization choices — part of the implementation contract

Core logic and interface signatures are not enough: specify which established capabilities must implement them. The primary researches existing/native/standard-library and established choices using current sources and task constraints; the **human explicitly approves the presented stack before any design or implementation**. Read-only discovery/research/review may precede it, not interfaces, schemas, module plans or prototypes. Carry approved unit-relevant rows and the human receipt into dispatch; never infer selections from skill names, broad plans or remembered patterns.

Record these fields in the existing plan/phase file (inline for an atomic patch); no separate registry is required:

| Field | Required content |
|---|---|
| Capability → selected provider | Concrete package/tool/platform and required API/entry point; select one, not an unresolved list of alternatives. |
| Human receipt | Task/scope, proposal revision, explicit human approval source, conditions/fallbacks; primary plan approval is not stack approval. |
| Compatibility | Repository-resolved version or supported range/runtime constraints; consult current API documentation, not guessed signatures. |
| Basis and guidance | Brief rationale, repository evidence, applicable approved language/pattern reference section, and authoritative API docs or a repository usage example. |
| Dependency surface | Existing dependency or approved addition; name allowed manifest/lockfile changes within the locked writable surface. Selection is not permission to install packages or use network. |
| Exceptions and prohibitions | Approved deviations and rationale, or `NONE`; identify substitutions/custom reimplementations that are forbidden. |
| Acceptance evidence | Actual call sites using the selected APIs plus relevant behavior checks; an installed or unused import alone is not evidence. |

For new or substantially changed structured CLIs, prefer the established parser recommended by accessible stack guidance or repository convention, rather than defaulting to hand parsing or a lower-level built-in interface from training memory. Preserve compatible repository choices; a small-utility standard-library choice or another deviation must be explicit and human-approved with its suitability rationale, not invented by the implementer. This does not require new dependencies for unrelated patches or override repository/user constraints. Library recommendations stay with the applicable approved reference; this contract carries the researched selection, not a duplicated library catalog.

Supply accessible guidance/docs or excerpts and permit their reads. Before design/
code, confirm the human receipt and actual API/runtime suitability. Missing choices,
receipt or sources → `UNVERIFIED`/`INCOMPLETE`; unavailable API/tool → contract defect
with evidence. Never silently substitute, vendor, mock or reimplement it. Reuse only
unchanged same-task approval; changed providers/material API/runtime constraints or
custom exceptions need HUMAN reapproval before dependent work. AFK needs approved
fallbacks or a halt. Selection never authorizes installation/network effects.

### Example: Python multi-command CLI

```text
Capability: command/option parsing → typer; use typer.Typer and @app.command.
Compatibility: retain the typer version resolved in the project's lockfile.
Basis: accessible language/CLI reference (e.g. Python + CLI/TUI stack guidance)
       or repository convention, plus current library documentation.
API source: https://typer.tiangolo.com/tutorial/commands/ (permitted READ).
Dependency surface: existing dependency; no manifest/lockfile edits or installs.
Exceptions: NONE. No argparse substitution or handwritten argv parser.
Evidence: command definitions and invocation use Typer; check --help,
          valid command execution, and rejection of invalid options.
```

Resolve guidance paths against the worker's accessible instruction root and confirm repository/version facts before dispatch; the example is a contract shape, not a claim about the current repository.

For rewrites classify each old semantic/interface as **delete** or **preserve**
within approved scope. Backward compatibility is OFF unless actual root engineering
docs explicitly enable it with scope; a bare link, nested ADR, existing client or
old test is not opt-in. Unavailable root evidence is unknown. Settle required
current task contracts and opted-in promises, not automatic legacy retention for
outside consumers. Include approved deletion/reference cleanup, not pointer stubs.
Report known consumers as consequences; investigate unknown required current/
outside-consumer contracts proportionately, mark UNVERIFIED and pause only dependent
work. Opt-out never authorizes new scope, unrelated deletion, data loss or unsafe
effects. Security, data/recovery and authorized availability remain distinct duties.

## Stop-before-dispatch conditions

Do not dispatch without one coherent approved unit, scope, acceptance evidence, required consumer contracts and satisfied prerequisites. Unresolved material decisions or requested scope expansion return to the primary. Missing phase-file scaffolding alone is not a blocker. Return `INCOMPLETE` with continuation state rather than silently substituting, rescoping or absorbing adjacent work.

## Preflight

- [ ] The decision gate permits delegation.
- [ ] One approved functional unit is selected; a broad plan is context only.
- [ ] Exactly one accepted dispatch basis is declared.
- [ ] Material cross-component design has the current independent challenge receipt (responsibility/dependency direction, consumers and simpler alternative examined by a separate instance), regardless of author; or no material design is changed. Primary approval alone is insufficient.
- [ ] Every required unit-payload field is bounded.
- [ ] Current human approval receipt and resolved materialization choices are carried with API sources, dependency-edit scope and actual reuse evidence. N/A new choices does not waive approval; missing/incompatible evidence blocks affected design/code, including atomic patches.
- [ ] Required consumer signatures/schema/errors are settled; no invented business semantics or unapproved public contract changes.
- [ ] Writable scope, disjoint ownership and cleanup are explicit; exact file deltas are conditional on coordination needs.
- [ ] Rewrite semantics/interfaces are classified delete or preserve.
- [ ] Required current/outside-consumer contracts and root-opted-in promises are settled; unknown required evidence pauses only dependent work. Known impact is reported, not a default legacy veto.
- [ ] The declared writable surface, allowed actions, out-of-scope boundary, and stop conditions agree.
- [ ] The phased Delivery Contract is included only when its trigger applies, with delegation-specific scope, adjacent-finding, action, and continuation instructions.
- [ ] The five-section output contract and surgical context are present.
