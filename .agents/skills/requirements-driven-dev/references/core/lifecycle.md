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
| **Challenger** | AI Agent | Adversarial reviewer — challenges choices from first principles at every phase gate |
| **Reviewer** | AI Agent + Human | Review quality, adherence to spec |

---

## 2. FLOW SELECTION

Before starting, assess the scope to determine which flow to follow.

### Full Flow

Use for: new features, large refactors, multi-component changes, anything
with unclear requirements or significant risk.

```
Research (optional) → PRD → TRD → BDD Specs → Execute → Verify → Validate → Commit
```

Adversarial challenges at every phase transition (see Section 3).

### Quick Flow

Use for: bug fixes, small features, well-understood changes, config tweaks.

```
BDD Spec (or inline task description) → Execute → Verify → Validate → Commit
```

Skip the requirements cascade. Start directly at the BDD spec or even
a clear task description if the scope is trivially small.

**Exception**: If the change touches security, authentication, authorization,
or data handling, apply the ⚔ Challenge Gate regardless of flow size.

### How to Decide

| Signal | Flow |
|--------|------|
| Requirements are unclear or debatable | Full |
| Multiple components or teams affected | Full |
| Architecture decisions needed | Full |
| New product or major initiative | Full (with Research phase) |
| Bug fix with clear reproduction steps | Quick |
| Small feature with obvious scope | Quick |
| Config/dependency change | Quick |
| User explicitly says "just do it" | Quick |

When in doubt, start Quick and escalate to Full if complexity emerges.

---

## 3. THE LIFECYCLE

```
Research (opt) → ⚔ → PRD → ⚔ → TRD → ⚔ → BDD Specs → ⚔ → Backlog
  → Load project-context → Execute → Verify → ⚔ Challenge → Validate
  → PASS → Changelog → Commit
  → FAIL → Feedback → back to Execute/Verify/Challenge
```

**⚔ = Adversarial Challenge Gate** — apply the adversarial-reviewer protocol
(see `references/core/adversarial-protocol.md` for the full protocol).

---

## R. RESEARCH PHASE (Optional)

Before writing requirements, investigate what you don't know. This phase
prevents building the wrong thing.

### When to Research

- New product domain you haven't worked in before
- Entering a competitive market — need to understand what exists
- Technical feasibility is uncertain
- Stakeholder assumptions haven't been validated

### Research Areas

| Area | Questions |
|------|-----------|
| **Domain** | What problem are we actually solving? Who has this problem? How do they solve it today? |
| **Market** | What alternatives exist? What works? What doesn't? What gaps remain? |
| **Technical** | Is this feasible with current tech? What are the constraints? What's been tried before? |
| **User** | Who are the real users? What do they actually need (vs what we think they need)? |

### Output

Produce a **research brief** saved to `{PRD_DIR}research/<topic-slug>.md`.
This feeds into the PRD as evidence for the problem statement and solution direction.

### ⚔ Challenge Gate: Research

Apply the adversarial protocol to the research brief before using it as
input for the PRD:

- **Assumptions**: What did the research assume that could be wrong?
- **Evidence**: Is the data representative? Could it be cherry-picked?
- **Alternatives**: Did the research explore enough alternatives?
- **Scope**: Is the problem statement too broad or too narrow?

---

## 0. REQUIREMENTS CASCADE

The cascade flows from high-level product intent down to verifiable behaviors.
Each level adds specificity and narrows scope.

### Context Chaining Rule

> **Each phase must load and reference the output of the previous phase.**
> This is not optional — it prevents drift between levels.

- Before writing a TRD → **read the approved PRD first**
- Before writing BDD specs → **read the approved TRD first**
- Before implementing → **read the approved BDD spec and project-context**
- Before verifying → **read the spec and the deliverable together**

If a previous phase's output doesn't exist, **stop and produce it first**
(or use Quick Flow if the work is simple enough to skip the cascade).

### Step 0.1: PRD (Product Requirements)

The PRD captures **what** to build and **why**:

- **Location**: `{PRD_DIR}<product-slug>.md`
- **Owner**: Human (Product Owner) — AI may draft, human must approve
- **Template**: See `templates/prd.md`
- **Rules**: See `rules/prd.md`
- **Input**: Research brief (if Phase R was done), or domain knowledge
- **Output**: A clear product intent with measurable goals, user stories, and scope

#### ⚔ Challenge Gate: PRD

Before advancing to TRD, the PRD must survive adversarial challenge:
- Is the problem validated with real data, not assumptions?
- Are success metrics measurable and time-bound?
- Are personas based on research or fiction?
- Are non-goals explicitly stated?

### Step 0.2: TRD (Technical Requirements)

From the PRD, derive **how** to build it architecturally:

- **Location**: `{TRD_DIR}<component-slug>.md`
- **Owner**: Human + AI — AI proposes architecture, human approves decisions
- **Template**: See `templates/trd.md`
- **Rules**: See `rules/trd.md`
- **Input**: **Load the approved PRD.** The TRD must reference every PRD requirement.
- **Output**: Architecture decisions, components, interfaces, non-functional requirements

#### ⚔ Challenge Gate: TRD

Before advancing to BDD specs, the TRD must survive adversarial challenge.
The challenge MUST include a `security-reviewer` pass on the Security Assessment section.

- Were alternative architectures genuinely evaluated?
- Do interface contracts survive requirement changes?
- Are non-functional requirements quantified (not "fast" but "p99 < 200ms")?
- Does the component breakdown map cleanly to BDD specs?
- Is the Security Assessment complete (auth, data protection, input validation, infra, supply chain, failure modes)?
- Are there unaddressed attack surfaces?

### Step 0.3: BDD Decomposition

From the TRD, split concerns into individual **BDD behavior specs**:

- **Location**: `{SPEC_DIR}<feature-slug>.md`
- **Owner**: Human + AI — co-authored, human approves
- **Template**: See `templates/behavior-spec.md`
- **Rules**: See `rules/bdd.md`
- **Input**: **Load the approved TRD.** Every spec must trace to a TRD component.
- **Output**: Verifiable Given/When/Then scenarios for each feature

#### ⚔ Challenge Gate: BDD Specs

Before entering the backlog, BDD specs must survive adversarial challenge:
- Does every user story have at least one Given/When/Then scenario?
- Are edge cases covered in validation rules?
- Do out-of-scope exclusions close all loopholes?
- Does the spec reference its parent TRD?
- **Scope drift check (early)**: Re-read the PRD's Problem Statement. Does
  the sum of all BDD specs directly solve that root problem? Or have the
  specs drifted toward adjacent concerns that feel productive but don't
  address the core _why_?

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
for its feature. Everything from here follows the execution lifecycle.

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

## 4.5. PROJECT CONTEXT

Recommended for any project that will have multiple implementation sessions.

The `project-context.md` file acts as a **living constitution** — it captures
technology stack, conventions, and rules that all implementation workflows
should follow for consistency.

### When to Create

- **New projects**: Create after the TRD/architecture phase to capture decisions
- **Existing projects**: Generate from the codebase to capture established patterns
- **Anytime**: When you notice agents making inconsistent decisions across stories

### Location

`docs/project-context.md` (or project convention)

### What Goes In It

- **Technology stack & versions** — Languages, frameworks, databases, infrastructure
- **Code conventions** — Naming, structure, patterns, anti-patterns
- **Critical implementation rules** — e.g., "all errors must be typed",
  "no ORM, raw SQL only", "tests co-located with source"
- **Architecture decisions** — Key choices and their rationale

### Lifecycle

This is a **living document**. Update it when:
- Architecture decisions change
- New conventions are established
- Patterns evolve during implementation
- Agents make decisions that conflict with project norms

---

## 5. EXECUTION PROTOCOL

When AI receives a task:

### Step A: Load Context

- Load `{SPEC_DIR}<feature-slug>.md` — the BDD spec
- Load `project-context.md` if it exists — technology stack, conventions, rules
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
- Follow patterns and conventions from `project-context.md`
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

## 6.5. ⚔ CHALLENGE GATE — Deliverables

> Nothing gets accepted unchallenged.

After verifications pass but before the validation gate, run deliverables
through an adversarial challenge using the protocol in
`references/core/adversarial-protocol.md`.

### When to Challenge

- **Always** for PRDs, TRDs, and BDD specs — requirement documents shape everything downstream
- **Always** for architecture decisions and interface contracts
- **Always** when deliverables are specs, docs, or templates (self-referential quality matters)
- **Optionally** for trivial code changes where first-principles debate adds little

### How It Works

1. **Load the artifact** — identify its type (PRD, TRD, BDD spec, deliverable)
2. **Decompose from first principles** — strip away solutions, find the core problem
3. **Generate challenges** using attack vectors: assumptions, evidence, alternatives,
   longevity, edge cases, UX, and scope
4. **Debate** — present challenges; writer must defend with reasoning and evidence
5. **Verdict** — artifact is ACCEPTED (writer won), REVISE (challenger won), or
   ESCALATE (impasse, needs Product Owner ruling)

### Verdict Format

```markdown
## Challenge Verdict: <Artifact>

**Challenges raised**: <N>
**Author victories**: <N>
**Challenger victories**: <N> (must revise)
**Escalated/Dissented**: <N>

### Overall Verdict

ACCEPTED / REVISE / ESCALATE
```

See `references/core/adversarial-protocol.md` for the full adversarial
challenge protocol, including attack vectors, debate rules, and the
dissenting progress mechanism for impasses.

---

## 7. VALIDATION GATE

Before any deliverable is considered "done":

| Check | Method | Owner |
|-------|--------|-------|
| All scenarios pass | Verifications | AI |
| Deliverables match spec | Manual review | Human |
| No regressions | Full verification suite | AI |
| Changelog recorded | File exists in `{CHANGELOG_DIR}` | AI |
| **Goal alignment** | PRD problem statement check | Human + AI |
| **Traceability matrix complete** | Gap check | AI |

### Scope Drift Check (Final Confirmation)

Before shipping, re-read the PRD's Problem Statement and ask:
- Does the delivered work directly solve the root problem stated there?
- Has the ratio of infrastructure to user-facing value become lopsided?
- Could the user get value from what exists right now without further work?
- Would deploying now and iterating be faster than continuing to polish?

If the answer to any of these suggests drift, raise it. Shipping imperfect
work that solves the root problem beats shipping perfect infrastructure
that hasn't been validated in the real world.

### Fail → Feedback Loop

If validation fails:
1. Human provides specific feedback (what's wrong, expected vs actual)
2. AI adjusts deliverables or verifications accordingly
3. Re-validate
4. Repeat until all checks pass

---

## 7.5 TRACEABILITY & GAP DETECTION

> **Law**: No commit with uncovered scenarios. Every scenario must be implemented and tested.

### The Traceability Matrix

Every BDD spec contains a **Traceability Matrix** section (see `templates/behavior-spec.md`).
This matrix tracks coverage from scenario → implementation → verification.

| # | Scenario | Impl Status | Impl Artifact | Test Status | Test Artifact |
|---|----------|-------------|---------------|-------------|---------------|
| 1 | Valid login | ✓ | `src/auth/login.ts` | ✓ | `tests/auth/login.test.ts` |
| 2 | Wrong password | ✓ | `src/auth/login.ts` | ⬚ | — |
| 3 | Account locked | ⬚ | — | ⬚ | — |

**Status legend**: ⬚ pending · ◐ partial · ✓ complete · ⊘ N/A (out of scope)

### Gap Detection

Run gap detection **before commit** and **during review** using the automated script:

```bash
# Check a single spec
.agents/scripts/gap-check.sh docs/specs/my-feature.md

# Check all specs in a directory
.agents/scripts/gap-check.sh docs/specs/

# Check default SPEC_DIR
.agents/scripts/gap-check.sh
```

The script parses Traceability Matrices and reports:
- `CLEAR` — all scenarios complete, ready to commit
- `GAPS` — lists missing implementations or tests
- `SKIP` — no matrix found (spec may be draft or exempt)

**Exit codes**: 0 = no gaps, 1 = gaps found (blocks commit)

### Agent Responsibilities

| Agent | Traceability Duty |
|-------|-------------------|
| **Executor** | After implementing a scenario, update matrix: `Impl Status` → `✓`, fill `Impl Artifact` |
| **Verifier** | After writing tests, update matrix: `Test Status` → `✓`, fill `Test Artifact` |
| **Reviewer** | Run `gap-check.sh`, block if exit code is 1 |

### Handling Intentional Gaps

Some scenarios may be intentionally deferred:
- Mark as `⊘ N/A` with a note explaining why (e.g., "deferred to v2")
- Add to "Out of Scope" section for consistency
- Human must approve any `⊘` status

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
4. **Read** `project-context.md` for technology stack and conventions
5. **Check** current verification results for the feature
6. **Resume** from where the last session left off

This ensures continuity even when context is lost.

---

_This protocol has the highest authority in the agent system._
