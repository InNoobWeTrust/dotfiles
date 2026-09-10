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
3. Exact writable surface: matching the approved locked file tree delta for this phase (files to create/modify/delete; zero unapproved files; scratch cleanup required).
4. Locked interface & DTO contracts: concrete code signatures, data schemas/types, and error variants to implement or preserve (zero contract degrees of freedom; zero invented interfaces; no loose prose descriptions).
5. Prerequisites already satisfied.
6. Explicit out-of-scope list.
7. Acceptance criteria and required evidence.
8. Stop conditions.

For a rewrite, overhaul, or delete-and-rebuild unit, classify each old semantic/interface as **delete** or **preserve**. If a public API or consumer app is affected, require approved consumer-facing contract/stubs and sign-off before launch.

## Stop-before-dispatch conditions

Do not dispatch if there are zero or multiple units; the unit is not bound to a referenced separate phase file; acceptance criteria/evidence are absent; boundary interfaces or DTO contracts are described in loose prose rather than locked code types; writable surface does not conform to the locked file tree; any design or contract decision is unresolved; a prerequisite is blocked; a required consumer contract is absent or unapproved; or scope expansion is requested. Return `INCOMPLETE` with continuation state rather than substituting, silently rescoping, or absorbing adjacent work.

## Preflight

- [ ] The decision gate permits delegation.
- [ ] Exactly one functional unit is selected from an approved separate phase file; any plan is context only.
- [ ] Exactly one accepted dispatch basis is declared.
- [ ] Every required unit-payload field is bounded.
- [ ] Boundary interfaces, method signatures, DTO types, and error variants are locked as concrete code, leaving zero contract degrees of freedom to the implementer (zero invented interfaces).
- [ ] Declared writable surface strictly matches the locked file tree delta, and cleanup of temporary artifacts is required (zero invented files).
- [ ] Rewrite semantics/interfaces are classified delete or preserve.
- [ ] Affected public APIs or consumer apps have approved contract/stubs and sign-off.
- [ ] The declared writable surface, allowed actions, out-of-scope boundary, and stop conditions agree.
- [ ] The phased Delivery Contract is included only when its trigger applies, with delegation-specific scope, adjacent-finding, action, and continuation instructions.
- [ ] The five-section output contract and surgical context are present.
