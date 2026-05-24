---
name: requirements-driven-dev
description: "PRD, TRD, BDD specs, acceptance criteria, user stories, traceability, and changelog workflows. Use when the user requests requirements, product specs, technical design documents, architecture planning, behavior scenarios, scope definition, or a large ambiguous feature plan. Activate on \"write a PRD\", \"define requirements\", \"acceptance criteria\", \"user stories\", \"feature spec\", or any task needing formal specification before implementation."
---

# Requirements-Driven Dev

Requirements-driven development is an opt-in workflow for turning product intent into verifiable delivery. Do not use it for small, well-scoped code/config/docs edits unless the user asks for specs or the task becomes ambiguous.

## Route First

| Signal | Action |
| --- | --- |
| User asks for PRD, product requirements, or feature definition | Load `references/rules/prd.md` and `references/templates/prd.md` |
| User asks for TRD, technical design, or architecture | Load `references/rules/trd.md` and `references/templates/trd.md` |
| User asks for BDD, behavior specs, scenarios, or acceptance criteria | Load `references/rules/bdd.md` and `references/templates/behavior-spec.md` |
| User asks for full lifecycle | Load `references/core/lifecycle.md` and follow it |
| User asks for changelog or traceability | Load `references/rules/changelog.md` and `references/templates/changelog-entry.md` |
| User asks for requirements-driven execution or commit guidance | Load `references/rules/execution.md` or `references/rules/commit.md` as needed |

## Full-Lifecycle Flow

1. **Grooming Interview (Gate 0)**: Before writing any specs, load `rules/grooming.md`. If standard/deep, ask the user 3-5 clarifying questions to align on the Design Concept. Do not proceed until aligned.
2. Identify the smallest required artifact: PRD, TRD, BDD spec, changelog, or verification plan.
3. Select the lightest safe track: Quick, Standard, or Deep.
4. Load only the packaged rule and template needed for the current artifact.
5. **Vertical Slicing**: When defining architecture (TRD) or planning execution checklists (`task.md`), load `rules/slicing.md` and decompose requirements into end-to-end vertical slices.
6. If deriving a child artifact, read the approved parent first.
7. Preserve parent-child traceability across PRD -> TRD -> BDD -> changelog.
8. Execute only after acceptance criteria are concrete enough to verify.
9. Verify against the selected artifact and report gaps.
10. Stop when requirements conflict, verification cannot be made concrete, approval is needed, or a git write lacks explicit approval.

## Default Flow

1. **Groom Interview**: Load `rules/grooming.md` and clarify Design Concept boundaries if ambiguous.
2. Identify the smallest required artifact: PRD, TRD, BDD spec, changelog, or verification plan.
3. Load only the rule/template for that artifact.
4. **Vertical Slicing**: Decompose the task checklist into vertical slices using `rules/slicing.md`.
5. Preserve parent-child traceability when a parent artifact exists.
6. Execute only after requirements are clear enough for verification.
7. Verify against the selected artifact and report gaps.

## Scale

| Track | Use When | Required Artifacts |
| --- | --- | --- |
| Quick | One small, clear change | Inline acceptance criteria or one BDD spec |
| Standard | Moderate feature or multiple components | PRD or brief, TRD if architecture matters, BDD specs |
| Deep | Platform, security-sensitive, or multi-team work | Full PRD -> TRD -> BDD cascade plus review gates |

Escalate only when ambiguity, risk, or scope demands it.

## Review And Safety

- Request an adversarial-lens review for challenge gates on PRDs, TRDs, BDD specs, or risky decisions.
- Request a security-lens review when requirements touch auth, secrets, data handling, infrastructure, or supply chain.
- Request an edge-case-lens review for validators, parsers, state machines, concurrency, or complex branching.
- Request an editorial-lens review when stakeholder-facing requirements need structure or prose polish.
- Use changelogs for scoped requirements workflows, not for every routine edit.
- Commit only when the user explicitly approves git writes and project git-safety rules are satisfied.

## References

- Lifecycle entrypoint: `references/core/lifecycle.md`
- PRD rule/template: `references/rules/prd.md`, `references/templates/prd.md`
- TRD rule/template: `references/rules/trd.md`, `references/templates/trd.md`
- BDD rule/template: `references/rules/bdd.md`, `references/templates/behavior-spec.md`
- Verification template: `references/templates/verification-spec.md`
- Changelog rule/template: `references/rules/changelog.md`, `references/templates/changelog-entry.md`
- Execution rule: `references/rules/execution.md`
- Commit rule: `references/rules/commit.md`
- Configuration: `references/rules/config.md`
- Project context: `references/rules/project-context.md`
- Review gates: request adversarial-, security-, edge-case-, or editorial-lens review as needed

## Tool Integration

This skill is self-contained. Use packaged files under `references/` for methodology, templates, lifecycle orchestration, and project-context guidance; request review lenses when additional challenge is needed.
