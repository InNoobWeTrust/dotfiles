---
name: bounded-iteration
description: "Use this skill for repetitive implement-verify-retry loops with machine-verifiable completion criteria. Activate when the user says \"run until done,\" \"keep trying until tests pass,\" \"iterate until it works,\" or any task with a clear pass/fail gate that benefits from automated retries. Prefers human-in-the-loop; AFK mode requires isolation."
---

# Bounded Iteration

Outer control loop around an AI CLI: locked brief → limited actions → state → **positive proof** verify → stop. Persistence only counts when bounded by proof.

This is a named **evaluator–optimizer** loop: the optimizer proposes the next change, the evaluator scores it against predeclared criteria, and the loop only continues when the evaluator returns retryable failure.

**Not:** design method, unsupervised shared-workspace edits, or a substitute for human judgment.

Elevated autonomy still obeys `rules/autonomy-safety.md`: reversible work inside locked scope may proceed; irreversible / high-blast-radius → stop and escalate.

---

## When to use

| Scenario | Use? |
|---|---|
| Coverage / migrate tests / verifiable bulk edits | Yes |
| Risky refactor / auth / security | HITL only |
| Diagnosis / architecture design | No — design or investigate first |

Design-first handoff: `references/swarm-integration.md`.

For subjective or policy-heavy scoring that cannot live in `verify.sh`, pair this skill with `reviewer` and let Reviewer act as the explicit evaluator before another optimizer pass. In that mode, the artifact under review, the review rubric, and the mapping from `PASS / FAIL / UNVERIFIED` to `retry / stop / escalate` must be written into `TASK.md` before iteration 1.

---

## Contract (required files)

| File | Purpose |
|---|---|
| `TASK.md` | Scope, allow/forbid, acceptance, stop triggers |
| `PROMPT.md` | Stable per-iteration instructions |
| `verify.sh` | Machine gate (exit 0 pass / 2 retry / 3 verifier broken / 4 not verifiable) |
| `progress.txt` | Human iteration log |
| `.ralph-state.json` | Resume / oscillation (required AFK) |
| `.ralph-verify.json` | Latest proof summary |

Templates: `references/templates/`. Deep procedure: `references/procedure.md`. Shell loops: `references/loop-patterns.md`.

---

## Modes

- **HITL (default):** one iteration → human inspect → continue.
- **AFK:** only if task locked, `verify.sh` trustworthy, workspace isolated/disposable, stop/cleanup configured. Not open-ended autonomy.

Defaults: `MAX_ITER=10`, `ITERATION_TIMEOUT_SEC=900`, `REQUIRED_SUCCESS_STREAK=1` (use 2 if flaky).

---

## Session flow (summary)

1. Reject ambiguous tasks (AFK → `STOP_INPUT_AMBIGUOUS`).
2. Build handoff package from templates, including criteria the evaluator can score before the optimizer writes.
3. One bounded optimizer iteration (narrow scope).
4. Run the evaluator (`verify.sh` + acceptance criteria); classify; feed failures back.
5. Detect oscillation (same fingerprint ×3 or alternating) → stop.
6. Cleanup/handoff; no destructive restore in shared workspaces.

**Stop codes:** `STOP_SUCCESS`, `STOP_INPUT_AMBIGUOUS`, `STOP_UNSAFE_ACTION`, `STOP_VERIFY_BROKEN`, `STOP_MAX_ITER`, `STOP_MAX_COST`, `STOP_TIMEOUT`, `STOP_OSCILLATION`, `STOP_CONTEXT_LIMIT`, `STOP_MANUAL_INTERVENTION`.

**Positive proof:** success needs signals like `18 tests passed`, not empty output or "no errors seen."

Load `references/procedure.md` before first AFK run or when implementing `verify.sh` / state files.

---

## Deliverable

- [ ] Contract files present and filled
- [ ] Mode chosen with guardrails
- [ ] Stop on success or explicit stop code (never silent continue)
- [ ] Evaluator criteria written before optimizer iteration begins
- [ ] Verification proof recorded
- [ ] Last good checkpoint known on failure
