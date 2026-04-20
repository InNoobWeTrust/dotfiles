---
name: requirements-driven-dev
description: >
  Requirements-driven development methodology — cascading from product
  requirements (PRD) to technical requirements (TRD) to behavior specs (BDD)
  to execution and delivery. Activate whenever the user wants to plan features,
  write product requirements, define technical architecture, author behavior
  specs, implement, verify, or commit work. Also activate for PRDs, TRDs,
  technical design docs, behavior specs, acceptance criteria, Given/When/Then
  scenarios, user stories, changelogs, structured commits, or when the user
  says "plan a feature", "design a system", "spec this out", "write a PRD",
  "what's the architecture", or "break this into stories" — even without
  explicitly saying "requirements-driven". Activate proactively when you
  detect multi-step feature work that would benefit from structured specs.
---

# Requirements-Driven Development Skill

> **Philosophy**: Humans own requirements. AI owns execution. Verification proves correctness.

A complete, self-contained methodology where:

- **Humans act as Product Owners** — defining requirements at every level, validating outcomes
- **AI acts as Executor & Verifier** — producing deliverables, running verifications
- **Requirements cascade** from high-level product vision down to verifiable behaviors:
  - **PRD** (Product Requirement Document) — _what_ to build and _why_
  - **TRD** (Technical Requirement Document) — _how_ to build it architecturally
  - **BDD spec** (Behavior Specification) — _verifiable behaviors_ that drive execution
- **Changelogs** track which artifacts were added/modified/removed

## Activation Signals

This skill activates on **path signals** (PRD, TRD, spec, or changelog files being read/created/edited),
**intent signals** (planning products, defining architecture, writing scenarios, preparing commits), and
**context signals** (deliverables referencing requirements, commit messages with `[changelog: ...]`).

Skip this skill when the task is a quick fix with no spec (and user declines writing one),
has no definable requirements, or when the user explicitly opts out.

---

## Quick Start

### Where to Start

| User says... | Start here |
| --- | --- |
| "Plan a feature" / "I have an idea" | PRD → read `../../rules/requirements-driven-dev/prd.md` + `references/templates/prd.md` |
| "I have a PRD already" | TRD → read `../../rules/requirements-driven-dev/trd.md` + `references/templates/trd.md` |
| "Write specs" / "behavior specs" | BDD → read `../../rules/requirements-driven-dev/bdd.md` + `references/templates/behavior-spec.md` |
| "Just build this" (clear task) | Quick track → BDD spec or inline task → Execute |
| "Review this spec" / "challenge" | ⚔ Challenge gate → read `references/core/adversarial-protocol.md` |

### Scale-Adaptive Routing

Before starting, assess scope to pick the right track. Agent auto-suggests;
user can override.

| Track        | When                         | What You Do                                                                  |
| ------------ | ---------------------------- | ---------------------------------------------------------------------------- |
| **Quick**    | 1-2 stories, well-understood | Skip to BDD spec → Execute → Verify → Commit                                 |
| **Standard** | 3-8 stories, single epic     | PRD → TRD → BDD → Execute (Full Flow below)                                  |
| **Deep**     | 8+ stories, multi-epic       | Full Flow + architecture/solutioning phase, ADRs, project-context generation |

**Signals for each track**:

- Quick: bug fix, config change, small feature, "I know exactly what to build"
- Standard: new feature, moderate complexity, single team
- Deep: platform-level work, cross-cutting concerns, multiple teams/agents

> Story count is guidance, not a gate. A 2-story database migration may need
> the Deep track while an 8-story UI reskin may only need Standard. Let
> complexity signals override the numbers.

### Full Flow (Standard/Deep tracks)

1. **Research** (optional) → Investigate domain, market, technical feasibility
2. **Define product requirements** → Write a PRD using the template
   - 💡 _Optional_: Run advanced elicitation (see `../../skills/strategic-problem-solving/references/elicitation-methods.md`) to push the PRD deeper
   - 💡 _Optional_: Use multi-stakeholder ideation techniques for diverse perspectives
3. **Define technical requirements** → Derive a TRD from the PRD
    - 💡 _Optional_: Run advanced elicitation on architecture decisions
4. **Define behavior specs** → Split TRD concerns into BDD specs
5. **AI executes** — AI reads BDD spec + project-context, produces deliverables
6. **AI verifies** — AI designs verifications from spec
7. **⚔ Adversarial challenge** — Challenge deliverables from first principles
   - Use the [review orchestrator](../../commands/review.md) to auto-select the right reviewers
8. **Gap check** — Verify all scenarios are implemented and tested
9. **Human validates** — Review, feedback, adjust
   - 💡 _Optional_: Run `editorial-reviewer` to polish docs before sharing
10. **Commit** — Record changelog, structured commit message

Adversarial challenge gates (⚔) run at every phase transition: after Research,
after PRD, after TRD, after BDD specs, and after deliverables.

**Traceability**: Each BDD spec has a Traceability Matrix that tracks which
scenarios are implemented and tested. Agents update this as they work.
Gaps block commit — no scenario left behind.

### Quick Flow (Quick track)

Skip to step 4 (BDD spec or inline task) → Execute → Verify → Commit.
Use for bug fixes, small features, config changes.

**Failure Layer Diagnosis**: If verification fails, determine where the failure
entered before patching:

- **Intent failure** → Requirements were wrong → go back to PRD/TRD
- **Spec failure** → BDD spec was incomplete → fix spec, then re-execute
- **Implementation failure** → Code bug → patch locally

Only truly local problems get patched locally. Don't fix spec-level failures
with code-level patches.

**Traceability in Quick Flow**: If you write a BDD spec, maintain the matrix.
If the task is trivially small (inline description, no formal spec), traceability
is optional — but if gaps emerge later, escalate to Standard/Deep track.

---

## Design Discipline (Before Implementation)

> **Core Principle**: Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the human has approved it.

**Note on Quick track**: Quick track (for trivially small tasks) still applies lightweight design thinking — a few sentences may suffice — but you MUST still present it and get approval. The Design Discipline applies to all tracks. The difference is only formality, not skippage.

Every project goes through this process. "Simple" projects are where unexamined assumptions cause the most wasted work. The design can be short (a few sentences for truly simple projects), but you MUST present it and get approval.

### The Design Process

1. **Explore project context** — check files, docs, recent commits
2. **Ask clarifying questions** — one at a time, understand purpose/constraints/success criteria
3. **Propose 2-3 approaches** — with trade-offs and your recommendation
4. **Present design** — in sections scaled to their complexity, get user approval after each section
5. **Write design doc** — save to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
6. **Spec self-review** — quick inline check for placeholders, contradictions, ambiguity, scope
7. **Human reviews written spec** — ask human to review the spec file before proceeding
8. **Transition to implementation** — invoke writing-plans or proceed to BDD spec

### Key Principles

- **One question at a time** - Don't overwhelm with multiple questions
- **Multiple choice preferred** - Easier to answer than open-ended when possible
- **YAGNI ruthlessly** - Remove unnecessary features from all designs
- **Explore alternatives** - Always propose 2-3 approaches before settling
- **Incremental validation** - Present design, get approval before moving on

### Design Output Location

Design documents: `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`

---

## Execution Discipline

### Test-Driven Development (TDD)

> **Iron Law**: NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.

Write the test first. Watch it fail. Write minimal code to pass. If you didn't watch the test fail, you don't know if it tests the right thing.

**RED-GREEN-REFACTOR cycle:**

1. **RED** — Write one minimal failing test showing desired behavior
2. **Verify RED** — Confirm test fails for expected reason (feature missing, not typo)
3. **GREEN** — Write simplest code to pass the test (no features beyond the test)
4. **Verify GREEN** — Confirm test passes and other tests still pass
5. **REFACTOR** — Clean up duplication, improve names (after green only)

**When Stuck in RED**: If the test fails but you don't know why, simplify the test — assert on something smaller, closer to the metal. Hard-to-test usually means the interface is wrong; listen to the test and redesign the API before proceeding.

**Violating the letter of the rules is violating the spirit of the rules.**

**Common Rationalizations (STOP and start over):**

| Excuse | Reality |
|--------|---------|
| "I'll test after" | Tests passing immediately prove nothing |
| "Deleting X hours is wasteful" | Sunk cost fallacy. Keeping unverified code is technical debt |
| "TDD is dogmatic" | TDD IS pragmatic — finds bugs before commit |
| "This is different because..." | All mean: Delete code. Start over with TDD |

### Verification Before Completion

> **Iron Law**: NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.

Claiming work is complete without verification is dishonesty, not efficiency.

**The Gate Function:**
```
BEFORE claiming any status or expressing satisfaction:
1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim
```

**Red Flags - STOP:**
- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!")
- About to commit/push/PR without verification
- Trusting agent success reports without independent verification

---

## Review Discipline

### Code Review Workflow

**When to request review:**
- After each major task in a multi-step implementation
- Before merge to main/base
- When stuck (fresh perspective helps)

**The Review Process:**

1. **Prepare context** — What was implemented? What was the spec/requirement? Git SHAs (BASE_SHA and HEAD_SHA)
2. **Dispatch reviewer** — Provide precise context: what changed, what it should do, what to evaluate
3. **Act on feedback:**
   - **Critical** — Fix immediately before proceeding
   - **Important** — Fix before proceeding
   - **Minor** — Note for later, track as tech debt
4. **Push back if reviewer is wrong** — with technical reasoning and evidence

**When receiving review:**
- Verify before implementing — don't blindly accept suggestions
- Ask clarifying questions when feedback is unclear
- Push back with technical reasoning if reviewer is wrong
- No performative agreement ("You're absolutely right!")
- If you pushed back and were wrong: state the correction factually, fix it, move on

**For external reviewers:**
- Check: Technically correct for THIS codebase? Breaks existing functionality?
- Check: Reason for current implementation? Works on all platforms/versions?
- If suggestion seems wrong: push back with technical reasoning
- If conflicts with human's architectural decisions: stop and discuss first

---

## Planning Discipline

When you have a spec or requirements for a multi-step task:

### Plan Structure

Each plan must have:
1. **Header** — Goal, Architecture, Tech Stack
2. **Task list** — Bite-sized steps (2-5 minutes each)
3. **Each task shows** — Exact files (create/modify/test), complete code examples, commands with expected output

### Critical Requirements

- **No placeholders** — TBD, TODO, "implement later" are failures
- **Exact file paths always**
- **Complete code in every step**
- **DRY, YAGNI, TDD principles**
- **Frequent commits**

### Self-Review Before Execution

Check:
- [ ] Spec coverage — every requirement addressed
- [ ] Placeholder scan — any TBD/TODO/undefined sections?
- [ ] Type consistency — interfaces match across components?

---

## Skill Structure

```
requirements-driven-dev/
├── SKILL.md                                   # This file — entry point & overview
├── ../../agents/                               # Top-level subagents for Claude/Kilo discovery
│   ├── requirements-prd-writer.md
│   ├── requirements-trd-writer.md
│   ├── requirements-spec-writer.md
│   ├── requirements-executor.md
│   ├── requirements-verifier.md
│   ├── requirements-proofreader.md
│   └── requirements-reviewer.md
├── ../../commands/                             # Top-level reusable commands
│   ├── review.md
│   └── requirements-lifecycle.md
├── ../../rules/requirements-driven-dev/        # Top-level reusable rules
│   ├── prd.md
│   ├── trd.md
│   ├── bdd.md
│   ├── changelog.md
│   ├── execution.md
│   ├── commit.md
└── references/
    ├── core/
    │   └── adversarial-protocol.md             # Synced adversarial challenge protocol
    ├── rules/
    │   ├── project-context.md                  # Per-project context convention
    │   └── config.md                           # Directory/config override reference
    └── templates/
        ├── prd.md                              # Template for PRDs
        ├── trd.md                              # Template for TRDs
        ├── behavior-spec.md                    # Template for BDD behavior specs
        ├── verification-spec.md                # Template for verification plans
        └── changelog-entry.md                  # Template for changelog entries
```

## Knowledge Modules

### Core Protocol

- [requirements-lifecycle](../../commands/requirements-lifecycle.md) — The lifecycle command: Research → Requirements Cascade → Backlog → Execute → Verify → ⚔ Challenge → Validate → Changelog → Commit
- [adversarial-protocol](references/core/adversarial-protocol.md) — Synced adversarial challenge protocol (from adversarial-reviewer)

### Rules

- [prd](../../rules/requirements-driven-dev/prd.md) — PRD authoring: required sections, quality checklist
- [trd](../../rules/requirements-driven-dev/trd.md) — TRD authoring: required sections, traceability to PRD
- [bdd](../../rules/requirements-driven-dev/bdd.md) — BDD spec authoring: Gherkin format, required sections, quality checklist
- [changelog](../../rules/requirements-driven-dev/changelog.md) — Artifact change tracking: one file per feature, append-only sessions
- [execution](../../rules/requirements-driven-dev/execution.md) — AI execution constraints: spec-driven, defensive, minimal diff
- [commit](../../rules/requirements-driven-dev/commit.md) — Git convention: conventional commits with changelog reference
- [project-context](references/rules/project-context.md) — Per-project AI constitution: tech stack, rules, conventions

### Templates

- [prd](references/templates/prd.md) — Product requirement document template
- [trd](references/templates/trd.md) — Technical requirement document template
- [behavior-spec](references/templates/behavior-spec.md) — Given/When/Then feature spec template
- [verification-spec](references/templates/verification-spec.md) — Verification flows, acceptance criteria template
- [changelog-entry](references/templates/changelog-entry.md) — Session-based changelog entry template

### Agents (Specialist Roles)

- [requirements-prd-writer](../../agents/requirements-prd-writer.md) — Helps human define product requirements
- [requirements-trd-writer](../../agents/requirements-trd-writer.md) — Helps human derive technical requirements from PRD
- [requirements-spec-writer](../../agents/requirements-spec-writer.md) — Helps human write clear, testable BDD specs
- [requirements-executor](../../agents/requirements-executor.md) — Produces deliverables strictly from spec
- [requirements-verifier](../../agents/requirements-verifier.md) — Designs and runs verifications from BDD spec
- [requirements-proofreader](../../agents/requirements-proofreader.md) — Adversarial challenger using adversarial-protocol for domain review
- [requirements-reviewer](../../agents/requirements-reviewer.md) — Quality gate: spec compliance + deliverable quality

---

## Configuration

This skill uses configurable directories for requirement documents and
changelog files. See `references/rules/config.md` for directory defaults,
project-specific overrides, and how to detect existing conventions.

Default directories: `docs/prds/`, `docs/trds/`, `docs/specs/`, `docs/changelogs/`.

---

## Integration Pattern

### Standalone (shared top-level config)

```
your-project/
├── .agents/
│   ├── AGENTS.md
│   ├── agents/
│   │   └── requirements-*.md
│   ├── commands/
│   │   └── requirements-lifecycle.md
│   ├── rules/
│   │   └── requirements-driven-dev/
│   └── skills/
│       └── requirements-driven-dev/
├── .claude -> .agents                  # Claude sees promoted agents/rules/commands
├── .kilo/
│   ├── agent -> ../.agents/agents      # Kilo auto-discovers the promoted agents
│   └── commands/
│       └── requirements-lifecycle.md   # Optional Kilo mirror of top-level commands
├── docs/
│   ├── prds/
│   │   └── <product>.md
│   ├── trds/
│   │   └── <component>.md
│   ├── specs/
│   │   └── <feature>.md
│   └── changelogs/
```

### Legacy compatibility

```
your-project/
├── .agents/
│   ├── AGENTS.md
│   ├── agents/
│   ├── rules/
│   ├── commands/
│   └── skills/
│       └── requirements-driven-dev/
├── .agent/                             # Optional legacy alias if your tooling still expects it
│   └── ...
├── docs/
│   ├── prds/
│   ├── trds/
│   ├── specs/
│   └── changelogs/
```

### Activate from host `AGENTS.md`

Add to your project's `AGENTS.md`:

```markdown
## Active Skills

- **Requirements-Driven Dev**: `.agents/skills/requirements-driven-dev/SKILL.md`
  Read the skill's lifecycle command and follow it for all feature work.
```

---

_This skill is self-contained and portable. No language assumptions. Integrates with `adversarial-reviewer` and `security-reviewer` skills when available._
