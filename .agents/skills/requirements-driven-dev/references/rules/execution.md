# AI Execution Rules

## Core Principles

1. **Acceptance-Driven**: Produce only what the selected acceptance contract defines: inline acceptance criteria, a BDD spec, TRD, or PRD as independently selected under `.agents/rules/phased-delivery.md`, explicitly requested, or required for regulation/coordination. Path placeholders resolve inside the host project, not inside the shared agent or skill repository. Consult related formal artifacts only when they exist and are relevant; if the contract remains unclear, ask.
2. **Context-Aware**: Before starting, look for guidance in the host project in this order:
   - **Primary**: `project-context.md`
   - **Fallback**: project instruction files such as `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, or equivalent tool-specific guidance
   - If the sources conflict, follow the higher-priority source above
   - Use the selected guidance to determine paths, technology choices, naming, testing, and workflow conventions
3. **Defensive by Default**: All deliverables must handle errors and edge cases gracefully.
4. **Single Responsibility**: One artifact = one concern. No monoliths.
5. **Minimal Diff**: Make the smallest change that satisfies the spec. Don't refactor unrelated areas.
6. **Readable > Clever**: Prefer clarity over cleverness. Work product is read 10x more than written.

## Organization

- Follow existing project structure and conventions
- Place new artifacts in locations consistent with the project's established layout

## Quality Gates

Before presenting deliverables to human:
- [ ] Deliverables address every applicable acceptance scenario in the selected contract
- [ ] No hardcoded secrets, credentials, or sensitive data
- [ ] Error handling covers all known failure modes
- [ ] Complex areas have clear documentation explaining "why"
- [ ] Deliverables follow the project's established conventions

## What AI Must NOT Do

- **Never** commit directly without human approval — the human owns the final decision on what enters the project
- **Never** delete artifacts without explicit instruction — deletions are irreversible and high-risk
- **Never** modify sensitive configurations without warning — unintended changes can cascade
- **Never** introduce new dependencies or tools without declaring them — hidden dependencies create maintenance burden
- **Never** produce deliverables outside the selected acceptance contract — scope discipline prevents drift
