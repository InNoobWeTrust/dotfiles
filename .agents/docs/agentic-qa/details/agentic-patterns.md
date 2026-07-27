# Agentic Patterns (Deep Leaf)

Expanded rising practices and how they fail. Pair with [../agentic-practices.md](../agentic-practices.md).

---

## Pattern cards

### P1 — Feedback sensors for coding agents

**Intent:** deterministic quality tools close the loop inside generation.  
**Good when:** unit/type/lint already exist and are fast.  
**Fails when:** agents mutate tests to match broken code; sensors are skipped "to save tokens."  
**Mitigation:** review test diffs; required CI still gates merge; mutation testing where ROI exists.

### P2 — Evaluator–optimizer

**Intent:** separate generation from scoring against a fixed rubric.  
**Good when:** criteria can be stated before seeing output.  
**Fails when:** same context both builds and grades; rubric rewritten after the fact.  
**Mitigation:** delegate evaluation; author-bias gate; PASS/FAIL/UNVERIFIED only.

### P3 — Charter-driven exploratory agent

**Intent:** time-boxed mission ("find payment edge cases on mobile") with notes and evidence.  
**Good when:** uncertainty is high; scripts would encode guesses.  
**Fails when:** charter is vague ("test the app") or agent wanders into prod/PII.  
**Mitigation:** written charter, sanction list, time box, explicit stop.

### P4 — Evidence-backed audit

**Intent:** run card + scenarios + graded outcomes + artifacts.  
**Good when:** release risk needs live proof.  
**Fails when:** one happy path stands in for the suite; blocked steps marked pass.  
**Mitigation:** evidence contract; fail-closed reporting.

### P5 — Scenario → materialization

**Intent:** promote stable journeys to durable automation.  
**Good when:** journey is high-value, stable UI/API, clear oracle.  
**Fails when:** promote-everything; no owner for flakes.  
**Mitigation:** written promote/skip rationale; flake budget; pyramid check.

### P6 — Multi-lens review

**Intent:** black-box, security, a11y, adversarial lenses in sequence or parallel.  
**Good when:** artifact types differ (UI vs API vs infra).  
**Fails when:** checklist spam without severity synthesis.  
**Mitigation:** severity rollup; conflict call-outs; depth modes (quick vs deep).

### P7 — Stakeholder projection

**Intent:** derive business artifacts from machine evidence.  
**Good when:** release owners need go/no-go without reading YAML.  
**Fails when:** deck becomes system of record; counts disagree with eng report.  
**Mitigation:** projection gates (sanitize, sensitive exclude, provenance, count consistency).

### P8 — Spec / acceptance → draft tests

**Intent:** agents turn AC into first-pass tests.  
**Good when:** AC are unambiguous and examples exist.  
**Fails when:** AC ambiguous → invented business rules.  
**Mitigation:** grooming rules; stop on ambiguity; human accepts oracle.

### P9 — Self-healing selectors (use with extreme caution)

**Intent:** agents rewrite locators when UI shifts.  
**Good when:** tightly scoped, reviewed, and rare.  
**Fails when:** silently retargets to wrong control; green lies.  
**Mitigation:** treat locator changes as code changes under review; prefer user-facing queries.

### P10 — Agent-assisted flake triage

**Intent:** classify flake vs real fail from traces/logs.  
**Good when:** traces exist and env is known.  
**Fails when:** real bugs labeled flake to unblock.  
**Mitigation:** human confirm on release-critical paths; quarantine with owner.

---

## Industry framing (2025–2026)

Themes consistent with harness engineering and agent skill modularization:

- **Feedforward:** skills, specs, conventions loaded just-in-time
- **Feedback:** compilers, linters, tests, SAST as sensors
- **Least privilege:** useful agents are permission-hungry; constrain scopes
- **Cognitive debt:** generated suites nobody understands are liabilities

These themes reinforce: agentic QA is **harness quality work**, not a free quality fairy.

---

## Mapping to classical roles (not org chart gospel)

| Classical role | Agentic analogue |
|---|---|
| SDET writing framework | Scenario schema + materializer contracts |
| Manual exploratory tester | Charter + evidence audit |
| Automation engineer in CI | Durable suite ownership + flake policy |
| QA lead sign-off | Human release owner + projection packs |
| Dev writing unit tests | Agent + feedback sensors under TDD rules |
