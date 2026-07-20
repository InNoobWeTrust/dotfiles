# Evolving the Project Over Time

### Phase-Based Maturity Model

Projects mature through predictable phases. Here's what to aim for at each stage:

### Phase 1: Foundation (Ship with this)

- AGENTS.md with source-of-truth hierarchy
- GLOSSARY.md with domain terminology
- Quality gates with defined thresholds
- CI/CD pipeline with environment separation
- Full skill catalog for common task types
- Architecture document with responsibility split and data ownership
- Makefile with standard command set
- Security scanning (secret scanning + dependency audit + SAST)

### Phase 2: Intelligence (Add as the project grows)

- Test coverage reporting integrated into CI
- Quality warnings graduated to hard-fail
- Complexity hotspots in legacy code resolved
- Dependency audit alerts automated (Dependabot, Renovate, or similar)
- AI usage dashboard (cost, tasks assisted, velocity)
- Performance budgets (page load, API response time)

### Phase 3: Optimization (Long-term vision)

- Predictive quality: automated suggestions for structural improvements
- Cross-project knowledge sharing: patterns that transfer between projects
- Skill effectiveness metrics: which skills produce the fewest review findings
- Self-healing pipelines: CI/CD that detects and rolls back on quality regression

### Adding New Skills to the Project

**When to add a project-specific skill:**
1. A pattern repeats across 3+ tasks in this project
2. The pattern has project-specific context (templates, URLs, data shapes)
3. The skill would reduce prompt engineering overhead

**When NOT to add a project-specific skill:**
1. The general version already covers it
2. The task is one-off
3. The skill would duplicate existing documentation

**Examples of project-specific skills that justify their existence:**
- A CI/CD template skill containing actual Helm charts, pipeline configs, and infrastructure conventions
- An E2E testing skill containing page object models, data seeding patterns, and selectors for your specific UI

### Evolving Quality Gates

Quality gates get stricter over time. The progression:

1. **Start permissive.** Warnings are visible but not blocking. This lets the team see the baseline.
2. **Pay down debt opportunistically.** Every time touched code is edited, leave it better. "No new warnings in touched code" means debt decreases naturally.
3. **Graduate to hard blocks.** When the warning backlog is low enough, switch from advisory to blocking.
4. **Enforce in CI.** Once the team has adjusted, wire the quality gate as a required CI check.

**Never weaken thresholds.** If a threshold is flagging healthy code, the threshold is wrong — fix the threshold, not the code.

### Adding New Team Members

Onboarding timeline for new engineers in an AI-augmented project:

1. **Day 1:** Read AGENTS.md and GLOSSARY.md. Walk through the setup commands. Verify the dev environment works.
2. **Week 1:** Make a first change following the quality gates. An existing team member reviews using the `reviewer` skill.
3. **Week 2:** Own a vertical slice end-to-end using the full skill workflow (requirements → exploration → code-craft → reviewer).
4. **Month 1:** Contribute to `.agents/` — either adding a project-specific skill or improving an existing rule based on their experience.

### When AI Output Quality Declines

If the AI starts producing lower-quality output, check these in order:

1. **Is AGENTS.md clear enough?** The AI can only follow rules it can read. Ambiguous rules produce ambiguous output. Rewrite rules that leave room for interpretation.
2. **Was the right skill loaded?** Check INDEX.md. Using the wrong skill for a task is inefficient; using no skill for a complex task is dangerous.
3. **Was the task scoped properly?** "Add feature X" is too broad. "Add feature X following pattern Y with acceptance criteria Z, storing data in module M" is actionable.
4. **Were quality gates run?** If the AI didn't run the quality commands, it didn't verify its work. Require verification output.
5. **Is there a memory gap?** If the AI lost context mid-task, write short-term memory entries more frequently and run the dream cycle before commits so long-term memory stays current.

---
