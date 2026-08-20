# PRD Authoring Rules

## Purpose

Apply `.agents/rules/phased-delivery.md`: select a PRD independently only when its
formal-artifact threshold, an explicit user request, or regulation/coordination requires it.
A PRD captures **what** to build and **why** — durable product-level intent when that
level of alignment is needed; it does not require downstream artifacts.

## File Convention

- Path placeholders such as `{PRD_DIR}` and `{TRD_DIR}` resolve inside the host project, not inside the shared agent or skill repository.
- **Location**: `{PRD_DIR}<product-slug>.md`
- **Naming**: lowercase, hyphen-separated, max 40 chars
  - Example: `user-onboarding.md`, `payment-system.md`
- **One product initiative per file** — large initiatives split into focused PRDs

## Structure When a PRD Is Selected

Use the sections below when relevant to the selected PRD's alignment need. Preserve
the durable outcome, scope, non-goals, stakeholders, and success alignment required
by the canonical threshold; omit inapplicable sections rather than inventing detail.

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

## Related Formal Artifacts (optional)
- {TRD_DIR}<component-slug>.md — <brief description, only when that TRD is independently selected>
```

## Authoring Rules

1. **Human writes the PRD** — AI may draft, but human must review and approve
2. **Focus on the "what" and "why"** — no implementation details, architecture, or technology choices
3. **Success metrics must be measurable** — "improved user experience" is weak; "reduce onboarding time from 5 min to 2 min" is strong
4. **Non-goals are as important as goals** — they prevent scope creep and align expectations
5. **Versioned** — update the PRD when its product direction changes; update only separately selected linked artifacts affected by that change
6. **Review proportionately** — use formal review when independently selected, explicitly requested, or required for regulation/coordination

## Quality Checklist

- [ ] Problem statement is clear and compelling
- [ ] Goals are measurable (not vague)
- [ ] Non-goals explicitly state what's out of scope
- [ ] User personas represent real user segments
- [ ] User stories cover the core use cases
- [ ] Success metrics can be tracked after delivery
- [ ] Related formal artifacts are linked only when independently selected
- [ ] Formal challenge/review completed when explicitly required or selected for the coordination need

## Linking

- Reference related selected TRDs: `See: {TRD_DIR}<component-slug>.md`
- Reference related PRDs: `See also: {PRD_DIR}<related-product>.md`
