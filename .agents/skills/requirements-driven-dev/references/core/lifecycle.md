# Requirements Lifecycle

Use this reference when the user asks for end-to-end requirements work across PRD, TRD, BDD specs, verification, traceability, or changelog updates, or when the scope is large enough that inline acceptance criteria are not safe.

## Entrypoint Guardrails

- Preserve the user's stated objective and scope before selecting a lifecycle track.
- Start with the lightest flow that can produce testable acceptance criteria.
- Stop when requirements conflict, verification criteria cannot be made concrete, approval is needed, or a git write lacks explicit user approval.

## Workflow

1. Preserve the user's objective, constraints, and explicit success criteria.
2. Identify the smallest required artifact: PRD, TRD, BDD spec, changelog, or verification plan.
3. Select the lightest safe track: Quick, Standard, or Deep.
4. Load only the packaged rule and template needed for the current artifact.
5. If deriving a child artifact, read the approved parent first.
6. Preserve parent-child traceability across PRD -> TRD -> BDD -> changelog.
7. Execute only after acceptance criteria are concrete enough to verify.
8. Verify against the selected artifact and report gaps.
9. Stop when scope or verification becomes ambiguous enough that human approval is required.

## Track Selection

| Track | Use When | Minimum Output |
| --- | --- | --- |
| Quick | One small, clear change | Inline acceptance criteria or one BDD spec |
| Standard | Moderate feature or multiple components | PRD or brief, TRD if architecture matters, BDD specs |
| Deep | Platform, security-sensitive, or multi-team work | Full PRD -> TRD -> BDD cascade plus review gates |

Escalate only when ambiguity, risk, or scope demands it.
