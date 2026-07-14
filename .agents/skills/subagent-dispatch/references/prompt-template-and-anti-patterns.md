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
