# Implementation Essentials

Use for a concrete implementation question about contracts, errors, types or
verification. This is a small working-code baseline, not a pre-write checklist or
an instruction to clean up adjacent code. Existing repository conventions win.

## Reuse and scope

- **Inspect first:** Find the existing implementation, relevant callers and
  platform/repository capabilities before introducing a replacement.
- **Choose deliberately:** Keep the primary-approved libraries, versions and APIs.
  Report incompatible choices instead of silently substituting a familiar stack.
  Use [language references](languages/README.md) only for an actual stack question;
  no installation, vendoring or toolchain migration is authorized by this guide.
- **Keep the contract:** For rewrites, settle what is preserved or deleted. Do not
  invent caller-visible defaults, fallback semantics or new behavior to finish a
  defective contract; return the precise gap to the primary.

## Make the working path dependable

- **Errors:** Validate external inputs at the relevant boundary. Distinguish
  expected rejection from internal failure; preserve useful error context without
  leaking secrets. Do not catch failures and return success-shaped empty values.
- **Effects and resources:** Make consequential writes and state ownership clear.
  Preserve transaction, cancellation and cleanup contracts; bound retries and
  deadlines where required. Use [execution flow](execution-flow.md) for a concrete
  branching, state or effect-visibility problem.
- **Types:** Use the project's supported types and boundary schemas. Narrow
  untrusted `unknown` values before use; do not escape checks with unchecked casts
  or `any`. Assertions express internal invariants, not validation of user input.
- **Small direct code:** Prefer idiomatic names, explicit decisions and cohesive
  functions. Do not add classes, DTOs, strategies or helpers merely to satisfy a
  style metric. Parameter passing is often enough to expose a dependency.
- **Navigation and contracts:** Maintain [file navigation](file-navigation.md)
  with the affected change. Document public inputs, outputs, failures or examples
  where callers need them; a module README is not mandatory for every code file.

## Verify the authorized result

Use [testing guidance](testing.md) and existing repository commands for relevant
normal and failure paths. Preserve required checks and existing suites; neither
this guide nor a tool catalogue authorizes installing scanners, imposing a new
complexity threshold or broadening test retention.

Report actual results, limitations and known shortcuts in the existing handoff.
Do not convert verification into a readability-audit or debt-inventory phase.
The primary dispatches the separate assessment after working verification;
discretionary refinements remain deferred until usefulness and explicit approval.
