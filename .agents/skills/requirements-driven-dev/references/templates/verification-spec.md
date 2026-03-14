# Verification Spec: <Feature Title>

> **Behavior Spec**: {SPEC_DIR}<feature-slug>.md
> **Created**: <YYYY-MM-DD>

## Verification Strategy

<Brief description of verification approach: automated checks, manual review, integration validation, etc.>

## Verification Environment

<Describe what tools, environments, or conditions are needed to run verifications.
Leave blank or remove this section if the project's agent config defines this globally.>

## Setup & Prerequisites

### Shared Setup

```
- <prerequisite 1: e.g., "A verified user account exists">
- <prerequisite 2: e.g., "Test data seeded in environment">
```

### Mocks / Stubs

```
- <mock 1: e.g., "External payment API returns success responses">
- <mock 2: e.g., "Email service captures messages without sending">
```

## Verification Flows

### Flow 1: <Happy Path Name>

```
1. Setup: <initial conditions>
2. Action: <what to do>
3. Assert: <expected observable outcome>
4. Cleanup: <how to reset, if needed>
```

### Flow 2: <Error Path Name>

```
1. Setup: <initial conditions>
2. Action: <action that should fail>
3. Assert: <expected error behavior>
4. Side-effect: <confirm no unintended changes>
```

### Flow 3: <Edge Case Name>

```
1. Setup: <create state that triggers edge case>
2. Action: <trigger action>
3. Assert: <system handles gracefully>
```

## Scenario-to-Verification Mapping

| BDD Scenario | Verification | Type | Priority |
|--------------|-------------|------|----------|
| <scenario 1> | <verification name> | <unit/integration/manual> | High |
| <scenario 2> | <verification name> | <unit/integration/manual> | High |
| <scenario 3> | <verification name> | <unit/integration/manual> | Medium |

## Acceptance Criteria for Verifications

- [ ] All high-priority scenarios have verifications
- [ ] Each verification is independent (no shared mutable state)
- [ ] Verifications are deterministic (same input = same result)
- [ ] Edge cases from spec are covered
