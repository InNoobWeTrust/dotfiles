---
name: swarm-intelligence
description: Multi-agent swarm pipeline. Use when user says "swarm", "run swarm", "multi-agent", "parallel agents", or wants a Research → Spec → Execution pipeline.
---

## Read First

Read the reference data under `references/`.

## Core Law

Swarm nodes output git patches in markdown code blocks; they do not write files. The user applies validated patches via `git apply`. `swarminator` runs one node per invocation and auto-detects available agents with fallback.

## Entry Contract

Before starting, ensure:

1. Non-empty input document
2. Access to the reference data under `references/`
3. Unique `run_id`: `date -u +%Y-%m-%dT%H-%M-%SZ-$(uuidgen)`

## Invocation

```bash
# Verify swarminator is on PATH
$SHELL -l -c 'command -v swarminator >/dev/null 2>&1 || { echo "ERROR: swarminator not found — install via: brew tap InNoobWeTrust/tap && brew install swarminator" >&2; exit 1; }'

# Safe invocation: pipe input from a file to avoid shell interpolation.
# swarminator auto-detects available agents (kilo, codex, claude, gemini) with fallback.
input_file="input.txt"
persona="PERSONA_TEXT"
model="MODEL_ID"
$SHELL -l -c "cat \"$input_file\" | swarminator -m \"$model\" -p \"$persona\""

# Optional flags:
#   --agent=AGENT      force a specific agent
#   --feedback=stderr  stream feedback to stderr
#   -t SECONDS         timeout
```

Use a login shell and pipe input from a file or stdin. See `swarminator --tutorial TOPIC`, `--phases`, or `--protocol` for built-in reference docs.

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
