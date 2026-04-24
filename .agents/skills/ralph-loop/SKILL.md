---
name: ralph-loop
description: Iterative autonomous coding loop. Use when you have a well-defined task with clear completion criteria that needs persistent work until actually done — not just until the LLM stops calling tools. Ralph keeps running verification loops (types, tests, linting) and only exits when completion criteria are met. Activate when the user says "ralph", "loop", "keep going", "run until done", "autonomous", or wants overnight/background coding work. NOT for ambiguous requirements, architectural decisions, or one-shot tasks. Can be combined with swarm-intelligence for a full Research → Spec → Execute pipeline.
---

# Ralph Loop

Iterative autonomous coding loop. Wraps the standard tool loop with an outer
verification layer that checks completion criteria before allowing exit.

**Core principle:** Iteration beats perfection. The agent doesn't need to be
perfect on the first try — it just needs to be persistent.

## When to Use

| Scenario | Use Ralph? | Why |
|----------|------------|-----|
| "Add tests to all uncovered functions" | ✅ | Clear criteria: coverage threshold met |
| "Refactor class components to hooks" | ✅ | Clear before/after: same behavior, different syntax |
| "Figure out why this is slow" | ❌ | No clear stopping point |
| "Design our new architecture" | ❌ | Needs human judgment |
| "Add auth to the API" | ⚠️ | Do manually or with HITL only |
| "Migrate Jest → Vitest" | ✅ | Well-defined with test pass/fail |

When the task is ambiguous or requires design — use **`swarm-intelligence`** first
to generate the spec, then hand the output to Ralph for execution. See
`references/swarm-integration.md`.

## Two Operating Modes

### HITL (Human-In-The-Loop)

Run one iteration at a time. Watch the agent work. Intervene when needed.

```bash
# Run one iteration, inspect, run next
cat TASK.md | claude -p "$(cat PROMPT.md)"
# review output, decide whether to continue
```

**Best for:** learning the technique, refining prompts, risky tasks.

### AFK (Away From Keyboard)

Set a max iteration count and let it run. Come back to results.

```bash
MAX_ITER=20
for i in $(seq 1 $MAX_ITER); do
  echo "Iteration $i of $MAX_ITER"
  cat TASK.md | claude -p "$(cat PROMPT.md)"
  ./verify.sh && break
done
```

**Best for:** well-defined work, test migrations, coverage improvements, large
refactors with clear patterns.

**AFK prerequisites:**
1. Define machine-verifiable completion criteria
2. Set max-iterations (start conservative: 10–20)
3. Run in a sandbox — never run AFK without isolation

## How the Loop Works

```
Outer Loop: Ralph
├── Inner Loop: AI Tool Use (LLM ↔ tools until done)
├── Verify: Is TASK actually complete?
│   ├── YES → Commit → Return result
│   └── NO  → Inject feedback → Run another iteration
└── Guard: Did we hit max iterations? → Stop and report
```

Key mechanisms:
- **Stop hook**: intercepts exit attempts, checks completion criteria
- **Progress tracking**: `progress.txt` tracks decisions, blockers, changes
- **Git commits**: each iteration commits, creating context for the next
- **Feedback gate**: types, tests, linting must ALL pass before continuing

## Session Flow

### 1. Clarify the Task

If vague, ask:
- "What's the specific thing you want built/migrated/refactored?"
- "What does 'done' look like?"
- "What would fail if the task isn't complete?"

**Well-defined task examples:**
- "Add JSDoc to all exported functions in src/" — verifiable by checking doc presence
- "Migrate all Jest tests to Vitest" — verifiable by running tests with Vitest
- "Increase test coverage to 80%" — verifiable by coverage report

**Ambiguous task examples (use Swarm first):**
- "Make the code better" — what does better mean?
- "Add better error handling" — how much is enough?
- "Figure out the architecture" — no clear stopping point

### 2. Define Completion Criteria

```json
{
  "description": "Add JSDoc to all exported functions",
  "verification": [
    "grep -r 'export function' src/ | wc -l",
    "@param count matches export function count",
    "typecheck passes"
  ],
  "passes": false
}
```

Or simpler: "Done when `npm run typecheck && npm test` passes with 0 errors."

### 3. Set Up Progress Tracking

Create `progress.txt`:

```
# Ralph Loop: [Task]
# Started: [timestamp]

## Iteration 1
- Changed: added JSDoc to src/api.ts (12 functions)
- Blocked: src/utils.ts has 3 functions with complex generics, skipped
- Decision: JSDoc format = /** */ style (not //)

## Iteration 2
- Changed: added JSDoc to src/utils.ts (3 functions)
- Done: all exported functions now have JSDoc
- Verification: typecheck passes ✓
```

### 4. Run the Loop

**HITL Mode:**
```
Ralph: Iteration 1... 12/15 exports documented. typecheck: 2 errors.
Ralph: Feedback injected: fix type errors, complete remaining 3 exports
Ralph: Iteration 2...
Ralph: Iteration 3 complete. All criteria met ✓
```

**AFK Mode:**
```
Ralph: Task: Add JSDoc to exported functions
Ralph: Mode: AFK, max-iterations=20
Ralph: Iteration 1... 12/15 done, typecheck: 2 errors
Ralph: Iteration 2... 15/15 done, typecheck: 0 errors ✓
Ralph: Task complete. 2 iterations.
```

### 5. Feedback Loop Gate

Before any commit, verify:
- TypeScript type checking passes
- Unit tests pass
- Linting passes
- Pre-commit hooks pass

If any fail → inject feedback → run another iteration.

## Loop Patterns

### Basic While Loop
```bash
while :; do
  cat TASK.md | claude -p "$(cat PROMPT.md)"
  ./verify.sh || continue
  break
done
```

### With Max Iterations
```bash
MAX_ITER=20
for i in $(seq 1 $MAX_ITER); do
  echo "Iteration $i of $MAX_ITER"
  cat TASK.md | claude -p "$(cat PROMPT.md)"
  ./verify.sh && break
done
```

### With Progress Tracking
```bash
LOG="progress.txt"
echo "# Ralph Loop: $(date)" >> $LOG

for i in $(seq 1 20); do
  echo "## Iteration $i" >> $LOG
  cat TASK.md | claude -p "$(cat PROMPT.md)" 2>&1 | tee -a $LOG
  ./verify.sh && break
done
```

### With Git Commits

**Git safety**: Never run `git add` or `git commit` directly. Delegate all git
mutations to the `git-supervisor` agent.

```bash
for i in $(seq 1 20); do
  cat TASK.md | claude -p "$(cat PROMPT.md)"
  ./verify.sh || continue
  # Route to git-supervisor: "Stage all verified changes and commit: Ralph iteration $i"
  break
done
```

## Practical Tips

| Tip | Rationale |
|-----|-----------|
| Define clear scope | Vague tasks produce vague results |
| Track progress in `progress.txt` | Each iteration needs context from the last |
| Block commits unless ALL checks pass | One failed check = iteration not complete |
| Take small steps per commit | If iteration N breaks, revert to N-1 |
| Cap AFK iterations at 10–20 | A 50-iteration loop can cost significant credits |

## Output Templates

### On Success

```markdown
## Ralph Loop Complete: [Task]

**Mode**: HITL / AFK
**Iterations**: N

### Completion Criteria
- [criterion]: ✓

### Git History
- [commit hash] [brief description]

### Files Changed
- [file 1]
```

### On Max Iterations Reached

```markdown
## Ralph Loop: Max Iterations Reached

**Iterations**: N (at cap)
**Completion**: X/Y criteria met

### What's Done
- [completed work]

### What's Remaining
- [incomplete work]

### Recommendations
- [next steps]
```

## Related Skills

- **`swarm-intelligence`** — Use before Ralph when the task is ambiguous or
  requires design. Swarm generates the spec + completion criteria; Ralph executes
  iteratively until they are met. See `references/swarm-integration.md` for the
  combined pipeline.
- **`strategic-problem-solving`** — Use when an iteration fails in an unexpected
  way and you need root cause analysis before the next iteration.
- **`strategic-codebase-navigation`** — Use before starting Ralph on an unfamiliar
  codebase so the task definition is grounded in the real code structure.
