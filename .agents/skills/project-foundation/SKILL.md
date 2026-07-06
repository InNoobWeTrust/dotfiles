---
name: project-foundation
description: "Bootstrap, evolve, and maintain the full AI-augmented project foundation: AGENTS.md, GLOSSARY.md, .agents/rules/, .agents/skills/, Makefile, docs/architecture.md, quality gates, and CI/CD pipeline skeleton. Load for \"set up a new project\", \"bootstrap AI agent infrastructure\", \"onboard a new project\", \"initialize .agents/\", \"create AGENTS.md\", \"create Makefile\", \"create glossary\", \"update project scaffold\", \"evolve project structure\", or \"audit project foundation\". Skip for adding individual rules/skills to an already-bootstrapped project."
---

# Project Foundation

Bootstrap, evolve, and maintain the full AI-augmented project foundation — the files every project described in the docs as "Phase 1: Foundation" needs, regardless of whether the project is brand new or evolving.

---

## Skill Workflow

This skill has 9 phases. All must be completed in order. For existing projects, phases adapt to what already exists — audit and fill gaps, don't overwrite.

### Phase 1 — Discover Project Context

Before creating anything, gather the facts:

1. **Read existing project files**: Scan `README.md`, `package.json`/`pyproject.toml`/`go.mod`, any existing `docs/`, and source code directories.
2. **Identify**: language stack, framework, database, external services, build system.
3. **Extract domain concepts**: Scan entity models, database schemas, and API route files for 10-15 recurrent nouns.
4. **Note what is missing**: Which of the foundation deliverables already exist?

**Deliverable**: A context summary block:
```
PROJECT CONTEXT
===============
Language/stack  : [e.g., Python/FastAPI + Vue 3/Nuxt]
Database        : [e.g., PostgreSQL via SQLAlchemy]
External services: [e.g., Stripe, SendGrid, AWS S3]
Build system    : [e.g., npm scripts, tox, Makefile]
Domain concepts : [list 10-15 recurring nouns found in entities/models]
Existing files  : [list which foundation files already exist]
```

### Phase 2 — Create AGENTS.md

Create or update `<project-root>/AGENTS.md` with these mandatory sections (adapt content to the discovered context):

1. **First paragraph**: What does this project do? Who uses it? One paragraph.
2. **Source-of-Truth Hierarchy**: Ranked list (1. product requirements → 2. design docs → 3. architecture → 4. existing code → 5. legacy docs).
3. **Project Rules**: Hard constraints — business logic location, data integrity rules, server management prohibitions.
4. **Tooling Rules**: Package manager, build commands, environment isolation.
5. **Agent Operating Rules**: Default skill (`code-craft`), when to load/not load skills, verification protocol.
6. **Code Quality Rules**: Nesting depth ≤ 3, function length ≤ 50, guard clauses, no magic literals, no silent error swallowing.
7. **Source Code Organization**: Map of where each type of code lives (routers, services, models, components, DTOs).
8. **Verification Commands**: Every command the AI should run before declaring work done (`make fix`, `make lint`, `make quality`, `make test`).
9. **Security Rules**: Never commit secrets, `.gitignore` patterns, secret scanning expectation. Run `trufflehog git file://. --only-verified` or `gitleaks detect --source .` before every commit; add them to `make quality` target.

**STOP CONDITION**: If AGENTS.md already exists and is comprehensive, skip creation. If it exists but is incomplete, update it rather than overwriting.

### Phase 3 — Create GLOSSARY.md

Create `<project-root>/GLOSSARY.md` using the bootstrap protocol:

1. Scan entity models, class declarations, and database schemas.
2. Extract 10-15 recurrent domain nouns and concepts.
3. Verify synonyms — check if identical concepts have different names in different files.
4. Detect term drift: cluster terms by concept, flag variants. The most-used name in domain code wins as canonical.
5. Draft the table:

```
| Term | Domain Definition | Backend Reference | Frontend Reference | Prohibited Aliases |
|---|---|---|---|---|
| [CanonicalName] | [What this concept means in the business domain] | [file path + symbol] | [file path + component] | [banned names] |
```

**Rules**: Each row is one canonical domain concept. "Domain Definition" explains business meaning, not code. Prohibited aliases list all alternative names found in the codebase. At least 10 terms for non-trivial projects.

**If GLOSSARY.md already exists**: Add new discovered terms. Update references. Do NOT change existing canonical names unless drift must be resolved.

### Phase 4 — Bootstrap Rules Directory

Create or verify `.agents/rules/` contains these 6 essential files:

1. `code-quality.md` — Design checkpoint, naming conventions, structure limits, prohibited patterns, tech debt markers, refactoring signals.
2. `tdd.md` — Red-Green-Refactor protocol, logic gates, exceptions, evidence requirement.
3. `grooming.md` — Reverse interview (3-5 questions), AFK self-grooming audit.
4. `ubiquitous-language.md` — Glossary protocol: locate → inspect → align → extend. Bootstrap rule pointing to GLOSSARY.md.
5. `slicing.md` — Vertical slicing protocol: decompose → implement → validate → feedback.
6. `skill-compliance.md` — Binding commitment, hard-stop gates, self-check checklist.

If this is a project-level `.agents/` (not the global `~/.agents/`), also create: `handoff.md`, `skills-discovery.md`.

### Phase 5 — Bootstrap Skills Directory

Create or verify `.agents/skills/` contains:

1. `INDEX.md` — Routing table with at minimum: `code-craft`, `systematic-investigation`, `codebase-exploration`, `reviewer`, `requirements-driven-dev`.
2. `WIRING.md` — Composition pathways: Investigation→Fix→Review, Feature Implementation.

For a project-level `.agents/`, these files are references to the global skill set. For a global `~/.agents/`, ensure all skills are in place.

### Phase 6 — Create Makefile

Create `<project-root>/Makefile` with these standard targets, adapted to the discovered stack. Each target is a thin wrapper — maximum 3 lines. Real logic stays in the build system:

```
make help         # Show available commands
make fix          # Auto-fix formatting and safe corrections
make lint         # Fast format + lint + type check
make quality      # Full structural checks + dependency audit
make test         # All tests
make dev          # Start dev servers
make dev-up       # Start infrastructure (databases, queues)
make build        # Production build
```

**Adaptation rules**:
- **Monorepo**: Delegate to subdirectory Makefiles or workspace-level commands.
- **No existing format/lint/test**: Create a target that echoes "not configured yet" — the target exists as a contract.
- **Multiple languages**: Chain commands with `&&`.
- **Python with uv**: Use `uv run` prefixes.
- **JavaScript**: Use the detected package manager (npm/pnpm/yarn/bun).

**If Makefile already exists**: Add missing targets. Never remove existing targets. If a target name conflicts, propose a unified target that subsumes both purposes rather than adding a `:new` variant — conflicting targets signal a process question that needs resolution, not a naming workaround.

### Phase 7 — Create docs/architecture.md

Create `<project-root>/docs/architecture.md` answering:

1. **Responsibility split**: Which component owns what? (Frontend, Backend, Data, Infrastructure).
2. **Data ownership**: Which tables/collections belong to which service?
3. **Data flow**: ASCII diagram showing how data moves between components.
4. **API contract strategy**: OpenAPI, gRPC, GraphQL — how are contracts defined and synchronized?
5. **Integration modes**: When ORM vs raw SQL? When REST vs events?
6. **Non-goals**: What is explicitly OUT of scope?

### Phase 7.5 — Create docs/engineering/quality-gates.md

Create `<project-root>/docs/engineering/quality-gates.md` with:

1. **Command matrix**: Map `make fix` / `make lint` / `make quality` / `make test` to the actual tool commands.
2. **Thresholds**: Per-command pass/fail criteria and timeout values.
3. **Escalation path**: When to widen thresholds, waive checks, or route to human review.
4. **Rollout policy**: How new checks are introduced and enforced (opt-in → warning → blocking).

### Phase 8 — Bootstrap Verification

Run the foundation checklist:

- [ ] `AGENTS.md` exists and has all mandatory sections
- [ ] `GLOSSARY.md` exists with 10+ domain terms, linked from AGENTS.md
- [ ] `rules/` contains all 6 essential rules
- [ ] `skills/INDEX.md` and `WIRING.md` exist
- [ ] `Makefile` exists with all standard targets; `make help` works
- [ ] `docs/architecture.md` exists with all 6 sections
- [ ] `docs/engineering/quality-gates.md` exists (creates if not — command matrix, thresholds, escalation, rollout policy)
- [ ] A new developer could onboard in 30 minutes using these files

---

## Stop Conditions

- **Update mode**: If the user says "update" not "create", apply only the phases for missing/incomplete files.
- **File conflict**: If a file exists and is substantively different from what this skill would create, present the conflict and ask before overwriting.
- **Insufficient domain knowledge**: If the project is too large to map in one pass, focus on the core data path and mark the rest as "to be mapped."

---

## Deliverable

- [ ] Project context summary produced (Phase 1)
- [ ] AGENTS.md created or verified (Phase 2)
- [ ] GLOSSARY.md created or verified (Phase 3)
- [ ] Rules directory bootstrapped (Phase 4)
- [ ] Skills directory bootstrapped (Phase 5)
- [ ] Makefile created or updated (Phase 6)
- [ ] docs/architecture.md created (Phase 7)
- [ ] docs/engineering/quality-gates.md created (Phase 7.5)
- [ ] Foundation verification checklist passed (Phase 8)

---

## Design Decision Anti-Patterns

| Temptation | Why It's Wrong | Correct Path |
|---|---|---|
| "I'll copy the template verbatim without adapting" | Generic content is worse than no content | Adapt every section to the actual stack and domain |
| "GLOSSARY.md can wait — we'll do it later" | Term drift starts immediately; retroactive cleanup is 10x harder | Bootstrap the glossary with at least 10 terms now |
| "I'll put the actual lint configuration in the Makefile" | Makefiles should be thin wrappers, not build logic | Reference the project's native tool |
| "The architecture doc is too high-level to write" | A partial doc is better than none — a newcomer has zero mental model | Write what you can deduce from code, mark unknowns |
| "I'll put todo placeholders in all files" | Placeholder-ridden docs are unusable | Write complete content for every section; mark only genuinely unknown areas |
| "I'll skip dev-up target, the team knows how to start databases" | Assumed knowledge is broken knowledge for newcomers and AI agents | Add the target, even if it's simple |

---

## References

- `code-craft` skill — For code quality implementation beyond foundation bootstrap
- `architecture-writer` skill — For deep architecture doc generation with detailed diagrams
- `devsecops` skill — For CI/CD pipeline design with integrated security scanning
