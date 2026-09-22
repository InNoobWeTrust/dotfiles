# Project Delivery & Governance Memory

Canonical project governance policies, delivery contracts, and planning protocols for this repository.

## 1. Phased Delivery & Delivery Contracts
- **Canonical Source**: `rules/phased-delivery.md` is the sole canonical source for delivery lifecycle, compromise schema, trajectory decisions, and the Delivery Contract.
- **Active Milestone Packet**: Multi-step delivery requires an Active Milestone Packet; a roadmap is required only for multi-milestone initiatives.
- **Delivery Contract before Delegation**: Before delegating work, establish a bounded Delivery Contract specifying: outcome, Must Ship, May Defer, Never Defer, verification evidence, review/change budgets, finding classification, and stop/trajectory behavior.
- **Closed-Scope Protection (Never Defer Gate)**: Only an evidence-backed Never Defer issue reopens closed scope. Non-blocking issues must be deferred to a named future milestone rather than creeping into current work.

## 2. Specification & Review Scope Governance
- **Independent Specification Selection**: PRD, TRD, BDD, and ADR artifacts are independently selected based on risk/evidence, explicit user request, or regulatory/coordination need; they never form an automatic mandatory cascade.
- **Review Scope Ownership**: Review findings do not automatically expand scope. Reviewers classify findings; the orchestrator owns scope. Content and governance work receives one bounded review and one targeted recheck after permitted corrections.

## 3. Layered Planning Protocol
- **Three Planning Depths**:
  - **L0 (Strategic Outline)**: Discovery and numbered top-level sections with goal statements only (no functional units or implementation details).
  - **L1 (Section Decomposition)**: Expand a targeted section into sub-headings flagged `[ATOMIC]` or `[NEEDS L2]`.
  - **L2 (Atomic Unit Specification)**: Fully specified dispatchable units with contracts, exact writable surface, and acceptance criteria.
- **Shared Plan File State**: The plan file acts as shared persistent state across architect-orchestrator loops. Context is strictly scoped to the targeted section per L1/L2 call.
- **SSOT**: Detailed planning dispatch mechanics live in `subagent-dispatch` SKILL.md while `build.md` routes to it with concise pointers.

## 4. Rapid-Demo Profile Boundaries
- When using the rapid-demo profile in `project-foundation`, strictly enforce local-first, synthetic-only data, no production credentials or PII, explicit opt-in hosting, and mandatory "DEMO ONLY — NOT PRODUCTION READY" labelling.
