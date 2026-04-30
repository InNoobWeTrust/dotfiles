# PRD Authoring Rules

## Purpose

A PRD captures **what** to build and **why** — the product-level intent that drives
everything downstream. It is the highest-level requirements document in the cascade.

## File Convention

- Path placeholders such as `{PRD_DIR}` and `{TRD_DIR}` resolve inside the host project, not inside the shared agent or skill repository.
- **Location**: `{PRD_DIR}<product-slug>.md`
- **Naming**: lowercase, hyphen-separated, max 40 chars
  - Example: `user-onboarding.md`, `payment-system.md`
- **One product initiative per file** — large initiatives split into focused PRDs

## Required Structure

Every PRD MUST contain these sections in order:

```markdown
# PRD: <Product Title>

## Problem Statement
<What problem exists and for whom. Why does it matter now?>

## Goals & Non-Goals

### Goals
- <measurable goal 1>
- <measurable goal 2>

### Non-Goals
- <explicit exclusion 1 — what this initiative will NOT address>

## User Personas
- **<Persona Name>**: <role, needs, pain points>

## User Stories (High-Level)
- As a **<persona>**, I want to **<capability>**, so that **<benefit>**.

## Success Metrics
- <metric 1 — specific, measurable, time-bound>
- <metric 2>

## Scope
<What is included in this initiative. Be explicit about boundaries.>

## Dependencies
- <external system, team, or decision this depends on>

## Out of Scope
- <explicit exclusion 1 — what this initiative will NOT address>

## Child TRDs
- {TRD_DIR}<component-slug>.md — <brief description>
```

## Authoring Rules

1. **Human writes the PRD** — AI may draft, but human must review and approve
2. **Focus on the "what" and "why"** — no implementation details, architecture, or technology choices
3. **Success metrics must be measurable** — "improved user experience" is weak; "reduce onboarding time from 5 min to 2 min" is strong
4. **Non-goals are as important as goals** — they prevent scope creep and align expectations
5. **Versioned** — if product direction changes, update the PRD first, then cascade to TRDs and BDD specs
6. **Immutable during execution** — once TRDs are approved, freeze the PRD for that release cycle

## Quality Checklist

- [ ] Problem statement is clear and compelling
- [ ] Goals are measurable (not vague)
- [ ] Non-goals explicitly state what's out of scope
- [ ] User personas represent real user segments
- [ ] User stories cover the core use cases
- [ ] Success metrics can be tracked after delivery
- [ ] Child TRDs are listed (or planned)
- [ ] Challenge gate passed (adversarial review completed)

## Linking

- Reference child TRDs: `See: {TRD_DIR}<component-slug>.md`
- Reference related PRDs: `See also: {PRD_DIR}<related-product>.md`
