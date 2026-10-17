# Structural integrity

Shared method for architecture, implementation and review. Use when maintained code changes responsibility placement, module/public boundaries, dependencies, registration or state ownership. For a local behavior-only patch, record why those surfaces are unchanged and check the local flow; do not demand a whole-repository graph. Research-only work need not adopt delivery gates; do not claim its structure was verified without evidence.

## 1. Map before choosing where to edit

Use existing task/design context, not a new mandatory artifact. Record the question, source revision/worktree (including relevant dirty state), examined paths and unknowns. Use [structural tracing](../../codebase-exploration/references/structural-tracing.md) to obtain evidence.

- Describe each affected component's responsibility and owning layer. Locate the existing home for policy, orchestration, state and effects before choosing files.
- Trace a representative entry → orchestration → capability → effect/result path, including failure propagation and registration. Identify state reads/writes and who controls lifetime. A reader should be able to follow this without reconstructing hidden global behavior.
- Separate these graphs; a pass in one is not a pass in another:

| Graph | Evidence and questions |
|---|---|
| Module/import | Actual imports/re-exports, aliases, generated sources and public types; which component depends on which? |
| Workspace/package | Manifests, workspace members, features/build targets and internal package edges; does reuse pull in an application? |
| External dependency | Direct declarations plus relevant resolved transitive paths from existing lockfiles/resolver output; what new capability, lifecycle or coupling enters? |
| Runtime wiring | Calls, dependency injection, callbacks/plugins, registration and initialization; where do effects and shared state actually connect? |

Mark unsupported languages, conditional targets, dynamic edges, unavailable resolver data and unexamined transitive paths explicitly. LSP symbols and successful builds do not establish complete graph coverage.

## 2. Decide placement and edge changes

State the intended allowed dependency direction, then show proposed edge additions/removals and affected consumers. Distinguish current facts from intended architecture.

**Split or keep deliberately.** Keep a cohesive capability together when its responsibilities and reasons to change align. Extract into a well-named module at the correct existing hierarchy when new work adds unrelated policy/effects, multiple reasons to change, or hides a reusable capability inside a consumer. Preserve a small explicit public surface and inspectable orchestration. File size is a signal, not a split threshold; moving code behind wrappers without separating responsibility is not modularity. Do not create a package/service or generic shared utility merely to reduce line count. New package boundaries need a real ownership, reuse, lifecycle or dependency-isolation reason.

If appropriate placement exceeds authorized writable scope or changes settled consumer contracts, return the evidence and proposed scope/contract revision to the owner. Do not stuff code into an allowed file to evade the boundary, or silently refactor adjacent code.

## 3. Check cycles and direction over the affected closure

For each added edge `A → B`, check whether `B` can already reach `A`, including through **unchanged** modules/packages and other proposed edges. Check the combined change, not each worker's patch in isolation. Use existing authorized tooling or bounded source tracing; record graph kind, resolved configuration, paths searched, command/source evidence and limitations.

Report an actual cycle as an edge witness, for example `A → B → unchanged C → A`. Check forbidden layer direction even when no cycle exists. Distinguish newly introduced/reachable defects from unrelated legacy cycles; an existing permitted runtime callback cycle is not automatically an import-cycle defect. Missing reachability evidence means **UNVERIFIED for that scope**, not “acyclic.” Do not install analyzers or expand execution authority just to obtain a PASS.

## 4. Verify the realized structure

Before writing, include placement/split-or-keep reasoning and relevant graph delta in design intent; check it during design/SOLID review. After writing, compare actual placement, exports, manifests and wiring against that intent, including untouched consumers and all integrated worker deltas. Investigate discrepancies before acceptance. A reviewer independently checks relevant source edges rather than endorsing an author's map by assertion.

Return separate results for behavior/build checks, responsibility/readability, dependency direction/cycles, and graph coverage. Human understandability requires clear names, cohesive boundaries and a traceable normal/error path, not just passing tests. Record exclusions honestly; missing evidence blocks only the corresponding claim or required acceptance item.

## Interface and prototype check

Inputs: scoped change/question, source identity, consumer constraints and authorized tools. Output: compact source-backed responsibility/flow map, placement decision, graph delta and scoped results/unknowns. No extra report is needed for an unchanged boundary.

Prototype walkthrough cases: (1) cohesive local patch stays local, (2) growing mixed-responsibility file gets a placement decision, (3) new edge closes a path through unchanged code, (4) two safe-looking worker deltas form a combined cycle, (5) unavailable LSP/resolver or stale memory cannot yield a complete-graph claim. Validate routing and overhead in the next 1–2 real uses; instruction compliance is not measured improvement in code quality.

### ACI pass

- Result: PASS WITH GAPS — source interface checked; live multi-agent effectiveness remains unverified.
- Main risks: over-scoped graph audits, stale maps, unsupported semantic tools, file splitting without cohesion.
- Interface upgrades: explicit applicability and local fast path, one shared method, source identity/coverage, concrete cycle witness, bounded fallback and ownership escalation. Native tools or authorized integrations can supply evidence; no deployment-specific prerequisite.
