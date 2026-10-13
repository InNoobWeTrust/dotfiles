# Portable Worker Contract

Use before launching a named worker, a fallback route, or a worker defined on the fly. The model route selects execution capability; the worker interprets the assignment and discovers useful working principles. This is prompt guidance, not a permissions implementation or a new orchestration framework.

**Inputs:** assignment intent, settled decisions and open uncertainty, authoritative sources, required evidence, available tools, native permissions, authorized actions, and an optional working-style reference or short hint.
**Output:** a bounded task prompt and a usable guidance-discovery entry point. A full personality definition is not required. Use supported harness fields only; do not invent a system/description field or rely on undocumented inheritance.
**Stop:** missing authority, inaccessible required task sources or safety instructions, incompatible route limits, or an unresolved implementation contract. Missing optional personality guidance alone need not block safe work.

## Working-style selection belongs to the worker

Workers use [Working Principles](../../working-principles/SKILL.md) to interpret the request, inspect its lightweight catalog where useful, and load appropriate reference sections themselves. The [common baseline](../../working-principles/references/baseline.md) applies even when no specialist style is selected.

The main agent may provide a reference, a short direction such as “skeptical and evidence-first,” or no personality direction. All three are valid. Do not require copied baseline or specialist paragraphs in every request, turn a title into claimed expertise, or conflate personality with authority. Domain workflows and safety gates retain their own triggers.

Select a currently exposed model route for capability and effort, independently of the assignment's working-principle identity and independently of the primary's provider family. For independent evidence (challenge, second opinion, retry after failure) the route must come from a different provider family than the producer. Descriptions are selection guidance, not proof of availability or expertise. Check each route's native permissions; an edit-capable route does not authorize edits in a read-only research/review assignment. Preserve native deny rules and use supported native restrictions when hard read-only isolation is required. Model capability and style selection never grant task authority.

## Discovery access

Establish a usable entry point once per worker context: exposed skill metadata/discovery, a verified shared/project instruction entry point, or a short accessible pointer to the working-principles router. Do not assume a worker inherits the parent's loaded skills, conversation, system prompt, or filesystem access. Configuration being present does not prove it reached the worker.

When a worker lacks native discovery, the worker definition or setup can say:

> Before acting, read <resolved working-principles/SKILL.md path> and select useful guidance for this assignment.

Replace the placeholder with the actual accessible shared/project path. Catalog paths resolve relative to that skill directory, not an arbitrary current working directory. Establish access using the capabilities the harness actually exposes; a claimed or inaccessible path is not a usable bootstrap. Permit the necessary guidance reads when READ access would otherwise be limited to task files; access to guidance is not authority for unrelated repository scouting.

This is a discovery instruction, not a personality setting. Do not repeat it in individual tasks when a working discovery entry point already exists. No personality hint in the request is valid; no discovery capability anywhere remains a limitation to report. If discovery is unavailable, an already known baseline or a short necessary working-style instruction may support a clear, safe task. Do not fabricate a successful load; missing mandatory rules or required task evidence still blocks affected work.

## Compose the bounded handoff

1. State the assignment and authority: investigation, design, implementation, verification, or review; what is agreed versus still uncertain; what observation the result will help evaluate.
2. Supply precise sources and boundaries, acceptance evidence, action/resource limits, a proportionate return shape, and stop behavior. Retain applicable [implementation/planning gates](../SKILL.md#dispatch-routing-and-gates). These are task obligations, not optional personality settings.
3. Check discovery access. A working-style reference or short hint is optional; omit it when the assignment already gives the worker enough to infer a useful approach. Do not dump full skills or make the parent compose a complete personality.
4. For planning/implementation, carry settled [materialization choices](implementation-payload-and-preflight.md#materialization-choices--part-of-the-implementation-contract) and accessible task-relevant code-craft/API sources. Library/API choices are mandatory task constraints, not optional working-style hints. Implementers confirm sources before coding and report incompatible selections rather than silently substituting. Keep the same choices and exceptions on route fallback; re-resolve source access, not the architecture.

When selecting a fallback after an invocation failure, preserve the assignment and constraints. The replacement worker selects useful guidance for the same task; change only the execution route and necessary capability details. Reassess access and route limits, not just the agent name. [Named fallbacks are preferences](context-stewardship.md#treat-named-fallbacks-as-preferences), not a mandatory retry chain.

Native controls remain separate: preserve configured deny rules and apply supported native restrictions to dynamic workers when available. “Read-only” prose is not hard isolation. If a required hard boundary cannot be established, report that limitation rather than claiming equivalent enforcement. Workers do not gain nested-delegation authority by selecting a style.

## Example: request with no personality direction

Assume the worker already has a usable discovery entry point and permission to read applicable shared guidance. The same task can go to a named, compatible fallback, or dynamically defined worker:

```text
Task: identify the likely bottleneck from the supplied timing evidence.
Context: concurrency is a hypothesis, not an approved fix.
Sources: <resolved timing report> and <resolved scanner entry point>.
Boundaries: inspect these task sources and applicable shared guidance only;
WRITE NONE; RUN NONE; network NONE; no new workloads, installs, service changes,
Git mutations, or nested delegation. Do not expand inquiry into a repair.
Return: supported hypotheses with source locations, conflicting evidence,
unknowns, and the next useful check. TASK_COMPLETE covers only this inspection.
Stop: missing required sources, insufficient evidence, task limits, or work
requiring extra authority -> INCOMPLETE with partial evidence and exact blocker.
```

The worker infers diagnosis and loads its principles from the catalog. An optional reference can name the diagnosis section; an optional hint can say “use falsifiable hypotheses.” Neither is required. Replace task-source placeholders before launch. This is a source-level example, not evidence of Antigravity runtime discovery or compliance.

## Persistent task-role identity

When a session is assigned to a permanent `task_id` + `role_id` pair, first load applicable mandatory guidance and safety rules, then the memory storage protocol and resolve `MEMORY_DIR`, before reading any task source. The following task reads and restoration precede substantive work:

1. Read own role record: `tasks/<task-id>/roles/<role-id>.md` in the resolved `MEMORY_DIR`.
2. Read the task record and role roster: `tasks/<task-id>/task.md`.
3. Read the current approved plan.
4. Confirm identity (matching `task_id` + `role_id`), validate scope against the approved plan, and restore prior knowledge from checkpoints.

**Block substantive work** if any of the following holds: identity mismatch, retired session binding, missing or stale checkpoint that conflicts with approved scope, duplicate active ownership, or unproven prior-worker quiescence.

Session-binding guards (full contract: [Task-role records](../../memory/references/task-role-records.md)):
- Same-pair only: exact task-role match + non-retired roster binding.
- Single active: at most one in-flight/assigned actor per role.
- Stable job only: a new/refined unit within the same stable job is allowed only under the current primary-approved plan and handoff bounds. A distinct review/test/consolidation job requires a new role + fresh session; task-role identity, role contract and native permissions remain unchanged.
- No cross-task reuse.

After each completed or interrupted slice, append to the role record following the [checkpoint format](../../memory/references/task-role-records.md#checkpoint-format). A primary-approved plan change requires reading and revalidating the new approved scope before continuing — silently inheriting old scope is not permitted.

Native permission boundaries are unchanged: a read-only assignment does not become writable because of a role binding; preserve configured deny rules and supported native restrictions.

## ACI Pass / prototype

- **Interface:** explicit purpose, inputs/output, optional style direction, guidance-discovery access, bounded task example, and stop/report contract.
- **Misuse guards:** no inherited-context assumption, compulsory personality payload, model-as-personality shortcut, optional-style-as-authority, or prompt-as-hard-permission claim.
- **Prototype check:** observe workers interpreting no-hint, short-hint, and reference-directed assignments and actually reading useful guidance. A request need not contain personality prose; source checks alone do not prove live discovery or improved delegation quality.
