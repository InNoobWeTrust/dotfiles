---
trigger: always_on
description: Rules for authoring and maintaining BDD behavior specs.
---

# BDD Spec Authoring Rules

## File Convention

- Path placeholders such as `{TRD_DIR}`, `{SPEC_DIR}`, and `{CHANGELOG_DIR}` resolve inside the host project, not inside the shared agent or skill repository.
- **Location**: `{SPEC_DIR}<feature-slug>.md`
- **Naming**: lowercase, hyphen-separated, max 40 chars
  - Example: `user-login.md`, `project-search-filter.md`
- **One feature per file** — split large features into sub-features

## Required Structure

Every behavior spec MUST contain these sections in order:

```markdown
# Feature: <Title>

## Parent TRD (optional)
{TRD_DIR}<component-slug>.md — <which TRD section this spec addresses>

## Description
<1-3 sentences: what this feature does and why it matters>

## User Stories
- As a [role], I want [action], so that [benefit]

## Scenarios

### Scenario: <Happy path name>
- **Given** <precondition>
- **When** <action>
- **Then** <expected outcome>

### Scenario: <Error/edge case name>
- **Given** <precondition>
- **When** <action>
- **Then** <expected outcome>

## Validation Rules
- <business constraint 1>
- <business constraint 2>

## Out of Scope
- <explicit exclusion 1>

## Dependencies
- <other spec or artifact this depends on>

## Traceability Matrix
(see requirements-lifecycle.md section 7.5 for format and rules)

## ⚔ Challenge Gate
<debate record>
```

## Traceability Matrix

> For the full protocol, see the `requirements-lifecycle` command guide, section 7.5.

The Traceability Matrix is defined in the behavior-spec template. Key rules:

1. **Initialize on spec creation** — add a row for each scenario with `⬚ pending`
2. **Executor updates** — after implementing, set `Impl Status` → `✓`
3. **Verifier updates** — after writing tests, set `Test Status` → `✓`
4. **Commit gate** — run `gap-check.sh` before commit
5. **Human approves `⊘`** — only human can mark a scenario as N/A

**Status legend**: `⬚` pending · `◐` partial · `✓` complete · `⊘` N/A

## Authoring Rules

1. **Human writes the spec** — AI may draft, but human must review and approve
2. **Be specific** — "User sees a success message" is weak; "User sees toast: 'Project created successfully'" is strong
3. **Cover error paths** — every happy path needs at least one sad path
4. **No implementation details** — specs describe WHAT, not HOW
5. **Versioned** — if behavior changes, update the spec first, then deliverables
6. **Immutable during execution** — once AI starts working, spec is frozen until verification completes. Changes go to a new iteration.

## Scenario Quality Checklist

- [ ] Each scenario has a clear, descriptive name
- [ ] Given/When/Then are concrete and verifiable
- [ ] Edge cases are covered (empty input, max limits, concurrent access)
- [ ] Error states have clear expected behavior
- [ ] No ambiguous words ("properly", "correctly", "as expected" — replace with specifics)
- [ ] Challenge gate passed (adversarial review completed)

## Linking

- Reference parent TRD: `Parent: {TRD_DIR}<component-slug>.md`
- Reference related specs: `See also: {SPEC_DIR}user-auth.md`
- Reference changelog: `Implemented in: {CHANGELOG_DIR}20260303_user-login.md`
