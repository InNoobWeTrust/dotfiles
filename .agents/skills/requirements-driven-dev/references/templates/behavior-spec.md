# Feature: <Feature Title>

> **Status**: draft | approved | implementing | verified
> **Owner**: <human name>
> **Created**: <YYYY-MM-DD>

## Parent TRD (optional)

`{TRD_DIR}<component-slug>.md` — <which TRD section this spec addresses>

## Description

<1-3 sentences: what this feature does and why it matters to the user/business>

## User Stories

- As a **<role>**, I want to **<action>**, so that **<benefit>**.
- As a **<role>**, I want to **<action>**, so that **<benefit>**.

## Scenarios

### Scenario: <Happy path — descriptive name>

- **Given** <precondition — system state before action>
- **When** <user action or system event>
- **Then** <expected observable outcome>

### Scenario: <Alternative path — descriptive name>

- **Given** <precondition>
- **When** <action>
- **Then** <expected outcome>

### Scenario: <Error path — descriptive name>

- **Given** <precondition>
- **When** <action that should fail>
- **Then** <expected error behavior, message, or state>

## Validation Rules

- <business rule 1 — e.g., "Email must be unique across all accounts">
- <business rule 2 — e.g., "Name must be at most 100 characters">
- <boundary condition — e.g., "Maximum 100 results per page">

## Out of Scope

- <explicit exclusion 1 — e.g., "Social login (deferred to v2)">
- <explicit exclusion 2>

## Dependencies

- <other spec or artifact this depends on — e.g., "Requires specs/user-auth.md">

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
