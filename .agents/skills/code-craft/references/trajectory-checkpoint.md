# Trajectory Checkpoint

Use this only when Phase 3 or Phase 4 starts to drift.

## Trigger signals

Run a checkpoint when any of these happen:

- 5+ meaningful tool turns on one implementation thread
- You are re-reading files or logs without changing the plan
- Two plausible fixes are competing and the path is getting muddy
- Confidence drops below "I know the next best step"
- You notice thrash: undo/redo cycles, widening scope, or speculative edits
- The user repeatedly corrects the same approach or supplies an existing implementation you have not examined

## Micro-protocol

Pause and restate the trajectory before continuing.

```markdown
TRAJECTORY CHECKPOINT
=====================
Goal now        :
Last 3 facts    :
1.
2.
3.
Open risks      :
Next best step  :
Why this step   :
Out of scope    :
```

## Rules

1. Use **facts**, not guesses, in `Last 3 facts`.
2. If you cannot name the next best step, stop and redesign or ask.
3. If the checkpoint reveals scope creep, narrow back to the smallest testable slice.
4. If two branches remain plausible, name both and choose one explicitly.
5. Do not continue with "I'll just try things" after a checkpoint.
6. On repeated correction, revisit the underlying model and inspect the user's example before editing again. Separate a factual correction from a preference change; do not answer either by merely reformatting the same disputed approach.

## Outcome

After the checkpoint, either:

- continue with one explicit next step,
- return to Design Intent,
- or escalate because the ambiguity is semantic, not tactical.
