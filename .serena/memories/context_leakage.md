---
kind: working-note
topic: context-leakage
status: follow-up
created: 2026-10-08
updated: 2026-10-08
tags: [context-boundaries, reader-context, portability, account-access]
---

# Context Leakage — User Correction and Follow-up

## Observed failure

Temporary conversation, harness, account, catalog, and research context was promoted into persistent guidance with a broader audience. Concrete deployment-specific agent routes also leaked into reusable skill references. The user reports encountering this pattern repeatedly across almost every model; that frequency is user-reported, not measured.

In this session, the user requested removal of the deployment-specific model-routing report from the reusable model-benchmarking skill. The report and its incoming links were removed. Do not recreate it inside skills as a workaround.

## Artifact boundaries

The clarified diagnosis is an audience-and-context boundary failure: writing for a conversation participant rather than the artifact's intended reader. It includes both contamination (unneeded or wrongly scoped context included) and missing necessary context (definitions, rationale, or constraints assumed from the chat). Even the requester may not understand the first draft. The correction is not to include everything or make everything generic, but to supply exactly the context the reader needs for the artifact's purpose.

- Agent profiles hold execution configuration and concise selection descriptions: purpose, model capabilities, meaningful effort trade-offs, and applicable constraints. A current harness observation or unfinished investigation is not a permanent model limitation.
- Shared skills describe reusable methods and independently selected working principles, not this deployment's concrete agent-mode catalog or account entitlements.
- Session observations and account-specific corrections belong in scoped memory or evidence, with their source and uncertainty explicit; they must not silently become universal instructions.
- Preserve genuine provider data-use constraints, opaque upstream identity caveats, and native permissions. Portability does not justify removing safety facts or inventing model equivalence.
- Before persisting a claim, ask whether it belongs to the artifact's intended audience and scope. Distinguish provider identity from harness implementation details, and model facts from temporary inspection state.

## Account-access correction

The user reports having an older annual GitHub Pro subscription whose model entitlements are not covered by the current public documentation. Do not infer this account's lack of access from a retirement table or an absent local catalog entry. If the user can still use a model, do not label their route retired, legacy, or unusable on that basis.

This is a user-reported account correction, not a verified subscription-plan mapping or a successful model invocation observed by the assistant. Public lifecycle documentation and account-specific usability are separate evidence. No paid access probe is implied or authorized.

## Correction and remaining follow-up

- The user authorized a proportionate reader/context boundary in existing shared guidance, plus a human-facing lesson record. Establish audience, purpose, assumed knowledge, and accessible references before writing; check the draft without chat history. No new skill or mandatory specification is needed.
- Description cleanup removed harness-origin prose, catalog snapshots, and research-status disclaimers while preserving legitimate capability, identity, and data-policy cautions. The changes were committed with the portable routing work.
- Reconcile older routing memories with the approved separation of model routes and working-principle identities before relying on conflicting historical instructions. No bulk memory rewrite or new enforcement rule is authorized by this capture.
- Model-training versus setup causation remains untested. Cross-harness repetition does not separate those causes when models and guidance are shared; a draft-only comparison is a proposed follow-up, not an executed benchmark.

The initial capture followed a description-only check; later user authorization permitted cleanup and the reader-boundary correction. Human-facing lessons are in [Lessons from agent-guidance failures](../../.agents/docs/skills-and-rules/agent-guidance-lessons.md). This note does not claim an independent audit, runtime validation, or proven behavioral improvement.
