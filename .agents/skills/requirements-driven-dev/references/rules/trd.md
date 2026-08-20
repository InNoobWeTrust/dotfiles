# TRD Authoring Rules

## Purpose

Apply `.agents/rules/phased-delivery.md`: select a TRD independently only when its
formal-artifact threshold, an explicit user request, or regulation/coordination requires it.
A TRD captures **how** to build a cross-system, operational, or technical contract
that needs durable coordination; it neither requires a parent PRD nor child BDD specs.

## File Convention

- Path placeholders such as `{PRD_DIR}`, `{TRD_DIR}`, and `{SPEC_DIR}` resolve inside the host project, not inside the shared agent or skill repository.
- **Location**: `{TRD_DIR}<component-slug>.md`
- **Naming**: lowercase, hyphen-separated, max 40 chars
  - Example: `auth-service.md`, `search-indexing.md`
- **One technical component or subsystem per file** — split cross-cutting concerns into separate TRDs

## Structure When a TRD Is Selected

Use the applicable sections below to cover the canonical operational minimum. Parent
and child links are optional and appear only for separately selected related artifacts.

```markdown
# TRD: <Technical Component Title>

## Related PRD (optional)
{PRD_DIR}<product-slug>.md — <relevant outcome or goals, when a PRD is independently selected>

## Technical Overview
<1-3 paragraphs: what this component does, high-level approach, key constraints>

## Architecture Decisions

### ADR (only when the canonical ADR threshold is met): <Decision Title>
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
> Apply a security-lens review to this section.

### Authentication & Authorization
### Data Protection
### Input Validation & Injection Prevention
### Infrastructure & Configuration
### Supply Chain & Dependencies
### Failure Modes

## Related BDD Specs (optional)
- {SPEC_DIR}<feature-slug>.md — <brief description, only when the BDD spec is independently selected>
```

## Authoring Rules

1. **Human owns the TRD** — AI may draft architecture proposals, but human must review and approve all decisions
2. **Trace to the selected need** — connect each section to the relevant outcome, contract, or PRD goal when a related PRD exists
3. **Architecture decisions use ADR format only at the canonical ADR threshold** — consequential, hard-to-reverse choices with competing options need context, decision, rationale, alternatives, consequences, and revisit conditions
4. **Non-functional requirements must be specific** — "fast" is meaningless; "p95 < 200ms at 1000 rps" is testable
5. **Security is mandatory, not optional** — the Security Assessment section must be filled for every TRD. Apply a security-lens review to audit it. An empty or hand-waved security section blocks the challenge gate
6. **Interfaces are contracts** — define them clearly enough that two teams could build against them independently
7. **Versioned** — update the TRD when its coordinated contract changes; update only separately selected linked artifacts affected by that change
8. **Review proportionately** — use formal review when independently selected, explicitly requested, or required for regulation/coordination

## Quality Checklist

- [ ] Related PRD is referenced when independently selected; otherwise the coordinated outcome/contract is identified
- [ ] ADRs document rationale, alternatives, consequences, and revisit conditions when the canonical threshold is met
- [ ] Interfaces are defined clearly (inputs, outputs, error cases)
- [ ] Non-functional requirements have concrete targets
- [ ] Security Assessment is complete — all 6 subsections addressed
- [ ] Security Assessment has received a security-lens review
- [ ] Related BDD specs are linked only when independently selected
- [ ] No product-level concerns (those belong in the PRD)

## Linking

- Reference related PRD: `See: {PRD_DIR}<product-slug>.md`
- Reference related selected BDD specs: `See: {SPEC_DIR}<feature-slug>.md`
- Reference sibling TRDs: `See also: {TRD_DIR}<related-component>.md`
