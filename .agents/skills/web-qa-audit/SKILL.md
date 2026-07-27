---
name: web-qa-audit
description: "Use this skill for executable web QA/QC work: QA-scoped spot checks, exploratory audits, release smoke passes, scenario-driven browser validation, evidence capture, and optional materialization into durable E2E/a11y/responsive/visual suites. Owns the operational QA workflow rather than the evaluative review lens."
---

# Web QA Audit

Executable QA for web applications: **live browser evidence, scenario-driven audits, and optional automation materialization**. This skill owns the operational workflow that should stay separate from a pure review lens.

---

## Boundary

- The **evaluative review layer** decides whether a frontend artifact looks correct, what user-visible risks exist, and whether live evidence is required.
- A **browser-control capability** owns direct page interaction mechanics, traces, screenshots, and low-level diagnostics.
- This skill owns **QA orchestration**: run cards, scenario shape, audit evidence contracts, QA-scoped spot checks, and materialization planning.

Use this skill when the task is about **running** QA, not only **judging** an artifact.

---

## Intention routing

Start with `references/INDEX.md`, then load only the path matching the request.

| Intent | Path |
|---|---|
| QA-scoped spot check with evidence expectations | Spot-check path |
| Structured browser audit with evidence | Browser-audit path |
| Scenario design for reusable QA coverage | Scenario-design path |
| Materialize scenarios into durable tests | Materialization path |
| Evaluate the maturity of a QA setup | Benchmark path |

---

## Modes

1. **Spot check** — quick, bounded, QA-scoped validation of a named flow with explicit pass/fail/unverified expectations.
2. **Browser audit** — structured pass/fail evidence over one or more scenarios.
3. **Materialization planning** — decide what should become durable automation.
4. **Materialization handoff** — produce the generation contract and outputs needed by a Playwright/Selenium-style implementation.

---

## Rules

- Prefer a dedicated browser-control capability for raw interaction mechanics and low-level performance traces.
- Prefer this skill for QA orchestration, evidence contracts, scenario lifecycle, and audit reporting.
- Start from `references/INDEX.md`; do not load the whole reference tree by default.
- Do not escalate a small spot check into a full materialization workflow unless the user or risk profile justifies it.
- Keep success evidence explicit: pass/fail/unverified with browser, viewport, and artifact context.
- Never normalize unsafe auth/session/test-endpoint behavior; require sanctioned target and environment assumptions first.
