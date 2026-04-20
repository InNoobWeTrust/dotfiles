# Feature: <Feature Title>

> **Status**: draft | approved | implementing | verified
> **Owner**: <human name>
> **Created**: <YYYY-MM-DD>

## Parent TRD (optional)

`{TRD_DIR}<component-slug>.md` — <which TRD section this spec addresses>

## Description

<1-3 sentences: what this feature does and why it matters to the user/business>

## User Stories

- [US-1] As a **<role>**, I want to **<action>**, so that **<benefit>**.
- [US-2] As a **<role>**, I want to **<action>**, so that **<benefit>**.

## Scenarios

### Scenario 1: <Happy path — descriptive name>

- **Given** <precondition — system state before action>
- **When** <user action or system event>
- **Then** <expected observable outcome>

### Scenario 2: <Alternative path — descriptive name>

- **Given** <precondition>
- **When** <action>
- **Then** <expected outcome>

### Scenario 3: <Error path — descriptive name>

- **Given** <precondition>
- **When** <action that should fail>
- **Then** <expected error behavior, message, or state>

## Use Case Mapping

This section groups the scenarios into use cases to aid implementation planning. Each use case represents a distinct decision context and maps scenarios to components and phases.

### Use Case Template

```
UC-<N>: <Use Case Name>
<1-2 sentences: what decision context this supports>
- **Covers**: Scenario <#> (<brief name>), Scenario <#> (<brief name>)
- **Lives in**: <component or location>
- **Status**: <implemented | partial | not implemented>
- **Blockers**: <any dependencies or blocked items>
```

### Component Ownership

```
<Component> — Scenarios <#>, <#>, <#>. <1-sentence description of what it owns>.
```

### Phase Eligibility

Identify which scenarios can be implemented without waiting for dependencies:

- **Phase 1 eligible** (no blockers): <list scenarios>
- **Blocked on**: <dependencies>

### Recommended Implementation Order

1. <priority 1 — scenario/use case with justification>
2. <priority 2>
3. ...

## Validation Rules

- <business rule 1 — e.g., "Email must be unique across all accounts">
- <business rule 2 — e.g., "Name must be at most 100 characters">
- <boundary condition — e.g., "Maximum 100 results per page">

## Out of Scope

- <explicit exclusion 1 — e.g., "Social login (deferred to v2)">
- <explicit exclusion 2>

## Dependencies

- <other spec or artifact this depends on — e.g., "Requires specs/user-auth.md">

---

## Traceability Matrix

> **Purpose**: Track coverage from scenario → implementation → verification.
> Agents update this section as work progresses. Gaps block commit.

| # | Scenario | Impl Status | Impl Artifact | Test Status | Test Artifact | Notes |
|---|----------|-------------|---------------|-------------|---------------|-------|
| 1 | <scenario name> | ⬚ | — | ⬚ | — | |
| 2 | <scenario name> | ⬚ | — | ⬚ | — | |
| 3 | <scenario name> | ⬚ | — | ⬚ | — | |

**Status legend**: ⬚ pending · ◐ partial · ✓ complete · ⊘ N/A (out of scope)

### Gap Summary

- **Scenarios total**: <N>
- **Implemented**: <N> / <N>
- **Tested**: <N> / <N>
- **Blocking gaps**: <list any scenarios missing impl or test>

### Update Protocol

1. **Executor**: After implementing a scenario, update `Impl Status` → `✓` and fill `Impl Artifact`
2. **Verifier**: After writing tests, update `Test Status` → `✓` and fill `Test Artifact`
3. **Before commit**: Run gap check — all scenarios must be `✓` or `⊘`, no `⬚` or `◐`

---

## ⚔ Challenge Gate

> **Status**: pending | passed | revisions-needed
> **Challenger**: <agent or human name>
> **Date**: <YYYY-MM-DD>

This spec must survive adversarial challenge before entering the backlog.
Record all challenges and their outcomes below for traceability.

### Debate Record

| # | Vector | Challenge | Response | Verdict |
|---|--------|-----------|----------|---------|
| 1 | <assumptions / evidence / alternatives / longevity / edge cases / scope> | <the challenge raised> | <author's defense with reasoning and evidence> | <author-won / challenger-won / escalated> |
| 2 | | | | |

### Challenge Summary

- **Challenges raised**: <N>
- **Author victories**: <N>
- **Challenger victories**: <N> (must revise before advancing)
- **Escalated**: <N> (needs Product Owner ruling)
- **Overall verdict**: ACCEPTED / REVISE / ESCALATE

### Revisions Made (if any)

- <what was changed in response to challenge, with rationale>

## Notes

- <any additional context, links, or design references>
