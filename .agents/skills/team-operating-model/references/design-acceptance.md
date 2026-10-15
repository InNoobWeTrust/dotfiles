# Design Acceptance

## Trigger and inputs

Use before implementing a material cross-component design: changed responsibility or dependency direction, adapter/core boundaries, shared contracts, orchestration, or state ownership. Applies to primary-authored and delegated designs alike. Mechanical edits and implementation under a still-current reviewed design need no new design review. Use the existing plan/phase or inline atomic-patch context; no extra plan object is required.

Give a separate capable reviewer the original outcome/constraints, proposed dependency and call flow, affected consumer/manifest sources, contract revision and realistic simpler alternative. Use `reviewer` design-rigor/pragmatic-triage; follow `subagent-dispatch` independence/provider-family requirements for design output. The designer cannot supply their own independent receipt. Missing required review blocks affected implementation, not unrelated safe work.

## Questions and receipt

The reviewer challenges the whole flow, not merely whether each module works:

- Which layer owns policy, orchestration and state? Do dependencies point toward reusable capabilities rather than another consumer/application?
- Does reuse accidentally import an application's configuration, provider, deployment or lifecycle graph? Check compile-time dependencies separately from runtime initialization.
- Are shared capabilities in an appropriate existing module/package, with a new package justified only when needed? Avoid both application-to-application coupling and reflexive crate/service proliferation.
- Do actual consumer contracts match the design, including error/retry paths? What does the simpler alternative lose?

Record in existing task context: design revision, author/reviewer identities, sources examined, challenged alternatives, evidenced findings and their disposition, and primary's approval or remaining blocker. A vote or reviewer PASS is not a substitute for the primary examining the evidence. Audit allegations still need the existing findings-skeptic procedure; do not recurse indefinitely through reviewers' receipts.

The primary resolves in-scope findings before dispatch. A documented compromise must explain its effect on the requested outcome, not silently redefine it. Requirements/authority conflicts return to the user; ordinary in-scope choices remain primary-owned. Changed material contracts or dependency direction invalidate the affected receipt and dependent checks, not all unrelated work.

Coordination ownership is not architectural immunity. Any contributor may raise an evidenced responsibility, dependency or contract defect and stop affected work, including under a primary-approved contract. Preserve the objection and evidence; resolve contested material design findings through the independent challenge, recording the correction or evidence-based rebuttal before resuming. Primary approval alone cannot close an objection. This grants neither unilateral rewrite authority nor a unanimity requirement; unresolved requirements/authority conflicts remain user-owned.

## Integration acceptance

Compare the implemented manifest/import graph and representative caller→adapter→core flow against the reviewed design, including untouched consumers. Use source tracing or existing dependency tooling within authorized execution bounds; record the source/check and result. Runtime tests prove behavior, not dependency independence. Perform relevant runtime checks as well; neither replaces the other. Missing boundary evidence is UNVERIFIED, not a clean architecture claim.

A receipt covers only the question, revision and sources actually examined. A cycle check or a PASS for removing one application dependency cannot approve responsibility placement it did not assess. Report build/runtime results, dependency-boundary results and design acceptance separately; never widen a scoped PASS during synthesis.

Example: a standalone protocol adapter may run without messaging credentials yet still depend on the messaging application library. Runtime smoke passes do not settle that design. The review must examine manifest direction and shared-analysis placement before approving the adapter boundary.

## Prototype check

At the next 1–2 material design handoffs, check whether the reviewer actually inspected consumers/dependencies, whether findings changed the plan, and whether integration verified the agreed direction. Source compliance alone does not establish improved design outcomes.
