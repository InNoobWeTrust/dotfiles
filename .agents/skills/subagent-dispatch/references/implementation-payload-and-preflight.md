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
9. Approved materialization choices: the unit-relevant capability-to-library/API mapping defined below, or an explicit `N/A` with rationale when no capability choice is affected. Required for both dispatch bases.

## Structural context — part of the unit handoff

For new or changed responsibilities/boundaries/dependencies, include the relevant slice of the current [source-boundary contract and map](../../architecture-design/references/structural-integrity.md): settled capability home paths and public boundary, split-or-keep rationale, allowed dependency direction, proposed edge delta, state/lifetime and consumer/normal-error flow, and source revision/coverage. Settle this before the worker's first affected source write or generator invocation; a broad writable directory is not a placement decision. Link an accessible scoped [source-map record](../../memory/references/source-maps.md) or provide a compact inline map; require freshness checks before reuse. No mandatory full-repo inventory or new memory store. If these surfaces are unchanged, briefly name the existing owner instead.

Workers return actual placement and edge changes, relevant source/check evidence, unknowns and invalidated map entries. An architectural defect or needed out-of-scope extraction returns to the primary; do not evade it by growing an allowed file. The primary checks the combined graph and reader-visible flow, not just individual worker PASS labels. Internal helper choices remain flexible within the approved responsibility/contract.

## Materialization choices — part of the implementation contract

Core logic and interface signatures are not enough: specify which established capabilities must implement them. The primary resolves choices using repository dependencies/conventions, explicit user constraints, and the smallest applicable [code-craft language reference](../../code-craft/references/languages/README.md) or pattern-catalog result. Carry the approved unit-relevant rows from the plan into the dispatch; do not leave a worker to infer selections from a skill name, broad plan link, or remembered coding patterns.

Record these fields in the existing plan/phase file (inline for an atomic patch); no separate registry is required:

| Field | Required content |
|---|---|
| Capability → selected provider | Concrete package/tool/platform and required API/entry point; select one, not an unresolved list of alternatives. |
| Compatibility | Repository-resolved version or supported range/runtime constraints; consult current API documentation, not guessed signatures. |
| Basis and guidance | Brief rationale, repository evidence, applicable code-craft reference/section, and authoritative API docs or a repository usage example. |
| Dependency surface | Existing dependency or approved addition; name allowed manifest/lockfile changes within the locked writable surface. Selection is not permission to install packages or use network. |
| Exceptions and prohibitions | Approved deviations and rationale, or `NONE`; identify substitutions/custom reimplementations that are forbidden. |
| Acceptance evidence | Actual call sites using the selected APIs plus relevant behavior checks; an installed or unused import alone is not evidence. |

For new or substantially changed structured CLIs, prefer the established parser recommended for the stack (see [CLI & TUI Stacks](../../code-craft/references/languages/cli-tui-stacks.md)), rather than defaulting to hand parsing or a lower-level built-in interface from training memory. Preserve compatible repository choices; a small-utility standard-library choice or another deviation must be explicit and primary-approved with its suitability rationale, not invented by the implementer. This does not require new dependencies for unrelated patches or override repository/user constraints. Library recommendations stay in code-craft; this contract carries the researched selection, not a duplicated library catalog.

Supply worker-accessible guidance/doc paths or scoped excerpts and permit their reads. Before coding, the worker confirms the selected API and compatibility against those sources. Missing choices or inaccessible required sources → `INCOMPLETE`; an unavailable/incompatible selected library/API → `INCOMPLETE: CONTRACT_DEFECT` with evidence and a proposed adjustment for the primary. Never silently substitute, vendor, or reimplement the capability. Approval follows Delivery Ownership; reapprove and propagate a changed choice before dependent work resumes.

### Example: Python multi-command CLI

```text
Capability: command/option parsing → typer; use typer.Typer and @app.command.
Compatibility: retain the typer version resolved in the project's lockfile.
Basis: code-craft/references/languages/python.md, CLI and TUI;
       code-craft/references/languages/cli-tui-stacks.md, Python.
API source: https://typer.tiangolo.com/tutorial/commands/ (permitted READ).
Dependency surface: existing dependency; no manifest/lockfile edits or installs.
Exceptions: NONE. No argparse substitution or handwritten argv parser.
Evidence: command definitions and invocation use Typer; check --help,
          valid command execution, and rejection of invalid options.
```

Resolve guidance paths against the worker's accessible instruction root and confirm repository/version facts before dispatch; the example is a contract shape, not a claim about the current repository.

### ACI Pass / prototype

- Result: PASS for the source interface; live implementer compliance remains unverified.
- Main risks: inherited-guidance assumptions, vague dependency lists, unused imports, silent fallback, and selection mistaken for installation authority.
- Upgrades: capability/API mapping, compatibility and accessible sources, explicit exception owner, scoped dependency edits, and call-site/behavior evidence.
- Prototype: 2026-10-14; inspect the next 1–2 real implementation handoffs for choice retention and actual reuse before claiming effectiveness.

For a rewrite, overhaul, or delete-and-rebuild unit, classify each old semantic/interface as **delete** or **preserve**. If a public API or consumer app is affected, require approved consumer-facing contract/stubs and sign-off before launch.

## Stop-before-dispatch conditions

Do not dispatch without one coherent approved unit, scope, acceptance evidence, required consumer contracts and satisfied prerequisites. Unresolved material decisions or requested scope expansion return to the primary. Missing phase-file scaffolding alone is not a blocker. Return `INCOMPLETE` with continuation state rather than silently substituting, rescoping or absorbing adjacent work.

## Preflight

- [ ] The decision gate permits delegation.
- [ ] One approved functional unit is selected; a broad plan is context only.
- [ ] Exactly one accepted dispatch basis is declared.
- [ ] Material cross-component design has the current independent challenge receipt required by [Design acceptance](../../team-operating-model/references/design-acceptance.md), regardless of author; or no material design is changed. Primary approval alone is insufficient.
- [ ] Every required unit-payload field is bounded.
- [ ] Materialization choices are resolved and primary-approved (or explicitly N/A); the dispatch carries the unit-relevant rows, accessible guidance/API sources, dependency-edit scope, and reuse evidence. Missing/incompatible choices block implementation, including atomic patches.
- [ ] Required consumer signatures/schema/errors are settled; no invented business semantics or unapproved public contract changes.
- [ ] Writable scope, disjoint ownership and cleanup are explicit; exact file deltas are conditional on coordination needs.
- [ ] Rewrite semantics/interfaces are classified delete or preserve.
- [ ] Affected public APIs or consumer apps have approved contract/stubs and sign-off.
- [ ] The declared writable surface, allowed actions, out-of-scope boundary, and stop conditions agree.
- [ ] The phased Delivery Contract is included only when its trigger applies, with delegation-specific scope, adjacent-finding, action, and continuation instructions.
- [ ] The five-section output contract and surgical context are present.
