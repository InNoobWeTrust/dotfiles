# Requirements Lifecycle

Use this reference when the user asks for end-to-end requirements work across PRD, TRD, BDD specs, verification, traceability, or changelog updates, or when the scope is large enough that inline acceptance criteria are not safe.

## Entrypoint Guardrails

- Preserve the user's stated objective and scope before selecting a lifecycle track.
- Start with the lightest flow that can produce testable acceptance criteria.
- Stop when requirements conflict, verification criteria cannot be made concrete, approval is needed, or a git write lacks explicit user approval.

## Workflow

1. Preserve the user's objective, constraints, and explicit success criteria.
2. Identify the smallest required artifact: PRD, TRD, BDD spec, changelog, or verification plan.
3. For multi-step work, establish an Active Milestone Packet; add a roadmap only for multi-milestone delivery.
4. Select the lightest safe track: Quick, Standard, or Deep.
5. Independently select only the formal artifacts justified by the authoritative escalation table in `../../../rules/phased-delivery.md`.
6. Load only the packaged rule and template needed for each selected artifact.
7. If deriving an artifact from an approved parent, read that parent first and preserve only the relevant traceability.
8. Execute only after acceptance criteria are concrete enough to verify.
9. Verify against the selected artifact and report gaps.
10. Stop when scope or verification becomes ambiguous enough that human approval is required.

## Track Selection

| Track | Use When | Minimum Output |
| --- | --- | --- |
| Quick | One small, clear change | Inline acceptance criteria or a selected BDD spec |
| Standard | Moderate feature or multiple components | Active Milestone Packet; independently selected formal artifacts when justified |
| Deep | Platform, security-sensitive, or multi-team work | Active Milestone Packet, roadmap only when multi-milestone, independently selected formal artifacts, and required review gates |

Use `../../../rules/phased-delivery.md` for positive escalation criteria. Never
create a PRD, TRD, or BDD merely for completeness or as an automatic cascade.
