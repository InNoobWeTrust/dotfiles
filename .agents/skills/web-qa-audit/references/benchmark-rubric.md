# Benchmark Rubric

Use this rubric to score the maturity of a `web-qa-audit` setup.

---

## Scoring

Score each dimension 0–3:
- 0 absent
- 1 partial
- 2 solid but incomplete
- 3 explicit and operational

Maximum: 18

---

## Dimensions

### Audit Readiness
Does the setup define sanctioned targets, startup, auth, fixtures, and stop conditions?

### Scenario Quality
Are reusable scenarios explicit enough for audit and materialization?

### Evidence Quality
Do findings require browser/viewport/artifact context and pass/fail/unverified status?

### Materialization Readiness
Can stable scenarios be promoted into durable automation with explicit rationale?

### Safety and Boundaries
Are secrets, sessions, test-only endpoints, and unsafe targets handled explicitly?

### Operational Clarity
Can an agent run or plan the QA flow without inventing core workflow?

---

## Verdict Bands

| Score | Meaning |
|---|---|
| 16–18 | Strong operational QA contract |
| 12–15 | Good foundation, still missing one surface |
| 8–11 | Conceptual but not operational |
| 0–7 | Mostly theory |
