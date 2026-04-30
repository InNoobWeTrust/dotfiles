---
name: requirements-driven-dev
description: Requirements workflow for PRDs, TRDs, BDD specs, acceptance criteria, traceability, and changelogs. Use when the user explicitly requests requirements, specs, architecture planning, behavior scenarios, or a large ambiguous feature plan.
---

# Requirements-Driven Dev

Requirements-driven development is an opt-in workflow for turning product intent into verifiable delivery. Do not use it for small, well-scoped code/config/docs edits unless the user asks for specs or the task becomes ambiguous.

## Route First

| Signal | Action |
| --- | --- |
| User asks for PRD, product requirements, or feature definition | Load `references/rules/prd.md` and `references/templates/prd.md` |
| User asks for TRD, technical design, or architecture | Load `references/rules/trd.md` and `references/templates/trd.md` |
| User asks for BDD, behavior specs, scenarios, or acceptance criteria | Load `references/rules/bdd.md` and `references/templates/behavior-spec.md` |
| User asks for full lifecycle | Use the full-lifecycle flow in this skill |
| User asks for changelog or traceability | Load `references/rules/changelog.md` and `references/templates/changelog-entry.md` |
| User asks for requirements-driven execution or commit guidance | Load `references/rules/execution.md` or `references/rules/commit.md` as needed |

## Full-Lifecycle Flow

1. Identify the smallest required artifact: PRD, TRD, BDD spec, changelog, or verification plan.
2. Select the lightest safe track: Quick, Standard, or Deep.
3. Load only the packaged rule and template needed for the current artifact.
4. If deriving a child artifact, read the approved parent first.
5. Preserve parent-child traceability across PRD -> TRD -> BDD -> changelog.
6. Execute only after acceptance criteria are concrete enough to verify.
7. Verify against the selected artifact and report gaps.
8. Stop when requirements conflict, verification cannot be made concrete, approval is needed, or a git write lacks explicit approval.

## Default Flow

1. Identify the smallest required artifact: PRD, TRD, BDD spec, changelog, or verification plan.
2. Load only the rule/template for that artifact.
3. Preserve parent-child traceability when a parent artifact exists.
4. Execute only after requirements are clear enough for verification.
5. Verify against the selected artifact and report gaps.

## Scale

| Track | Use When | Required Artifacts |
| --- | --- | --- |
| Quick | One small, clear change | Inline acceptance criteria or one BDD spec |
| Standard | Moderate feature or multiple components | PRD or brief, TRD if architecture matters, BDD specs |
| Deep | Platform, security-sensitive, or multi-team work | Full PRD -> TRD -> BDD cascade plus review gates |

Escalate only when ambiguity, risk, or scope demands it.

## Review And Safety

- Use `adversarial-reviewer` for challenge gates on PRDs, TRDs, BDD specs, or risky decisions.
- Add `security-reviewer` when requirements touch auth, secrets, data handling, infrastructure, or supply chain.
- Add `edge-case-hunter` for validators, parsers, state machines, concurrency, or complex branching.
- Add `editorial-reviewer` when stakeholder-facing requirements need structure or prose polish.
- Use changelogs for scoped requirements workflows, not for every routine edit.
- Commit only when the user explicitly approves git writes and project git-safety rules are satisfied.

## References

- PRD rule/template: `references/rules/prd.md`, `references/templates/prd.md`
- TRD rule/template: `references/rules/trd.md`, `references/templates/trd.md`
- BDD rule/template: `references/rules/bdd.md`, `references/templates/behavior-spec.md`
- Verification template: `references/templates/verification-spec.md`
- Changelog rule/template: `references/rules/changelog.md`, `references/templates/changelog-entry.md`
- Execution rule: `references/rules/execution.md`
- Commit rule: `references/rules/commit.md`
- Configuration: `references/rules/config.md`
- Project context: `references/rules/project-context.md`
- Adversarial protocol: `references/core/adversarial-protocol.md`

## Tool Integration

This skill is self-contained. Use packaged files under `references/` for methodology, templates, and project-context guidance; use other reviewer skills by name for review gates.
