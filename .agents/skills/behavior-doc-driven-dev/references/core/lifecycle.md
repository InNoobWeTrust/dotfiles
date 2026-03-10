---
trigger: always_on
---

# Behavior-Doc-Driven Development — Core Lifecycle

> **Immutable Law**: No deliverable without a behavior spec. No commit without a changelog.

This document defines the core development lifecycle. It is always active
and governs how every task flows from idea to committed deliverable.

---

## 1. ROLES

| Role | Actor | Responsibility |
|------|-------|----------------|
| **Product Owner** | Human | Define behavior, validate outcomes, approve merges |
| **Executor** | AI Agent | Produce deliverables, implement changes |
| **Verifier** | AI Agent | Design & run verifications based on behavior specs |
| **Proofreader** | AI Agent | Specialist domain review using relevant skills |
| **Reviewer** | AI Agent + Human | Review quality, adherence to spec |

---

## 2. THE LIFECYCLE

```
┌──────────────┐
│  1. BACKLOG  │  Human writes behavior spec in {SPEC_DIR}<feature-slug>.md
└──────┬───────┘
       ▼
┌──────────────┐
│  2. EXECUTE  │  AI reads spec → produces deliverables
└──────┬───────┘
       ▼
┌──────────────┐
│  3. VERIFY   │  AI designs verifications from spec's expected behavior
└──────┬───────┘
       ▼
┌────────────────┐
│ 4. PROOFREAD   │  Specialist skills review deliverables for domain quality
└──────┬─────────┘
       ▼
┌──────────────────┐
│  5. VALIDATE     │  Run verifications → check against acceptance criteria
└──────┬───────────┘
       │
       ├── PASS ──► 6. CHANGELOG → 7. COMMIT
       │
       └── FAIL ──► Human feedback → AI adjusts → back to step 2, 3, or 4
```

---

## 3. BEHAVIOR SPEC — The Source of Truth

Every feature starts as a markdown file in the spec directory:

- **Location**: `{SPEC_DIR}<feature-slug>.md`
- **Format**: Gherkin-style Given/When/Then in fenced blocks
- **Owner**: Human (Product Owner) — AI may draft, human must approve
- **Template**: See `templates/behavior-spec.md`

### Required Sections

1. **Feature title & description** — What and why
2. **User stories** — As a [role], I want [action], so that [benefit]
3. **Scenarios** — Given/When/Then acceptance criteria
4. **Validation rules** — Business constraints, edge cases
5. **Out of scope** — Explicit exclusions to prevent scope creep

---

## 4. EXECUTION PROTOCOL

When AI receives a task:

### Step A: Read the Spec
- Load `{SPEC_DIR}<feature-slug>.md`
- If spec is missing or incomplete → **STOP** and ask human to complete it
- Never infer behavior that isn't written in the spec

### Step B: Plan (No Deliverables Yet)
- Identify affected artifacts and areas
- List changes needed with rationale
- Present plan to human for approval
- If impact is large (>5 artifacts), create plan summary in changelog

### Step C: Execute
- Produce **only** what the spec defines
- Follow execution rules in `rules/execution.md`
- Use defensive practices (error handling, validation, fallbacks)
- Single responsibility per artifact — no monoliths

### Step D: Self-Check
- Re-read spec after execution
- Verify each scenario is addressed
- Flag any gaps to human

---

## 5. VERIFICATION PROTOCOL

AI designs verifications based on the behavior spec, not the deliverables:

### Verification Sources
- **Scenarios** in `{SPEC_DIR}<feature-slug>.md` → verification cases
- **Validation rules** → edge case verifications
- **Error paths** → negative verifications

### Verification Output
- Verifications placed following project conventions
- Each verification references the BDD spec it covers
- Coverage: every Given/When/Then scenario = at least 1 verification

### Verification Spec (Optional)
- For complex features, human may write `{SPEC_DIR}<feature-slug>-verification.md`
- This defines verification flows, setup, and boundaries
- Template: See `templates/verification-spec.md`

---

## 5.5. PROOFREAD GATE

> Use specialist knowledge to catch what generic verification misses.

After verifications pass but before the validation gate, run deliverables through
a **proofread pass** using relevant specialist agents or domain skills. The idea
is simple: an agent with deep domain expertise will catch issues that a generic
reviewer cannot — the same way a native speaker catches awkward phrasing that
a grammar checker misses.

### When to Proofread

- **Always** when the project has specialist skills available (e.g., a design skill
  for UI work, a security skill for auth features, an i18n skill for localized content)
- **Always** when deliverables are specs, docs, or templates (self-referential quality matters)
- **Optionally** for routine changes where domain expertise adds little value

### How It Works

1. **Identify relevant skills** — which specialist agents or domain skills apply
   to this deliverable? (e.g., `frontend-design` skill for UI components,
   `i18n-localization` for translated strings, `skill-creator` for agent skills)
2. **Load the specialist** — read the relevant skill's instructions and quality criteria
3. **Review against domain standards** — the specialist checks the deliverable using
   its domain-specific quality criteria, not just generic correctness
4. **Produce a proofread report** — list findings by severity (critical / warning / suggestion)
5. **Apply fixes** — address findings, then re-verify if any changes were made

### Why This Works

Generic verification checks "does it match the spec?" — but specs can't capture
every domain convention. A UX skill knows that touch targets should be 44×44px.
A localization skill knows that Japanese strings need different max-widths.
A security skill knows that JWT tokens need rotation. These aren't in the spec
because they're implicit domain knowledge.

The proofread gate makes implicit knowledge explicit by bringing in the right
specialist at the right time.

### Proofread Report Format

```markdown
## Proofread: <Feature>

**Specialist**: <skill or agent used>
**Deliverables reviewed**: <list of artifacts>

### Findings

1. [🔴 critical] <issue> — <location>
2. [🟡 warning] <issue> — <location>
3. [🔵 suggestion] <issue> — <location>

### Summary

<overall assessment: clean / needs fixes / blocking issues>
```

See `agents/proofreader.md` for the specialist review protocol.

## 6. VALIDATION GATE

Before any deliverable is considered "done":

| Check | Method | Owner |
|-------|--------|-------|
| All scenarios pass | Verifications | AI |
| Deliverables match spec | Manual review | Human |
| No regressions | Full verification suite | AI |
| Changelog recorded | File exists in `{CHANGELOG_DIR}` | AI |

### Fail → Feedback Loop

If validation fails:
1. Human provides specific feedback (what's wrong, expected vs actual)
2. AI adjusts deliverables or verifications accordingly
3. Re-validate
4. Repeat until all checks pass

---

## 7. CHANGELOG & COMMIT PROTOCOL

### Changelog File (Artifact Change Tracker)

Each feature has **one changelog file** that tracks which artifacts are in scope:

- **Location**: `{CHANGELOG_DIR}<yyyymmdd>_<feature-slug>.md`
- **One file per feature** — maps 1:1 to `{SPEC_DIR}<feature-slug>.md`, date prefix = when work started
- **Append-only** — each modification adds a new `## Session: <YYYY-MM-DDTHH:MM>` entry (timestamp for audit trail)
- **Create on first modification** — when starting a feature, generate the file
- **Update after each artifact change** — immediately record what was added/modified/removed
- **Template**: See `templates/changelog-entry.md`
- **Rules**: See `rules/changelog.md`

### Git Commit

- Commit message references the changelog file
- Format: `<type>(<scope>): <summary> [changelog: <filename>]`
- Example: `feat(auth): add JWT refresh flow [changelog: 20260303_jwt-refresh.md]`
- Rules: See `rules/commit.md`

---

## 8. SOCRATIC GATE

> **Immutable**: Never execute when the request is ambiguous.

Before any execution:
1. Is the behavior spec complete? → If not: **ASK**
2. Are there conflicting requirements? → If yes: **CLARIFY**
3. Will this change break existing behavior? → If risk: **WARN**

---

## 9. HANDOFF PROTOCOL

When transitioning between agents or sessions:

1. **Read** the feature's changelog: `{CHANGELOG_DIR}*_<feature-slug>.md` for full history
2. **Read** the relevant `{SPEC_DIR}<feature-slug>.md` spec
3. **Check** current verification results for the feature
4. **Resume** from where the last session left off

This ensures continuity even when context is lost.

---

*This protocol has the highest authority in the agent system.*
