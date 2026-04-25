---
name: swarm-intelligence
description: Multi-agent swarm pipeline. Use when user says "swarm", "run swarm", "multi-agent", "parallel agents", or wants a Research → Spec → Execution pipeline.
---

## Read First

Read the reference data under `references/`.

## Core Law

Swarm nodes output git patches in markdown code blocks; they do not write files. The user applies validated patches via `git apply`. `kilo-swarm` runs one node per invocation.

## Entry Contract

Before starting, ensure:

1. Non-empty input document
2. Access to the reference data under `references/`
3. Unique `run_id`: `date -u +%Y-%m-%dT%H-%M-%SZ-$(uuidgen)`

## Invocation

```bash
# Verify kilo-swarm is on PATH
$SHELL -l -c 'command -v kilo-swarm >/dev/null 2>&1 || { echo "ERROR: kilo-swarm not found" >&2; exit 1; }'

# Safe invocation: pass stdin as a file to avoid shell interpolation.
input_file="input.txt"
prompt="ROLE_TEXT"
model="MODEL_ID"
$SHELL -l -c "cat \"$input_file\" | kilo-swarm -m \"$model\" -p \"$prompt\""
```

Use a login shell and pipe input from a file or stdin.

## Stop Conditions

- `STOP_SUCCESS` - all phases done
- `STOP_NO_QUORUM` - cannot reach agreement
- `STOP_UNAPPROVED` - rejected after max cycles
- `STOP_TIMEOUT` - resource limit exceeded
- `STOP_CONFIG_MISSING` - required data missing

## Failure Envelope

```json
{
  "status": "error",
  "code": "STOP_NO_QUORUM",
  "message": "Could not reach agreement",
  "details": {
    "run_id": "2026-04-24T12-00-00Z-a1b2c3d4"
  },
  "retryable": false
}
```

## Success Artifact

```json
{
  "status": "success",
  "patches": [
    {
      "path": "...",
      "patch": "...",
      "task_id": "...",
      "patch_valid": true
    }
  ]
}
```

## Output Rule

Intermediate outputs may be free-form. Only the final artifact is strict JSON.
