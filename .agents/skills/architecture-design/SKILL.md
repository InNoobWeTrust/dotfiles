---
name: architecture-design
description: "Use this skill for software architecture work — system design, architecture documentation, pattern selection (Modular Monolith default), modular component design (C4 L1-L3), DDD bounded contexts, ADR writing, architecture audits, API/data/security architecture, and fitness functions. Composes with db-design and code-craft."
---

# Architecture Design

Software architecture design across the full lifecycle: design, document, audit, evolve.
Modular-first & illustration-first — prefer clear component boundaries and mermaid diagrams over prose.

Progressive disclosure: this file is the workflow router.
Deep detail lives in `references/`.

| When | Load |
|---|---|
| Selecting an architecture pattern | `references/patterns/INDEX.md` → specific category |
| Modular Monolith & Bounded Context design | `references/patterns/modular-architecture.md` |
| Operational Database Schema Design | Route to `db-design` skill |
| Drawing C4 diagrams | `references/visualization/c4-mermaid-templates.md` |
| Writing an ADR | `references/adr-templates.md` |
| Analyzing tradeoffs or fitness | `references/analysis/fitness-functions.md` |

---

## Gate 1 — Scope Check

Before starting, determine:

| Question | Action |
|---|---|
| Existing architecture docs? | Read first. Audit before rewriting. |
| DB schema design needed? | Compose with `db-design` skill. |
| Code change only, no arch impact? | STOP — skill not needed. |
| Code review request? | Route to `reviewer` instead. |

## Gate 2 — C4 Level Calibration & Modular Boundaries

```mermaid
graph LR
    A["Project Size"] --> B{Complexity?}
    B -->|"Single service / Monolith"| C["L1-3: Context + Container + Component (Modular Monolith)"]
    B -->|"Multi-service"| D["L1-3: + Component boundaries per service"]
    B -->|"Enterprise"| E["L1-4: + Code for critical domain models"]
```

| Project Size | Default C4 Depth | Architectural Mandate |
|---|---|---|
| Single service / monolith | Level 1–3 (Context + Container + Component) | **Mandatory Component breakdown (C4 L3)**: define Modular Monolith bounded contexts & public module APIs |
| Multi-service / microservices | Level 1–3 (+ Component per service) | Define component boundaries & inter-service contract DTOs per deployable |
| Enterprise / platform | Level 1–4 (all levels) | Define enterprise domain contexts, trust boundaries, & data ownership |

---

## Gate 3 — Illustration Budget

Architecture docs that are walls of text have failed. Minimum diagrams:

| Artifact | Minimum Illustrations |
|---|---|
| Architecture overview | 1× system context + 1× container diagram + 1× component/bounded context diagram |
| Migration plan | 1× current state + 1× target state + 1× transition sequence |
| Data & Schema architecture | 1× component data flow + 1× ER diagram (compose with `db-design`) |
| Security review | 1× trust boundary diagram (STRIDE overlay) |
| ADR | 1× options comparison diagram (optional) |

---

## Workflow Routing

Match the scenario, load only the matching workflow file.

### Common Scenarios (try these first)

| Scenario | Trigger | Load |
|---|---|---|
| **Greenfield design** | New system, no existing architecture | `references/workflows/greenfield.md` |
| **Brownfield documentation** | Existing system, missing/outdated docs | `references/workflows/brownfield.md` |
| **Architecture audit** | Review existing system, fitness check | `references/workflows/architecture-audit.md` |
| **ADR writing** | Record a significant decision | `references/workflows/adr-writing.md` |
| **Migration planning** | Monolith→micro, cloud migration, DB migration | `references/workflows/migration.md` |

### Specialized Scenarios (if common ones don't match)

| Scenario | Trigger | Load |
|---|---|---|
| **System integration** | Connecting two systems, API gateway, BFF | `references/workflows/integration.md` |
| **Security architecture** | Threat model, trust boundaries, compliance | `references/workflows/security-review.md` |
| **Performance redesign** | Scaling bottleneck, latency SLO breach | `references/workflows/performance-redesign.md` |
| **API design** | New API, contract-first, versioning | `references/workflows/api-design.md` |
| **Data architecture** | Data modeling, pipelines, governance | `references/workflows/data-architecture.md` |

Default when nothing matches: **brownfield documentation**.

---

## Pattern Selection (Modular Monolith Default)

When choosing an architecture pattern:
1. Default to **Modular Monolith** with DDD Bounded Contexts (`references/patterns/modular-architecture.md`) before breaking into premature microservices.
2. Load `references/patterns/INDEX.md` to explore pattern categories.
3. Enforce **Hexagonal Architecture (Ports & Adapters)** for domain components — domain logic must not depend on databases, HTTP frameworks, or third-party SDKs.
4. Enforce **Explicit Contract DTOs** across component interfaces — positional tuples and untyped dictionaries across module boundaries are forbidden.

---

## Hard Rules

- **Modular Monolith default**: Prefer in-process bounded contexts with explicit interfaces over distributed microservices for single applications.
- **Mandatory Component Breakdown (C4 L3)**: Never present a single service as a black box without specifying its internal component boundaries.
- **Illustration-first**: Every architecture section MUST have at least one mermaid diagram.
- **Explicit types over tuples**: Inter-component interfaces must use explicit DTO types.
- **Evidence over aspiration**: Document what IS, mark aspirational targets as "Target State".

---

## Deliverables

- [ ] Scope check passed (Gate 1)
- [ ] C4 depth calibrated to Level 3 Component boundaries (Gate 2)
- [ ] Illustration budget met (Gate 3)
- [ ] Modular Monolith / Bounded Context breakdown specified
- [ ] Database schema delegated to `db-design` (ER diagram + typed repository DTOs)
- [ ] ADR written for any significant decision made during the process

---

## References

- `references/INDEX.md` — Master index of architecture references
- `references/patterns/modular-architecture.md` — Modular Monoliths, Bounded Contexts, Ports & Adapters
- `references/visualization/c4-mermaid-templates.md` — C4 L1-L3 templates
- `references/adr-templates.md` — ADR templates
- Compose with: `db-design` (operational DB engineering), `code-craft` (implementation), `reviewer` (design-rigor lens)
