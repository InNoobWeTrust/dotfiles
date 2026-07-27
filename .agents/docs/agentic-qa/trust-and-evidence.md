# Trust and Evidence

**Do not trust agentic QA skills — or agents — blindly.** Trust the *system*: rubrics, environments, independent evaluation, and honest grades.

---

## 1. Why blind trust fails

Agents are optimized to produce coherent narratives. Coherence is not correctness.

Typical failure modes:

| Failure | What it looks like | Corrective |
|---|---|---|
| **Author bias** | Same agent that built the feature "QA's" it green | Delegate evaluation; separate contexts |
| **Unverified → pass** | Blocked login still reported as success | Hard ban; fail-closed projection gates |
| **Selector theater** | Test asserts on implementation details | User-facing queries; behavior oracles |
| **Env lies** | Shared staging pollution, prod data | Sanctioned targets, fixtures, seed policy |
| **Coverage cosplay** | Huge E2E generated overnight | Pyramid discipline; promote sparingly |
| **Assertion weakening** | Agent "fixes" failing tests by deleting expects | Review test diffs as carefully as prod diffs |
| **Report laundering** | Excel becomes source of truth | Machine record canonical; packs are projections |
| **Permission hunger** | Broad browser + secrets + external send | Least privilege; sanctioned scopes only |

---

## 2. Evidence contract (minimum)

Every executable QA claim should record:

1. **Target** (URL/env id) and **sanction** (allowed to touch?)
2. **Scenario id** and **expectation** stated before the run
3. **Outcome:** pass | fail | unverified | blocked
4. **Context:** browser, viewport, locale, account role (non-secret)
5. **Artifacts:** paths to screenshots/traces/logs (with sensitivity flags)
6. **Evidence grade** if heuristic-only
7. **Stop reason** if incomplete

Without (1)–(3), the claim is storytelling.

Leaf: [details/evidence-contracts.md](./details/evidence-contracts.md).

---

## 3. Independence rules

1. **Rubric before artifact** — write pass criteria before judging.
2. **Author cannot be sole evaluator** for non-trivial work.
3. **Deterministic sensors beat model opinion** for machine-checkable facts.
4. **Human owns release** — agents advise with evidence; they do not sign production risk alone.
5. **Disconfirming tests first** — try to break the claim, then accept it.

These mirror classical independent QA and modern "evaluator–optimizer" research practice.

---

## 4. What "skill maturity" would mean

A skill or playbook is not mature because it has many markdown files. Score operational reality:

| Dimension | Immature | Stronger |
|---|---|---|
| Audit readiness | Invents auth/fixtures | Sanctioned targets, stop conditions |
| Scenario quality | One-off clicks | Reusable scenarios with oracles |
| Evidence quality | Prose only | Graded outcomes + artifacts |
| Materialization | Everything becomes E2E | Explicit promote/skip rationale |
| Safety | Touches prod freely | Boundaries, secrets, test endpoints |
| Clarity | Operator invents workflow | Runnable without heroics |
| Stakeholder packs | Optional pretty slides | Projection gates; eng-only skips ceremony |

Use scores to drive investment — not marketing.

---

## 5. Relationship to this repository

Skills such as `reviewer` (black-box-qa lens), `web-qa-audit`, and browser automation skills **illustrate** parts of this model. They are:

- useful drafts for experiments
- **not** industry certification
- **not** a substitute for your team's pyramid, CI, and risk policy

See [local-materialization.md](./local-materialization.md).
