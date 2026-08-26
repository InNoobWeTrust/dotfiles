# Tool-Call Integrity

**Applies to:** Every tool call with side effects (file writes, moves, API calls, shell commands, MCP tools).

**Prevents:** The gap between intended outcome and actual outcome.

---

## The Core Failure

Tools resolve paths and scopes differently than you assume. A tool may succeed by its own contract while failing your intent. **Verify outcomes, not intentions.**

---

## Verify-After-Call Protocol

For every side-effect tool call:

### 1. State Intended Outcome (before call)
- Action: what the tool should do
- Target: absolute path or exact scope
- Expected result: what should exist/change/disappear

### 2. Execute the Call

### 3. Verify Actual Outcome (after call)
- [ ] Target exists (ls/read actual path)
- [ ] Content matches (spot-check)
- [ ] No unintended side effects (check for duplicates, wrong locations)
- [ ] No stale artifacts (verify old location is gone for moves)

If any check fails, **stop and fix** before proceeding.

---

## Path Resolution

Tools resolve paths differently than you assume. Some resolve `relative_path` against the project root, others against the working directory, others accept only absolute paths. **Never assume — verify.**

- If tool docs are unclear on path resolution, use absolute paths
- If a parameter is named `relative_path` or `path`, test with a trivial case first to learn the actual resolution behavior
- After any write/move/delete, verify the file landed at the intended path with `ls` or `read`

---

## When This Applies

| Situation | Verify? |
|---|---|
| Write/move/rename/delete file | Yes |
| Edit existing file | Yes |
| API call with side effects | Yes |
| Shell command with output | Yes |
| Read-only operations (ls, grep, read) | No |

---

## Forbidden Patterns

- Declaring success without verifying actual path
- Assuming relative paths resolved as intended
- Declaring moves complete without confirming source is gone
- Trusting tool success response as proof of correct outcome
- Using relative paths when tool resolution behavior is ambiguous

---

## On Discrepancy

1. Stop — do not proceed with dependent work
2. Report: intended path, actual path, what went wrong
3. Fix the issue
4. Re-verify after fix

A file at the wrong path is not "close enough." Fix before continuing.

---

## Relationship to Other Rules

- **Self-Grounded Verification** — verifies logic correctness; this verifies tool-call correctness
- **Execution Safety** — governs how scripts run; this verifies what they produced
- **Git Safety** — explicit approvals for git; this covers non-git side effects
