# Project Onboarding: First Week

### Document Map

A newcomer should understand the documentation landscape by end of week 1. Structure should follow a clear purpose:

```
docs/
├── {product-name}-requirements.md  ← Product north star (WHAT to build)
├── architecture.md                 ← System design (HOW it's built)
├── design/                         ← Interaction and visual standards
│   ├── DESIGN.md                   ← Visual design principles
│   └── UX-GUIDELINES.md            ← User experience standards
├── engineering/                    ← Engineering process and standards
│   ├── quality-gates.md            ← Quality thresholds and command matrix
│   ├── local-dev.md                ← Local environment setup instructions
│   └── ai-augmented-*.md           ← AI workflow documentation (this guide)
├── product/                        ← Product requirement documents
├── delivery/                       ← Delivery artifacts
│   ├── specs/                      ← Feature specifications (BDD-style)
│   ├── verification/               ← Audit reports and verification results
│   └── changelogs/                 ← Per-release delivery changelogs
├── research/                       ← Ad-hoc investigations and decision records
└── requirements/                   ← Raw notes, feedback, source material
```

Key principle: **keep raw notes and source material in `requirements/`.** Keep refined, canonical specs in `docs/`. Nothing in `docs/` should be a "draft" — if it's there, it's the team's agreed-upon truth.

### Understanding the Architecture

Every project needs a `docs/architecture.md` that answers these questions:

1. **Responsibility split** — Who owns what? (Frontend, Backend, Data Engineering, Infrastructure)
2. **Data ownership** — Which tables/collections belong to which team or service?
3. **Data flow** — How does data move between components? Draw a simple ASCII diagram.
4. **API contract strategy** — How are contracts defined and synchronized? (OpenAPI, gRPC, GraphQL schema)
5. **Integration modes** — When do you use ORM vs raw queries? When do you use REST vs events?
6. **Non-goals** — What is explicitly OUT of scope for this architecture document?

### Understanding the CI/CD Pipeline

Every team member should be able to answer:

- **When does each pipeline stage run?** (On MR? On push to main? On tag?)
- **What changes trigger which stages?** (Only backend changes trigger backend build? Only docs changes skip the full pipeline?)
- **How are deployments gated?** (Manual approval? Automated tests? Canary rollouts?)
- **What happens when a pipeline fails?** (Rollback? Diagnostic collection? Alerting?)

The CI/CD pipeline file (GitLab CI, GitHub Actions, Jenkins) should be readable enough that a newcomer can trace the flow from commit to deployment without asking anyone.

### Understanding the Quality Gates

Every project needs a `docs/engineering/quality-gates.md` that defines:

1. **Command matrix** — What commands run what checks, and when to run them
2. **Thresholds** — Complexity limits, max function length, max nesting depth
3. **Escalation rules** — Which failures are blockers vs warnings
4. **Rollout policy** — If warnings exist in legacy code, how are they being paid down?

A typical quality gate model uses two layers:

- **Inner-loop checks** (`make fix`, `make lint`) — Fast, run after every edit
- **Quality gates** (`make quality`) — Slower, structural + dependency validation, run before merge

### Understanding the Security Posture

A newcomer should be able to answer:

- **What scanners run?** — Secret scanning, SAST, dependency auditing, IaC scanning
- **How are secrets managed?** — Never in code, always in environment vars or a secret manager
- **What files are in .gitignore?** — .env files, credentials, editor state, build artifacts
- **What's the incident response process?** — Who to contact, where logs live, how to rollback

---
