# Web QA Audit Reference Index

Load this index first after activating `web-qa-audit`. It keeps the skill compact while giving a clear path through the executable QA stack.

---

## What each reference owns

| Reference | Owns |
|---|---|
| `scope-and-boundaries.md` | When work belongs to QA orchestration vs review vs raw browser control |
| `browser-audit-protocol.md` | Audit scope contract, run card, dispatch template, evidence contract |
| `browser-run-cookbook.md` | Startup, readiness, auth, fixture, artifact, and teardown patterns |
| `scenario-schema.md` | Reusable scenario shape for audit and materialization |
| `materializer-contract.md` | Durable automation planning/generation contract |
| `benchmark-rubric.md` | Scoring the maturity of a QA setup |

---

## Load paths by intent

### 1. QA-scoped spot check
Load in order:
1. `scope-and-boundaries.md`
2. `browser-audit-protocol.md`

Use when the goal is a bounded evidence-backed check of one named flow without expanding into full suite design.

### 2. Structured browser audit
Load in order:
1. `browser-audit-protocol.md`
2. `browser-run-cookbook.md`

Use when the app is runnable and the user needs pass/fail/unverified evidence over one or more scenarios.

### 3. Scenario design
Load:
1. `scenario-schema.md`

Use when the goal is to define reusable QA coverage rather than only run a one-off audit.

### 4. Materialization planning or handoff
Load in order:
1. `scenario-schema.md`
2. `materializer-contract.md`

Use when stable scenarios should become durable E2E, a11y, responsive, visual, or performance checks.

### 5. QA maturity evaluation
Load:
1. `benchmark-rubric.md`

Use when judging whether a QA workflow is operationally ready.

---

## Progressive-disclosure rule

Do not load all references by default. Pick the narrowest path that matches the request.

- A small spot check should not automatically load materialization docs.
- Materialization planning should not automatically load the run cookbook unless a live browser run is also required.
- Benchmarking should remain separate from the operational run path unless the user explicitly wants maturity scoring.
