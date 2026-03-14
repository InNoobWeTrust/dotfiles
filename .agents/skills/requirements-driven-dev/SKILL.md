---
name: requirements-driven-dev
description: >
  Requirements-driven development methodology — cascading from product
  requirements (PRD) to technical requirements (TRD) to behavior specs (BDD)
  to execution and delivery. Activate whenever the user wants to plan features,
  write product requirements, define technical architecture, author behavior
  specs, implement, verify, or commit work. Also activate when the user
  mentions PRDs, TRDs, technical design docs, behavior specs, acceptance
  criteria, Given/When/Then scenarios, user stories, changelogs, or structured
  commits — even if they don't explicitly say "requirements-driven". Use this
  skill for any feature work that benefits from a requirements-first approach,
  including non-software domains like process design, policy writing, or
  content creation.
---

# Requirements-Driven Development Skill

> **Philosophy**: Humans own requirements. AI owns execution. Verification proves correctness.

A complete, self-contained methodology where:
- **Humans act as Product Owners** — defining requirements at every level, validating outcomes
- **AI acts as Executor & Verifier** — producing deliverables, running verifications
- **Requirements cascade** from high-level product vision down to verifiable behaviors:
  - **PRD** (Product Requirement Document) — *what* to build and *why*
  - **TRD** (Technical Requirement Document) — *how* to build it architecturally
  - **BDD spec** (Behavior Specification) — *verifiable behaviors* that drive execution
- **Changelogs** track which artifacts were added/modified/removed

## Activation Signals

This skill activates on **path signals** (PRD, TRD, spec, or changelog files being read/created/edited),
**intent signals** (planning products, defining architecture, writing scenarios, preparing commits), and
**context signals** (deliverables referencing requirements, commit messages with `[changelog: ...]`).

Skip this skill when the task is a quick fix with no spec (and user declines writing one),
has no definable requirements, or when the user explicitly opts out.

---

## Quick Start

1. **Define product requirements** → Write a PRD using the template
2. **Define technical requirements** → Derive a TRD from the PRD
3. **Define behavior specs** → Split TRD concerns into BDD specs
4. **AI executes** — AI reads BDD spec, produces deliverables
5. **AI verifies** — AI designs verifications from spec
6. **AI proofreads** — Specialist skills review for domain quality
7. **Human validates** — Review, feedback, adjust
8. **Commit** — Record changelog, structured commit message

> **Shortcut**: For small features, you can start directly at step 3 (BDD spec)
> without writing a PRD/TRD. The cascade is valuable for complex features
> where multiple concerns need to be split and tracked.

---

## Skill Structure

```
requirements-driven-dev/
├── SKILL.md                      # This file — entry point & overview
└── references/
    ├── core/
    │   └── lifecycle.md          # Core lifecycle protocol (always active)
    ├── rules/
    │   ├── prd.md                # PRD authoring rules
    │   ├── trd.md                # TRD authoring rules
    │   ├── bdd.md                # BDD spec authoring rules
    │   ├── changelog.md          # Changelog file convention
    │   ├── execution.md          # AI execution discipline
    │   └── commit.md             # Git commit convention
    ├── templates/
    │   ├── prd.md                # Template for PRDs
    │   ├── trd.md                # Template for TRDs
    │   ├── behavior-spec.md      # Template for BDD behavior specs
    │   ├── verification-spec.md  # Template for verification plans
    │   └── changelog-entry.md    # Template for changelog entries
    └── agents/
        ├── prd-writer.md         # Assists human in writing PRDs
        ├── trd-writer.md         # Assists human in writing TRDs
        ├── spec-writer.md        # Assists human in writing BDD behavior specs
        ├── executor.md           # AI executor — produces deliverables from spec
        ├── verifier.md           # AI verifier — designs verifications from spec
        ├── proofreader.md        # Specialist domain review before validation
        └── reviewer.md           # Quality gate — spec compliance review
```

## Knowledge Modules

### Core Protocol
- [lifecycle](references/core/lifecycle.md) — The always-on lifecycle: Requirements Cascade → Backlog → Execute → Verify → Proofread → Validate → Changelog → Commit

### Rules
- [prd](references/rules/prd.md) — PRD authoring: required sections, quality checklist
- [trd](references/rules/trd.md) — TRD authoring: required sections, traceability to PRD
- [bdd](references/rules/bdd.md) — BDD spec authoring: Gherkin format, required sections, quality checklist
- [changelog](references/rules/changelog.md) — Artifact change tracking: one file per feature, append-only sessions
- [execution](references/rules/execution.md) — AI execution constraints: spec-driven, defensive, minimal diff
- [commit](references/rules/commit.md) — Git convention: conventional commits with changelog reference

### Templates
- [prd](references/templates/prd.md) — Product requirement document template
- [trd](references/templates/trd.md) — Technical requirement document template
- [behavior-spec](references/templates/behavior-spec.md) — Given/When/Then feature spec template
- [verification-spec](references/templates/verification-spec.md) — Verification flows, acceptance criteria template
- [changelog-entry](references/templates/changelog-entry.md) — Session-based changelog entry template

### Agents (Specialist Roles)

- [prd-writer](references/agents/prd-writer.md) — Helps human define product requirements
- [trd-writer](references/agents/trd-writer.md) — Helps human derive technical requirements from PRD
- [spec-writer](references/agents/spec-writer.md) — Helps human write clear, testable BDD specs
- [executor](references/agents/executor.md) — Produces deliverables strictly from spec
- [verifier](references/agents/verifier.md) — Designs and runs verifications from BDD spec
- [proofreader](references/agents/proofreader.md) — Specialist domain review using relevant skills
- [reviewer](references/agents/reviewer.md) — Quality gate: spec compliance + deliverable quality

---

## Configuration

This skill uses **configurable directories** for requirement documents and changelog files. By default:

| Variable | Default | Purpose |
|----------|---------|---------|
| `{PRD_DIR}` | `docs/prds/` | Product requirement documents — one `.md` per product/initiative |
| `{TRD_DIR}` | `docs/trds/` | Technical requirement documents — one `.md` per component/system |
| `{SPEC_DIR}` | `docs/specs/` | Behavior specs — one `.md` per feature |
| `{CHANGELOG_DIR}` | `docs/changelogs/` | Artifact scope tracker — one file per feature |

### Project-specific overrides

The host project's agent config (e.g., `AGENT.md`) should declare:

```markdown
## Requirements-Driven Dev Configuration

- **PRD directory**: `docs/prds/`
- **TRD directory**: `docs/trds/`
- **Spec directory**: `docs/specs/`
- **Changelog directory**: `docs/changelogs/`
```

If no override is provided, the skill uses the defaults above.

### Additional project overrides

The host project may also configure:
- **Verification tools** — e.g., pytest, vitest, manual checklist, etc.
- **Source layout** — where deliverables live
- **Commit convention extensions** — additional `type` values
- **Domain-specific execution rules** — extend `references/rules/execution.md`

These overrides live in the project's own agent config, not in this skill.

---

## Integration Pattern

### Standalone (new project)

```
your-project/
├── .agent/
│   ├── AGENT.md                        # Your project-level config
│   └── skills/
│       └── requirements-driven-dev/    # ← Drop this folder here (or symlink)
├── docs/
│   ├── prds/
│   │   └── <product>.md
│   ├── trds/
│   │   └── <component>.md
│   ├── specs/
│   │   └── <feature>.md
│   └── changelogs/
```

### Alongside existing agent config

```
your-project/
├── .agent/
│   ├── AGENT.md                        # Existing config (untouched)
│   ├── rules/                          # Existing rules (untouched)
│   └── skills/
│       ├── existing-skill/             # Existing skills (untouched)
│       └── requirements-driven-dev/    # ← Added, no clash
├── docs/
│   ├── prds/
│   ├── trds/
│   ├── specs/
│   └── changelogs/
```

### Activate from host AGENT.md

Add to your project's `AGENT.md`:

```markdown
## Active Skills

- **Requirements Workflow**: `.agent/skills/requirements-driven-dev/SKILL.md`
  Read the skill's core protocol and follow it for all feature work.
```

---

*This skill is self-contained and portable. No external dependencies. No language assumptions.*
