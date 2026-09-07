# Swarm-Intelligence Compliance Reference

> Read before executing `swarm-intelligence` Mode Full Swarm. Every control in
> this reference is mandatory for that mode.

## Preflight Gate

Complete these steps in order before Phase 1. If any cannot be completed, stop
and report the unmet prerequisite.

1. Confirm that the user requested multi-agent swarm orchestration.
2. Identify the primary domain: code, skill-review, writing, slides, design,
   product management, or finance.
3. Clarify the final deliverable shape.
4. Confirm that the read-only node constraint is acceptable.
5. Verify `swarminator` with `$SHELL -l -c 'command -v swarminator'`.
6. Inspect its CLI with `$SHELL -l -c 'swarminator --help'`.
7. List its agents with `$SHELL -l -c 'swarminator --list-agents'`.
8. Review `.agents/skills/swarm-intelligence/references/models/free.json` and
   `.agents/skills/swarm-intelligence/references/models/premium.json`; select
   the agent-and-model pairs.
9. Confirm that `.agents/skills/swarm-intelligence/references/discover-personas.sh`
   is executable.
10. Confirm that all required personas are retrievable; the senior reviewer is
    always inline.

## Model Configuration and Quorum

Model selection is part of preflight, not an execution-time shortcut. Each
persona invocation within every phase must use two or three different models.
One model cannot substitute for the required quorum, including for a small or
time-constrained task. Preserve the selected agent-and-model pairs in the phase
evidence.

## Phase Artifact Gates

Do not begin a phase until its predecessor's required artifact is complete.

| Phase | Required artifact sections |
|---|---|
| Phase 1 | `## Goals And Constraints`; `## Key Inputs`; `## Extracted Findings`; `## Open Questions`; `## Synthesis Log` |
| Phase 2 | `## Specification Summary`; `## Design Decisions`; `## Acceptance Criteria`; `## Task Decomposition Hints`; `## Synthesis Log` |
| Phase 3 | `## Executive Summary`; `## Task Results`; `## Blocked Tasks`; `## Open Items`; `## Synthesis Log` |

## Forbidden Shortcuts

Stop and correct if reasoning proposes any of the following:

- Simplifying the workflow because the task appears small.
- Using one model where the phase quorum requires two or three.
- Skipping preflight because the domain appears clear.
- Describing what the swarm would produce instead of running the swarm.
- Producing the required output without invoking `swarminator` through the Bash
  tool.
