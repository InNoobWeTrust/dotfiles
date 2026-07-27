# Mental Model: Agentic QA / QC

Internalize this before naming a skill, a Playwright suite, or a "AI tester" product.

---

## 1. Three roles (do not collapse them)

| Role | Question it answers | Human analog |
|---|---|---|
| **Evaluative review** | Is this risky / wrong / incomplete? Do we need live evidence? | Senior QA or tech lead reviewing a PR |
| **QA orchestration** | What scenarios, run cards, and evidence contracts produce a defensible result? | QA engineer designing a test plan |
| **Tool / browser control** | Click, type, wait, screenshot, trace — *mechanics only* | Automation runner / device lab |

**Law:** judgment ≠ orchestration ≠ mechanics.

- Review without evidence is opinion.
- Mechanics without a contract is demo-ware.
- Orchestration without review criteria invents success.

---

## 2. Layers of QA work (orthogonal to Part 2's quality layers)

Part 2's layers (format → SAST → governance) answer *code and supply-chain risk*.

These layers answer *behavior and release risk*:

| Layer | Pre-agentic home | Agentic leverage |
|---|---|---|
| **Static confidence** | Linters, types, unit tests | Agent runs gates and self-corrects (feedback sensors) |
| **Integration confidence** | API / service / contract tests | Agent drafts contracts; humans own truth |
| **User-visible confidence** | E2E, a11y, visual, exploratory | Agent executes journeys with evidence contracts |
| **Release confidence** | Smoke, regression packs, sign-off | Agent projects machine evidence to stakeholders |
| **Learning loop** | Bug → unit test; flaky quarantine | Agent proposes materialization; humans promote |

---

## 3. Confidence portfolio (not one shape)

Industry never agreed on one diagram — and that is fine:

- **Test pyramid** (Cohn / Fowler): many fast low-level tests; few slow broad ones.
- **Testing trophy** (Dodds / Rauch line): for UI-heavy code, invest more in integration that *resembles use*.
- **Honeycomb / microservice shapes**: more integration at service boundaries.

**Shared truth across shapes:**

1. Different granularities of tests.
2. Higher level → fewer tests (because cost and brittleness rise).
3. High-level failure implies a missing lower-level test — fix the gap, don't only patch E2E.
4. ROI = confidence per unit of time, not coverage theater.

Agents change *who writes and runs* some layers. They do not repeal cost curves.

---

## 4. Evidence grades (the non-negotiable vocabulary)

| Grade | Meaning | Allowed in green report? |
|---|---|---|
| **pass** | Observed outcome matches explicit expectation under declared environment | Yes |
| **fail** | Observed outcome contradicts expectation | No — block or track |
| **unverified** | Could not run, blocked, ambiguous, or environment invalid | **Never** as pass |
| **blocked** | Prerequisite failed (auth, fixture, target down) | No — surface as risk |

Optional refinement: **evidence_grade** (strong / weak / heuristic) when screenshots alone are insufficient.

---

## 5. Two clocks

| Clock | Goal | Typical agents help |
|---|---|---|
| **Inner loop** | Dev/agent self-correct before PR | Run unit/integration, fix, re-run |
| **Outer loop** | Release / stakeholder trust | Spot checks, smoke, audit packs, sign-off projections |

Part 2's inner vs governance loops still apply. Agentic QA mostly accelerates *both* — and invents new failure modes when they mix (e.g. stakeholder PDF as source of truth).

---

## 6. Promotion ladder (exploratory → durable)

```
heuristic review
  → spot check with evidence
    → structured browser audit
      → scenario pack
        → materialize durable automation
          → CI gate / release pack
```

Each step costs more and demands more stability. **Do not escalate by default.**

Deep leaves: [pre-agentic catalog](./details/pre-agentic-catalog.md) · [agentic patterns](./details/agentic-patterns.md) · [evidence contracts](./details/evidence-contracts.md)
