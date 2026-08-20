# Skill Compliance

## Core Commitment

**Loading or reading a skill's SKILL.md is a binding commitment to select its lightest valid track and execute that track faithfully.** Complexity, length, and effort cost are not valid reasons to silently skip required work.

> Before execution, select the scope-calibrated track and artifacts the skill permits. Then execute every mandatory step of that selected track. If work is deferred or compromised, document it through the canonical compromise-register schema in `phased-delivery.md` when that rule applies.

## What Compliance Means

**DO:**
- Read the full SKILL.md before beginning work.
- Identify every step marked as mandatory, required, must, or hard stop.
- Select the lightest valid track and artifact set before execution.
- Execute every mandatory step of the selected track in order.
- Produce the artifacts required by the selected track.
- Report blockers, deferrals, and compromises explicitly — do not silently skip around them.

**DO NOT:**
- Announce you are using a skill and then deviate from its workflow.
- Skip a mandatory selected-track preflight, setup, or phase step.
- Use fewer models, agents, or personas than the skill requires.
- Produce a Markdown document summarizing what the skill would do instead of actually executing it.
- Claim a lighter track while omitting its mandatory steps or required deferral record.

## Swarm-Intelligence: Hard Stop Gates

Swarm-intelligence is the highest-process skill and the most frequently violated. The following gates are absolute — you **MUST NOT proceed past a gate** until it is fully satisfied.

### GATE 1 — Preflight (all 10 steps required, in order)

Check each box before starting Phase 1. If any step cannot be completed, STOP and report why.

1. ☐ User confirmed they want multi-agent swarm orchestration
2. ☐ Primary domain identified (code / skill-review / writing / slides / design / pm / finance)
3. ☐ Final deliverable shape clarified
4. ☐ Read-only node constraint confirmed as acceptable
5. ☐ swarminator verified: `$SHELL -l -c 'command -v swarminator'`
6. ☐ CLI inspected: `$SHELL -l -c 'swarminator --help'`
7. ☐ Agents listed: `$SHELL -l -c 'swarminator --list-agents'`
8. ☐ Model catalogs reviewed (`references/models/{free,premium}.json`), agent+model pairs selected
9. ☐ Persona discovery script confirmed executable: `references/discover-personas.sh`
10. ☐ Required personas confirmed retrievable (senior-reviewer is always inline)

### GATE 2 — Phase Output Artifacts (each phase required before the next begins)

**Model quorum applies inside every phase:** each persona invocation within a phase MUST use 2-3 different models. Single-model runs are NOT a valid substitute at any point, even for "quick" tasks.

**Phase 1 must produce:**
- `## Goals And Constraints`
- `## Key Inputs`
- `## Extracted Findings`
- `## Open Questions`
- `## Synthesis Log`

**Phase 2 must produce:**
- `## Specification Summary`
- `## Design Decisions`
- `## Acceptance Criteria`
- `## Task Decomposition Hints`
- `## Synthesis Log`

**Phase 3 must produce:**
- `## Executive Summary`
- `## Task Results`
- `## Blocked Tasks`
- `## Open Items`
- `## Synthesis Log`

### Swarm-Intelligence Forbidden Shortcuts

These phrases in your reasoning signal a violation — stop and correct:
- "I'll simplify the workflow for this task"
- "I'll use just one model since the task is small"
- "I'll skip the preflight since the domain is clear"
- "Here's what the swarm would produce:" (description instead of execution)
- Producing any output document without running `swarminator` via the Bash tool

## All Other Skills

For every loaded skill that is not `swarm-intelligence` Mode Full Swarm:

1. Read the full SKILL.md.
2. Identify every section marked mandatory / required / must / hard stop.
3. Select the lightest valid track and artifact set before execution.
4. Complete all mandatory sections of that track in the specified order.
5. If a step is blocked or deferred, report the specific blocker or documented compromise — never silently skip.
6. Produce the artifacts required by that track.

## Self-Check Before Final Output

Before producing the final output from any skill-based task, confirm:

- [ ] I selected the lightest valid track and artifact set before execution
- [ ] I executed every mandatory step of that selected track
- [ ] I documented every blocked, deferred, or compromised item rather than silently skipping it
- [ ] I produced all artifacts required by the selected track
- [ ] I used the minimum number of models/agents/personas the skill requires
