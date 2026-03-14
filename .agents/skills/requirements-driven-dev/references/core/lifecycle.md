---
trigger: always_on
---

# Requirements-Driven Development — Core Lifecycle

> **Immutable Law**: No deliverable without a behavior spec. No spec without requirements. No commit without a changelog.

This document defines the core development lifecycle. It is always active
and governs how every task flows from product idea to committed deliverable.

---

## 1. ROLES

| Role | Actor | Responsibility |
|------|-------|----------------|
| **Product Owner** | Human | Define product requirements (PRD), validate outcomes, approve merges |
| **Technical Architect** | Human + AI | Define technical requirements (TRD), architecture decisions |
| **Spec Author** | Human + AI | Write BDD behavior specs from TRDs |
| **Executor** | AI Agent | Produce deliverables, implement changes |
| **Verifier** | AI Agent | Design & run verifications based on behavior specs |
| **Proofreader** | AI Agent | Adversarial challenger — debates choices from first principles |
| **Reviewer** | AI Agent + Human | Review quality, adherence to spec |

---

## 2. THE LIFECYCLE

```
┌───────────────────────────────────────────────────────────────┐
│                REQUIREMENTS CASCADE (Phase 0)                 │
│                                                               │
│  ┌─────────┐    ┌─────────┐    ┌─────────────┐                │
│  │   PRD   │───▶│   TRD   │───▶│  BDD Specs  │                │
│  │ (1..N)  │    │ (1..N)  │    │   (1..N)    │                │
│  └─────────┘    └─────────┘    └──────┬──────┘                │
│   what/why       how/arch       verifiable                    │
│                                 behaviors                     │
└────────────────────────────────────────┼──────────────────────┘
                                         ▼
┌──────────────┐
│  1. BACKLOG  │  BDD spec ready in {SPEC_DIR}<feature-slug>.md
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
│ 4. PROOFREAD   │  Adversarial challenge — debate choices from first principles
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

### Shortcut for Small Changes

For small features or quick tasks, the requirements cascade is optional.
You can start directly at step 1 (Backlog) by writing a BDD spec without
a PRD or TRD. The cascade adds the most value for complex features where
multiple concerns need to be split, tracked, and coordinated.

---

## 3. REQUIREMENTS CASCADE — Phase 0

The cascade flows from high-level product intent down to verifiable behaviors.
Each level adds specificity and narrows scope.

### Step 0.1: PRD (Product Requirements)

The PRD captures **what** to build and **why**:

- **Location**: `{PRD_DIR}<product-slug>.md`
- **Owner**: Human (Product Owner) — AI may draft, human must approve
- **Template**: See `templates/prd.md`
- **Rules**: See `rules/prd.md`
- **Output**: A clear product intent with measurable goals, user stories, and scope

### Step 0.2: TRD (Technical Requirements)

From the PRD, derive **how** to build it architecturally:

- **Location**: `{TRD_DIR}<component-slug>.md`
- **Owner**: Human + AI — AI proposes architecture, human approves decisions
- **Template**: See `templates/trd.md`
- **Rules**: See `rules/trd.md`
- **Input**: Parent PRD
- **Output**: Architecture decisions, components, interfaces, non-functional requirements

### Step 0.3: BDD Decomposition

From the TRD, split concerns into individual **BDD behavior specs**:

- **Location**: `{SPEC_DIR}<feature-slug>.md`
- **Owner**: Human + AI — co-authored, human approves
- **Template**: See `templates/behavior-spec.md`
- **Rules**: See `rules/bdd.md`
- **Input**: Parent TRD
- **Output**: Verifiable Given/When/Then scenarios for each feature

### Traceability

Each document references its parent:
- BDD spec header → parent TRD
- TRD header → parent PRD
- PRD → child TRDs
- TRD → child BDD specs

This enables bidirectional navigation: from product intent down to individual
test cases, or from a failing test up to the business goal it serves.

---

## 4. BEHAVIOR SPEC — The Source of Truth for Execution

Once the cascade produces BDD specs, each spec becomes the source of truth
for its feature. Everything from here follows the existing execution lifecycle.

Every feature starts as a markdown file in the spec directory:

- **Location**: `{SPEC_DIR}<feature-slug>.md`
- **Format**: Gherkin-style Given/When/Then in fenced blocks
- **Owner**: Human (Product Owner) — AI may draft, human must approve
- **Template**: See `templates/behavior-spec.md`

### Required Sections

1. **Feature title & description** — What and why
2. **Parent TRD** (optional) — Traceability link to the technical requirement
3. **User stories** — As a [role], I want [action], so that [benefit]
4. **Scenarios** — Given/When/Then acceptance criteria
5. **Validation rules** — Business constraints, edge cases
6. **Out of scope** — Explicit exclusions to prevent scope creep

---

## 5. EXECUTION PROTOCOL

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

## 6. VERIFICATION PROTOCOL

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

## 6.5. PROOFREAD GATE

> Nothing gets accepted until the writer wins the debate.

After verifications pass but before the validation gate, run all documents and
deliverables through an **adversarial challenge** — a structured debate where the
proofreader attacks every choice from first principles and the writer must defend.

The proofreader thinks 6-12 months ahead for the product owner. It is data-driven,
ignores industry trends and groupthink, and will not accept "best practice" as
justification. It challenges assumptions, demands evidence, stress-tests alternatives,
and probes failure modes.

### When to Challenge

- **Always** for PRDs, TRDs, and BDD specs — requirement documents shape everything downstream
- **Always** for architecture decisions and interface contracts
- **Always** when deliverables are specs, docs, or templates (self-referential quality matters)
- **Optionally** for trivial code changes where first-principles debate adds little

### How It Works

1. **Load the document** — identify its type (PRD, TRD, BDD spec, deliverable)
2. **Decompose from first principles** — strip away solutions, find the core problem
3. **Generate challenges** using 6 attack vectors: assumptions, evidence, alternatives,
   longevity, edge cases, and scope
4. **Debate** — present challenges; writer must defend with reasoning and data
5. **Verdict** — document is ACCEPTED (writer won), REVISE (proofreader won), or
   ESCALATE (impasse, needs Product Owner ruling)

### Debate Rules

- Writer must respond to every challenge with reasoning, not assertions
- "Because X does it" is never acceptable — demand first-principles reasoning
- Data beats opinion — if both sides present data, the better data wins
- Unresolved challenges **block** the document from advancing
- Impasses escalate to the Product Owner for final ruling

### Proofread Verdict Format

```markdown
## Proofread Verdict: <Feature>

**Challenges raised**: <N>
**Writer victories**: <N>
**Proofreader victories**: <N> (must revise)
**Escalated**: <N>

### Overall Verdict

ACCEPTED / REVISE / ESCALATE
```

See `agents/proofreader.md` for the full adversarial challenge protocol.

## 7. VALIDATION GATE

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

## 8. CHANGELOG & COMMIT PROTOCOL

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

## 9. SOCRATIC GATE

> **Immutable**: Never execute when the request is ambiguous.

Before any execution:
1. Is the behavior spec complete? → If not: **ASK**
2. Are there conflicting requirements? → If yes: **CLARIFY**
3. Will this change break existing behavior? → If risk: **WARN**

---

## 10. HANDOFF PROTOCOL

When transitioning between agents or sessions:

1. **Read** the feature's changelog: `{CHANGELOG_DIR}*_<feature-slug>.md` for full history
2. **Read** the relevant `{SPEC_DIR}<feature-slug>.md` spec
3. **Read** the parent TRD and PRD (if they exist) for broader context
4. **Check** current verification results for the feature
5. **Resume** from where the last session left off

This ensures continuity even when context is lost.

---

*This protocol has the highest authority in the agent system.*
