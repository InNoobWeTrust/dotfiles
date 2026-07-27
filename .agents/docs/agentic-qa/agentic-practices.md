# Rising Agentic Practices

Agents do not invent quality. They change **who drafts, who runs, and how fast feedback returns** — on top of the pre-agentic foundation.

---

## 1. What actually changed

| Pre-agentic | Agentic addition |
|---|---|
| Humans write most tests | Agents draft tests, scenarios, fixtures — humans own acceptance |
| Fixed scripts run in CI | Agents run ad-hoc audits and exploratory passes with evidence |
| Static test plans | Agents adapt paths when UI shifts (within guardrails) |
| Manual exploratory charters | Agents expand charters, still need human risk framing |
| Feedback sensors = CI jobs | Feedback sensors also sit *inside* the coding loop (lint/type/test as auto-correct) |

Thoughtworks Technology Radar (Vol. 34 themes, 2026) frames the same idea as **coding agent harnesses**: feedforward (skills, specs) + feedback (deterministic gates). Agentic QA is the quality half of that harness — not a separate religion.

---

## 2. Pattern catalog (rising practices)

### A. Feedback sensors in the coding loop

Deterministic tools (compiler, linter, typechecker, unit suite, mutation testing) run after agent edits so failures trigger self-correction *before* human review.

**Inherits:** pyramid base, shift-left.  
**Risk:** agents "fix" tests by weakening assertions.

### B. Evaluator–optimizer loops

One agent (or skill) **optimizes** (implements); another **evaluates** against a predeclared rubric (PASS / FAIL / UNVERIFIED). Rubric is fixed before seeing the artifact.

**Inherits:** independent test design, definition of done.  
**Risk:** same context self-reviews (author bias).

### C. Heuristic black-box review

Outside-in judgment of user-visible behavior from PRs, screenshots, acceptance criteria — without claiming live execution.

**Inherits:** exploratory and usability review.  
**Risk:** confident prose without evidence grades.

### D. Evidence-backed spot checks and browser audits

Bounded runs with run cards: target, auth, fixtures, scenarios, expected outcomes, artifact capture.

**Inherits:** smoke tests, session-based test management.  
**Risk:** treating a happy-path demo as full regression.

### E. Scenario design → materialization

Stable, high-value journeys become durable Playwright/Cypress/Selenium (or API) tests with explicit promotion rationale.

**Inherits:** risk-based automation selection.  
**Risk:** materializing everything the agent touched once.

### F. Contract and property drafting

Agents propose consumer contracts, property tests, or fuzz seeds; humans and CI own the oracle.

**Inherits:** CDC, property-based testing, fuzzing.  
**Risk:** hallucinated API shapes that never matched production.

### G. Stakeholder projection

Machine evidence (YAML/MD/JUnit) projects to Excel / PDF / HTML for non-eng audiences under sanitization and count-consistency gates.

**Inherits:** classic eng vs business report split.  
**Risk:** pretty decks that map unverified → pass.

### H. Multi-persona / adversarial QA

Separate agents (or lenses) attack assumptions: security, a11y, edge cases, adversarial misuse.

**Inherits:** independent QA, red team, peer review.  
**Risk:** checklist theater without severity synthesis.

Deeper patterns and failure modes: [details/agentic-patterns.md](./details/agentic-patterns.md).

---

## 3. What agents are good at (honest list)

- Expanding scenario variants once a charter exists
- Driving repetitive browser paths and capturing traces
- Drafting first-pass tests from acceptance criteria
- Summarizing failures with repro steps
- Running local gates and iterating on RED/GREEN
- Translating machine evidence into audience-shaped narratives *after* gates pass

---

## 4. What agents are bad at (honest list)

- Owning risk appetite or release decisions
- Inventing correct business rules under ambiguity
- Guaranteeing non-flaky automation without env discipline
- Self-grading without independent criteria (author bias)
- Replacing lower-level tests with more E2E
- Staying safe with broad permissions (prompt injection, data exfil — "lethal trifecta" class risks)

---

## 5. Composition that respects the foundation

Recommended loop (conceptual — not a product pitch):

```
1. Declare risk + rubric (human / lead)
2. Prefer lower-layer evidence first (unit, contract, API)
3. Evaluative review → decide if live evidence is needed
4. Orchestrate a bounded audit (scenarios + evidence contract)
5. Mechanics execute under sanctioned env only
6. Grade pass/fail/unverified honestly
7. Promote only stable, high-ROI paths to durable automation
8. High-level fail → add lower-level regression before "done"
```

---

## 6. Relationship to Part 2 quality tooling

| Part 2 layer | Agentic QA touch |
|---|---|
| Format / lint / type | Feedback sensors in coding loop |
| Tests / coverage | Generation + repair under TDD rules |
| SAST / secrets / SCA | Agents may run tools; humans triage policy |
| Governance dashboards | Stakeholder projections must not become the system of record |

Agentic QA **extends** the test & evidence story; it does not replace Sonar, Semgrep, or dependency policy.
