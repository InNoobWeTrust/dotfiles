# Skill Compliance

## Scope

This rule applies after loading a skill. It preserves skill adherence while
keeping mode-specific procedures out of the always-loaded context.

## Inspection Is Not Activation

Inspecting a skill catalog entry, description, or reference to decide whether it
applies is not activation. Reading a skill's `SKILL.md` activates it and is a
binding commitment to follow its complete applicable workflow.

## Core Commitment

1. Read the activated `SKILL.md` completely before execution.
2. Identify its mandatory, required, must, and hard-stop instructions.
3. Select the smallest applicable workflow, track, and artifact set that
   preserves the skill's contracts, prerequisites, and safety controls.
4. Execute every required step of that selection in the stated order. Do not
   cherry-pick convenient phases, controls, artifacts, models, agents, or
   personas.
5. Produce the selected workflow's required artifacts and evidence.

Complexity, length, cost, or task size never justify silently omitting a
required step. A lighter workflow is valid only when the skill explicitly
permits it and all of that workflow's mandatory controls are completed.

## Stop and Report

Stop rather than improvise when the skill conflicts with another applicable
contract, its prerequisites cannot be met, its required resources are
unavailable, or its mandatory steps are ambiguous. Report the specific conflict
or blocker, the unmet prerequisite, and the effect on completion. Record a
permitted deferral or compromise through the applicable canonical process; never
use one to bypass a safety or correctness requirement.

## Just-in-Time References

- Load `references/skill-compliance-execution.md` when selecting a workflow,
  handling a blocked or deferred step, or preparing completion evidence.
- Load `references/skill-compliance-swarm-intelligence.md` before executing
  `swarm-intelligence` Mode Full Swarm. Its preflight, model quorum, phase
  artifacts, and shortcut prohibitions are mandatory for that mode.

## Completion Check

Before claiming completion, verify that the selected workflow was executed in
full, all required artifacts exist, all blockers and deferrals are explicit,
and the reported result is supported by evidence.
