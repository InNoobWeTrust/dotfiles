---
name: behavior-doc-driven-dev
description: >
  Behavior-doc-driven development methodology for any domain — code, docs,
  designs, configs, or any deliverable. Activate whenever the user wants to
  plan, brainstorm, spec, implement, verify, or commit work. Also activate
  when the user mentions behavior specs, acceptance criteria, Given/When/Then
  scenarios, user stories, changelogs, or structured commits — even if they
  don't explicitly say "BDD". Use this skill for any feature work that
  benefits from a spec-first approach, including non-software domains like
  process design, policy writing, or content creation.
---

# Behavior-Doc-Driven Development Skill

> **Philosophy**: Humans own behavior. AI owns execution. Verification proves correctness.

A complete, self-contained methodology where:
- **Humans act as Product Owners** — defining behavior, validating outcomes
- **AI acts as Executor & Verifier** — producing deliverables, running verifications
- **Behavior specs in Markdown** are the single source of truth
- **Changelogs** track which artifacts were added/modified/removed

## Activation Signals

This skill activates on **path signals** (spec or changelog files being read/created/edited),
**intent signals** (planning features, writing scenarios, preparing commits), and
**context signals** (deliverables referencing specs, commit messages with `[changelog: ...]`).

Skip this skill when the task is a quick fix with no spec (and user declines writing one),
has no definable behavior, or when the user explicitly opts out.

---

## Quick Start

1. **Define behavior** → Write a spec using the template
2. **AI executes** — AI reads spec, produces deliverables
3. **AI verifies** — AI designs verifications from spec
4. **AI proofreads** — Specialist skills review for domain quality
5. **Human validates** — Review, feedback, adjust
6. **Commit** — Record changelog, structured commit message

---

## Skill Structure

```
behavior-doc-driven-dev/
├── SKILL.md                      # This file — entry point & overview
└── references/
    ├── core/
    │   └── lifecycle.md          # Core lifecycle protocol (always active)
    ├── rules/
    │   ├── bdd.md                # BDD spec authoring rules
    │   ├── changelog.md          # Changelog file convention
    │   ├── execution.md          # AI execution discipline
    │   └── commit.md             # Git commit convention
    ├── templates/
    │   ├── behavior-spec.md      # Template for feature behavior specs
    │   ├── verification-spec.md  # Template for verification plans
    │   └── changelog-entry.md    # Template for changelog entries
    └── agents/
        ├── spec-writer.md        # Assists human in writing behavior specs
        ├── executor.md           # AI executor — produces deliverables from spec
        ├── verifier.md           # AI verifier — designs verifications from spec
        ├── proofreader.md        # Specialist domain review before validation
        └── reviewer.md           # Quality gate — spec compliance review
```

## Knowledge Modules

### Core Protocol
- [lifecycle](references/core/lifecycle.md) — The always-on lifecycle: Backlog → Execute → Verify → Proofread → Validate → Changelog → Commit

### Rules
- [bdd](references/rules/bdd.md) — Spec authoring: Gherkin format, required sections, quality checklist
- [changelog](references/rules/changelog.md) — Artifact change tracking: one file per feature, append-only sessions
- [execution](references/rules/execution.md) — AI execution constraints: spec-driven, defensive, minimal diff
- [commit](references/rules/commit.md) — Git convention: conventional commits with changelog reference

### Templates
- [behavior-spec](references/templates/behavior-spec.md) — Given/When/Then feature spec template
- [verification-spec](references/templates/verification-spec.md) — Verification flows, acceptance criteria template
- [changelog-entry](references/templates/changelog-entry.md) — Session-based changelog entry template

### Agents (Specialist Roles)

- [spec-writer](references/agents/spec-writer.md) — Helps human write clear, testable BDD specs
- [executor](references/agents/executor.md) — Produces deliverables strictly from spec
- [verifier](references/agents/verifier.md) — Designs and runs verifications from BDD spec
- [proofreader](references/agents/proofreader.md) — Specialist domain review using relevant skills
- [reviewer](references/agents/reviewer.md) — Quality gate: spec compliance + deliverable quality

---

## Configuration

This skill uses **configurable directories** for spec and changelog files. By default:

| Variable | Default | Purpose |
|----------|---------|---------|
| `{SPEC_DIR}` | `specs/` | Behavior specs — one `.md` per feature |
| `{CHANGELOG_DIR}` | `changelogs/` | Artifact scope tracker — one file per feature |

### Project-specific overrides

The host project's agent config (e.g., `AGENT.md`) should declare:

```markdown
## BDD Configuration

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
│       └── behavior-doc-driven-dev/    # ← Drop this folder here (or symlink)
├── specs/
│   └── <feature>.md
└── changelogs/
```

### Alongside existing agent config

```
your-project/
├── .agent/
│   ├── AGENT.md                        # Existing config (untouched)
│   ├── rules/                          # Existing rules (untouched)
│   └── skills/
│       ├── existing-skill/             # Existing skills (untouched)
│       └── behavior-doc-driven-dev/    # ← Added, no clash
├── specs/
└── changelogs/
```

### Activate from host AGENT.md

Add to your project's `AGENT.md`:

```markdown
## Active Skills

- **BDD Workflow**: `.agent/skills/behavior-doc-driven-dev/SKILL.md`
  Read the skill's core protocol and follow it for all feature work.
```

---

*This skill is self-contained and portable. No external dependencies. No language assumptions.*
