## Guardrails Before First Iteration

Do not start the loop until these are true:

1. Scope is explicit
   - Files in scope are listed in `TASK.md`
   - Allowed and forbidden actions are listed in `TASK.md`
2. Hard limits are set
   - `MAX_ITER` default: `10`
   - `ITERATION_TIMEOUT_SEC` default: `900`
   - `REQUIRED_SUCCESS_STREAK` default: `1`
   - For flaky checks, set `REQUIRED_SUCCESS_STREAK=2`
   - `MAX_COST_USD` is optional but recommended for AFK runs
3. Cleanup strategy exists
   - Preferred: disposable worktree, container, or VM snapshot
   - Shared workspace: use HITL only
4. Unsafe actions are blocked
   - No destructive filesystem or git commands
   - No edits to secret-bearing files unless explicitly approved
   - No network-mutating commands or dependency additions unless explicitly allowed in `TASK.md`
   - No background services, daemons, or long-running processes
5. Resume data exists
   - `progress.txt` is created before iteration `1`
   - `.ralph-state.json` exists before iteration `1` in AFK mode or whenever resume is required

## Stop Conditions

Stop immediately when any of these codes applies:

| Code | Meaning |
|------|---------|
| `STOP_SUCCESS` | Verification reached success with positive proof |
| `STOP_INPUT_AMBIGUOUS` | Task is still ambiguous or contradictory |
| `STOP_UNSAFE_ACTION` | The next action would violate guardrails |
| `STOP_VERIFY_BROKEN` | `verify.sh` is misconfigured or cannot provide trustworthy output |
| `STOP_MAX_ITER` | Iteration cap reached |
| `STOP_MAX_COST` | Budget cap reached |
| `STOP_TIMEOUT` | The current iteration exceeded its wall-clock limit |
| `STOP_OSCILLATION` | The loop is repeating the same failure or alternating between failures |
| `STOP_CONTEXT_LIMIT` | Context cannot be safely summarized anymore |
| `STOP_MANUAL_INTERVENTION` | A human decision is required before continuing |

If a stop condition fires, do not run another iteration first. Report current
state, last known good checkpoint, and the exact blocker.

## Verification Contract

`verify.sh` is the heart of Bounded Iteration. If verification is weak, Bounded Iteration is unsafe.

### Required behavior

`verify.sh` must:

1. Exit `0` only when all acceptance checks pass
2. Exit `2` when product checks fail and another implementation iteration may help
3. Exit `3` when the verifier itself is broken or the environment is misconfigured
4. Exit `4` when the task is not machine-verifiable and AFK should stop
5. Write a machine-readable summary to `.ralph-verify.json`

### Positive proof rule

Success must be proven by positive signals, not by the absence of errors.

Good proof:

- `18 tests passed`
- `typecheck completed with 0 errors`
- `coverage 82.4% >= target 80%`
- `expected 15 docs, found 15 docs`

Not good enough:

- Empty output
- `0 tests found`
- "No error text was present"
- A tool exiting `0` while skipping the real check

### Verification summary shape

`.ralph-verify.json` should look like this:

```json
{
  "status": "pass",
  "retryable": false,
  "checks": [
    {
      "name": "tests",
      "status": "pass",
      "proof": "18 tests passed"
    }
  ],
  "proof": {
    "tests_ran": 18,
    "typecheck_passed": true
  },
  "failure_fingerprint": "",
  "notes": []
}
```

Use `REQUIRED_SUCCESS_STREAK=2` when verification is flaky or when the project
has intermittent tests.

## State And Context Management

Bounded Iteration must manage state explicitly. Otherwise the loop either forgets too much
or drags too much history forward.

### Human-readable state

`progress.txt` is the concise operator log. Append one section per iteration:

```text
# Bounded Iteration: add jsdoc to exports
# Started: 2026-04-24T09:00:00Z

## Iteration 1
- Changed: documented 12 of 15 exported functions in src/api.ts
- Verification: tests pass, typecheck fails in src/utils.ts
- Next focus: fix 3 remaining exports and type errors
```

### Machine-readable state

`.ralph-state.json` should track at least:

- `mode`
- `iteration`
- `success_streak`
- `failure_fingerprint`
- `repeat_failures`
- `cost_usd`
- `files_touched`
- `last_good_checkpoint`

An example lives at `references/examples/ralph-state.json`.

### Context policy

Each iteration should read only:

1. `TASK.md`
2. `PROMPT.md`
3. The latest `progress.txt` summary
4. The latest `.ralph-verify.json` or verifier log
5. The specific files currently in scope

Do not replay the full transcript every time. Summarize older iterations into
state files. If the task cannot be summarized safely, stop with
`STOP_CONTEXT_LIMIT`.

## Session Flow

### 1. Clarify Or Reject The Task

If the task is vague:

- In HITL: ask the human and lock the answer into `TASK.md`
- In AFK: do not start; return `STOP_INPUT_AMBIGUOUS`

Examples of well-defined tasks:

- "Increase coverage to 80%"
- "Migrate Jest tests to Vitest"
- "Add JSDoc to all exported functions in src/"

Examples that need design first:

- "Make the code better"
- "Add better error handling"
- "Figure out the architecture"

### 2. Build The Handoff Package

Create or materialize:

- `TASK.md`
- `PROMPT.md`
- `verify.sh`
- `progress.txt`
- `.ralph-state.json` for AFK or resumable HITL runs

Use the templates under `references/templates/`.

### 3. Run One Bounded Iteration

One iteration means:

1. Run the AI CLI once with the current prompt package
2. Keep the change scope narrow
3. Record what changed and why
4. Enforce timeout, budget, and guardrails

### 4. Verify And Classify The Result

After each iteration:

1. Run `verify.sh`
2. Read `.ralph-verify.json`
3. Classify the result
   - Success -> increment success streak
   - Retryable failure -> feed the failure back into the next iteration
   - Verifier failure -> stop and repair the verifier
   - Unsafe or subjective path -> stop and escalate

### 5. Detect Oscillation

Stop when any of these happens:

- The same `failure_fingerprint` repeats 3 times
- Two failure fingerprints alternate back and forth
- The loop keeps changing unrelated files without improving verification

Oscillation means the loop is no longer learning from feedback. Switch to HITL
or route to systematic investigation.

### 6. Cleanup And Handoff

On success:

- Write the final verification proof to `progress.txt`
- Record the last good checkpoint in `.ralph-state.json`
- Emit a clear completion summary

On failure:

- Stop with the relevant stop code
- Record the last passing checkpoint or note that none exists yet
- Restore from the disposable workspace, snapshot, or approved checkpoint plan

Do not rely on destructive cleanup in a shared workspace.

## Cleanup And Recovery

Preferred recovery order:

1. Throw away the disposable worktree or container and recreate it
2. Restore a VM snapshot or workspace snapshot
3. Apply a saved patch or approved checkpoint

Do not use these as automatic cleanup steps in AFK mode unless the environment
explicitly permits them and the workspace is disposable:

- `git reset --hard`
- `git clean -fdx`
- `rm -rf`

If the loop runs in a shared workspace, Bounded Iteration should stop and request human
cleanup instead of attempting destructive restoration.
