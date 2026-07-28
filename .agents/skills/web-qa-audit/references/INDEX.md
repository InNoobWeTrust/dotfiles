# Web QA Audit Reference Index

Load this index first after activating `web-qa-audit`. It keeps the skill compact while giving a clear path through the executable QA stack.

---

## What each reference owns

| Reference | Owns |
|---|---|
| `scope-and-boundaries.md` | When work belongs to QA orchestration vs review vs raw browser control |
| `audit-request-grooming.md` | QA interview flow, missing-input detection, and auditable input-file drafting |
| `browser-audit-protocol.md` | Audit scope contract, run card, dispatch template, evidence contract |
| `browser-run-cookbook.md` | Startup, readiness, auth, fixture, artifact, and teardown patterns |
| `scenario-schema.md` | Reusable scenario shape for audit and materialization |
| `materializer-contract.md` | Durable automation planning/generation contract |
| `stakeholder-report-pack.md` | Audience-adapted report projection: Excel, PDF, static HTML from machine evidence |
| `benchmark-rubric.md` | Scoring the maturity of a QA setup |

---

## Load paths by intent

### 1. Grooming / input composition
Load in order:
1. `scope-and-boundaries.md`
2. `audit-request-grooming.md`
3. `scenario-schema.md` only if the request should become a reusable scenario artifact rather than a one-off run card

Use when the operator has a PR, bug, or test request but **does not yet have** an auditable input file (`audit-request`, run card, or scenario file). This is also the default path when the skill was invoked directly by QA rather than delegated from `reviewer`, and the request is still fuzzy.

### 2. QA-scoped spot check
Load in order:
1. `scope-and-boundaries.md`
2. `browser-audit-protocol.md`
3. **If audience is not eng-only** (or user asks for Excel/PDF/HTML): also load `stakeholder-report-pack.md` after machine evidence exists

Use when the goal is a bounded evidence-backed check of one named flow without expanding into full suite design. Eng-only spot checks stop after step 2.

### 3. Structured browser audit
Load in order:
1. `browser-audit-protocol.md`
2. `browser-run-cookbook.md`
3. **If audience is not eng-only**: also load `stakeholder-report-pack.md` after machine evidence exists

Use when the app is runnable and the user needs pass/fail/unverified evidence over one or more scenarios.

### 4. Scenario design
Load:
1. `scenario-schema.md`

Use when the goal is to define reusable QA coverage rather than only run a one-off audit.

### 5. Materialization planning or handoff
Load in order:
1. `scenario-schema.md`
2. `materializer-contract.md`

Use when stable scenarios should become durable E2E, a11y, responsive, visual, or performance checks.

### 6. Stakeholder / business reporting
Load in order:
1. Confirm audience is **not** eng-only (or user explicitly requested Excel/PDF/HTML)
2. `browser-audit-protocol.md` (machine evidence contract already produced)
3. `stakeholder-report-pack.md`

Use when results must be communicated to non-technical or business stakeholders (Excel matrix, PDF executive summary, hosted static HTML). **Do not load** for eng-only spot checks or eng-only audits.

### 7. QA maturity evaluation
Load:
1. `benchmark-rubric.md`

Use when judging whether a QA workflow is operationally ready. Score **core 0–18** always; score stakeholder **+0–3 only** when non-dev delivery is in scope (eng-only is N/A, not a penalty).

---

## Progressive-disclosure rule

Do not load all references by default. Pick the narrowest path that matches the request.

- If no input file exists yet, load the grooming path before any browser-run path.
- A small eng-only spot check should not automatically load materialization docs or stakeholder packs.
- A business-audience spot check **does** load `stakeholder-report-pack.md` after evidence exists (path 2 step 3).
- Materialization planning should not automatically load the run cookbook unless a live browser run is also required.
- Stakeholder Excel/PDF/HTML should not replace the machine evidence layer; load reporting only when audience is non-dev or the user asks.
- Eng-only dispatch must not emit a Stakeholder Pack section.
- Benchmarking should remain separate from the operational run path unless the user explicitly wants maturity scoring.
