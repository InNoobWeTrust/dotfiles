# Browser Audit Protocol

Structured browser QA execution for runnable web applications.

---

## Goal

Given a target app and one or more user journeys, produce:
- bounded live-browser evidence
- pass / fail / unverified per scenario
- reproducible failures with screenshots/traces
- regression candidates worth promoting into durable tests
- audience-adapted report surfaces when non-dev stakeholders must act on the result

---

## Required Inputs

Lock these before execution:
1. **Target** — sanctioned base URL, environment, startup contract
2. **Scope** — scenario ids or explicit flows, priorities, out-of-scope boundaries
3. **Access** — anonymous vs authenticated flow, fixture/source of auth state
4. **Execution surface** — browser tool, actual engine/version, viewports, evidence expectations
5. **Stop conditions** — max runtime, max failures, no CAPTCHA bypass, stop on missing prerequisites

Do not run against production or third-party hosts without explicit authorization.

## Default Execution Surface

Use **terminal-browser**, side-by-side with the agent, for ordinary interaction and screenshot/snapshot evidence. Follow [CLI mechanics](../../cdp-browser-automation/references/terminal-browser.md); pin the browser and tab rather than following the active tab. Chrome DevTools MCP is not a prerequisite.

Before executing, check the agreed evidence against actual capabilities:
- Record the tool/version, actual engine, and observed viewport; a terminal Chromium page cannot prove Firefox/WebKit or real-device coverage.
- Compact interactive snapshots support orientation, not a full accessibility audit. Run the requested accessibility checks separately when required.
- Traces are opt-in for the default CLI run. If requested, establish the collector and artifact format before execution; do not call an arbitrary recording a Chrome Performance trace or Playwright trace archive.
- Preserve approved scope: unavailable browsers, dimensions, or artifacts remain blocked/unverified unless an authorized specialist path satisfies them. Do not disable requested evidence to make a run pass.
- Use Chrome/CDP only for explicit Chrome tasks or demonstrated capability gaps; installs, MCP enablement, and restarts need authorization. Existing durable cross-browser suites remain valid specialist paths.

---

## Audit Profiles

### Critical-path smoke
- Chromium via terminal-browser by default
- desktop + one mobile viewport
- screenshots on pass/fail; traces only when requested and supported
- 1–3 critical journeys

### UX regression audit
- Chromium
- mobile + desktop
- happy path + negative path + recovery path
- screenshots and keyboard-path notes; opt-in traces

### Release audit
- Chromium baseline, plus Firefox/WebKit when available
- mobile + tablet + desktop
- only top business-critical journeys
- screenshots, agreed traces/a11y smoke, optional perf evidence; verify each collector before running

---

## Operational Loop

Every meaningful action follows:
1. **Orient** — inspect current page state
2. **Act** — click/type/navigate/inject state
3. **Verify** — prove the action worked
4. **Recover / Escalate** — bounded retry or stop

Use `cdp-browser-automation` for terminal-browser-first mechanics. A generic successful CLI action is not evidence that the scenario's expected user-visible state occurred.

---

## Run Card

```yaml
run_id: bbqa-checkout-smoke-2026-07-27
mode: browser-audit
app:
  name: acme-shop
  env: preview
  base_url: https://preview.example.com
  startup_contract: already-running
scope:
  scenario_ids:
    - checkout-happy-path
    - checkout-invalid-card
access:
  auth_mode: seeded-user
  fixture_source: qa-seed-2026-07-27
execution:
  browser_tool: terminal-browser
  browsers: [chromium]
  viewports: [desktop-1440, mobile-390]
  collect:
    screenshot_on_fail: true
    trace_on_fail: false
    a11y_snapshot: false
stop:
  max_runtime_min: 20
  max_failures: 5
```

This is a lightweight default example, not permission to relax an approved run card. Use exact viewport dimensions and required device emulation where applicable; record observed values. Enable trace/a11y requirements explicitly when needed and validate their collectors first.

---

## Dispatch Template

Lock **audience** before dispatch: `eng-only` | `mixed` | `business` | `release-owner`.

Shared fields for every dispatch (fill once; do not omit on the business branch):

| Field | Example |
|---|---|
| Base URL | `https://preview.example.com` |
| Environment | local / staging / preview |
| Startup contract | already running / start command separately |
| Scenario ids / flows | checkout-happy-path, checkout-invalid-card |
| Browser tool | terminal-browser by default; authorized specialist tool + reason otherwise |
| Browser(s) | chromium / firefox / webkit |
| Viewports | mobile, desktop |
| Auth | anonymous / seeded / cookie bootstrap |
| Fixtures | seed info |

### Eng-only dispatch

```markdown
Perform a bounded black-box browser audit.

Audience: eng-only

Target:
- Base URL: [BASE_URL]
- Environment: [local/staging/preview]
- Startup contract: [already running / command separately]

Scope:
- [scenario id 1]
- [scenario id 2]

Execution:
- Browser tool: terminal-browser by default; identify any required specialist capability.
- Browser(s): [chromium / firefox / webkit]
- Viewports: [mobile, desktop]
- Auth: [anonymous / seeded / cookie bootstrap]
- Fixtures: [seed info]

Rules:
- Use observe → act → verify on every step.
- Pin the browser/tab, verify the actual engine/viewport, and preserve requested evidence; no silent Chrome/MCP setup or coverage substitution.
- Do not bypass CAPTCHAs or anti-bot walls.
- Stop if startup, auth, or fixture assumptions are missing.
- Mark missing live evidence as UNVERIFIED.
- Do **not** load stakeholder-report-pack or emit a Stakeholder Pack section.

Return exactly:
## Browser Audit Summary
## Passed Journeys
## Findings
## Evidence
## Regression Candidates
## Blockers / Unverified Claims
TASK_COMPLETE
```

### Business / release-owner dispatch

```markdown
Perform a bounded black-box browser audit, then project a stakeholder pack.

Audience: [mixed | business | release-owner]
Stakeholder surfaces: [excel | pdf | html | combination]

Target:
- Base URL: [BASE_URL]
- Environment: [local/staging/preview]
- Startup contract: [already running / command separately]

Scope:
- [scenario id 1]
- [scenario id 2]

Execution:
- Browser tool: terminal-browser by default; identify any required specialist capability.
- Browser(s): [chromium / firefox / webkit]
- Viewports: [mobile, desktop]
- Auth: [anonymous / seeded / cookie bootstrap]
- Fixtures: [seed info]

Rules:
- Use observe → act → verify on every step.
- Pin the browser/tab, verify the actual engine/viewport, and preserve requested evidence; no silent Chrome/MCP setup or coverage substitution.
- Do not bypass CAPTCHAs or anti-bot walls.
- Stop if startup, auth, or fixture assumptions are missing.
- Mark missing live evidence as UNVERIFIED.
- After machine YAML + engineering summary exist, load stakeholder-report-pack.md.
- Run projection gates before Excel/PDF/HTML; fail closed on gate failure.
- Never map unverified/blocked to pass/OK.

Return exactly:
## Browser Audit Summary
## Passed Journeys
## Findings
## Evidence
## Regression Candidates
## Blockers / Unverified Claims
## Stakeholder Pack
TASK_COMPLETE
```

---

## Evidence Contract

Every finding should include:
- scenario id
- browser tool/version + actual engine + observed viewport
- auth/fixture context
- step where failure occurred
- expected vs observed behavior
- severity
- `evidence_grade`: `browser-audited` | `heuristic` | `unverified` | `blocked`
- artifact references
- regression-candidate status

Example:

```yaml
finding_id: bbqa-004
scenario_id: checkout-invalid-card
severity: high
evidence_grade: browser-audited
browser: chromium
viewport: iphone-12
expected: inline validation appears and order is not created
observed: submit spinner hangs; no field error shown
artifacts:
  screenshot: checkout-invalid-card-hang.png
  trace: checkout-invalid-card-hang.trace.zip
regression_candidate: true
```

---

## Output Format

### Eng-only (default)

```markdown
## Browser Audit Summary
- Target: [app/env]
- Audience: eng-only
- Scope: [scenario ids]
- Browsers/Viewports: [matrix]
- Browser tool/version and observed viewport: [actual execution context]
- Result: [N passed / M failed / K unverified]
- Verdict: [Go / Go with conditions / No-Go / Blocked]  # optional unless release-facing

## Passed Journeys
## Findings
## Evidence
## Regression Candidates
## Blockers / Unverified Claims
```

Do **not** include `## Stakeholder Pack` for eng-only.

### Business / release-owner

Same sections as eng-only, plus:

```markdown
## Stakeholder Pack
- Audience: [mixed | business | release-owner]
- Excel: [path | interim CSV | skipped: reason]
- PDF: [verified PDF path | uncompiled .typ + blocker | skipped: reason]
- HTML: [URL/path | skipped: reason]
- Projection gates: [pass | fail: reason]
```

### Audience rule

- **eng-only**: machine YAML + engineering Markdown only; do not load `stakeholder-report-pack.md`.
- **mixed / business / release-owner**: after machine + engineering record is complete, load `stakeholder-report-pack.md`, run projection gates, derive Excel / PDF / optional static HTML.
- YAML remains source of truth; Excel/PDF/HTML are projections only.
- Release / go-no-go with non-dev decision makers: at least one of Excel, PDF, or hosted static HTML (real format or explicitly labeled interim).
