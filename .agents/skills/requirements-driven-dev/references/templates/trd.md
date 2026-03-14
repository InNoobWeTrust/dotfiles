# TRD: <Technical Component Title>

> **Status**: draft | approved | implementing | verified
> **Owner**: <human name>
> **Created**: <YYYY-MM-DD>

## Parent PRD

`{PRD_DIR}<product-slug>.md` — Addresses goals: <list specific goals from the PRD>

## Technical Overview

<1-3 paragraphs: what this component does at a high level, the approach chosen,
and the key constraints that shape the design. Focus on the "how" at an
architectural level — not code-level details.>

## Architecture Decisions

### ADR-1: <Decision Title>

- **Context**: <what situation, constraint, or trade-off prompted this decision>
- **Decision**: <what was decided>
- **Rationale**: <why this option was chosen over alternatives>
- **Alternatives Considered**:
  - <Alternative A> — <why rejected>
  - <Alternative B> — <why rejected>

### ADR-2: <Decision Title>

- **Context**: <context>
- **Decision**: <decision>
- **Rationale**: <rationale>
- **Alternatives Considered**:
  - <Alternative A> — <why rejected>

## System Components

- **<Component A>**: <responsibility, key interfaces, where it lives>
- **<Component B>**: <responsibility, key interfaces, where it lives>

## API Contracts / Interfaces

<Define the interfaces between components. Use whatever format fits the domain.>

### <Interface Name>

```
<Method / Endpoint / Function signature>

Input:
  - <parameter>: <type> — <description>

Output:
  - <field>: <type> — <description>

Errors:
  - <error code / exception>: <when it occurs>
```

## Data Models

<Entities, relationships, storage decisions.>

### <Entity Name>

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| <field> | <type> | <constraints> | <description> |

## Non-Functional Requirements

- **Performance**: <specific targets, e.g., "p95 latency < 200ms at 1000 rps">
- **Security**: <auth model, data encryption, access control requirements>
- **Scalability**: <expected load, growth projections, horizontal/vertical strategy>
- **Observability**: <logging, monitoring, alerting, SLO targets>
- **Reliability**: <uptime target, failure modes, recovery strategy>

## Child BDD Specs

- `{SPEC_DIR}<feature-slug>.md` — <brief description of the verifiable behavior>
- `{SPEC_DIR}<feature-slug>.md` — <brief description of the verifiable behavior>

## Notes

- <Additional context, diagrams, references to external documentation>
