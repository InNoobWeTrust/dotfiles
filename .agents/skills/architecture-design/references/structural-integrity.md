---
metadata:
  materialization-clarification-added: "2026-10-18"
  review-after: "1–2 real uses or 2027-01-18"
  prototype-review: "Validate routing and overhead in the next 1–2 real uses; instruction compliance is not measured improvement in code quality."
  materialization-review: "Review after 1–2 real uses; source walkthroughs alone do not prove future adherence."
  aci-review: |-
    Result: PASS WITH GAPS — source interface checked; live multi-agent effectiveness remains unverified.
    Main risks: over-scoped graph audits, stale maps, unsupported semantic tools, file splitting without cohesion.
    Interface upgrades: explicit applicability and local fast path, one shared method, source identity/coverage, concrete cycle witness, bounded fallback and ownership escalation. Native tools or authorized integrations can supply evidence; no deployment-specific prerequisite.
---

# Structural integrity

Shared method for architecture, implementation and review. Use when creating or changing maintained capabilities, runtime/trust or public boundaries, dependencies, registration or state ownership, and when relocating source modules. New systems are included. For a cohesive helper or behavior-only edit within an existing boundary, briefly name the existing owner and why those surfaces are unchanged, then check the local flow; do not demand new folders, forms or a whole-repository graph. Research-only work need not adopt delivery gates; do not claim its structure was verified without evidence.

## 1. Map before choosing where to edit

Use existing task/design context, not a new mandatory artifact. Record the question, source revision/worktree (including relevant dirty state), examined paths and unknowns. Trace a bounded affected slice through actual source and consumers: entrypoints, imports/re-exports, manifests/resolution, registration/runtime wiring, state ownership, and representative normal/error flow. Use available semantic tools only for supported methods; complement them with source, manifests and runtime wiring. Mark unsupported languages, dynamic edges, unavailable resolver data and unexamined transitive paths explicitly; symbols/builds alone do not establish full graph coverage.

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

**Settle the source-boundary contract before the first affected source write or generator invocation.** In existing intent, identify capability → actual source home(s), consumer-visible surface, allowed dependency direction and state/lifetime owner; name relevant forbidden edges. Use concrete paths where placement matters, not only conceptual layer names or a broad writable directory. Keep internal helpers flexible within that boundary; no separate artifact or per-symbol inventory is required.

**Materialize the boundaries, not a promise to reorganize later.** Generate directly at the settled homes. Group distinct capability/runtime surfaces in maintained multi-capability code so reviewers can navigate ownership from the source tree; keep composition/orchestration explicit. Paths, imports, public surfaces and state ownership must express the same boundaries. Documentation cannot repair a contradictory layout or graph. A cohesive capability may remain one file; do not manufacture empty scaffolding, barrels or wrappers to satisfy a folder quota.

**Split or keep deliberately.** Keep a cohesive capability together when its responsibilities, reasons to change, and size stay within the governing structure standard (default ≤400 code lines per source file, ≤50 lines and ≤15 cognitive complexity per function unless overridden by project config). Extract into a well-named module at the correct feature/layer home when new work adds unrelated policy/effects, multiple reasons to change, breaches a configured limit, or hides a reusable capability inside a consumer. Preserve a small explicit public surface, forward-only layer order (`types/domain` → `config` → `ports/repo` → `service` → `adapters/runtime` → `ui/entry`) and inspectable orchestration. Moving code behind pass-through wrappers or `*Manager`/`utils` buckets without separating responsibility is not modularity. New package boundaries need a real ownership, reuse, lifecycle or dependency-isolation reason.

If appropriate placement exceeds authorized writable scope or changes settled consumer contracts, return the evidence and proposed scope/contract revision to the owner. Do not stuff code into an allowed file to evade the boundary, or silently refactor adjacent code.

## 3. Check cycles and direction over the affected closure

For each added edge `A → B`, check whether `B` can already reach `A`, including through **unchanged** modules/packages and other proposed edges. Check the combined change, not each worker's patch in isolation. Use existing authorized tooling or bounded source tracing; record graph kind, resolved configuration, paths searched, command/source evidence and limitations.

Report an actual cycle as an edge witness, for example `A → B → unchanged C → A`. Check forbidden layer direction even when no cycle exists. Distinguish newly introduced/reachable defects from unrelated legacy cycles; an existing permitted runtime callback cycle is not automatically an import-cycle defect. Missing reachability evidence means **UNVERIFIED for that scope**, not “acyclic.” Do not install analyzers or expand execution authority just to obtain a PASS.

## 4. Verify the realized structure

Check the pre-write source-boundary contract during design/SOLID review. After writing, compare actual homes, exports, manifests and wiring against that contract, including untouched consumers and all integrated worker deltas. Resolve discrepancies before acceptance; revalidate changed boundary decisions before dependent work rather than silently rewriting intent to bless the generated layout. A reviewer independently checks relevant source edges and ownership rather than endorsing an author's map by assertion.

Observed placement/allowed-edge violations are **FAIL**; absent required evidence is **UNVERIFIED**. Either blocks structural acceptance of the affected unit even when behavior passes. Verify physical destinations and removal of old paths after moves. A writable path is permission to edit, not permission to collapse distinct responsibilities into it.

Return separate results for behavior/build checks, responsibility/readability, dependency direction/cycles, and graph coverage. Human understandability requires clear names, cohesive boundaries and a traceable normal/error path, not just passing tests. Record exclusions honestly; missing evidence blocks only the corresponding claim or required acceptance item.

## Interface and walkthrough cases

Inputs: scoped change/question, source identity, consumer constraints and authorized tools. Output: compact source-backed responsibility/flow map, placement decision, graph delta and scoped results/unknowns. No extra report is needed for an unchanged boundary.

Walkthrough cases: (1) cohesive local patch stays local, (2) growing mixed-responsibility file gets a placement decision, (3) new edge closes a path through unchanged code, (4) two safe-looking worker deltas form a combined cycle, (5) unavailable LSP/resolver or stale memory cannot yield a complete-graph claim.

Also check new multi-capability generation at agreed homes and rejection of acyclic forbidden edges or code outside those homes.
