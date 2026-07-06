---
name: architecture-writer
description: "Generate or update docs/architecture.md with responsibility split, data ownership, data flow diagrams, API contract strategy, integration modes, and explicit non-goals. Load for \"write architecture doc\", \"document system design\", \"create architecture diagram\", \"map data flow\", or \"define API contracts\". Skip for minor code changes that don't affect architecture."
---

# Architecture Writer

Generate or update a project's `docs/architecture.md` — the definitive system design document that answers "who owns what, how data moves, and what is explicitly out of scope."

---

## Skill Workflow

This skill has 6 phases. Each phase produces one section of the architecture document.

### Phase 1 — Discover Existing Architecture

Map what already exists before writing:

1. **Identify the technology stack**: Language, framework, database, message queue, cache, CDN, cloud provider.
2. **Identify component boundaries**: What are the deployable units? (e.g., backend API, frontend SPA, worker process, cron jobs).
3. **Identify data stores**: Which databases, caches, object stores, and file systems are in use?
4. **Identify external services**: Which third-party APIs and services does the project depend on?
5. **Identify existing docs**: Is there already an architecture doc? A README architecture section? Design decision records?

**Deliverable**: Architecture inventory listing every component, data store, and external service with what you know about each.

### Phase 2 — Define Responsibility Split

For each component, define:
1. **Who owns it**: Which team or which part of the system is responsible?
2. **What it does**: One paragraph describing its role.
3. **What it does NOT do**: Explicit boundaries — what looks like it belongs here but doesn't?

Format:
```markdown
## Responsibility Split

### Backend API (Python/FastAPI)
**Owns**: Business logic, data validation, database access, authentication, background job scheduling.
**Does NOT own**: UI rendering, static asset serving, email delivery (delegates to SendGrid), file storage (delegates to S3).

### Frontend (Vue 3/Nuxt)
**Owns**: UI rendering, client-side routing, form state, user interaction.
**Does NOT own**: Business logic, data persistence, authorization decisions (follows backend directives).
```

### Phase 3 — Map Data Ownership

For each data entity (from GLOSSARY.md or discovered in code), define:
1. **Which service owns it**: The authoritative source for this data.
2. **Schema location**: Where the schema is defined (model file, migration file).
3. **Access pattern**: How other services read this data (direct DB read? API call? Event subscription?).

Format:
```markdown
| Entity | Owned By | Schema Location | Access Pattern |
|---|---|---|---|
| PurchaseOrder | Backend API | `purchase_order` table (orm/models.py:42) | API only — direct DB access forbidden |
| UserSession | Backend API | Redis, TTL 24h | Backend internal only |
| ProductCatalog | Backend API | `products` table, cached in Redis | API with 5-min cache TTL |
```

### Phase 4 — Draw Data Flow Diagram

Create an ASCII data flow diagram showing how data moves between components. When the target platform supports Mermaid rendering (GitHub, some wikis), optionally add a supplementary Mermaid diagram after the ASCII version.

```ascii
┌──────────────┐     HTTP/REST       ┌──────────────┐
│   Frontend   │ ──────────────────> │   Backend    │
│   (Vue/Nuxt) │ <────────────────── │   (FastAPI)  │
└──────────────┘     JSON/SSE        └──────┬───────┘
                                            │
                   ┌────────────────────────┼────────────────────────┐
                   │                        │                        │
                   ▼                        ▼                        ▼
           ┌──────────────┐       ┌──────────────┐        ┌──────────────┐
           │  PostgreSQL  │       │    Redis     │        │   SendGrid   │
           │  (primary)   │       │   (cache)    │        │   (email)    │
           └──────────────┘       └──────────────┘        └──────────────┘
```

### Phase 5 — Define API Contract Strategy

Document how API contracts are defined, synchronized, and validated:

1. **Contract format**: OpenAPI 3.0, gRPC protobuf, GraphQL schema, JSON Schema?
2. **Source of truth**: Is the backend the contract owner? Is the contract auto-generated from code?
3. **Synchronization**: How are frontend types generated from backend contracts?
4. **Validation**: How is contract drift detected? (e.g., `make api-check`)

Format:
```markdown
## API Contract Strategy

- **Format**: OpenAPI 3.0, auto-generated from FastAPI route decorators
- **Source of truth**: Backend code (route handlers define the contract)
- **Frontend sync**: `make api-sync` runs `openapi-typescript` to generate TypeScript types
- **Drift detection**: `make api-check` compares generated types against committed types
- **Breaking change policy**: New optional fields allowed; field removal requires major version bump
```

### Phase 6 — Define Non-Goals

Explicitly state what is OUT of scope for this architecture document:

```markdown
## Non-Goals

This architecture document does NOT cover:
- Infrastructure provisioning (Terraform, cloud resource management)
- CI/CD pipeline design (see docs/engineering/ci-cd-pipeline.md)
- Mobile app architecture (the mobile team owns their architecture doc)
- Historical migration plans (see docs/research/ for decision records)
- Performance SLAs and SLOs (see docs/engineering/sla.md)
```

---

## Stop Conditions

- **Insufficient codebase knowledge**: If the project is too large to map in one pass, focus on the core data path (one write flow, one read flow) and mark the rest as "to be mapped."
- **Architecture doc already exists and is current**: Audit the existing doc against the 6 sections. Report gaps; don't overwrite.
- **Project has no backend/data layer**: For static sites or simple frontend projects, the architecture doc is minimal — just the responsibility split and data flow.
- **No deployable units identified**: If the project is a monolith with no distinct deployable boundaries, document the single-unit split (app, database, external services) and skip component-boundary detail — the doc still has value as a data-flow and ownership map.

---

## Deliverable

- [ ] Architecture inventory (Phase 1)
- [ ] Responsibility split documented (Phase 2)
- [ ] Data ownership table (Phase 3)
- [ ] ASCII data flow diagram (Phase 4)
- [ ] API contract strategy (Phase 5)
- [ ] Non-goals section (Phase 6)
- [ ] Final `docs/architecture.md` written with all 6 sections

---

## Design Decision Anti-Patterns

| Temptation | Why It's Wrong | Correct Path |
|---|---|---|
| "I'll describe every class and module" | An architecture doc is not a code tour — it's about component boundaries | Describe components and their relationships, not internal module structure |
| "I'll draw the diagram as a Mermaid block" | ASCII diagrams render everywhere (terminal, GitHub, docs); Mermaid requires a renderer | Use ASCII art for the main diagram; optionally add Mermaid as a supplement |
| "I'll skip non-goals — they're obvious" | Without explicit non-goals, scope creeps and readers assume the doc covers everything | List at least 3-5 things the doc explicitly does NOT cover |
| "I'll generate architecture from code structure alone" | Code structure reflects implementation, not intent or boundaries | Infer boundaries from deployable units, not directory structure |
| "The data flow is too complex for ASCII" | If it's too complex to diagram, it's too complex to understand | Simplify to the primary read path and primary write path |
