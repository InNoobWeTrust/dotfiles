# Pre-Agentic Foundation

Agentic QA only works if it inherits decades of automation practice. This entry is the foundation report — what the industry already learned *before* coding agents could drive browsers.

---

## 1. Why automation existed

Manual click protocols do not scale with continuous delivery. Automation exists to:

- shorten feedback from days to minutes
- make large refactors survivable
- encode regression memory so teams do not re-learn every bug

That motivation is unchanged in the agent era. Agents increase *throughput of change*, so the need for automation only rises.

---

## 2. Portfolio balance (pyramid and friends)

**Test pyramid** (Mike Cohn; popularized and refined by Fowler / Vocke):

- many unit tests
- some service / API / integration tests
- few UI / end-to-end tests

**Why few high-level tests?** They are slower, more brittle, more non-deterministic, and harder to diagnose. Fowler: high-level failure should drive a *new lower-level test* that keeps the bug dead.

**Ice-cream cone anti-pattern:** almost everything through the GUI; almost nothing at unit/API. Common when record-playback tools dominate or when "QA owns automation" is separated from development.

**Testing trophy** (Kent C. Dodds, after Rauch's "mostly integration"): for frontend ownership, static analysis + integration that resembles user behavior often beats isolated unit thrashing. Guiding principle:

> The more your tests resemble the way your software is used, the more confidence they can give you.

**Practical synthesis for mixed stacks:**

| Concern | Prefer |
|---|---|
| Pure logic | Unit / property / mutation-adjacent |
| Boundaries (DB, HTTP, files) | Narrow integration + contract tests |
| Multi-service contracts | Consumer-driven contracts (e.g. Pact-style) |
| Critical user journeys | Thin E2E / UI layer |
| UX uncertainty | Exploratory testing (human or agent-assisted), not only scripts |

Deeper catalog: [details/pre-agentic-catalog.md](./details/pre-agentic-catalog.md).

---

## 3. Shift-left and continuous testing

**Shift-left** means moving detection earlier: design reviews, unit tests, static analysis, contract tests in PR — not only UAT at the end.

**Continuous testing** means tests run in the pipeline on every change, with quarantine for flaky tests so the suite stays trusted.

Both are preconditions for agentic work. An agent that only "tests" at the end of a long unguarded generation session is shift-*right* with better marketing.

---

## 4. What good automation already required

Industry hard-won rules (still binding on agents):

| Rule | Why |
|---|---|
| **Test behavior, not implementation details** | Implementation-tied tests break on every refactor |
| **Stable selectors / user-facing queries** | CSS/XPath brittleness killed early Selenium suites |
| **Deterministic environments** | Shared staging + live data → flaky hell |
| **Explicit fixtures and auth** | Hidden state makes green meaningless |
| **Quarantine flaky tests** | Flakes destroy trust faster than missing coverage |
| **Page objects / screenplay / component models** | Abstractions reduce duplication *when used carefully* |
| **Avoid pure record-playback as the suite** | Generates unmaintainable scripts (Fowler: almost always a bad idea as the primary strategy) |
| **Separate checking from exploring** | Automation checks known expectations; exploration finds unknowns |
| **Traceability to risk** | Priority by business risk, not by "easy to automate" |

---

## 5. Exploratory testing was never optional

Even mature pyramid shops keep **chartered exploratory sessions**: time-boxed, mission-driven investigation by skilled testers. Scripts cannot invent every path.

Agentic QA's best use cases often sit *here* — accelerating exploration and evidence capture — not replacing the pyramid base.

---

## 6. Reporting and stakeholders (pre-agentic)

Classic practice already split:

- **Machine / eng record:** JUnit XML, Allure, cucumber reports, CI logs
- **Business / release narrative:** go/no-go, risk summary, known issues

Excel and PDF were *projections*, not sources of truth. That discipline must survive agent-generated stakeholder packs.

---

## 7. What this foundation demands of any agentic approach

Any agent-assisted QA system that claims maturity must still answer:

1. Where does each check live on the cost/confidence curve?
2. What is the environment and data contract?
3. How are flakes handled?
4. What becomes a durable CI test vs a one-off audit?
5. How does a high-level failure create a lower-level regression test?
6. Who owns the pass/fail rubric — the agent or the team?

If it cannot answer those, it is not "modern QA." It is demo automation.
