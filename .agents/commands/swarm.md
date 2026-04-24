**Swarm — Multi-Agent Parallel Node Guidance**

### Do This First

1. Read `~/.agents/skills/swarm-intelligence/SKILL.md`.
2. For normal orchestration, read only `references/orchestrator/minimal-flow.md`, one domain config, and `references/models/*.json`.
3. Pull extra files only when the skill routes you to them.

### Quick Start

```bash
# CORRECT — always use login shell so kilo-swarm is on PATH
$SHELL -l -c 'kilo-swarm --help'
```

## Hard Rules

- `kilo-swarm` runs **one node per invocation**. The orchestrator achieves multi-agent behavior by running **multiple `kilo-swarm` invocations** to coordinate quorum, merge, and routing.
- Phase 1 requires 2 valid JSON outputs per persona (quorum).
- If a stop condition is hit, stop immediately and surface the failure with the error envelope.
- Swarm nodes return JSON only and do not write files.
- `references/orchestrator/minimal-flow.md` is the canonical execution path.
- **Always use login shell** (`$SHELL -l -c '...'`) to ensure `kilo-swarm` is on PATH.

## Stop Conditions

Stop and surface failure when:

| Code | Condition |
|---|---|
| `STOP_SUCCESS` | All phases completed |
| `STOP_PHASE1_NO_QUORUM` | Phase 1 could not reach 2 valid outputs |
| `STOP_PHASE2_UNAPPROVED` | Phase 2 rejected after max reviews |
| `STOP_PHASE3_TASK_FAILURE` | Task failed after max maker-fix retries |
| `STOP_TIMEOUT` | Absolute timeout exceeded |
| `STOP_CONFIG_MISSING` | Required config key missing |

## Preflight Check

Always verify `kilo-swarm` is available before running:

```bash
$SHELL -l -c 'command -v kilo-swarm >/dev/null 2>&1 || { echo "ERROR: kilo-swarm not found" >&2; exit 1; }'
```

---

Follow the instructions above to work on the user's actual request right below.

---
