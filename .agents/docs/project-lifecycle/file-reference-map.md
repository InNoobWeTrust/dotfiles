# File Reference Map

| File | What It Contains | Who Maintains It |
|---|---|---|
| `AGENTS.md` | Agent instructions, project rules, tooling commands, debugging protocol | Engineering lead |
| `GLOSSARY.md` | Domain terminology, code references, prohibited aliases | Engineering lead + domain experts |
| `.agents/rules/INDEX` | Rules map: trigger per policy, load on fire | Engineering lead |
| `.agents/rules/authority.md` | Decision ownership, consequence-first safety, resource bounds, informed alignment | Engineering lead |
| `.agents/rules/evidence.md` | Self-grounded verification, tool-call outcome checks, anti-gaslight circuit breaker | Engineering lead |
| `.agents/rules/skill-use.md` | Index-first discovery, activation vs. inspection, binding workflow execution | Engineering lead |
| `.agents/rules/execution-safety.md` | Pre-execution gate, sandbox routing, secrets, long-running processes | Engineering lead |
| `.agents/rules/git-safety.md` | Staging, committing, pushing, destructive git operations | Engineering lead |
| `.agents/rules/code-quality.md` | Reuse-first baseline, design principles, test persistence boundary, ubiquitous language | Engineering lead |
| `.agents/rules/document-formats.md` | Typst/PDF default, Markdown exceptions | Engineering lead |
| `.agents/skills/code-craft/references/testing.md` | Acceptance behavior (including spec-only examples), evidence, testing strategies, context isolation | Engineering lead |
| `.agents/skills/code-craft/references/implementation-essentials.md` | Implementation contracts, errors, types and verification | Implementer |
| `.agents/skills/code-maintainability/SKILL.md` and local `references/` | Report-only assessment; later approved refinement | Separate assessor or approved refiner |
| `.agents/skills/working-principles/references/planning.md` | Lightweight discovery, primary planning and tactical planning | Engineering lead |
| `.agents/skills/brainstorming/SKILL.md` | Product intent, outcomes and product briefs, including settled direction | Engineering lead |
| `.agents/skills/architecture-design/SKILL.md` | Technical constraints, trade-offs and optional technical specification | Engineering lead |
| `.agents/skills/team-operating-model/references/phased-delivery.md` | Proportionate phased delivery, usable directly for solo work | Engineering lead |
| `.agents/skills/team-operating-model/references/slicing.md` | Vertical slicing, usable directly for solo work | Engineering lead |
| `.agents/skills/INDEX` | Skill routing table with cost and applicability columns | Engineering lead |
| `.agents/skills/WIRING` | Skill composition pathways and skill-to-skill transitions | Engineering lead |
| `.agents/skills/memory-techniques/` | Two-tier memory skill: short-term entries, long-term consolidation, dream cycle, eviction protocol, progressive-disclosure structuring | Engineering lead |
| `.agents/docs/quality-tooling/fleet-benchmarks.csv` | Per-agent model evidence behind fleet routing: scores, prices, provenance, retirement reasons | Engineering lead |
| `docs/architecture.md` | System design, responsibility split, data ownership model | Engineering lead |
| `docs/engineering/quality-gates.md` | Quality thresholds, command matrix, escalation rules | Engineering lead |
| `docs/skills-and-rules/INDEX.md` | How to design skills and rules, failure pattern catalog | Engineering lead |
| CI/CD pipeline file | Pipeline triggers, stages, environment separation | DevOps |
| `Makefile` | Standard command entry point for all automation | Engineering lead |
| `.editorconfig` | Cross-editor formatting rules (line endings, indentation) | Engineering lead |
| `.gitattributes` | Git line ending normalization per file type | Engineering lead |
| `.gitignore` | Files excluded from version control | Engineering lead |
