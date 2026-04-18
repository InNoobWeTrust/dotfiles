---
description: >
  Iterative autonomous coding loop. Use when you have a well-defined task
  with clear completion criteria that needs persistent work until actually
  done — not just until the LLM stops calling tools. Ralph keeps running
  verification loops (types, tests, linting) and only exits when completion
  criteria are met. Activate when the user says "ralph", "loop", "keep going",
  "run until done", "autonomous", or wants overnight/background coding work.
  NOT for ambiguous requirements, architectural decisions, or one-shot tasks.
---

# Ralph Loop — Iterative Autonomous Coding

Run an AI coding agent in a persistent loop until the work is actually complete,
not just until the LLM stops calling tools.

## Core Philosophy

**Iteration beats perfection.** The agent doesn't need to be perfect on the first
try — it just needs to be persistent. Ralph wraps the standard tool loop with an
outer verification layer that checks completion criteria before allowing exit.

## When to Use

| Scenario | Use Ralph? | Why |
|----------|------------|-----|
| "Add tests to all uncovered functions" | ✅ | Clear criteria: coverage threshold met |
| "Refactor class components to hooks" | ✅ | Clear before/after: same behavior, different syntax |
| "Figure out why this is slow" | ❌ | No clear stopping point |
| "Design our new architecture" | ❌ | Needs human judgment |
| "Add auth to the API" | ⚠️ | Do manually or with HITL only |
| "Migrate Jest → Vitest" | ✅ | Well-defined with test pass/fail |

## Entry Point

Use the bash loop pattern directly with your AI CLI:

```bash
# Basic loop with Claude Code
while :; do 
  cat TASK.md | claude -p "$(cat PROMPT.md)"
  ./verify.sh || continue
  break
done

# Or with maximum iterations
MAX_ITER=20
for i in $(seq 1 $MAX_ITER); do
  cat TASK.md | claude -p "$(cat PROMPT.md)"
  ./verify.sh && break
done
```

Ralph will:
1. Clarify the task if vague
2. Define completion criteria
3. Set up progress tracking
4. Run iterations until criteria met or max iterations reached

## Two Operating Modes

### HITL (Human-In-The-Loop)

Run one iteration at a time. Watch the agent work. Intervene when needed.

```bash
# Run one iteration, inspect, run next
cat TASK.md | claude -p "$(cat PROMPT.md)"
# review output, decide whether to continue
```

**Best for:**
- Learning the technique
- Refining prompts
- Risky tasks where you want eyes on every change

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

**Best for:**
- Well-defined work with clear completion criteria
- Test migrations
- Coverage improvements
- Large refactors with clear patterns

**AFK Prerequisites:**

1. **Define completion criteria** — Must be machine-verifiable
2. **Set max-iterations** — Start conservative (10-20)
3. **Use sandbox** — Run in an isolated environment
4. **Verify criteria are checkable** — Can scripts/tests actually verify completion?

**Critical:** Never run AFK mode without isolation. You're giving an agent
autonomous access to your system. Contain it.

## How Ralph Works

```
Outer Loop: Ralph
├── Inner Loop: AI Tool Use (LLM ↔ tools until done)
├── Verify: Is TASK actually complete?
│   ├── YES → Commit → Return result
│   └── NO  → Inject feedback → Run another iteration
└── Guard: Did we hit max iterations? → Stop and report
```

Key mechanisms:
- **Stop hook**: Intercepts exit attempts, checks completion criteria
- **Progress tracking**: `progress.txt` tracks decisions, blockers, changes
- **Git commits**: Each iteration commits, creating context for next
- **Feedback gate**: Types, tests, linting must pass before continuing

## Session Flow

### 1. Clarify the Task

If vague, ask:

```
"What's the specific thing you want built/migrated/refactored?"
"What does 'done' look like?"
"What would fail if the task isn't complete?"
```

**Well-defined task examples:**
- "Add JSDoc to all exported functions in src/" — verifiable by checking doc presence
- "Migrate all Jest tests to Vitest" — verifiable by running tests with Vitest
- "Increase test coverage to 80%" — verifiable by coverage report

**Ambiguous task examples:**
- "Make the code better" — what does better mean?
- "Add better error handling" — how much is enough?
- "Figure out the architecture" — no clear stopping point

### 2. Define Completion Criteria

```json
{
  "description": "Add JSDoc to all exported functions",
  "verification": [
    "grep -r 'export function' src/ | wc -l",
    "grep -r '@param' src/ | wc -l (should match)",
    "typecheck passes"
  ],
  "passes": false
}
```

Or simpler: "Done when `npm run typecheck && npm test` passes with 0 errors"

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
Ralph: Clarified task: Add JSDoc to exported functions
Ralph: Criteria: typecheck passes + all exports documented
Ralph: Iteration 1...
[You watch the agent work]
Ralph: Iteration 1 complete. 12/15 exports documented. typecheck: 2 errors.
Ralph: Feedback injected: fix type errors, complete remaining 3 exports
Ralph: Iteration 2...
...
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

**Git safety**: Never run `git add` or `git commit` directly. Delegate all git mutations to the `git-supervisor` agent.

```bash
for i in $(seq 1 20); do
  cat TASK.md | claude -p "$(cat PROMPT.md)"
  ./verify.sh || continue
  # Route to git-supervisor: "Stage all verified changes and commit: Ralph iteration $i"
  break
done
```

## Practical Tips

### Define Clear Scope
The agent needs to know exactly what "done" means. Vague tasks produce vague results.

### Track Progress
`progress.txt` gives future iterations context. Without it, each iteration
starts fresh — losing all the decisions and context from previous work.

### Use Feedback Loops
Block commits unless ALL checks pass. One failed check = iteration not complete.

### Take Small Steps
One logical change per commit. If iteration N breaks something, you can
revert to iteration N-1 and know exactly what changed.

### Cap Iterations
- **HITL:** No cap needed — you're watching every step
- **AFK:** Start with 10-20. A 50-iteration loop can cost significant credits.
  Increase only after understanding your token consumption.

### Commit After Each Logical Unit
Good git hygiene = clean history + easy rollback. If iteration 15 breaks,
revert to iteration 14's commit.

## Output

### On Success

```markdown
## Ralph Loop Complete: [Task]

**Mode**: HITL / AFK
**Iterations**: N
**Time**: ~M minutes

### Completion Criteria
- [criterion]: ✓
- [criterion]: ✓

### Git History
- [commit hash] [brief description]

### Files Changed
- [file 1]
- [file 2]
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
- Consider: [alternative approach]
```

---

## Integration

Ralph works with any AI CLI tool using bash loops:

| Tool | Loop Pattern |
|------|--------------|
| Claude Code | `cat TASK.md \| claude -p "$(cat PROMPT.md)"` |
| Claude CLI | `cat TASK.md \| claude -p "$(cat PROMPT.md)"` |
| Custom scripts | Replace the `cat TASK.md \| <ai-cli>` part |

### When to Use vs Alternatives

| Task | Use | Alternative |
|------|-----|-------------|
| Implement feature until tests pass | Ralph | Single-shot prompting |
| Review + fix all findings | Review command | Ralph (Ralph is overkill for single-pass fixes) |
| Migrate 50 files | Ralph | Single-shot prompting (will fail) |
| Understand unfamiliar codebase | Codebase navigation | Ralph (no clear completion criteria) |
| Design architecture | None | Human deliberation |

## Self-Reference: Improving Ralph Itself

Ralph can improve itself:

```bash
# Create task file
cat > TASK.md << 'EOF'
Review and improve this ralph-loop.md file.

Completion criteria:
1. Add table comparing when to use Ralph vs alternatives
2. Add concrete AFK safeguards section
3. Add entry point explanation with bash loop examples
4. Integration section explains generic tool usage
5. Add progress tracking format example

Verification: Read the updated file and confirm improvements.
EOF

# Run the loop
while :; do 
  cat TASK.md | claude -p "$(cat PROMPT.md)"
  ./verify.sh || continue
  break
done
```
