# Pre-Agentic Catalog (Deep Leaf)

Reference notes for the foundation era. Prefer primary sources when teaching; this leaf is a compressed map.

---

## Shapes and metaphors

| Shape | Core claim | Watch-outs |
|---|---|---|
| **Test pyramid** (Cohn; Fowler bliki; Vocke practical article) | Many unit, some service, few UI/E2E | Name debates; still useful cost curve |
| **Ice-cream cone** | Inverted portfolio: mostly UI | Often from record-playback + siloed QA |
| **Testing trophy** (Dodds) | Static + integration ROI for UI codebases | Definitions of "unit/integration" vary |
| **Honeycomb** (often microservice-oriented) | Emphasize integrated service tests | Not a free pass to skip unit logic tests |

Fowler reminder: end-to-end, UI, and customer-facing tests are **orthogonal** axes — do not conflate them.

---

## Test types (practical buckets)

| Type | Typical question | Cost / brittleness |
|---|---|---|
| Unit (solitary/sociable) | Does this unit behave? | Low / low |
| Narrow integration | Does this boundary serialize correctly? | Med / med |
| Contract (incl. CDC) | Do provider and consumer still agree? | Med / low–med if automated well |
| API / subcutaneous | Does the service layer honor business cases? | Med / med |
| UI component | Does the view behave in isolation? | Low–med / med |
| E2E / broad stack | Does the journey work in a real(ish) stack? | High / high |
| Visual / a11y / perf budgets | Does the experience meet non-functional bars? | Med–high / med |
| Exploratory / charter | What unknowns exist? | Human time / n/a (not a green gate) |
| Chaos / resilience | How does the system fail? | High / specialized |

---

## Automation engineering practices that survived

- **Arrange–Act–Assert** / Given–When–Then structure
- **Test doubles** with clear intent (mock vs stub vs fake)
- **Page Object / Screenplay** — useful abstraction, easy to over-engineer
- **User-centric queries** (roles, labels, text) over CSS/XPath chains
- **Data builders / fixtures** over shared mutable sandboxes
- **Parallelization + hermetic envs** (containers, ephemeral DBs)
- **Flaky quarantine** with owners and SLAs
- **Traceability**: risk → scenario → automation → CI job
- **Bug → lower-level regression** before closing high-level fails

---

## Tooling eras (not prescriptions)

| Era | Examples of concerns |
|---|---|
| Record-playback GUI tools | Fast start, poor maintainability |
| xUnit + CI (JUnit, NUnit, pytest, …) | Pyramid base industrialization |
| Selenium WebDriver generation | Cross-browser E2E at scale + flake wars |
| Cypress / Playwright generation | Better waits, traces, DX; still need portfolio balance |
| Contract / Pact ecosystems | Microservice decoupling |
| Visual / Percy-class, a11y engines | Non-functional automation |
| Allure / ReportPortal / etc. | Eng-facing evidence UX |

Brand lists age; **concerns** do not.

---

## Sources worth citing in workshops

- Mike Cohn — *Succeeding with Agile* (pyramid popularization)
- Martin Fowler — Test Pyramid bliki; Ham Vocke — Practical Test Pyramid
- Kent C. Dodds — Testing Trophy; "tests should resemble use"
- Google Testing Blog — caution on over-reliance on E2E
- Classical agile testing literature (Crispin/Gregory et al.) on automation vs exploratory split
- Continuous Delivery (Humble/Farley) — pipeline as quality backbone

This leaf is educational compression, not a bibliography with page numbers.
