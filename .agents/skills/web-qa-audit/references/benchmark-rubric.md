# Benchmark Rubric

Use this rubric to score the maturity of a `web-qa-audit` setup.

---

## Scoring model (split)

### Core operational QA (always scored)

Score each core dimension 0–3:

- 0 absent
- 1 partial
- 2 solid but incomplete
- 3 explicit and operational

**Core maximum: 18**

Core dimensions:

1. **Audit Readiness** — sanctioned targets, startup, auth, fixtures, stop conditions
2. **Scenario Quality** — reusable scenarios explicit enough for audit and materialization
3. **Evidence Quality** — browser/viewport/artifact context + pass/fail/unverified (+ evidence_grade)
4. **Materialization Readiness** — promote stable scenarios into durable automation with rationale
5. **Safety and Boundaries** — secrets, sessions, test-only endpoints, unsafe targets
6. **Operational Clarity** — agent can run/plan without inventing core workflow

### Optional stakeholder extension (only if non-dev delivery is in scope)

Score 0–3:

7. **Stakeholder Reporting** — machine evidence projects to Excel / PDF / static HTML **without** replacing YAML/MD as source of truth; projection gates (sanitize, sensitive, provenance, count consistency); audience-branched dispatch (eng-only does not pay pack ceremony)

**Stakeholder bonus maximum: +3**

**Combined maximum when stakeholder delivery is in scope: 21**

Eng-only setups are **not** penalized for skipping stakeholder delivery. Report scores as:

```text
Core: 16/18 — Strong operational QA contract
Stakeholder: N/A (eng-only) | 2/3 — …
```

---

## Core verdict bands (use Core score only)

| Core score | Meaning |
|---|---|
| 16–18 | Strong operational QA contract |
| 12–15 | Good foundation, still missing one surface |
| 8–11 | Conceptual but not operational |
| 0–7 | Mostly theory |

## Stakeholder extension bands (bonus only)

| Bonus | Meaning |
|---|---|
| 3 | Projection gates + audience branch + real/interim-honest formats operational |
| 2 | Pack contracts exist; gates or branching incomplete |
| 1 | Docs only / aspirational |
| 0 / N/A | Not in scope (eng-only is N/A, not zero-punish) |

Combined label when bonus applies:

| Core + bonus | Meaning |
|---|---|
| Core ≥16 and bonus 3 | Strong operational QA **including** stakeholder delivery |
| Core ≥12 and bonus ≥1 | Foundation plus partial stakeholder surface |
| Otherwise | Use core band; note stakeholder separately |
