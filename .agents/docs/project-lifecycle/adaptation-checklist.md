# Checklist: Adapting This Guide to Your Project

Use this checklist when bootstrapping a new project or auditing an existing one for AI readiness:

### Foundation (Must Have — ship with this)

- [ ] `AGENTS.md` at repo root with source-of-truth hierarchy, project rules, tooling rules
- [ ] `GLOSSARY.md` with domain terms, code references, and prohibited aliases
- [ ] `.agents/rules/` with code quality baseline, TDD enforcement, grooming protocol, glossary sync, vertical slicing, skill compliance
- [ ] `.agents/skills/INDEX.md` routing table (which skill fits which task)
- [ ] `.agents/skills/WIRING.md` composition pathways (how skills chain together)
- [ ] `docs/architecture.md` with responsibility split and data ownership model
- [ ] `docs/engineering/quality-gates.md` with command matrix and thresholds
- [ ] `Makefile` with fix, lint, quality, test targets
- [ ] CI/CD pipeline with environment separation (pre-merge, dev, prod)
- [ ] Security scanning (secret scanning + dependency audit + SAST at minimum)
- [ ] `.gitignore` covering `.env`, secrets, editor state, caches, build artifacts

### Quality (Should Have — add within first month)

- [ ] Code quality rules enforced via linter configuration (not just documented)
- [ ] Complexity thresholds defined and measured (cyclomatic complexity, max nesting, max statements)
- [ ] TDD enforced for all logic components (parsers, validators, state machines)
- [ ] Pre-implementation design checkpoint required for any new class, function, or module
- [ ] Tech debt marking convention established (`TODO(debt):` format)
- [ ] Refactoring signal convention established (`REFACTOR-SIGNAL:` format)
- [ ] Module README.md requirement enforced (every module directory needs one)

### AI Integration (Should Have — add as team adopts AI tools)

- [ ] Skill loading rules defined (default to `code-craft` for code, skip for formatting)
- [ ] Grooming interview protocol active (3-5 clarifying questions before complex tasks)
- [ ] Memory protocol defined (repo-local short-term + long-term with dream-cycle consolidation)
- [ ] Server management rules (AI agent must not start/stop servers or manipulate processes)
- [ ] Debugging protocol documented (reproduce → inspect → compare → trace → test → fix → verify)

### Management (Add when management asks for visibility)

- [ ] Quality metrics dashboard or report (complexity trends, vulnerability counts, coverage)
- [ ] AI usage tracking (cost per sprint, tasks assisted, velocity impact)
- [ ] Delivery changelogs (per-release summaries in `docs/delivery/changelogs/`)
- [ ] Verification audit trails (test run results, quality gate output in `docs/delivery/verification/`)
- [ ] Cost tracking for AI providers, infrastructure, and tooling

### Evolution (Plan for the next quarter)

- [ ] Phase 2 maturity items defined and prioritized
- [ ] Skill effectiveness review cadence set (quarterly)
- [ ] Quality gate tightening schedule (when do warnings become errors?)
- [ ] New team member onboarding timeline documented and tested
- [ ] Monthly failure pattern review established (what AI mistakes recurred, what rules would prevent them)

---
