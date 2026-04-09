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
