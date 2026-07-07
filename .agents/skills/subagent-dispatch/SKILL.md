---
name: subagent-dispatch
description: "Construct a precise, structured delegation prompt before every subagent launch. Use whenever you are about to delegate work to a background agent, run a task in parallel, or spawn a worker. Injects scope constraints, a structured output contract, obstacle reporting, and allowed-action boundaries directly into the input prompt to compensate for generic or unconfigured subagent descriptions. Activate on: 'delegate this', 'run this in parallel', 'use the research agent', 'background task', 'spawn a worker', 'launch a subagent', 'hand this off'."
---

# Subagent Dispatch

This skill applies exclusively at **input-prompt construction time** — before you invoke any subagent.

**Core constraint**: assume you cannot edit the subagent's `name`, `description`, or system prompt. All intelligence must travel inside the delegation prompt you write.

---

## Decision Gate — Delegate or Keep in Main Thread?

Before constructing a delegation prompt, apply this single test:

> **Does the intermediate work matter to the main thread?**
> - **No** → delegate. You need the result, not the journey.
> - **Yes** → keep it in the main thread. Each step depends on what the previous step discovered.

**Delegate when:**
- The exploratory work would clutter the main context (e.g., reading dozens of files to answer one question)
- The task benefits from a fresh context with no history of how the code was written (code reviews)
- The task needs a custom tone, persona, or domain context baked into the prompt (copywriting, styling against a design system)
- **Clean-Room TDD Implementation**: Implementing a feature/bugfix after writing unit tests in the main context to avoid bias and enforce blind test verification (see `rules/tdd.md`).

**Do not delegate when:**
- Each step of the pipeline depends on what the previous step discovered — information degrades at every handoff
- You need full raw output to diagnose issues (test runners: a subagent returning "tests failed" hides the details you need — except in Clean-Room TDD where the subagent itself runs the tests blindly and implements/fixes code iteratively)
- The only value would come from an "expert" persona label — the LLM model already has that knowledge; the label adds nothing

---

## The Four Pillars (Input-Side Only)

Because you own the **input prompt**, not the subagent config, every pillar is implemented inside the prompt you write.

### Pillar 1 — Precise Scope Instruction

The main agent's system prompt lists subagent names and descriptions. Since those may be generic, the delegation prompt **must** contain the specificity the description omitted.

Rules:
- State the exact deliverable (file paths, function names, URLs, data set, etc.).
- State what is out of scope explicitly.
- Never say "investigate the code" — say "read `src/auth/jwt.ts` lines 40–90 and identify any token expiry edge cases."
- **Context budget**: limit pasted context to the minimum that would let a competent engineer start immediately — typically under 500 lines or one logical unit. A subagent receiving a 50k-token blob will still wander regardless of how precise the task statement is.

### Pillar 2 — Structured Output Contract

Include a numbered output template in the prompt. The subagent fills in each section and stops when all sections are complete. This is the primary mechanism to prevent runaway execution.

**Required sections for any delegation:**

```
Return your findings in exactly this format:

## 1. Objective Recap
One sentence restating what you were asked to do.

## 2. Findings
<domain-specific findings here>

## 3. Obstacles Encountered
List any: setup issues · workarounds used · commands that needed special flags
· dependencies or imports that caused problems · environment quirks.
Write NONE if the task was clean.

## 4. Confidence & Caveats
Rate your confidence (High / Medium / Low) and list any assumptions made.

## 5. Done Signal
Write exactly: TASK_COMPLETE
```

The `DONE Signal` section forces an unambiguous completion marker the orchestrating agent can scan for.

**Domain-specific Findings templates** — slot one into section 2 based on task type:

<details>
<summary>Code review</summary>

```
## 2. Findings

### Critical Issues
Security vulnerabilities, data integrity risks, or logic errors requiring immediate fix.

### Major Issues
Architecture misalignment, quality problems, or significant performance concerns.

### Minor Issues
Style inconsistencies, documentation gaps, minor optimizations.

### Approval Status
APPROVE | APPROVE_WITH_CHANGES | REJECT — and one sentence why.
```

</details>

<details>
<summary>Research / analysis</summary>

```
## 2. Findings

### Summary
Two-to-four sentence overview.

### Key Evidence
Bullet list of concrete facts, values, or citations.

### Open Questions
What you could not confirm and why.
```

</details>

<details>
<summary>Implementation / code change</summary>

```
## 2. Findings

### Changes Made
File-by-file list of what was changed and why.

### Verification Result
Output of the test/lint/typecheck command run after changes.

### Rollback Notes
What to undo and how if the change needs reverting.
```

</details>

<details>
<summary>Debugging / investigation</summary>

```
## 2. Findings

### Root Cause
One clear sentence.

### Evidence Chain
Step-by-step reasoning from symptom to cause.

### Proposed Fix
Concrete code or config change. State UNKNOWN if not found.
```

</details>

---

### Pillar 3 — Obstacle Reporting

Section 3 of the output template ("Obstacles Encountered") is non-optional. It captures:

- Commands that needed special flags or env vars
- Dependencies or imports that failed and how they were resolved
- Environment quirks (missing tools, wrong versions, permission errors)
- Workarounds discovered mid-task

**Why it matters**: without this, the orchestrating agent rediscovers the same issues on its own, wasting tokens and time.

If the subagent has no obstacles to report, it writes `NONE`. This still confirms the section was evaluated.

---

### Pillar 4 — Allowed Actions Declaration

You cannot change which tools the subagent has access to. You compensate by **declaring allowed actions in the prompt** and relying on the subagent's instruction-following to respect them.

> **Soft contract**: this is enforced by instruction-following, not a hard sandbox. If hard tool isolation is required, configure actual permission grants separately — this declaration alone does not provide it.

Include a `## Allowed Actions` block in every delegation prompt:

```
## Allowed Actions
- READ files: <list specific files or glob patterns, e.g. src/auth/*.ts>
- RUN commands: <list specific read-only commands, e.g. git diff HEAD~1 -- src/>
- NO file writes
- NO destructive commands (rm, mv, git reset, etc.)
- NO network requests beyond: <list domains or NONE>
```

For **standard implementation agents** that must write:

```
## Allowed Actions
- READ: all files under src/
- WRITE: <specific files only, e.g. src/auth/jwt.ts, src/auth/jwt.test.ts>
- RUN: npm test, npm run lint
- NO changes outside the listed write targets
- NO git commits or pushes
```

For **Clean-Room TDD implementation agents**:

```
## Allowed Actions
- READ: all files under src/ (EXCLUDING the unit test files and test helper files, e.g. *.test.ts, test_*.py)
- WRITE: <specific implementation files only, e.g. src/auth/jwt.ts>
- RUN: <specific test runner command, e.g. npm test -- src/auth/jwt.test.ts>
- NO reading or viewing of the unit test files
- NO changes outside the listed write targets
- NO git commits or pushes
```

---

## Delegation Prompt Template

Copy this template and fill in the `[BRACKETS]` before launching a subagent.

```
You are acting as a [ROLE, e.g. "code reviewer", "research analyst", "debugging agent"].

## Task
[ONE CLEAR SENTENCE describing the deliverable]

## Context
[Paste only the relevant context — file paths, excerpts, error messages, URLs.
Do not paste the whole codebase. Be surgical.]

## Allowed Actions
- READ: [list files or globs]
- RUN: [list allowed commands, or NONE]
- WRITE: [list writable files, or NONE]
- NO destructive commands (rm, mv, git reset --hard, etc.)
- NO network requests beyond: [list or NONE]

## Output Format
Return your findings in exactly this format:

### 1. Objective Recap
One sentence restating what you were asked to do.

### 2. Findings
[INSERT domain-specific findings template here]

### 3. Obstacles Encountered
List any: setup issues · workarounds used · commands that needed special flags
· dependencies or imports that caused problems · environment quirks.
Write NONE if the task was clean.

### 4. Confidence & Caveats
Rate your confidence (High / Medium / Low) and list any assumptions made.

### 5. Done Signal
Write exactly: TASK_COMPLETE

## Stop Conditions
Stop immediately and report partial findings if:
- You cannot access a required file or resource.
- The task scope is larger than described here.
- You encounter an action not listed in Allowed Actions.
- You are approaching the context limit and have not yet filled all five output sections — report what you have so far.
```

---

## Preflight Checklist

Run through this before every subagent launch:

- [ ] **Scope**: Does the prompt name the exact files, URLs, or data — not a vague domain?
- [ ] **Output template**: Is the five-section format included verbatim?
- [ ] **Domain template**: Is the correct Findings sub-template slotted into section 2?
- [ ] **Obstacles section**: Is section 3 present and non-optional?
- [ ] **Allowed Actions**: Is the block present and does it match what the task actually requires?
- [ ] **Stop Conditions**: Is there at least one condition that triggers early termination?
- [ ] **Context is surgical**: Did you include only what the subagent needs — not the entire conversation?

---

## Receiving Results

When the subagent returns:

1. **Scan for `TASK_COMPLETE`** in section 5. If absent, treat the result as incomplete and re-delegate with a clarification prompt.
2. **Read section 3 (Obstacles Encountered)**. Surface any workarounds or quirks to the main context so they are not rediscovered.
3. **Read section 4 (Confidence & Caveats)**. Low-confidence findings must be verified before acting on them.
4. **Reject and re-delegate** if:
   - The subagent broadened scope beyond what was described. _Detect this by checking whether findings reference files, URLs, or data sources not listed in the delegation prompt's context or Allowed Actions block._
   - The subagent performed a forbidden action (e.g., wrote a file it was not allowed to touch).
   - The output format is missing or incomplete.

---

## Anti-Patterns to Avoid

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| "Investigate the auth module" | No scope → subagent wanders | Name the exact files and question |
| No output format in prompt | Subagent invents its own → unreadable | Always include the five-section template |
| Omitting Obstacles section | Workarounds get lost → main agent rediscovers | Section 3 is mandatory |
| "Use any tools you need" | Accidental writes or destructive commands | Always include Allowed Actions block |
| Delegating the entire conversation context | Expensive, distracting, often wrong | Paste only the surgical slice |
| Treating a missing TASK_COMPLETE as success | Silent partial results slip through | Always scan for the Done Signal |
| "You are a Python expert" persona | underlying LLM model already has that knowledge; label adds nothing | Drop the persona; use a role that changes *context*, not just claimed expertise |
| Sequential pipeline where step B needs step A's discoveries | Information degrades at every handoff; bugs compound | Keep sequential dependent work in the main thread |
| Test-runner subagent | Returns "tests failed" — hides the output needed to diagnose | Run tests directly in main thread; delegate only post-analysis summaries (except blind test loops in Clean-Room TDD) |
| Biased TDD Implementation | Writing tests and implementing them in the same context, leading to tests being "cheated" with hardcoded values. | Delegate implementation to a separate subagent or new session, explicitly forbidding it from reading test file contents (Clean-Room TDD). |

---

## Quick Reference Card

```
DECISION GATE: does the intermediate work matter?
  YES → keep in main thread
  NO  → delegate

GOOD DELEGATE TARGETS:
  research/exploration · code review (fresh context) · custom system prompt tasks · Clean-Room TDD implementation (blind to tests)

BAD DELEGATE TARGETS:
  expert persona labels · sequential dependent pipelines · test runners (except blind test loops in Clean-Room TDD)

DELEGATION PROMPT = Role + Task + Context (surgical) + Allowed Actions (excluding tests for Clean-Room TDD) + Output Template + Stop Conditions

OUTPUT TEMPLATE =
  1. Objective Recap
  2. Findings (domain template)
  3. Obstacles Encountered
  4. Confidence & Caveats
  5. Done Signal: TASK_COMPLETE

RECEIVE =
  scan TASK_COMPLETE → surface Obstacles → check Confidence → reject if out-of-scope/read-forbidden-tests
```
