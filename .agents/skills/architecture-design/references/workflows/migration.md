# Migration Planning

## When
Triggered when planning monolith-to-microservices decomposition, cloud platform
migration or database engine migration. Use an authorized recovery-safe plan with
explicit availability requirements, not a universal zero-downtime commitment.
Root engineering docs must affirmatively enable backward compatibility with scope;
otherwise it is OFF (unavailable evidence is unknown). Coexistence, dual running,
shims, soak windows and incremental cutover below are conditional techniques for
that opted-in scope or an actual availability requirement, not mandatory phases
for every migration. Approved offline replacement can be appropriate; data-loss,
security, recovery and destructive-operation approval gates still apply. Research
and obtain human stack approval before designing any migration machinery.

---

## Phase 1 — Target Architecture Definition
```mermaid
flowchart LR
    A[Monolith] -->|Strangler Fig| B[Target Microservices]
    A -->|Re-platform| C[Cloud Native]
```
**Do:**
- Evaluate migration patterns (Strangler Fig, Database-per-service, Re-platform vs Re-architect).
- Define target state architecture, success criteria, and non-negotiable NFRs.
**Ask:**
- What are the hard deadlines, legacy constraints, or compliance drivers for migration?

---

## Phase 2 — Domain Boundary Decoupling
```mermaid
flowchart LR
    M[Monolith DB] -->|CDC / Outbox| E[Event Bus] --> S[Target Service DB]
```
**Do:**
- Map bounded contexts and define clear data ownership boundaries.
- Implement Change Data Capture (CDC) or Transactional Outbox pattern for event emission.
**Ask:**
- Which domain boundaries have clean separation with low direct database dependencies?

---

## Phase 3 — Coexistence & Dual-Running
```mermaid
sequenceDiagram
    Client->>Gateway: Request
    Gateway->>Legacy: Primary Processing
    Gateway-->>Target: Shadow Traffic / Dual-Write
```
**Do:**
- Configure feature flags, shadow traffic mirroring, and dual-writing logic.
- Set up continuous automated data reconciliation to detect divergence.
**Ask:**
- How will data divergence between legacy and target systems be flagged and repaired?

---

## Phase 4 — Cutover Execution
```mermaid
flowchart LR
    G[API Gateway] -->|Shift % Traffic| N[Target System]
    G -.->|Auto Rollback| L[Legacy System]
```
**Do:**
- Execute progressive traffic shifting via API Gateway or DNS routing.
- Continuously monitor latency, error rates, and p95/p99 SLO metrics during cutover.
**Ask:**
- What specific error or performance threshold automatically triggers an instant rollback?

---

## Phase 5 — Decommissioning
```mermaid
flowchart LR
    L[Legacy System] -->|Soak Period| S[Shutdown] --> C[Remove Shims & Flags]
```
**Do:**
- Shut down legacy components after a successful stability soak period.
- Remove migration shims, temporary feature flags, and proxy redirect layers.
**Ask:**
- Have all downstream consumers successfully shifted off legacy migration shims?

---

## Deliverables
- [ ] Target architecture blueprint & pattern ADRs
- [ ] Bounded context definitions & CDC event schemas
- [ ] Dual-running proxy/reconciliation only where the approved availability or root compatibility contract requires it
- [ ] Traffic cutover runbook & automated rollback plan
- [ ] Scope boundary with contracts settled proportionately to consumer/handoff need, and cleanup noted
- [ ] Cutover implementation phases proportionate to delegation need (separate phase files only for independently delegated or resumable units, otherwise inline sequence)
- [ ] Legacy decommissioning sign-off & cleanup verification

## Pitfalls
| Temptation | Mitigation |
|---|---|
| Unplanned cutover | Choose authorized offline or staged cutover from availability, recovery and root-opted-in compatibility requirements |
| Shared monolithic DB | Enforce database-per-service via CDC and event streaming |
| No rollback strategy | Define automated rollback criteria before shifting traffic |
| No data reconciliation | Implement continuous background diff tooling during dual-run |

## Approvers
Migration Lead, Data Engineering Lead, SRE, Product Stakeholders
