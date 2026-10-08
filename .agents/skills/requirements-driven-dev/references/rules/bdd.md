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
(see this skill's lifecycle workflow guidance for format and rules)

## ⚔ Challenge Gate
<debate record>
```

## Traceability Matrix

> For the full protocol, see this skill's lifecycle workflow guidance.

The Traceability Matrix is defined in the behavior-spec template. Key rules:

1. **Initialize on spec creation** — add a row for each scenario with `⬚ pending`
2. **Executor updates** — after implementing, set `Impl Status` → `✓`
3. **Verifier updates** — after writing tests, set `Test Status` → `✓`
4. **Commit gate** — run `gap-check.sh` before commit
5. **N/A requires justified authority** — human or explicitly delegated primary may mark a scenario `⊘` only when evidence shows it is outside unchanged requirements. Record reason and authority; never drop a failed required scenario to obtain PASS.

**Status legend**: `⬚` pending · `◐` partial · `✓` complete · `⊘` N/A

## Authoring Rules

1. **Authorized owner approves the spec** — follow `../../../../rules/delivery-ownership.md`: the autonomous primary researches and approves observable in-scope behavior before implementation; user-only outcomes and reserved approvals remain human-owned.
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
