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

## Security Assessment

> Apply `security-reviewer` skill to this section. Do not skip.

### Authentication & Authorization

- **Auth model**: <e.g., JWT + refresh tokens, OAuth2, API keys, mTLS>
- **Access control**: <RBAC / ABAC / ACL — what roles exist, what each can access>
- **Session management**: <session lifetime, invalidation, concurrent session policy>
- **Privilege boundaries**: <what separates user-level from admin-level, how escalation is prevented>

### Data Protection

- **Data classification**: <what data is sensitive — PII, credentials, financial, health>
- **Encryption at rest**: <algorithm, key management, rotation policy>
- **Encryption in transit**: <TLS version, certificate management>
- **Data retention & deletion**: <what is kept, for how long, how deletion is enforced>
- **Secrets management**: <how credentials, API keys, tokens are stored — never hardcoded>

### Input Validation & Injection Prevention

- **Input boundaries**: <what inputs exist, how each is validated/sanitized>
- **Injection vectors**: <SQL, XSS, command injection, path traversal — how each is mitigated>
- **File uploads** (if applicable): <size limits, type validation, storage isolation>

### Infrastructure & Configuration

- **Network boundaries**: <what is exposed, what is internal-only, firewall rules>
- **Default credentials**: <are all defaults changed? Are ports locked down?>
- **Container/deployment security** (if applicable): <image scanning, least-privilege, read-only fs>

### Supply Chain & Dependencies

- **Dependency policy**: <pinned versions? lockfile enforced? CVE scanning?>
- **Third-party integrations**: <what external services are trusted, what data is shared>

### Failure Modes

- **Fail-closed vs fail-open**: <what happens when auth/validation/external services fail>
- **Audit logging**: <what security events are logged, where, retention>
- **Incident response**: <how security incidents are detected and escalated>

## Non-Functional Requirements

- **Performance**: <specific targets, e.g., "p95 latency < 200ms at 1000 rps">
- **Scalability**: <expected load, growth projections, horizontal/vertical strategy>
- **Observability**: <logging, monitoring, alerting, SLO targets>
- **Reliability**: <uptime target, failure modes, recovery strategy>

## Child BDD Specs

- `{SPEC_DIR}<feature-slug>.md` — <brief description of the verifiable behavior>
- `{SPEC_DIR}<feature-slug>.md` — <brief description of the verifiable behavior>

## ⚔ Challenge Gate

> **Status**: pending | passed | revisions-needed
> **Challenger**: <agent or human name>
> **Date**: <YYYY-MM-DD>

This TRD must survive adversarial challenge before advancing to BDD specs.
The challenge MUST include a security-reviewer pass on the Security Assessment section.
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

- <Additional context, diagrams, references to external documentation>
