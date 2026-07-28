# Agentic QA Browser Playbook

Practical operating guide for QA teams that already have a strong manual process, an overloaded queue, and an agent that can drive a browser through Chrome DevTools Protocol.

This playbook is deliberately pragmatic:
- start with bounded browser audits, not full automation
- keep human QA on risk judgment and final grading
- make every run auditable through explicit input files and machine-readable outputs
- derive stakeholder reports from evidence, never the other way around

---

## 1. What this playbook solves

Use this when:
- developers ship changes faster than QA can manually cover
- QA has a reporting template already, but evidence collection is slow
- the team can use a browser-driving agent, but not Selenium or Playwright directly
- you need something operational now, before building a full automation engineering practice

The first goal is **better triage and faster evidence collection**.
The second goal is **selective promotion of stable checks**.

---

## 2. Operating model

Split the work clearly:

| Role | Owns |
|---|---|
| **Developer** | PR handoff, local self-check, seed/flag notes, obvious happy-path verification |
| **Agent** | browser mechanics, repetitive scenario execution, evidence capture, report drafting |
| **QA** | scenario selection, exploratory judgment, severity/risk grading, release recommendation |

Use the agent for:
1. scenario expansion
2. bounded browser execution
3. artifact capture
4. draft report filling

Do **not** use the agent as the sole release approver.

---

## 3. Suggested repo layout in the target project

```text
qa/
  audit-requests/
    checkout-smoke.yaml
  report-templates/
    qa-summary-template.md
    stakeholder-template.xlsx
  artifacts/
    browser-audits/
      2026-07-28/
        checkout-smoke/
          audit-request.yaml
          findings.yaml
          summary.md
          artifacts-manifest.yaml
          screenshots/
          traces/
          reports/
```

Minimum practical rule:
- `audit-requests/` = what should be run
- `artifacts/browser-audits/` = what actually happened
- `report-templates/` = how results should be presented

---

## 4. MCP setup for browser driving

Your agent needs a browser-control MCP server plus a Chrome instance that allows remote debugging.

### Step 1 — Launch Chrome for QA work

Use an isolated profile, not your personal browser profile.

```text
google-chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/qa-chrome-profile
```

Why:
- isolates test cookies and sessions
- makes remote browser control predictable
- reduces risk of leaking personal sessions into artifacts

### Step 2 — Register the MCP server in `kilo.json`

The exact command depends on which CDP-compatible MCP server your team installs. The shape in Kilo looks like this:

```jsonc
{
  "$schema": "https://app.kilo.ai/config.json",
  "mcp": {
    "browser": {
      "type": "local",
      "command": ["<your-mcp-launcher>", "<your-browser-mcp-server>"],
      "environment": {
        "CHROME_REMOTE_DEBUGGING_URL": "http://127.0.0.1:9222",
        "CHROME_PATH": "/usr/bin/google-chrome"
      },
      "enabled": true,
      "timeout": 20000
    }
  },
  "permission": {
    "browser_*": "ask"
  }
}
```

Notes:
- keep browser tools on `ask` at first; loosen only after the workflow is stable
- if your MCP server expects a port instead of a URL, adapt the environment variables accordingly
- if the server launches Chrome for you, still prefer a dedicated QA profile

### Step 3 — Verify in Kilo

After saving config:
1. restart or reload Kilo if needed
2. use `/mcps` to confirm the server is enabled
3. ask the agent to do one tiny verification:

```text
Open the browser on https://example.com, capture one screenshot, and report the page title.
```

If that fails, fix MCP connectivity before trying QA scenarios.

### Step 4 — Operator rules for browser work

Always tell QA operators:
- never browse production without explicit sanction
- never capture secrets in screenshots or traces
- stop on CAPTCHA or anti-bot walls
- use dedicated test accounts only
- use observe → act → verify on every step

---

## 5. How QA should work with the agent

Use a bounded prompt, not a vague request.

### Bad request

```text
Test the app and tell me if it is okay.
```

### Good request

```text
You are assisting QA on a bounded browser audit.
Use the audit request file at `qa/audit-requests/checkout-smoke.yaml`.
Run only the declared scenarios.
For each scenario, return:
- expected result
- observed result
- grade: pass | fail | unverified | blocked
- artifact references
- short repro steps for failures
Stop if auth, environment, or fixture assumptions are broken.
Do not invent missing requirements.
```

This keeps the run:
- auditable
- reproducible
- reviewable by another human later

---

## 6. Start with one auditable input file

For overloaded teams, the fastest adoption path is a **single audit request file** per run.

### Recommended file: `qa/audit-requests/checkout-smoke.yaml`

```yaml
schema_version: 1
run_id: checkout-smoke-2026-07-28
purpose: "Smoke-check checkout changes from PR-184"
audience: eng-only
app:
  name: acme-shop
  environment: preview
  base_url: https://preview.acme-shop.test
  sanctioned: true
access:
  auth_mode: seeded-user
  account_role: shopper
  secrets_ref: env:QA_SHOPPER_ACCOUNT
fixtures:
  - cart-with-one-item
  - payment-sandbox
execution:
  browser: chromium
  viewports: [desktop-1440, iphone-12]
  collect:
    screenshots_on: [fail]
    trace_on_fail: true
    a11y_snapshot: true
stop_conditions:
  - auth failure
  - environment unreachable
  - captcha encountered
  - missing seed data
scenarios:
  - id: checkout-happy-path
    priority: critical
    intent: "Complete checkout with valid data"
    steps:
      - "Open /checkout"
      - "Confirm cart has one item"
      - "Fill valid shipping and payment details"
      - "Submit order"
    rubric:
      pass_when:
        - "Order confirmation is visible"
        - "URL includes /confirmation"
        - "Order id is shown"
      fail_when:
        - "Submission errors appear"
        - "Spinner hangs without completion"
      unverified_when:
        - "Page becomes unstable or run cannot complete"
  - id: checkout-invalid-card
    priority: critical
    intent: "Rejected card should not create an order"
    steps:
      - "Open /checkout"
      - "Use decline test card"
      - "Submit payment"
    rubric:
      pass_when:
        - "Inline payment error is visible"
        - "URL does not move to /confirmation"
      fail_when:
        - "Order confirmation appears"
        - "No validation or error appears"
      unverified_when:
        - "Sandbox payment service is unavailable"
report:
  template: qa/report-templates/qa-summary-template.md
  require_fields:
    - scenario_id
    - expected_result
    - actual_result
    - grade
    - artifacts
```

### Why this shape works

This file locks:
- target and environment
- auth and fixture assumptions
- stop conditions
- scenarios
- rubric for grading
- report contract

That is enough for an agent to run a bounded audit without guessing too much.

---

## 7. How QA should compose the audit request through Q&A turns

Many QA teams will not write the full YAML from scratch at first.
That is fine.

A practical workflow is:
1. QA brings the PR / ticket / bug context
2. QA asks the agent to interview them
3. the agent asks structured questions
4. QA answers in short plain language
5. the agent drafts the `audit-request.yaml`
6. QA reviews and corrects the draft before execution

The goal is not to make QA become YAML experts.
The goal is to make the input **explicit, reviewable, and auditable**.

### Recommended opening prompt from QA

```text
Help me compose an audit request file for this change.
Ask me one question at a time until you have enough information to draft `qa/audit-requests/checkout-smoke.yaml`.
Do not run the browser yet.
At the end, return:
1. missing assumptions
2. proposed scenarios
3. the draft YAML
```

This keeps the agent in **orchestration mode**, not execution mode.

### What the agent should ask for

The interview should collect these fields in order:

1. **Change context**
   - what feature / PR / bug is under test?
2. **Target environment**
   - local, preview, staging?
   - what base URL?
3. **Access model**
   - anonymous or authenticated?
   - what role/account is needed?
4. **Fixtures / data**
   - what seed data, feature flags, or setup is required?
5. **Scope**
   - which 1–5 scenarios matter most for this run?
6. **Rubric**
   - what proves pass, fail, unverified, blocked?
7. **Execution settings**
   - browser, viewports, screenshot/trace expectations?
8. **Report target**
   - eng-only or stakeholder-facing?
   - what report template should be filled?

### A good Q&A pattern

The agent should ask short, narrowing questions like:

- “What exact change are we testing?”
- “Which environment is sanctioned for this run?”
- “Do we need login? If yes, what role?”
- “What data must exist before the scenario starts?”
- “What are the top 3 risky user journeys?”
- “For scenario 1, what proves success?”
- “What would count as a fail vs just unverified?”
- “Should this run stay eng-only, or feed a stakeholder report?”

### A bad Q&A pattern

Avoid agent questions like:

- “Tell me everything about this feature.”
- “What should I test?”
- “Can you provide all the requirements in detail?”

Those create vague, high-effort conversations that waste QA time.

### Example conversation

```text
QA: Help me compose an audit request file for PR-184. Ask one question at a time.

Agent: What exact change is PR-184 introducing?

QA: Checkout UI update plus new payment validation behavior on mobile.

Agent: Which environment is sanctioned for this audit?

QA: Preview. Base URL is https://preview.acme-shop.test.

Agent: Does the flow require authentication? If yes, which role/account?

QA: Yes. Seeded shopper account.

Agent: What setup or seed data must exist first?

QA: Cart with one item, sandbox payment gateway, default shipping address.

Agent: What are the top risky scenarios for this run? Keep it to 3 if possible.

QA: Happy path checkout, declined card flow, and form validation on mobile.

Agent: For the happy path, what proves pass?

QA: Confirmation page appears, URL includes /confirmation, and order id is shown.

Agent: What should count as unverified rather than fail?

QA: If preview is unstable or the payment sandbox is unavailable.
```

At that point, the agent should summarize assumptions and draft YAML.

### Recommended intermediate output from the agent

Before writing YAML, ask the agent to show this summary:

```text
Proposed audit scope
- Target: ...
- Auth: ...
- Fixtures: ...
- Scenarios: ...
- Known stop conditions: ...
- Open questions: ...
```

Why this matters:
- QA can catch misunderstanding early
- the run scope stays small
- missing preconditions become visible before execution

### Recommended prompt for the draft step

```text
Based on our Q&A so far, draft the audit request YAML.
Use only information we explicitly agreed on.
If something is missing, mark it under `open_questions` or `assumptions` instead of inventing details.
Do not start the browser run.
```

### QA review checklist before approving the draft

Before the audit request is used, QA should check:

- Is the environment correct and sanctioned?
- Is the required role/account correct?
- Are fixtures or flags listed explicitly?
- Are there too many scenarios for one run?
- Does each scenario have real pass/fail logic?
- Are stop conditions present?
- Is `unverified` used honestly?
- Is the report target correct?

### Practical rule for early adoption

For the first few weeks, keep each conversationally-authored audit request to:
- **1 feature or PR**
- **1 environment**
- **1 role/account type**
- **3–5 scenarios max**

Small audit requests are easier to review, easier to run, and easier to trust.

---

## 8. How to write scenarios well

Each scenario should answer 5 questions:

1. **What business path is being checked?**
2. **What preconditions must hold first?**
3. **What exact actions should be taken?**
4. **What proves pass?**
5. **What counts as fail, unverified, or blocked?**

### Good scenario style

```text
Intent: Rejected card should not create an order.
Pass when: inline error is shown and URL stays off confirmation.
Fail when: order confirmation appears.
Unverified when: payment sandbox is down.
```

### Weak scenario style

```text
Test payment errors.
```

Short is fine.
Vague is not.

---

## 9. How to write rubrics that stay honest

Rubrics should be written **before** the run.

Use these grade meanings consistently:

| Grade | Meaning |
|---|---|
| **pass** | All required expectations were met |
| **fail** | One or more expectations were contradicted |
| **unverified** | The run did not produce enough trustworthy evidence to judge |
| **blocked** | A prerequisite failed before the scenario could be tested |

Hard rules:
- never map `unverified` to pass
- never map `blocked` to pass
- do not let the agent rewrite the rubric after seeing the result
- use user-visible behavior, not implementation details, as the oracle

---

## 10. Daily browser audit workflow

For each risky PR or ticket:

1. dev provides a small QA handoff block
2. QA writes or updates one audit request file
3. agent runs the browser audit from that file
4. agent stores artifacts and machine outputs under `qa/artifacts/browser-audits/...`
5. QA reviews the findings and corrects any bad grading
6. agent projects the machine outputs into the target report template
7. QA decides whether any scenario should be promoted into durable automation later

### Minimal dev handoff block

```text
Feature/change:
Risk areas:
How to access:
Test account / role:
Seed data / feature flag:
Happy path to verify:
Negative path to verify:
Known non-goals:
```

This is one of the cheapest ways to reduce QA bottlenecks.

---

## 11. Expected machine outputs from the run

A good browser audit should produce at least:

```text
qa/artifacts/browser-audits/<date>/<run-id>/
  audit-request.yaml
  summary.md
  findings.yaml
  artifacts-manifest.yaml
  screenshots/
  traces/
```

### `findings.yaml` example

```yaml
run_id: checkout-smoke-2026-07-28
results:
  - scenario_id: checkout-happy-path
    grade: pass
    expected_result: "Order confirmation visible and URL includes /confirmation"
    actual_result: "Confirmation page visible with order id ORD-1042"
    evidence_grade: browser-audited
    artifacts:
      - screenshots/checkout-happy-path--desktop-1440.png
  - scenario_id: checkout-invalid-card
    grade: fail
    expected_result: "Inline payment error appears and no order is created"
    actual_result: "Submit spinner hangs and no validation appears"
    evidence_grade: browser-audited
    artifacts:
      - screenshots/checkout-invalid-card--iphone-12--fail.png
      - traces/checkout-invalid-card--iphone-12.trace.zip
    repro_steps:
      - open checkout with seeded cart
      - enter decline card
      - submit payment
      - observe endless spinner
```

### `artifacts-manifest.yaml` should record

- file path
- scenario id
- artifact type
- whether it is sensitive
- whether it is safe for stakeholder reports

This prevents screenshots and traces from becoming unmanaged junk.

---

## 12. How to turn the browser run into the target report

Treat reporting as **projection**, not as the source of truth.

### Flow

1. `audit-request.yaml` defines what should be checked
2. browser run produces `summary.md`, `findings.yaml`, and artifact files
3. the agent maps those machine outputs into your existing report template
4. QA reviews the final report before sharing

### Mapping example

| Machine field | Target report field |
|---|---|
| `scenario_id` | Scenario / test case |
| `expected_result` | Expected |
| `actual_result` | Actual |
| `grade` | Status / grading column |
| `artifacts` | Evidence link / screenshot reference |
| `repro_steps` | Repro / notes |

### Safe prompt for report generation

```text
Using `qa/artifacts/browser-audits/2026-07-28/checkout-smoke/findings.yaml`
and the template `qa/report-templates/qa-summary-template.md`,
produce the target report.
Preserve machine grades exactly.
Do not convert unverified or blocked into pass.
Exclude any artifact marked sensitive or not stakeholder-safe.
If required template fields are missing, mark the row incomplete instead of inventing content.
```

---

## 13. Reporting modes

### Engineering-only

Use:
- Markdown summary
- machine findings YAML
- artifact links

Best when:
- devs need fast repro and evidence
- no non-technical audience needs the result yet

### Stakeholder / business

Use only after the machine evidence exists.

Possible outputs:
- Excel matrix
- PDF summary
- static HTML report

Rules:
- sanitize sensitive text and artifacts first
- counts must match the machine record
- `unverified` must stay `unverified`
- `blocked` must stay `blocked`

---

## 14. What to automate later, not now

Do **not** start by asking QA to build a giant end-to-end suite.

Promote only scenarios that are:
- repeated often
- stable across runs
- expensive to retest manually
- important to release confidence

Good first promotion candidates:
- login smoke
- checkout happy path
- core navigation smoke
- recurring bug repros

Bad first promotion candidates:
- highly exploratory UX checks
- unstable fixture-dependent flows
- brittle multi-system paths with poor test isolation

---

## 15. Anti-patterns to avoid

- “Test the whole app” requests
- letting the same dev author and grade the final result alone
- hiding `unverified` inside a green summary
- storing screenshots with secrets or personal data
- skipping stop conditions when env/auth is broken
- turning every useful one-off run into permanent automation
- treating Excel or PDF as more real than the machine evidence

---

## 16. First 2-week rollout plan

### Week 1
- enable browser MCP reliably
- agree one audit-request file format
- standardize grade meanings
- pilot on top 3–5 risky PRs only

### Week 2
- measure blocked vs fail vs unverified causes
- improve dev handoff quality
- identify 1–2 repeated scenarios worth promoting
- refine the report projection prompt/template

Success is not “more AI usage.”
Success is:
- less QA manual clicking
- faster turnaround on risky changes
- clearer repro evidence for devs
- fewer silent misses caused by overload

---

## Related reading

- [agentic-qa / Mental model](../agentic-qa/mental-model.md)
- [agentic-qa / Trust and evidence](../agentic-qa/trust-and-evidence.md)
- [agentic-qa / Local materialization](../agentic-qa/local-materialization.md)
- [slides / Agentic QA deck](../slides/03_ai-agentic-qa-en.md)
