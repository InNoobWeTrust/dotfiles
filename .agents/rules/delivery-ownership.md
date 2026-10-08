---
description: "Selects decision ownership for authorized delivery: autonomous by default, collaborative or approval-gated on request; preserves scope, safety, resource bounds, and final human acceptance."
globs: "*"
alwaysApply: false
trigger: model_decision
---

# Delivery Ownership

Apply to requests to **build, fix, deliver, or iterate to completion**. Research-only requests and active exploratory dialogue do not authorize implementation. This rule defines who decides; domain skills still define how to design, implement, and verify.

## Choose the operating mode before work

| Mode | Decisions and communication |
|---|---|
| **Autonomous delivery — default** | The primary owns research, design choices, implementation, integration, and release readiness inside the authorized outcome and boundaries. Record useful decisions in product documentation; deliver an inspectable result for human user acceptance. No routine intermediate approval. |
| **Collaborative** | Explore product/design choices with the user, then execute agreed work. Keep live dialogue in the primary thread. |
| **Approval-gated / HITL** | Pause at the upfront agreed checkpoints or after each iteration, as requested. |

Honor an explicit mode, including “don't ask until complete” or “ask before each change.” Otherwise state the default and relevant boundaries briefly, then proceed; do not create a ritual mode-confirmation question. Ask upfront only if missing outcome, authority, or safety constraints prevent useful safe work. A later request for dialogue changes the mode for affected work.

**Autonomous** describes decision ownership; **AFK** describes unattended execution. AFK additionally needs verified isolation, resumable state, bounded jobs, and reliable stop/cleanup. Neither is an extra grant of permissions.

## Establish the contract proportionately

Capture the requested outcome, must-ship behavior, non-goals, acceptance observations, writable scope, compatibility constraints, authorized services/spending, execution environment, resource bounds, and stop conditions. Use existing task context for small work; use the domain's task/plan artifacts when needed. Product goals can be clear even when technical choices are not yet known.

- Distinguish **fixed user requirements** from **agent-owned choices**. Research and decide the latter; do not send the user a questionnaire of implementation details.
- Infer ordinary reversible details from the request, repository conventions, common user expectations, and evidence. Record consequential assumptions and how to validate them. Do not invent consent, a business goal, sensitive-data permissions, or a new scope.
- When investigation reveals a contract defect, stop the affected implementer, not necessarily the whole delivery. The primary may revise and reapprove the plan/contracts inside its delegated authority before redispatch. Version the decision and rerun affected checks.
- Keep acceptance tied to the outcome. Never remove a failed requirement, weaken a safety check, or declare an inconvenient scenario N/A merely to obtain a pass.

## Approval authority

In autonomous delivery, the primary may approve agent-owned architecture, consumer contracts/stubs, implementation plans, and ordinary UX/failure semantics **before implementation**. Record the authority source, decision, evidence, and validation; “AFK assumed approved” is not approval. Workers cannot invent new contracts or expand their writable surface.

Existing instructions to obtain contract/plan sign-off refer to this authorized owner, **unless they explicitly reserve the action to a human**. User-mandated approvals, organizational/regulatory approvals, tool permissions, Git approvals, test-persistence rules, and safety gates are not delegated by this rule.

For rewrites, classify old semantics/interfaces as preserve or delete. An explicit user instruction to replace a workflow supplies authority for that stated change, not unrelated deletions. The primary may decide unpublished implementation details within scope; breaking an existing published/public compatibility promise or affecting external consumers still requires explicit user authorization. Where compatibility intent is consequential and unknown, preserve the current contract while researching or pause only that boundary; never automatically add shims.

## Research and own the decision

Use repository evidence plus current authoritative documentation where needed. Compare realistic options, maintenance/operational costs, safety, and user-facing consequences; run bounded experiments when authorized. Record sources and relevant versions for consequential technology choices. Scale depth to uncertainty and impact, not a fixed browsing quota. More research is useful only when it could change a decision or its confidence.

Delegate independently checkable research, implementation slices, and evaluation through `../skills/subagent-dispatch/`. The primary remains accountable for resolving conflicts and integration. A model label or a majority vote is not evidence.

## Bounds are not arbitrary completion deadlines

- No default **total iteration count or total elapsed-time cap**. Continue useful, safe work until the release gate passes or a real stop condition occurs. User-specified total limits remain binding.
- Individual commands, workers, services, and concurrent workloads still need enforceable limits, suitable isolation, cancellation/watchdogs, and cleanup under `autonomy-safety.md` and `execution-safety.md`.
- Provider quotas, authorized costs, disk capacity, context limits, and available tools remain real constraints. No total cap does not authorize unlimited spending, new paid services, a higher resource budget, or bypassing permissions.
- Repeated failure triggers diagnosis and a changed approach, not an automatic question after N turns. Stop an unchanged failing loop; resume only with a supported alternative inside scope. If no safe useful path remains, return the checkpoint and exact blocker.

## Release from the user's perspective

Declare the release rubric before evaluating. A complete product is not merely a green build or reviewers agreeing with the author.

For substantial features, use independent reviewers with distinct user-relevant perspectives: first-use/onboarding and everyday UX; failure/recovery and operations; applicable safety/compatibility/accessibility. Select only relevant lenses and bounded assignments, not an indiscriminate panel. For small changes, a focused independent check may suffice.

Require observable evidence of the primary journey, important failure paths, integration/E2E behavior, and usable instructions. A review says PASS, FAIL, or UNVERIFIED against the rubric, with supporting evidence. Missing required evidence is not a pass; neither a vote nor subjective approval can waive a required machine check. Fix evidenced blockers; avoid endless cosmetic review cycles. If reviewers are unavailable, state the limitation and do not claim independently reviewed readiness.

“Ready for user acceptance” means agent-owned checks are complete. The **user alone** supplies final user acceptance. Their feedback starts another scoped loop; do not reinterpret your own PASS as their approval. Delivery is a local artifact/handoff, not authorization to publish, deploy, commit, or push.

## Communication and stopping

Keep user-facing usage, design decisions, constraints, and verification summaries in the product's `docs/` or existing guides. Store execution plans, raw logs, checkpoints, and agent consensus in the task/memory area, not consumer documentation. Small utilities can use a README and concise handoff rather than a new docs tree.

Interrupt only for a genuine authority/safety boundary, a user-only fact needed to choose the outcome, or an exhausted safe path. First finish independent safe work where possible. Report the affected work, evidence, checkpoint, recommendation, and minimal necessary question. Never conceal a blocker in docs while implying success; do not silently run forever when progress is impossible.

At handoff, provide what is ready, how to use and judge it, proof and remaining limitations, and a short path to deeper explanation. Do not expose raw worker transcripts or internal chain-of-thought.
