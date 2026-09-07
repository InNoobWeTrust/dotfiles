# Skill Compliance Execution Reference

> Read when selecting an activated skill's workflow, resolving a blocked or
> deferred step, or preparing completion evidence.

## Workflow Selection Table

| Situation | Required action |
|---|---|
| The skill offers tracks, modes, or calibrated workflows | Select the smallest one that preserves every applicable contract, prerequisite, and safety control before execution. |
| The skill has no explicit lighter option | Execute its complete workflow. Do not infer one from task size. |
| A selected workflow has optional artifacts | Omit only artifacts the skill explicitly marks optional for that workflow. |
| A required step depends on another rule | Apply both; use the stricter compatible control. |
| A prerequisite, resource, or approval is missing | Stop and report it. Do not substitute an unapproved shortcut. |
| A required step conflicts with another applicable contract | Stop and report the conflict for resolution. Do not choose a contract unilaterally. |
| A deferral or compromise is allowed | Record it through the canonical process required by the applicable rule or skill. |
| A deferral would bypass safety, correctness, or a hard stop | Do not defer it; stop and report the blocker. |

## Completion Evidence

Completion evidence must show, as applicable:

- the selected workflow, track, or mode;
- completion of every mandatory step in order;
- required artifacts and their locations or contents;
- verification results required by the skill; and
- explicit blockers, deferrals, compromises, and unmet prerequisites.

## Prohibited Shortcuts

| Shortcut | Why it violates compliance | Required response |
|---|---|---|
| Announcing a skill without following its workflow | Activation is a binding commitment, not a label. | Execute the selected workflow or report why it is blocked. |
| Summarizing what a skill would do instead of doing it | A description is not the required execution or evidence. | Perform the workflow and produce its artifacts. |
| Selecting a lighter workflow but omitting its mandatory steps | It is neither the selected workflow nor a valid reduction in scope. | Complete the missing steps or restart with the valid workflow. |
| Skipping preflight, setup, or a phase because the task seems simple | Task size does not waive explicit controls. | Complete the control or stop and report the unmet prerequisite. |
| Silently reducing required models, agents, or personas | Required diversity or coverage is part of the skill contract. | Meet the requirement or report that the workflow is blocked. |
| Treating a local note as a substitute for a required compromise record | It loses the governing workflow's accountability and traceability. | Use the applicable canonical process. |
