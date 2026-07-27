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
4. **Execution surface** — browsers, viewports, evidence expectations
5. **Stop conditions** — max runtime, max failures, no CAPTCHA bypass, stop on missing prerequisites

Do not run against production or third-party hosts without explicit authorization.

---

## Audit Profiles

### Critical-path smoke
- Chromium
- desktop + one mobile viewport
- screenshots on pass/fail, traces on fail
- 1–3 critical journeys

### UX regression audit
- Chromium
- mobile + desktop
- happy path + negative path + recovery path
- screenshots, traces, keyboard-path notes

### Release audit
- Chromium baseline, plus Firefox/WebKit when available
- mobile + tablet + desktop
- only top business-critical journeys
- screenshots, traces, a11y smoke, optional perf evidence

---

## Operational Loop

Every meaningful action follows:
1. **Orient** — inspect current page state
2. **Act** — click/type/navigate/inject state
3. **Verify** — prove the action worked
4. **Recover / Escalate** — bounded retry or stop

Use `cdp-browser-automation` for the low-level mechanics.

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
  browsers: [chromium]
  viewports: [desktop-1440, iphone-12]
  collect:
    screenshot_on_fail: true
    trace_on_fail: true
    a11y_snapshot: true
stop:
  max_runtime_min: 20
  max_failures: 5
```

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
- Browser(s): [chromium / firefox / webkit]
- Viewports: [mobile, desktop]
- Auth: [anonymous / seeded / cookie bootstrap]
- Fixtures: [seed info]

Rules:
- Use observe → act → verify on every step.
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
- Browser(s): [chromium / firefox / webkit]
- Viewports: [mobile, desktop]
- Auth: [anonymous / seeded / cookie bootstrap]
- Fixtures: [seed info]

Rules:
- Use observe → act → verify on every step.
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
- browser + viewport
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
- PDF: [path | interim MD | skipped: reason]
- HTML: [URL/path | skipped: reason]
- Projection gates: [pass | fail: reason]
```

### Audience rule

- **eng-only**: machine YAML + engineering Markdown only; do not load `stakeholder-report-pack.md`.
- **mixed / business / release-owner**: after machine + engineering record is complete, load `stakeholder-report-pack.md`, run projection gates, derive Excel / PDF / optional static HTML.
- YAML remains source of truth; Excel/PDF/HTML are projections only.
- Release / go-no-go with non-dev decision makers: at least one of Excel, PDF, or hosted static HTML (real format or explicitly labeled interim).
