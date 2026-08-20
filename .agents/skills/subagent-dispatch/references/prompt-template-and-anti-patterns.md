## Delegation Prompt Template

Copy this template and fill in the `[BRACKETS]` before launching a delegated worker/agent.

```
You are acting as a [ROLE, e.g. "code reviewer", "research analyst", "debugging agent"].

## Task
[ONE CLEAR SENTENCE describing the deliverable]

## Context
[Paste only the relevant context — file paths, excerpts, error messages, URLs.
Do not paste the whole codebase. Be surgical.]

## Delivery Contract (only when `../../rules/phased-delivery.md` applies)
[Populate the canonical inline template from `../../rules/phased-delivery.md`.
Do not duplicate or alter its classifications, budgets, compromise schema, or
trajectory protocol here.]

## Delegation-specific execution behavior
- Scope expansion: [STOP and report; do not absorb without approval]
- Adjacent work: [report with a Delivery Contract classification; do not implement]
- Continuation / resumption state: [completed work, current location, remaining steps, evidence, blockers, and next safe action if incomplete]

If incomplete, distinguish a true Never Defer blocker from Must Ship work
remaining, May Defer items, and Out of Scope items. Follow
`../../rules/phased-delivery.md` for all contract semantics. Omit both sections
when that rule's trigger does not apply.

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
[INSERT domain-specific findings template here. For phased work, classify every
finding as Never Defer blocker, Must Ship defect, May Defer, or Out of Scope.]

### 3. Obstacles Encountered
List any: setup issues · workarounds used · commands that needed special flags
· dependencies or imports that caused problems · environment quirks.
Write NONE if the task was clean.

### 4. Confidence & Caveats
Rate your confidence (High / Medium / Low) and list any assumptions made.

### 5. Done Signal
Write exactly one: `TASK_COMPLETE` if the assigned work is complete, or `INCOMPLETE` if it is not. If `INCOMPLETE`, include the continuation / resumption state above and identify whether the cause is a true blocker, remaining Must Ship work, or only deferred/out-of-scope work.
```

### Investment research variant

When delegating research for skill `investment-assessment`:

```
You are acting as an investment research analyst (read-only).

## Task
Collect [facts for ASSET/PRODUCT or macro series] from [sources]. Decision type: [single name | sleeve | portfolio].

## Context
Investor rails: [max pain / horizon / job of money if known]. Separate Observed vs Inferred. No buy call unless asked.

## Delivery Contract (only when `../../rules/phased-delivery.md` applies)
Include the canonical Delivery Contract and the delegation-only scope-expansion, adjacent-work, and continuation/resumption fields from the standard template above. Otherwise omit these sections.

## Allowed Actions
- READ: [paths/URLs]
- RUN: data fetch / pdf extract / OCR if needed
- WRITE: NONE
- NO informal illegal workarounds; NO fabricated prices

## Output Format
### Observed (with source)
### Inferences (labeled)
### Regime-relevant signals (if any)
### Blockers / missing data
### Confidence
### Done Signal
Write exactly one: `TASK_COMPLETE`, or `INCOMPLETE` with the continuation / resumption state from the applicable Delivery Contract.
```

## Stop Conditions
Stop immediately and report partial findings with `INCOMPLETE` and continuation/resumption state if:
- You cannot access a required file or resource.
- The task scope is larger than described here.
- You encounter an action not listed in Allowed Actions.
- You are approaching the context limit and have not yet filled all five output sections — report what you have so far.

---

## Preflight Checklist

Run through this before every delegated worker launch:

- [ ] **Scope**: Does the prompt name the exact files, URLs, or data — not a vague domain?
- [ ] **Delivery Contract**: When the phased-delivery trigger applies, does every implementation, exploration, or review prompt include the canonical populated contract plus scope-expansion, adjacent-work, and continuation/resumption instructions?
- [ ] **Output template**: Is the five-section format included verbatim?
- [ ] **Domain template**: Is the correct Findings sub-template slotted into section 2?
- [ ] **Obstacles section**: Is section 3 present and non-optional?
- [ ] **Allowed Actions**: Is the block present and does it match what the task actually requires?
- [ ] **Stop Conditions**: Is there at least one condition that triggers early termination?
- [ ] **Context is surgical**: Did you include only what the delegated worker needs — not the entire conversation?

---

## Receiving Results

When the delegated worker returns:

1. **Scan for `TASK_COMPLETE` or `INCOMPLETE`** in section 5. `INCOMPLETE` is an explicit partial result, not an automatic retry: continue only if the evidence is insufficient for the next decision.
2. **Read section 3 (Obstacles Encountered)**. Surface any workarounds or quirks to the main context so they are not rediscovered.
3. **Read section 4 (Confidence & Caveats)**. Low-confidence findings must be verified before acting on them.
4. **Reject and re-delegate** if:
    - The delegated worker broadened scope beyond what was described. _Detect this by checking whether findings reference files, URLs, or data sources not listed in the delegation prompt's context or Allowed Actions block._
    - The delegated worker performed a forbidden action (e.g., wrote a file it was not allowed to touch).
    - The output format is missing or materially incomplete for the decision required.

---

## Anti-Patterns to Avoid

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| "Investigate the auth module" | No scope → delegated worker wanders | Name the exact files and question |
| No output format in prompt | Delegated worker invents its own → unreadable | Always include the five-section template |
| Omitting Obstacles section | Workarounds get lost → main agent rediscovers | Section 3 is mandatory |
| "Use any tools you need" | Accidental writes or destructive commands | Always include Allowed Actions block |
| Delegating the entire conversation context | Expensive, distracting, often wrong | Paste only the surgical slice |
| Treating a missing TASK_COMPLETE as success | Silent partial results slip through | Always scan for the Done Signal |
| Forcing a retry just to obtain `TASK_COMPLETE` | Wastes work when partial evidence already supports the decision | Accept `INCOMPLETE` with a continuation state; retry only for decision-blocking evidence |
| Delegating phased work without a bounded contract | Worker optimizes for a future state or expands scope | When the phased-delivery trigger applies, include the canonical Delivery Contract and delegation-only behavior |
| "You are a Python expert" persona | underlying LLM model already has that knowledge; label adds nothing | Drop the persona; use a role that changes *context*, not just claimed expertise |
| Sequential pipeline where step B needs step A's discoveries | Information degrades at every handoff; bugs compound | Keep sequential dependent work in the main thread |
| Test-runner delegated worker | Returns "tests failed" — hides the output needed to diagnose | Run tests directly in main thread; delegate only post-analysis summaries (except blind test loops in Clean-Room TDD) |
| Biased TDD Implementation | Writing tests and implementing them in the same context, leading to tests being "cheated" with hardcoded values. | Delegate implementation to a separate worker or new session, explicitly forbidding it from reading test file contents (Clean-Room TDD). |

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

DELEGATION PROMPT = Role + Task + Context (surgical) + [canonical Delivery Contract when its trigger applies] + delegation-only action boundaries + Output Template + Stop Conditions

OUTPUT TEMPLATE =
  1. Objective Recap
  2. Findings (domain template)
  3. Obstacles Encountered
  4. Confidence & Caveats
  5. Done Signal: TASK_COMPLETE or INCOMPLETE + continuation state

RECEIVE =
  scan TASK_COMPLETE/INCOMPLETE → surface Obstacles → check continuation and Confidence → retry only if decision-blocking or contract-broken
```
