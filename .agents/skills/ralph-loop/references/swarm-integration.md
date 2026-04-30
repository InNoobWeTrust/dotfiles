# Swarm + Ralph: Combined Pipeline

This document describes how to combine `swarm-intelligence` and `ralph-loop`
into one end-to-end workflow:

```text
Swarm orchestrator (research -> design -> decomposition)
  -> Ralph handoff package synthesis
    -> Ralph execution loop until verification passes
```

Use this pattern when the task is too large or ambiguous for a single-shot
prompt, but still has a machine-verifiable end state.

## When To Use The Combined Pipeline

| Situation | Use |
|-----------|-----|
| Task is clear and small | Ralph alone |
| Task is ambiguous and needs design | Swarm alone |
| Task is large, ambiguous, and still has a verifiable end state | Swarm -> Ralph |
| Task requires human judgment on every step | Neither; work manually |

## Ground Rules

1. `swarm-intelligence` is an orchestrated multi-phase workflow.
2. `swarminator` runs one node per invocation, not the whole swarm.
3. The final swarm output is one JSON artifact with a `files` array.
4. Intermediate phase outputs may be prose, bullets, lightly structured text,
   or JSON; they are not the final artifact contract.
5. Swarm nodes do not write files. A separate materialization step or premium
   `code` agent writes files.

If you are building a custom orchestrator, verify `swarminator` exists first:

```bash
$SHELL -l -c 'command -v swarminator >/dev/null 2>&1 || { echo "ERROR: swarminator not found in PATH" >&2; exit 1; }'
```

Do not replace the swarm with one raw `swarminator` command. A single invocation
only runs one node.

## Phase 1: Run Swarm Normally

Load `swarm-intelligence` and let it follow its documented orchestrator flow.
In minimal mode that means:

1. Select the correct domain config.
2. Run both Phase 1 branches to quorum.
3. Run Phase 2 forward/review and revise if needed.
4. Run Phase 3 decomposition and maker/breaker loops.
5. Return one final JSON artifact with `files[]`.

For code work, the usual choice is the `code` domain config.

### What Ralph Needs From Swarm

Ralph needs a handoff package, not just the final implementation artifact.
Capture these during orchestration:

1. The approved Phase 2 design decisions and completion criteria
2. The Phase 2 review findings that must be checked in verification
3. The Phase 3 decomposition and file/task scope
4. The final artifact's `files[]` output

Important: only `files[]` is guaranteed in the final swarm artifact. If you
need design notes, QA cases, or decomposition details later, persist them
explicitly in the orchestrator or synthesize them into the handoff package.

## Phase 2: Build The Ralph Handoff Package

After the swarm succeeds, create a Ralph handoff package in a separate
synthesis/materialization step. This is done by the orchestrator or a premium
`code` agent, not by swarm nodes directly.

Recommended handoff files:

1. `TASK.md`
2. `PROMPT.md`
3. `verify.sh`
4. `progress.txt` seed
5. Optional `.ralph-state.json` seed

Starter templates live under `references/templates/`.

### `TASK.md`

`TASK.md` should be a locked execution brief, built from the approved swarm
outputs:

```markdown
# Task: [Title]

## What to implement
- [Concrete work items from the approved decomposition]

## Files in scope
- [Paths from decomposition and/or final artifact]

## Allowed actions
- Edit only the files in scope unless verification proves another file is required

## Forbidden actions
- No destructive cleanup commands
- No dependency additions or network-mutating commands unless explicitly approved
- No secret-file edits

## Completion criteria
- [ ] Every required contract or interface is implemented
- [ ] Every required file in scope is updated
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] Critical review findings from swarm are covered by verification

## Notes for the next iteration
- Check `progress.txt` before changing anything
- If verification fails, fix the reported failures before expanding scope
```

See also `references/templates/TASK.md`.

### `PROMPT.md`

`PROMPT.md` should be stable across iterations. It should tell the model what to
read, what to avoid, and how to react to verifier output.

```markdown
You are executing one Ralph iteration.

Read `TASK.md`, `progress.txt`, and `.ralph-verify.json` first.
Stay inside scope. Fix the latest verifier failure first.
If the task becomes ambiguous or unsafe, stop and report it instead of guessing.
```

See also `references/templates/PROMPT.md`.

### `verify.sh`

`verify.sh` should turn the swarm's acceptance criteria into machine-verifiable
checks and emit positive proof. At minimum it should:

1. Exit `0` only on real success
2. Exit `2` on retryable product failures
3. Exit `3` when the verifier itself is broken or the environment is wrong
4. Exit `4` when the task is not machine-verifiable and should not run AFK
5. Write a summary file to `.ralph-verify.json`

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "=== Type check ==="
npm run typecheck

echo "=== Tests ==="
npm test

echo "=== Extra contract / regression checks ==="
# Add project-specific checks derived from the swarm review here.

echo "=== All checks passed ==="
```

Do not treat empty output or `0 tests found` as success. Success needs positive
proof such as `18 tests passed`.

See also `references/templates/verify.sh`.

### Artifact Shape

Default behavior: build `TASK.md`, `PROMPT.md`, and `verify.sh` in the separate Ralph
handoff materialization step above. Do not assume they are present in the
swarm's final artifact unless your orchestrator explicitly emits them there.

If your orchestrator chooses to place `TASK.md`, `PROMPT.md`, and `verify.sh` inside the final
artifact, each entry must follow the documented swarm schema:

```json
{
  "path": "TASK.md",
  "language": "markdown",
  "code": "# Task ...",
  "task_id": "task_handoff"
}
```

Use `.code`, not `.content`, when extracting entries from the artifact.

Example extraction, only if the final artifact actually includes those files:

```bash
jq -r '.files[] | select(.path == "TASK.md") | .code' swarm-output.json > TASK.md
jq -r '.files[] | select(.path == "PROMPT.md") | .code' swarm-output.json > PROMPT.md
jq -r '.files[] | select(.path == "verify.sh") | .code' swarm-output.json > verify.sh
chmod +x verify.sh
```

If the final artifact does not include the handoff files, materialize them in a
separate premium `code` step.

## Phase 3: Run Ralph With Real Feedback Injection

Once `TASK.md`, `PROMPT.md`, and `verify.sh` exist, Ralph can iterate until
verification passes.

```bash
MAX_ITER=10
ITERATION_TIMEOUT_SEC=900
REQUIRED_SUCCESS_STREAK=1
LOG="progress.txt"
VERIFY_LOG=".ralph-verify.log"
PASS_STREAK=0

echo "# Swarm + Ralph Pipeline: $(date)" > "$LOG"
: > "$VERIFY_LOG"

for i in $(seq 1 "$MAX_ITER"); do
  echo "## Iteration $i" >> "$LOG"

  FEEDBACK=""
  if [ -s "$VERIFY_LOG" ]; then
    FEEDBACK="$(printf '\nPrevious verification failures:\n%s\n' "$(cat "$VERIFY_LOG")")"
  fi

  PROMPT="$(cat PROMPT.md)

${FEEDBACK}"

  timeout "$ITERATION_TIMEOUT_SEC" <ai-cli> "$PROMPT" < TASK.md 2>&1 | tee -a "$LOG" || {
    echo "STOP_TIMEOUT" >> "$LOG"
    break
  }

  if ./verify.sh > "$VERIFY_LOG" 2>&1; then
    cat "$VERIFY_LOG" >> "$LOG"
    PASS_STREAK=$((PASS_STREAK + 1))
    if [ "$PASS_STREAK" -ge "$REQUIRED_SUCCESS_STREAK" ]; then
      break
    fi
    continue
  fi

  PASS_STREAK=0

  {
    echo "### Verification failures after iteration $i"
    cat "$VERIFY_LOG"
  } >> "$LOG"
done
```

The important part is the feedback loop:

1. Run work for one iteration
2. Capture full verification output
3. Feed the failed checks back into the next iteration prompt
4. Stop only when verification exits `0` with positive proof or the iteration cap is hit

## Handoff Contract

The swarm-to-ralph handoff is valid only when all of these are true:

1. `TASK.md` has machine-verifiable completion criteria
2. `PROMPT.md` exists and encodes the per-iteration guardrails
3. `verify.sh` is executable, emits positive proof, and exits with the documented codes
4. The swarm spec is locked: no open questions or unresolved contradictions
5. Required design/review context was persisted explicitly if it is needed by Ralph
6. AFK mode runs in a sandbox or isolated environment
7. A cleanup or restore strategy exists before the first iteration

If any of these are false, do not start Ralph yet.

## Failure Recovery

| Failure | Action |
|---------|--------|
| Swarm Phase 1 cannot reach quorum | Retry with different models or simplify input |
| Swarm Phase 2 is still unapproved after 3 total reviews | Resolve the contradiction manually, then rerun |
| A Phase 3 task still fails after the maker-fix limit | Narrow the task or intervene manually |
| Ralph hits max iterations | Report partial state, identify blockers, then either raise the cap or repair the handoff package |
| `verify.sh` never exits `0` | Debug `verify.sh` itself; it may be too strict, too weak, or missing positive proof |
| Iteration breaks previously passing checks | Revert to the last good checkpoint and narrow scope |
| Ralph repeats the same failure | Stop and debug the failure fingerprint before another iteration |
| Context grows too large to summarize safely | Stop and rebuild the handoff package with a smaller scope |
| Workspace is polluted after failure | Restore from the disposable worktree, snapshot, or approved checkpoint |

## Cleanup And Restore

Prefer disposable environments for AFK runs. The safest restore path is to
discard the disposable worktree or container and recreate it from the last good
state.

If you must keep local state between iterations, persist:

- `progress.txt`
- `.ralph-state.json`
- `.ralph-verify.json`
- An approved patch or checkpoint reference

Do not rely on destructive cleanup commands in a shared workspace.

## Budget Guidance

- Swarm is a one-time planning/spec cost.
- Ralph iterations are the variable execution cost.
- Start with `MAX_ITER=10` or `20`, then adjust based on convergence.
- If several iterations make no progress, stop and debug the task definition,
  verification contract, or prompt handoff.
