# Branch-Graft Synthesis

Use this when multiple agents or personas produce **different but plausible** branches of thought and collapsing too early would lose signal.

## When to trigger

- Two or more branches satisfy part of the brief but disagree on approach
- Reviewers reject a synthesis because it erased an important trade-off
- The orchestrator is about to pick a winner without preserving why the losers mattered

## The branch-graft protocol

For each branch, extract:

```markdown
### Branch [A/B/C]
- Core claim:
- Evidence / rationale:
- Strengths:
- Failure risks:
- Non-negotiables:
```

Then produce a graft table:

| Dimension | Branch A | Branch B | Keep | Why |
|---|---|---|---|---|
| Goal interpretation | | | | |
| Constraints honored | | | | |
| Key insight | | | | |
| Risk handling | | | | |
| Open weakness | | | | |

## Output

End with one of these verdicts:

- **GRAFTED** — one merged synthesis keeps the best parts of multiple branches
- **CHOOSE A BRANCH** — one branch dominates; preserve the losing branch notes in the synthesis log
- **ESCALATE** — the conflict is really a product/policy decision, not a synthesis problem

## Hard rules

1. Do not average contradictions into vague prose.
2. Preserve the strongest dissent in the synthesis log.
3. If branches differ because the brief is ambiguous, escalate instead of pretending they are compatible.
4. If one branch is strictly dominated, say so explicitly and explain why.
