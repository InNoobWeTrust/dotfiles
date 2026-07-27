# Maturity Path

Adopt agentic QA the same way you adopt quality tooling: **baseline → policy → leverage** — not "install an AI tester" day one.

---

## Phase 0 — Precondition (non-negotiable)

Without these, agentic QA amplifies chaos:

- [ ] Versioned code + CI that can run *some* automated checks
- [ ] Agreement on quality layers (Part 2) and definition of done
- [ ] Sanctioned non-prod environments and test data policy
- [ ] Humans who understand pyramid / flaky quarantine basics

**If Phase 0 is missing, fix that first.**

---

## Phase 1 — Feedback sensors (inner loop)

Goal: agents self-correct on machine-checkable failures.

- Wire format, lint, type, unit tests into the coding agent loop
- Forbid "fix the suite" by deleting assertions without review
- Track: % PRs with green local gates before human review

**Inherits:** shift-left, pyramid base.

---

## Phase 2 — Evaluative discipline

Goal: separate build from judge.

- Predeclare rubrics for reviews
- Black-box / adversarial lenses on user-visible changes
- Author-bias rule: implementer does not sole-sign non-trivial QA

**Inherits:** independent review, exploratory charters.

---

## Phase 3 — Evidence-backed audits

Goal: bounded live checks with honest grades.

- Spot checks for high-risk flows only
- Run cards: auth, fixtures, stop conditions
- Artifacts retained with sensitivity labels
- Outcomes: pass / fail / unverified — never launder

**Inherits:** smoke tests, session-based testing.

---

## Phase 4 — Scenario packs + selective materialization

Goal: reusable coverage without ice-cream cone.

- Scenario schema shared by audits and future automation
- Promote only stable, high-ROI journeys to durable E2E/API tests
- Every high-level failure spawns a lower-level regression test

**Inherits:** risk-based automation, pyramid discipline.

---

## Phase 5 — Stakeholder projection (optional)

Goal: business audiences see risk without owning eng formats.

- Machine YAML/MD/JUnit remains system of record
- Excel/PDF/HTML are derived under projection gates
- Eng-only work skips pack ceremony entirely

**Inherits:** classic release reporting split.

---

## Phase 6 — Portfolio governance

Goal: measure the system, not the hype.

| Signal | Healthy | Unhealthy |
|---|---|---|
| Flake rate | Low, quarantined | "Just re-run" culture |
| E2E count growth | Slow, justified | Explodes with agent output |
| Unverified rate | Visible on reports | Hidden or mapped to pass |
| Time-to-signal | Minutes on inner loop | Hours of agent demo theater |
| Human override rate | Explained | Silent rubber-stamp |

---

## Anti-rollout patterns

See [details/anti-patterns.md](./details/anti-patterns.md). Short list:

- Replacing unit tests with agent E2E
- Prod exploration without sanction
- One mega-skill that "does all QA"
- Stakeholder decks as the only artifact
- Measuring success by lines of generated tests
