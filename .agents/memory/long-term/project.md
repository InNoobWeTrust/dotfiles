# Project Memory

## Facts

## Decisions
- phased_delivery_canonical_source :: rules/phased-delivery.md is the sole canonical source for lifecycle, compromise schema, formal-artifact escalation, trajectory decisions, and Delivery Contract.
- milestone_packet_requirement :: Multi-step delivery requires an Active Milestone Packet; a roadmap is required only for multi-milestone delivery.
- specification_artifact_independent_selection :: PRD, TRD, BDD, and ADR artifacts are independently selected by evidence/risk, explicit request, or regulation/coordination; they never form an automatic cascade.
- delivery_contract_bounded_delegation :: Before delegation, define a bounded Delivery Contract specifying outcome, Must Ship, May Defer, Never Defer, evidence, review/change budgets, finding classification, and stop/trajectory behavior.
- review_scope_governance :: Review findings do not expand scope automatically; reviewers classify while orchestrator owns scope, with governance work receiving one bounded review and one targeted recheck.
- rapid_demo_profile_architecture :: Rapid-demo profile uses a thin conditional matrix and Demo Receipt/graduation boundary, deferring CLI automation until manual stability is proven.
- layered_planning_depth_levels :: Planning uses three explicit depth levels: L0 (strategic outline with goal statements only), L1 (section decomposition with [ATOMIC]/[NEEDS L2] flags), and L2 (atomic unit specification with full acceptance criteria).
- layered_planning_orchestration_protocol :: Orchestrator drives depth selection without skipping levels, context is strictly scoped to the targeted section per L1/L2 call, and the plan file acts as shared state across invocations.
- planning_dispatch_ssot :: Detailed planning dispatch mechanics live in subagent-dispatch SKILL.md while autonomous.md routes to it with concise pointers.

## Constraints
- scope_reopen_never_defer_gate :: Only an evidence-backed Never Defer issue reopens closed scope; non-blocking work must be deferred to a named future milestone.
- rapid_demo_boundary_constraints :: Rapid-demo profile strictly enforces local-first, synthetic-only data, no production credentials/PII, explicit opt-in hosting, and "DEMO ONLY — NOT PRODUCTION READY" labelling; SST is cloud-assisted, not default.

## Open Questions
