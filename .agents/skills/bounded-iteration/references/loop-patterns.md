## Loop Patterns

### HITL: One Iteration At A Time

```bash
ITERATION_TIMEOUT_SEC=${ITERATION_TIMEOUT_SEC:-900}

timeout "$ITERATION_TIMEOUT_SEC" <ai-cli> "$(cat PROMPT.md)" < TASK.md
./verify.sh
```

### AFK: Bounded Loop With State And Stop Conditions

```bash
MAX_ITER=${MAX_ITER:-10}
ITERATION_TIMEOUT_SEC=${ITERATION_TIMEOUT_SEC:-900}
REQUIRED_SUCCESS_STREAK=${REQUIRED_SUCCESS_STREAK:-1}
PASS_STREAK=0

for i in $(seq 1 "$MAX_ITER"); do
  timeout "$ITERATION_TIMEOUT_SEC" <ai-cli> "$(cat PROMPT.md)" < TASK.md || {
    echo "STOP_TIMEOUT" >> progress.txt
    break
  }

  ./verify.sh
  rc=$?

  if [ "$rc" -eq 0 ]; then
    PASS_STREAK=$((PASS_STREAK + 1))
    if [ "$PASS_STREAK" -ge "$REQUIRED_SUCCESS_STREAK" ]; then
      echo "STOP_SUCCESS" >> progress.txt
      break
    fi
    continue
  fi

  PASS_STREAK=0

  case "$rc" in
    2) ;;
    3) echo "STOP_VERIFY_BROKEN" >> progress.txt; break ;;
    4) echo "STOP_MANUAL_INTERVENTION" >> progress.txt; break ;;
    *) echo "STOP_UNSAFE_ACTION" >> progress.txt; break ;;
  esac
done
```

The loop above is still a template. In production AFK mode, add:

- Signal traps for graceful shutdown
- State writes after every iteration
- Budget tracking
- Oscillation detection
- Cleanup hooks for your isolated environment

## Output Templates

### On Success

```markdown
## Bounded Iteration Complete: [task]

Mode: HITL / AFK
Stop code: STOP_SUCCESS
Iterations: N

Verification proof:
- tests: 18 passed
- typecheck: 0 errors

Files changed:
- [file 1]

Checkpoint:
- [snapshot, patch, or approved commit]
```

### On Stop Condition

```markdown
## Bounded Iteration Stopped: [task]

Mode: HITL / AFK
Stop code: STOP_MAX_ITER
Iterations: N

Last good checkpoint:
- [checkpoint or none]

Current blocker:
- [exact verifier failure or unsafe action]

Next operator action:
- [debug verifier / narrow task / switch to HITL / use swarm]
```

## Integration

Bounded Iteration works with any AI CLI that can be wrapped in a bounded outer loop.

| Tool | Pattern |
|------|---------|
| Generic AI CLI | `<ai-cli> "$(cat PROMPT.md)" < TASK.md` |
| Claude Code | `claude -p "$(cat PROMPT.md)" < TASK.md` |
| Custom scripts | Replace `<ai-cli>` with your wrapper |
