# Category E: Architectural Failures

#### E1. God Object Growth

**Symptom:** Over 5 AI-assisted tasks, `PurchaseOrderController` grows from 100 lines handling one concern to 500 lines handling orders, pricing, sync status, and export formatting.

**What happens:** The class becomes impossible to test in isolation. Any change risks breaking unrelated functionality. New team members can't understand it.

**Defending rule:** Code Quality Baseline (Prohibited Patterns: Classes owning multiple domain concepts)

#### E2. Implicit Coupling

**Symptom:** Two modules share state through a global variable or rely on specific call ordering that isn't documented.

**What happens:** Changing module A's initialization breaks module B silently. The bug only surfaces in production when a specific sequence of operations occurs.

**Defending rule:** Code Quality Baseline (Prohibited Patterns: Global mutable state without justification) + Refactoring Signal Markers (implicit-coupling)

#### E3. Infinite Migration Churn

**Symptom:** The AI modifies an existing database migration instead of creating a new one, or creates migrations that can't be downgraded.

**What happens:** Database schemas become unrecoverable. Rollback stops working. Data can be lost.

**Defending rule:** Project-specific database migration rules (in AGENTS.md): strict schema reversion protocol, upgrade/downgrade testing requirement.

---
