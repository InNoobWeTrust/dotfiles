---
description: >
  Auto-select and run the right combination of reviewers based on what's being
  reviewed. Use this command whenever you need a review and aren't sure which
  reviewer(s) to use, or when you want comprehensive multi-lens coverage. Also
  activate when the user says "review this", "full review", "check this",
  "quality check", "review and fix", or "fix everything". Routes to
  adversarial-reviewer, edge-case-hunter, editorial-reviewer, and/or
  security-reviewer based on artifact type. In fix mode, autonomously applies
  fixes and re-reviews until clean.
---

# Review Orchestrator

Automatically select and run the right reviewers for the artifact under review.

## How It Works

1. **Identify artifact type** — What is being reviewed?
2. **Select reviewers** — Match artifact to reviewer combination (see routing table)
3. **Run reviewers** — Execute in recommended order
4. **Aggregate findings** — Present combined results

## Routing Table

| Artifact Type | Reviewers | Order |
|---|---|---|
| **Code / diffs** | `adversarial-reviewer` → `edge-case-hunter` → `security-reviewer` | Logic first, then paths, then security |
| **Specs / PRDs / TRDs** | `adversarial-reviewer` → `editorial-reviewer` (structure) | Challenge reasoning, then polish |
| **Architecture / design docs** | `adversarial-reviewer` → `security-reviewer` | Challenge decisions, then threat model |
| **Documentation / prose** | `editorial-reviewer` (structure → prose) | Structure first, then clarity |
| **Config / infra** | `security-reviewer` → `edge-case-hunter` | Security first, then boundary conditions |
| **BDD specs / test plans** | `adversarial-reviewer` → `edge-case-hunter` | Coverage gaps, then path tracing |
| **API contracts** | `adversarial-reviewer` → `security-reviewer` → `edge-case-hunter` | Design, then security, then boundaries |
| **Skill / command definitions** | `adversarial-reviewer` → `editorial-reviewer` (structure) | Challenge logic, then clarity |

**Mixed artifacts**: If an artifact matches multiple types (e.g., a TRD with code
snippets), take the **union** of reviewers from all matching rows. Run in order
of the primary type's sequence.

## Artifact Type Detection

Detect automatically from:
- **File extension**: `.ts`, `.py`, `.go` → Code; `.md` with PRD/TRD markers → Spec
- **Content markers**: `Feature:` / `Scenario:` → BDD spec; `openapi:` → API contract
- **Directory location**: `docs/specs/` → Spec; `docs/` → Documentation; `infra/` → Config
- **User context**: If user says "review my PRD" → Spec; "check this config" → Config

When ambiguous, ask the user or default to **Standard mode with the union of
all unique reviewers from potentially matching rows**.

## User Overrides

Users can customize at any point:

- **Add a reviewer**: "Also run security review on this"
- **Remove a reviewer**: "Skip editorial, just adversarial"
- **Change intensity**: "Quick review" → run only the primary reviewer; "deep review" → run all applicable
- **Specify reviewer directly**: "Just edge cases" → skip orchestration, run edge-case-hunter only

## Output Format

Adapt to the reviewers actually run. Use this as a guideline, not a rigid template:

```markdown
## Review Summary: [Artifact]

**Artifact type**: [detected type]
**Reviewers run**: [list]

### [Reviewer 1 Name] — [N findings]
[Reviewer's output in its native format]

### [Reviewer 2 Name] — [N findings]
[Reviewer's output in its native format]

---

### Combined Verdict
- **Total findings**: [N]
- **Blocking**: [N]
- **Warnings**: [N]
- **Informational**: [N]

**Overall**: PROCEED / REVISE / ESCALATE
```

## Quick vs Deep Review

| Mode | What Happens |
|---|---|
| **Quick** | Run only the primary reviewer for the artifact type (first in the routing table) |
| **Standard** | Run the full combination from the routing table (default) |
| **Deep** | Run all 4 reviewers regardless of artifact type |
| **Fix** | Standard review + autonomously fix findings + re-review until clean (see below) |

Default is **Standard**. User can request quick, deep, or fix explicitly.

---

## Fix Mode

Autonomous review-fix-verify loop. Instead of reporting findings for the user
to triage, the agent reviews, fixes, and re-reviews until no actionable issues
remain.

**Triggers**: "review and fix", "fix everything", "clean this up",
"review until clean", or any review request combined with "fix".

### Loop Protocol

```
0. Orient: re-read your planning notes — what's done, what's remaining,
   what was the last change?
1. Run Standard review (or Deep if user specified)
2. Classify each finding:
   - 🔴 Blocking  → must fix
   - 🟡 Warning   → fix unless ambiguous
   - 🟢 Info      → fix if trivial, otherwise note
   - ⚪ Cosmetic  → skip (e.g. table padding lint)
3. Apply all fixable findings, track progress in your planning notes
4. Re-verify: re-run affected checks (sync scripts, linters, tests, etc.)
5. If new issues found during fix → go to step 0
6. Pre-present checklist:
   - Did I re-run ALL verification steps after my last fix?
   - Do my planning notes reflect current state?
   - Any fixes I applied that could have caused new issues?
7. When clean → produce summary and present to user
```

### What Gets Fixed Automatically

| Category | Auto-fix? | Notes |
|---|---|---|
| Syntax / formatting errors | ✅ | Italic style, blank lines, numbering |
| Missing cross-references | ✅ | Related Skills, broken links |
| Script bugs | ✅ | Logic errors, unsafe patterns |
| Synced file drift | ✅ | Re-run the project's sync mechanism |
| Missing permissions | ✅ | `chmod +x` for scripts |
| Content restructuring | ⚠️ | Only if clearly wrong (e.g. duplicate step numbers) |
| Table alignment | ❌ | Cosmetic, skip unless user asks |
| Design decisions | ❌ | Flag for user, never auto-decide |

### Guardrails

- **Max 3 review-fix cycles** — if issues persist after 3 rounds, present
  remaining findings to user for manual triage
- **Never modify files the user excluded** — respect "don't touch X" directives
- **Explain non-obvious fixes** — routine fixes (typos, blank lines) need no
  explanation; structural changes get a one-line rationale
- **Preserve author voice** — fix mechanics, not style preferences

### Output

After the loop completes, present a summary (not the full review):

```markdown
## Fix Mode Summary: [Artifact/Scope]

**Rounds**: [N] review-fix cycles
**Fixed**: [N] findings across [N] files
**Skipped**: [N] cosmetic / [N] deferred to user

### Changes Made
- [file]: [one-line description of fix]
- [file]: [one-line description of fix]

### Remaining (User Decision Needed)
- [finding that requires human judgment]

### Verification
- [verification steps run and their results]
```

---

## Integration

This command is suggested by `requirements-driven-dev` at review gates (step 7).
It can also be invoked directly at any time.

Fix mode is especially useful for:

- Post-refactor cleanup across many files
- Skill/command directory maintenance
- Pre-commit quality gates where you want autonomous cleanup
