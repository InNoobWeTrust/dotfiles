# Scope-bounded evidence and recovery

Use when promoting a diagnostic conclusion, handing off an investigation, or recovering an unsuccessful approach. Inputs are the goal and constraints, direct observations with sources, candidate explanations and failed attempts; output is a bounded conclusion or a specific unresolved question with the next permitted check.

## Scope-bounded evidence

Keep three things distinct in the existing report or checkpoint, not a separate record for every thought or tool call:

- **Observation:** what the source or executed check actually returned, for which target, revision, conditions and sampled times. Link the source or failure excerpt needed to recheck it.
- **Inference:** what that observation supports, and the assumptions or alternatives not excluded. An observation is not a broader conclusion merely because a prior summary repeated it.
- **Unknown:** missing or conflicting evidence and the part of the decision it prevents. A tool's success status does not settle the meaning of its output.

**Example:** a replica health probe does not establish the primary's health. Three low-utilization samples do not rule out pool exhaustion throughout the intervening window; report that saturation was not observed in those samples and leave unsampled periods unresolved.

## Choose a discriminating check

When plausible alternatives remain, evidence conflicts, or the proposed conclusion exceeds the observations, name the strongest relevant alternative and an available observation that would distinguish it from the leading explanation. Seek evidence, not an argument that is required to disagree.

If that observation is unavailable or outside permission, retain the unknown and report the exact evidence or authorization needed. Stop only the affected decision; independently justified, authorized work can continue. A decisive check for a clear reversible fix does not require inventing an opposing hypothesis or adding a critic agent; other applicable review requirements still apply.

## Recovery without forgetting

After repeated unsuccessful interventions or before resuming from reduced context, preserve a compact checkpoint of the goal, constraints and permissions, bounded observations, failed attempts and their actual outcomes, and remaining unknowns. Keep the audit evidence retrievable; do not delete inconvenient failures or turn a fresh summary into fresh corroboration.

Re-analyze before another equivalent failed intervention: identify what new evidence or changed hypothesis makes the next action useful. If no permitted distinguishing check remains, return the concrete blocker rather than looping or bypassing restrictions. A reset never expands authority, resets a retry allowance, removes a safety stop or proves the surviving explanation correct.
