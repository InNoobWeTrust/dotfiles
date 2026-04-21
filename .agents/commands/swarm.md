---
description: >
  Run the Swarm Orchestration Pipeline on raw input. Uses kilo-swarm as a
  single-pass node runner and orchestrates phases, loops, and parallelism
  directly. Activate when the user says "swarm", "run swarm", "orchestrate",
  "swarm pipeline", or wants multi-agent consensus before generating output.
---

# Swarm — Multi-Agent Orchestration Pipeline

`kilo-swarm` is a **single-pass node runner** — one call = one agent invocation
returning JSON. The orchestrator (this session or a caller script) owns all
phase logic, loops, retries, and parallelism.

## kilo-swarm interface

```
kilo-swarm -m MODEL -p PERSONA -i INPUT_FILE
echo "input" | kilo-swarm -m MODEL -p PERSONA
```

| Flag | Required | Description |
|------|----------|-------------|
| `-m MODEL` | yes | Model identifier |
| `-p PERSONA` | yes | Persona/instruction string (user message) |
| `-i FILE` | no | Input file attached via `-f`; default: stdin |
| `--dry-run` | no | Print command without executing |

**Output:** extracted JSON to stdout. Always exits 0; returns `{}` on empty/invalid response.

## Domain configs

Domain configs live in `~/.agents/skills/swarm-orchestrator/references/`.
Each JSON file defines all the personas for a pipeline:

| Domain | File | Pipeline |
|--------|------|----------|
| Software | `code.json` | Business/Tech → Architecture → Code |
| Writing | `writing.json` | Audience/Content → Outline → Sections |
| Design | `design.json` | UX/Systems → Design → Components |
| Product | `pm.json` | Product/Business → Spec → Features |
| Slides | `slides.json` | Communications/Audience → Structure → Slides |

### Domain JSON fields

```
phase1_a_label / phase1_a_persona / phase1_a_field
phase1_b_label / phase1_b_persona / phase1_b_field
phase2_forward_label / phase2_forward_persona
phase2_review_label  / phase2_review_persona       → must output {approved, critical_vulnerabilities, edge_cases}
phase2_revise_label  / phase2_revise_persona        → receives {current_design, qa_feedback}
phase3_decompose_label / phase3_decompose_persona   → must output {tasks:[{id,title,file_path,...}]}
phase3_maker_label     / phase3_maker_persona       → must output {file_path, code, ...}
phase3_maker_fix_label / phase3_maker_fix_persona   → receives {task, previous_output, review_failures}
phase3_breaker_label   / phase3_breaker_persona     → must output {passed, critical_failures, issues}; use __QA_CASES__ placeholder
```

## Model selection — checkpoint before running

Before invoking any `kilo-swarm` calls, present the following table to the
user and **wait for confirmation or overrides**. Do not proceed until the user
approves the model choices.

| Node | Phase | Task nature | Default model | Why |
|------|-------|-------------|---------------|-----|
| Ingest A + B | 1 — parallel research | Extraction, classification, no reasoning chain | `kilo/google/gemini-2.0-flash-lite-001` | Cheapest capable model; task is structured extraction not synthesis |
| Forward (Synth) | 2 — design/spec | Synthesis, contradiction resolution, structured output | `kilo/google/gemini-2.5-flash-lite` | Needs reasoning; flash-lite hits cost/quality balance |
| Review (QA/Critic) | 2 — adversarial | Negative-case generation, vulnerability spotting | `kilo/google/gemini-2.5-flash-lite` | Same tier as Forward; adversarial quality matters here |
| Revise | 2 — revision | Targeted rewrite addressing specific failures | `kilo/google/gemini-2.5-flash-lite` | Continuity with Forward tier |
| Decompose | 3 — planning | Task decomposition from locked spec | `kilo/google/gemini-2.5-flash-lite` | Structural reasoning; errors here cascade to all tasks |
| Maker | 3 — execution | Produce output per task | `kilo/mistralai/devstral-small` | Domain-specific execution; cheap and task-focused |
| Breaker | 3 — review | Verify maker output against QA cases | `kilo/mistralai/devstral-small` | Same tier as Maker; upgrade if review quality is weak |
| Maker-Fix | 3 — retry | Targeted fix on rejected output | `kilo/mistralai/devstral-small` | Same tier as Maker |

**Present to user:**

> These are the default models for each swarm node. You can override any of
> them. To research cheaper or better alternatives, run `/benchmark-agents`
> with a focus on small/cheap models first.
>
> | Node group | Model | Override? |
> |------------|-------|-----------|
> | Research (Phase 1) | `kilo/google/gemini-2.0-flash-lite-001` | |
> | Spec/Decompose (Phase 2 + Phase 3 Decompose) | `kilo/google/gemini-2.5-flash-lite` | |
> | Execution (Phase 3 Maker/Breaker) | `kilo/mistralai/devstral-small` | |
>
> Confirm to proceed, or specify overrides.

Only start the orchestration loop after the user responds.

## Orchestration pattern

The orchestrator reads the domain config, calls `kilo-swarm` for each node,
and manages state between calls.

```bash
DOMAIN=~/.agents/skills/swarm-orchestrator/references/code.json
RM=kilo/google/gemini-2.0-flash-lite-001   # research model
SM=kilo/google/gemini-2.5-flash-lite        # spec model
CM=kilo/mistralai/devstral-small            # code model

# Phase 1 — parallel
P1A=$(jq -r .phase1_a_persona "$DOMAIN")
P1B=$(jq -r .phase1_b_persona "$DOMAIN")
kilo-swarm -m "$RM" -p "$P1A" -i input.txt > p1a.json &
kilo-swarm -m "$RM" -p "$P1B" -i input.txt > p1b.json &
wait

# Merge
jq -s '.[0] * .[1]' p1a.json p1b.json > p1_merged.json

# Phase 2 — forward pass
P2F=$(jq -r .phase2_forward_persona "$DOMAIN")
kilo-swarm -m "$SM" -p "$P2F" -i p1_merged.json > p2_forward.json

# Phase 2 — review (loop up to 3x)
P2R=$(jq -r .phase2_review_persona "$DOMAIN")
P2V=$(jq -r .phase2_revise_persona "$DOMAIN")
for i in 1 2 3; do
  kilo-swarm -m "$SM" -p "$P2R" -i p2_forward.json > p2_review.json
  approved=$(jq -r '.approved' p2_review.json)
  crits=$(jq '.critical_vulnerabilities | length' p2_review.json)
  [[ "$approved" == "true" || "$crits" == "0" ]] && break
  jq -s '{current_design:.[0],qa_feedback:.[1]}' p2_forward.json p2_review.json > p2_feedback.json
  kilo-swarm -m "$SM" -p "$P2V" -i p2_feedback.json > p2_forward.json
done

# Phase 3 — decompose
P3D=$(jq -r .phase3_decompose_persona "$DOMAIN")
kilo-swarm -m "$SM" -p "$P3D" -i p2_forward.json > tasks.json

# Phase 3 — per-task maker + breaker (orchestrator loops over tasks)
QA_CASES=$(jq '.edge_cases[:10]' p2_review.json)
P3M=$(jq -r .phase3_maker_persona "$DOMAIN")
P3B_TMPL=$(jq -r .phase3_breaker_persona "$DOMAIN")
P3B="${P3B_TMPL//__QA_CASES__/$QA_CASES}"
P3F=$(jq -r .phase3_maker_fix_persona "$DOMAIN")

jq -c '.tasks[]' tasks.json | while read -r task; do
  echo "$task" > task.json
  kilo-swarm -m "$CM" -p "$P3M" -i task.json > maker.json
  kilo-swarm -m "$CM" -p "$P3B" -i maker.json > breaker.json
  passed=$(jq -r '.passed' breaker.json)
  if [[ "$passed" != "true" ]]; then
    jq -s '{task:.[0],previous_output:.[1],review_failures:.[2]}' \
      task.json maker.json breaker.json > fix_input.json
    kilo-swarm -m "$CM" -p "$P3F" -i fix_input.json > maker.json
  fi
  # save maker.json artifact...
done
```

## Consensus check rules

| Phase | Check | Orchestrator action |
|-------|-------|---------------------|
| Phase 1 | JSON parseable / non-empty | Re-call kilo-swarm (up to 2 times) |
| Phase 2 | `review.approved == true` OR `critical_vulnerabilities == []` | Feed review back into forward agent (max 3 loops) |
| Phase 3 | `breaker.passed == true` | Feed breaker report into maker-fix agent (max 2 retries) |

## Model recommendations

> Run `/benchmark-agents` to get up-to-date alternatives. The defaults below
> are starting points only — cheap models evolve fast.

| Phase | Default | When to upgrade |
|-------|---------|-----------------|
| Research | `kilo/google/gemini-2.0-flash-lite-001` | Input is ambiguous or dense; upgrade to flash |
| Spec | `kilo/google/gemini-2.5-flash-lite` | Design is complex or multi-system; upgrade to `gemini-2.5-flash` |
| Execution | `kilo/mistralai/devstral-small` | Domain needs deeper reasoning; try `deepseek-chat-v3-0324` |

## Limitations

- Each `kilo-swarm` call is a new session — no shared memory between nodes
- `swarm-node` agent has all write/bash tools denied — analysis only
- `depends_on` task ordering is not enforced; orchestrator must handle if needed
