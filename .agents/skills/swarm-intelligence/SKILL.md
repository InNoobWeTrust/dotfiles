---
name: swarm-intelligence
description: "Use this skill for multi-agent orchestration — Mode Single-Node (one bounded external node for research, second opinions, or patch suggestions) or Mode Full Swarm (multi-phase multi-persona cross-validation). Activate when the user asks for a swarm, parallel agents, second opinion, cross-validation, or diverse perspectives on high-risk work. Commands: \"swarm\" → Full Swarm, \"external subagent\" → Single-Node. Skip for routine single-agent tasks."
---

# Swarm Intelligence (Swarminator)

One skill, two modes. **Choose the mode first** — compliance and preflight differ. Commands pin the mode: `/external-subagent` → Single-Node, `/swarm` → Full Swarm.

> Loading this skill binds you to the **chosen mode’s full procedure**. Do not run a “lite swarm” that is neither a locked single node nor a full three-phase swarm. Real `swarminator` invocations only — no prose simulations. See `rules/skill-compliance.md` for Full Swarm hard gates.

Compose with `subagent-dispatch` for prompt contracts before any node launch.

---

## Mode router (mandatory)

| Signal | Mode | Cost |
|---|---|---|
| `/external-subagent` command, or one concrete deliverable / one node / research / second opinion / review / patch suggestion | **Single-Node** | low |
| User asks for one isolated delegated node / worker to offload a small task | **Single-Node** | low |
| `/swarm` command, or multi-phase / ambiguous / high-stakes / quorum / challenge cycles | **Full Swarm** | high |
| User says swarm, multi-agent, diverse perspectives, cross-validate | **Full Swarm** | high |
| Unsure | Prefer **Single-Node**; escalate to Full Swarm only if the artifact is still insufficient after one tight retry | — |

```
Is the deliverable one bounded artifact from one model context?
  YES → Mode Single-Node  (references/single-node.md)
  NO  → Mode Full Swarm   (references/preflight-and-phases.md)
```

**Do not** slowly grow Single-Node into an ad-hoc multi-node mini-swarm. Escalate modes explicitly.

---

## Shared runtime

Discover CLI at runtime — do not hard-code stale flags:

```bash
$SHELL -l -c 'command -v swarminator'
$SHELL -l -c 'swarminator --help'
$SHELL -l -c 'swarminator --list-agents'
$SHELL -l -c 'swarminator --list-models --agent NAME'
```

**Shared assets** (both modes):

- Personas: `references/personas/` via `references/discover-personas.sh`
- Models: `references/models/{free,premium}.json`
- Default node preference: `command-code` + `deepseek-v4-pro` while budget allows

**Shared hard rules** (both modes):

1. Delegated nodes are **read-only** on the workspace: no file writes, patch apply, stage, or destructive commands.
2. Host defines contract (scope, output, allowed files, stop conditions) **before** invoke.
3. Host validates and applies any changes.
4. Prefer `subagent-dispatch` pillars in every node prompt.

---

## Mode Single-Node

**Goal:** one task → one `swarminator` node → one immutable artifact.

**Procedure:** `references/single-node.md`  
Artifact modes: `analysis` | `review` | `patch` | `transform`.

**Minimum flow:** lock scope + artifact mode + allowed files → one node → validate artifact → host applies if needed.

**Retry:** fresh bounded invocation with a tighter contract — not automatic multi-node expansion. If scope is unbounded, switch to Full Swarm.

---

## Mode Full Swarm

**Goal:** multi-persona, multi-model, three-phase orchestration with synthesis between phases.

**Preflight:** all 10 steps required (user confirm, domain, deliverable, read-only OK, swarminator checks, catalogs, personas).  
**Detail:** `references/preflight-and-phases.md`  
**Models:** **2–3 models per persona** each phase — single-model shortcuts forbidden.

| Phase | Purpose | Required sections (summary) |
|---|---|---|
| 1 Gather | Inputs + findings | Goals, Key Inputs, Extracted Findings, Open Questions, Synthesis Log |
| 2 Synthesize | Spec + challenge | Spec Summary, Design Decisions, Acceptance Criteria, Task Hints, Synthesis Log |
| 3 Produce | Decompose + deliver | Executive Summary, Task Results, Blocked Tasks, Open Items, Synthesis Log |

**Forbidden:** describing what the swarm would produce; skipping preflight; “simplified” single-model swarm.

---

## Composition

| With | How |
|---|---|
| `subagent-dispatch` | Build every node prompt (scope, output contract, obstacles, allowed actions) before `swarminator` |
| `bounded-iteration` | Full Swarm (or design) first → locked `TASK.md` → iteration loop (`bounded-iteration/references/swarm-integration.md`) |
| `reviewer` | Single-Node `review` artifact mode, or Full Swarm review personas |
| `model-benchmarking` | Choose catalogs/tiers → then this skill for execution |
| `references/branch-graft-synthesis.md` | Use when multiple viable branches disagree and the host must preserve them before converging |
| Environment-native task workers | Prefer native workers when available; use this skill when you need swarminator isolation or multi-model quorum |

---

## Deliverable checklist

**Either mode**

- [ ] Mode chosen and stated
- [ ] swarminator verified at runtime
- [ ] Node prompts include dispatch contract
- [ ] Workspace mutations only on host after validation

**Single-Node**

- [ ] Artifact mode locked; one node; one artifact validated

**Full Swarm**

- [ ] Full preflight complete
- [ ] All three phases with required sections
- [ ] 2–3 models per persona; real swarminator runs
