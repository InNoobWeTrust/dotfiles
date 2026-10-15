# Implementation Dispatch Payload and Preflight

Read this reference before dispatching to a code implementer. The main orchestrator selects one approved functional unit; a full plan may be provided only as context and is never executable scope.

## Accepted dispatch basis

Use exactly one basis:

| Basis | Use when |
|---|---|
| Approved plan / Active Milestone Packet | Work is non-atomic, multi-step, or phased; cite the specific approved separate phase file referenced in the main plan. |
| Atomic patch exception | One coherent, independently verifiable outcome has a fully known scope and evidence, and no design or contract decision remains open. |

## Required unit payload

Bound all fields before launch:

1. Plan-basis citation (pointing to the specific separate phase file) or Atomic patch exception rationale.
2. Unit ID and one-sentence outcome.
3. Exact writable surface: matching the approved locked scoped file tree delta for this phase within in-scope boundaries (files to create/modify/delete; out-of-scope files untouched; zero unapproved files; scratch cleanup required).
4. Locked interface & DTO contracts: concrete code signatures, data schemas/types, and error variants to implement or preserve (zero contract degrees of freedom; zero invented interfaces; no loose prose descriptions).
5. Prerequisites already satisfied.
6. Explicit out-of-scope list.
7. Acceptance criteria and required evidence.
8. Stop conditions.
9. Approved materialization choices: the unit-relevant capability-to-library/API mapping defined below, or an explicit `N/A` with rationale when no capability choice is affected. Required for both dispatch bases.

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

Do not dispatch if there are zero or multiple units; the unit is not bound to a referenced separate phase file; acceptance criteria/evidence are absent; boundary interfaces or DTO contracts are described in loose prose rather than locked code types; writable surface does not conform to the locked scoped file tree or breaches scope boundaries; any design or contract decision is unresolved; a prerequisite is blocked; a required consumer contract is absent or unapproved; or scope expansion is requested. Return `INCOMPLETE` with continuation state rather than substituting, silently rescoping, or absorbing adjacent work.

## Preflight

- [ ] The decision gate permits delegation.
- [ ] Exactly one functional unit is selected from an approved separate phase file; any plan is context only.
- [ ] Exactly one accepted dispatch basis is declared.
- [ ] Material cross-component design has the current independent challenge receipt required by [Design acceptance](../../team-operating-model/references/design-acceptance.md), regardless of author; or no material design is changed. Primary approval alone is insufficient.
- [ ] Every required unit-payload field is bounded.
- [ ] Materialization choices are resolved and primary-approved (or explicitly N/A); the dispatch carries the unit-relevant rows, accessible guidance/API sources, dependency-edit scope, and reuse evidence. Missing/incompatible choices block implementation, including atomic patches.
- [ ] Boundary interfaces, method signatures, DTO types, and error variants are locked as concrete code, leaving zero contract degrees of freedom to the implementer (zero invented interfaces).
- [ ] Declared writable surface strictly matches the locked scoped file tree delta within in-scope boundaries, out-of-scope boundaries are respected, and cleanup of temporary artifacts is required (zero invented files).
- [ ] Rewrite semantics/interfaces are classified delete or preserve.
- [ ] Affected public APIs or consumer apps have approved contract/stubs and sign-off.
- [ ] The declared writable surface, allowed actions, out-of-scope boundary, and stop conditions agree.
- [ ] The phased Delivery Contract is included only when its trigger applies, with delegation-specific scope, adjacent-finding, action, and continuation instructions.
- [ ] The five-section output contract and surgical context are present.
