---
trigger: on_trd
description: Rules for authoring and maintaining Technical Requirement Documents (TRDs).
---

# TRD Authoring Rules

## Purpose

A TRD captures **how** to build something architecturally — the technical decisions,
system components, and interfaces that implement one or more PRD goals. It bridges
the gap between product intent (PRD) and verifiable behavior (BDD specs).

## File Convention

- **Location**: `{TRD_DIR}<component-slug>.md`
- **Naming**: lowercase, hyphen-separated, max 40 chars
  - Example: `auth-service.md`, `search-indexing.md`
- **One technical component or subsystem per file** — split cross-cutting concerns into separate TRDs

## Required Structure

Every TRD MUST contain these sections in order:

```markdown
# TRD: <Technical Component Title>

## Parent PRD
{PRD_DIR}<product-slug>.md — <which goals this TRD addresses>

## Technical Overview
<1-3 paragraphs: what this component does, high-level approach, key constraints>

## Architecture Decisions

### ADR-1: <Decision Title>
- **Context**: <what situation or trade-off prompted this decision>
- **Decision**: <what was decided>
- **Rationale**: <why this option was chosen>
- **Alternatives Considered**: <what else was evaluated>

## System Components
- **<Component A>**: <responsibility, interfaces>
- **<Component B>**: <responsibility, interfaces>

## API Contracts / Interfaces
<Define inputs, outputs, protocols, and contracts between components.
Use whatever format fits the domain: REST endpoints, function signatures,
message schemas, CLI arguments, etc.>

## Data Models
<Entities, relationships, storage decisions. Tables, schemas, object models —
whatever is relevant to the domain.>

## Non-Functional Requirements
- **Performance**: <specific targets, e.g., "p95 latency < 200ms">
- **Scalability**: <expected load, growth projections>
- **Observability**: <logging, monitoring, alerting needs>

## Security Assessment
> Apply security-reviewer skill to this section.

### Authentication & Authorization
### Data Protection
### Input Validation & Injection Prevention
### Infrastructure & Configuration
### Supply Chain & Dependencies
### Failure Modes

## Child BDD Specs
- {SPEC_DIR}<feature-slug>.md — <brief description of the verifiable behavior>
```

## Authoring Rules

1. **Human owns the TRD** — AI may draft architecture proposals, but human must review and approve all decisions
2. **Every section traces to a PRD goal** — if a component doesn't serve a product goal, question whether it belongs
3. **Architecture decisions use ADR format** — context, decision, rationale, alternatives. This avoids "we just chose X" without reasoning
4. **Non-functional requirements must be specific** — "fast" is meaningless; "p95 < 200ms at 1000 rps" is testable
5. **Security is mandatory, not optional** — the Security Assessment section must be filled for every TRD. Invoke the `security-reviewer` skill to audit it. An empty or hand-waved security section blocks the challenge gate
6. **Interfaces are contracts** — define them clearly enough that two teams could build against them independently
7. **Versioned** — if architecture changes, update the TRD first, then cascade to BDD specs
8. **Immutable during execution** — once BDD specs are approved, freeze the TRD for that iteration

## Quality Checklist

- [ ] Parent PRD is referenced and specific goals are identified
- [ ] Architecture decisions have rationale (not just "we chose X")
- [ ] Alternatives were considered for non-trivial decisions
- [ ] Interfaces are defined clearly (inputs, outputs, error cases)
- [ ] Non-functional requirements have concrete targets
- [ ] Security Assessment is complete — all 6 subsections addressed
- [ ] Security Assessment has been reviewed by `security-reviewer`
- [ ] Child BDD specs are listed (or planned)
- [ ] No product-level concerns (those belong in the PRD)

## Linking

- Reference parent PRD: `Parent: {PRD_DIR}<product-slug>.md`
- Reference child BDD specs: `See: {SPEC_DIR}<feature-slug>.md`
- Reference sibling TRDs: `See also: {TRD_DIR}<related-component>.md`
