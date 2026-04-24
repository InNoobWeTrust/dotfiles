# Swarm + Ralph: Combined Pipeline

This document describes how to combine `swarm-intelligence` and `ralph-loop`
into a single end-to-end pipeline:

```
Swarm Phase 1 (Research)
  → Swarm Phase 2 (Spec + Completion Criteria)
    → Ralph (Iterative Execution until criteria met)
```

Use this pattern when the task is too large or ambiguous for a single-shot
prompt but has a clear end state — typically large refactors, migrations,
and feature builds that span many files.

---

## When to Use the Combined Pipeline

| Situation | Use |
|-----------|-----|
| Task is clear + small | Ralph alone |
| Task is ambiguous or needs design | Swarm alone |
| Task is large + ambiguous, but has a verifiable end state | **Swarm → Ralph** |
| Task requires human judgment at every step | Neither — work manually |

---

## Pipeline Phases

### Phase 1 — Swarm Research & Spec

Run `swarm-intelligence` with the `code` domain config (or whichever domain
matches your task). The swarm outputs:

- A locked technical specification (`design` object)
- A set of API contracts that implementation must satisfy
- A decomposed task list (from `phase3_decompose_persona`)

**Swarm invocation (minimal mode):**

```bash
$SHELL -l -c 'echo "<task description>" | kilo-swarm -m MODEL -p "$(cat swarm-persona.txt)"'
```

**What to extract from swarm output:**

1. The final `files` artifact — this becomes Ralph's `TASK.md`
2. The QA edge cases and negative tests — these become `verify.sh` checks
3. The API contracts — these become the machine-verifiable completion criteria

---

### Phase 2 — Translate Swarm Output to Ralph Input

Convert the swarm artifact into two files Ralph needs:

**`TASK.md`** — the task description with scope and acceptance criteria:

```markdown
# Task: [Title from swarm spec]

## What to implement
[From swarm phase3_decompose output]

## Completion criteria
- [ ] All API contracts from spec are implemented with correct signatures
- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm test` passes with 0 failures
- [ ] [QA edge cases from swarm phase2_review output are handled]

## Files in scope
[From swarm decomposition task list]

## Contracts to satisfy
[Copy api_contracts verbatim from swarm design output]
```

**`verify.sh`** — machine-verifiable gate script:

```bash
#!/usr/bin/env bash
set -e

echo "=== Type check ==="
npm run typecheck

echo "=== Tests ==="
npm test

echo "=== Contract surface check ==="
# Example: verify all expected exports exist
node -e "
  const mod = require('./dist/index.js');
  const required = ['functionA', 'ClassB', 'typeC'];
  const missing = required.filter(k => !(k in mod));
  if (missing.length) { console.error('Missing:', missing); process.exit(1); }
  console.log('All contracts present');
"

echo "=== All checks passed ==="
```

---

### Phase 3 — Ralph Execution Loop

With `TASK.md` and `verify.sh` ready, run the Ralph loop:

```bash
MAX_ITER=20
LOG="progress.txt"
echo "# Swarm+Ralph Pipeline: $(date)" > $LOG

for i in $(seq 1 $MAX_ITER); do
  echo "## Iteration $i" >> $LOG
  cat TASK.md | claude -p "Work on the next incomplete item. Check progress.txt for context." 2>&1 | tee -a $LOG
  ./verify.sh && break
  echo "Verify failed — injecting feedback for iteration $((i+1))" | tee -a $LOG
done
```

Each iteration:
1. Reads `TASK.md` for the full task and criteria
2. Reads `progress.txt` for context from previous iterations
3. Implements the next incomplete item
4. Runs `verify.sh` — if it passes, loop exits; if not, feedback is injected

---

## Handoff Contract

The swarm-to-ralph handoff is only valid when:

1. `TASK.md` has **machine-verifiable** completion criteria (not "looks good")
2. `verify.sh` is executable and exits `0` on success, non-zero on failure
3. The swarm spec is **locked** — no open questions or unresolved contradictions
4. A sandbox or isolated environment is in place for AFK mode

If any of these conditions are not met, do not start the Ralph loop. Resolve
the gap first (clarify the spec, write the verify script, set up isolation).

---

## Failure Recovery

| Failure | Action |
|---------|--------|
| Swarm Phase 1 no quorum | Retry with different models or simplify input |
| Swarm Phase 2 rejected after 3 cycles | Manually resolve the contradiction and re-run |
| Ralph hits max iterations | Report partial state, identify blockers, extend cap or intervene |
| `verify.sh` never exits 0 | Debug verify script itself — it may have a false negative |
| Iteration breaks previously passing tests | Revert to last good commit, narrow scope |

---

## Cost and Iteration Budget

- Swarm phases are a one-time cost (Research + Spec)
- Ralph iterations are the variable cost — each iteration is one full LLM run
- Start with `MAX_ITER=10`, increase only after observing convergence rate
- If iteration 5 shows no progress vs iteration 1, stop and debug the task definition

---

## Example: Jest → Vitest Migration

```bash
# Step 1: Run swarm to produce spec and task decomposition
echo "Migrate all Jest tests in src/ to Vitest. Output: locked spec, task list, verify script." \
  | $SHELL -l -c 'kilo-swarm -m claude-3-5-haiku -p "$(cat swarm-persona.txt)"' \
  > swarm-output.json

# Step 2: Extract TASK.md and verify.sh from swarm output
# (manually or via jq)
jq -r '.files[] | select(.path == "TASK.md") | .content' swarm-output.json > TASK.md
jq -r '.files[] | select(.path == "verify.sh") | .content' swarm-output.json > verify.sh
chmod +x verify.sh

# Step 3: Run Ralph loop
MAX_ITER=20
for i in $(seq 1 $MAX_ITER); do
  echo "Iteration $i of $MAX_ITER"
  cat TASK.md | claude -p "Continue the migration. Check progress.txt for context from previous iterations."
  ./verify.sh && break
done
```

Expected outcome: all Jest imports replaced with Vitest equivalents, all tests
pass under Vitest, in 3–8 iterations.
