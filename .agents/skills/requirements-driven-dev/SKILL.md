---
name: requirements-driven-dev
description: "Use this skill when the user needs formal specifications before implementation — PRDs, TRDs, BDD scenarios, acceptance criteria, user stories, or scope definitions. Activate when the task is large and ambiguous enough that jumping straight to code would be risky, or when the user explicitly asks for requirements, specs, or feature planning."
---

# Requirements-Driven Dev

Requirements-driven development is an opt-in workflow for turning product intent into verifiable delivery. Do not use it for small, well-scoped code/config/docs edits unless the user asks for specs or the task becomes ambiguous. For multi-step delivery, the lightweight default is an Active Milestone Packet; add a roadmap only for multi-milestone work. Use the cross-skill contract at `../../rules/phased-delivery.md` as the lifecycle source of truth rather than reproducing it here.

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

1. **Grooming Interview (Gate 0)**: Before writing formal specs, load `rules/grooming.md`. If standard/deep, ask the user 3-5 clarifying questions to align on the Design Concept. Do not proceed until aligned.
2. For multi-step work, establish or update the Active Milestone Packet required by `../../rules/phased-delivery.md`; add or update the roadmap only when delivery has multiple milestones, and keep only the current milestone operationally detailed.
3. Identify the smallest required artifact: inline acceptance criteria/slice card, PRD, milestone architecture note/TRD, BDD spec, changelog, or verification plan.
4. Select the lightest safe track: Quick, Standard, or Deep.
5. Load only the packaged rule and template needed for the current artifact.
6. **Vertical Slicing**: When defining architecture (TRD) or planning execution checklists (`task.md`), load `rules/slicing.md` and decompose requirements into end-to-end vertical slices.
7. If deriving a formal child artifact, read its approved parent first. Formal traceability is optional unless regulation or coordinated delivery requires it.
8. Execute only after the active milestone's acceptance criteria are concrete enough to verify.
9. Verify against the selected artifact and report gaps.
10. Stop when requirements conflict, verification cannot be made concrete, approval is needed, or a git write lacks explicit approval.

## Default Flow

1. **Groom Interview**: Load `rules/grooming.md` and clarify Design Concept boundaries if ambiguous.
2. For multi-step work, use an Active Milestone Packet as the minimum delivery shape; add a roadmap only for multi-milestone work, and follow `../../rules/phased-delivery.md` for lifecycle details.
3. Start with the smallest artifact that makes the current slice verifiable: inline acceptance criteria or a slice card.
4. Load a formal rule/template only when the canonical escalation table in `../../rules/phased-delivery.md` calls for it.
5. **Vertical Slicing**: Decompose the task checklist into vertical slices using `rules/slicing.md`.
6. Preserve parent-child traceability only when a formal parent exists or coordinated/regulatory delivery requires it.
7. Execute only after requirements are clear enough for verification.
8. Verify against the selected artifact and report gaps.

## Scale

| Track | Use When | Required Artifacts |
| --- | --- | --- |
| Quick | Clear change or one independently shippable slice | Inline acceptance criteria or a slice card in the active milestone packet; no formal artifact by default |
| Standard | Moderate milestone, multiple components, or a material boundary/decision | Active Milestone Packet; roadmap only for multiple milestones; milestone architecture note and independently selected formal artifacts when justified |
| Deep | Platform, security-sensitive, regulated, high-risk migration, or multi-team work | Active Milestone Packet; roadmap only for multiple milestones; independently selected formal artifacts and review gates where coordination/risk requires them |

Escalate only when ambiguity, risk, or scope demands it—not to make the documentation set look complete.

### Formal-Artifact Escalation

Use the authoritative positive escalation criteria and operational minimums in
`../../rules/phased-delivery.md`. Do not select PRD, TRD, or BDD solely for
completeness, template availability, or because another formal artifact exists.
When escalation is unnecessary, record the decision in the Active Milestone
Packet rather than creating speculative artifacts.

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
- Cross-skill lifecycle and milestone-packet contract: `../../rules/phased-delivery.md`
- Review gates: request adversarial-, security-, edge-case-, or editorial-lens review as needed

## Tool Integration

This skill is self-contained. Use packaged files under `references/` for methodology, templates, lifecycle orchestration, and project-context guidance; request review lenses when additional challenge is needed.
