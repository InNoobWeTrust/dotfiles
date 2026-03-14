---
trigger: always_on
description: Rules for authoring and maintaining BDD behavior specs.
---

# BDD Spec Authoring Rules

## File Convention

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
```

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

## Linking

- Reference parent TRD: `Parent: {TRD_DIR}<component-slug>.md`
- Reference related specs: `See also: {SPEC_DIR}user-auth.md`
- Reference changelog: `Implemented in: {CHANGELOG_DIR}20260303_user-login.md`
