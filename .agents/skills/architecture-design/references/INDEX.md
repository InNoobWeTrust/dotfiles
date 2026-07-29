# Architecture Design References

Master index for all reference material. Load only what the current workflow needs.

## Workflows

| Scenario | File | When |
|---|---|---|
| Greenfield design | `workflows/greenfield.md` | New system, no existing architecture |
| Brownfield documentation | `workflows/brownfield.md` | Existing system, missing/outdated docs |
| Architecture audit | `workflows/architecture-audit.md` | Review existing system, fitness check |
| ADR writing | `workflows/adr-writing.md` | Record a significant decision |
| Migration planning | `workflows/migration.md` | Monolith→micro, cloud, DB migration |
| System integration | `workflows/integration.md` | Connecting two systems |
| Security architecture | `workflows/security-review.md` | Threat model, compliance |
| Performance redesign | `workflows/performance-redesign.md` | Scaling, latency |
| API design | `workflows/api-design.md` | Contract-first, versioning |
| Data architecture | `workflows/data-architecture.md` | Modeling, pipelines, governance |

## Patterns

Searchable catalog: `patterns/INDEX.md` → category files with mermaid diagrams.

## Visualization

C4 mermaid templates: `visualization/c4-mermaid-templates.md`

## Analysis

ATAM, fitness functions, anti-patterns: `analysis/fitness-functions.md`

## ADR Templates

Nygard + MADR templates, lifecycle: `adr-templates.md`
