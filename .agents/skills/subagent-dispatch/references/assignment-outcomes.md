# Assignment Outcomes

## Purpose and storage

Make role selection improve from observed work, without turning anecdotes into model rankings. The primary records acceptance evidence for its own design/integration decisions as well as workers' outputs. Use the existing task/role event log or a short-term capture under the selected memory scope; link it from the existing memory entry point. Do not create a second database or duplicate the same event across stores. Cross-project routing uses only explicitly authorized memory scopes; do not scan other projects or global history silently.

## Capture at acceptance or interruption

Append one compact event per substantive assignment, whether useful, corrected, rejected, partial or unverified. No full report is required: a table row or checkpoint bullets suffice. Include:

| Field | Content |
|---|---|
| Identity / context | Stable event ID, date, task/unit/revision, role, session/run ID, configured agent/model route; actual upstream if verified, otherwise unknown. Distinguish route metadata from verified execution identity. |
| Assigned contract | Relevant constraint and source/prompt pointer; note missing/inaccessible context, permissions and checks the worker was not allowed to run. |
| Observation / evidence | Concrete artifact or finding and source/check receipt; claimed completion versus inspected result. Record useful outcomes too, not only failures. |
| Attribution | Primary-approved design/acceptance issue, implementer deviation, review false positive, provider/environment failure, handoff defect, or unresolved cause; split mixed causes. |
| Disposition | Accepted, corrected, rejected, incomplete or UNVERIFIED; independent check/counterexample, repair owner, remaining uncertainty and final outcome. |
| Routing implication | Narrow task/role-specific caution, successful fit or no change; confidence, scope and what evidence would change it. |

Do not attribute a contract violation without checking the supplied contract, or state the limit when the original handoff cannot be verified. Build/test restrictions are not laziness. Provider quota/overload is availability evidence, not reasoning failure. A successful exit or TASK_COMPLETE with no deliverable is not accepted work; inspect owned output and record the missing evidence. Corrected work retains both the initial defect and repair outcome; append corrections rather than erasing the earlier event.

## Targeted recall and routing

For a substantive role choice, start at the existing memory index and retrieve only relevant agent/role/task-type outcomes. Reuse an already-loaded current summary; do not reread full history for every call. Mechanical launches need no history audit. If no relevant evidence is available, record that limit when material; do not invent a clean record or broaden memory access.

Use outcomes to refine the task description, add a concrete contract example/check, pair an implementer with an independent challenger, or recommend a narrower role. Track challenged findings that were rejected so prolific false positives do not look like reviewer success. A primary accepting an inappropriate design remains accountable even when the suggestion came from a worker.

One incident warrants a scoped caution, not a model-wide competence claim. Before recommending route removal, description changes or challenger-only assignment, inspect repeated comparable assignments, useful successes, actual identity/version, handoff quality and current applicability. Report the sample size and selection bias; do not manufacture rates from incident-only samples or count service failures as reasoning failures. A serious single incident can justify an immediate task-local restriction, explicitly provisional. Actual profile edits or persistent routing restrictions require authorization for that change; logging is not permission to demote. Long-term promotion/consolidation still follows the selected memory capability's explicit approval rules.

## Example event

```text
E7 | 2026-10-15 | adapter/unit2 rev3 | implementer | session S
Route: provider/model; actual upstream unknown.
Contract: snapshot fields in phase2; handoff pointer available.
Observed: invented nested payload; source runner:42; consumer trace rejects it.
Attribution: implementer deviation; primary caught it before acceptance.
Disposition: corrected by worker; independent fixture passes; live call UNVERIFIED.
Routing: scoped caution for DTO adaptation; provide concrete producer fixture next time.
Sample: one assignment, not evidence for model-wide removal.
```
