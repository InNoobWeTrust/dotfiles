# Scenario Schema

Stable scenario artifact for reusable web QA runs and automation planning.

---

## Goal

A scenario file should be specific enough to:
- drive browser audits without guesswork
- drive test materialization without overfitting to prose
- separate exploratory findings from stable regression assertions

Prefer keeping **scenario definition** separate from **run results** when the project has a real runner implementation.

---

## Schema Shape

```yaml
schema_version: 1
project: string
feature: string
scenario_id: string
priority: critical | high | medium | low
mode: browser-audit | materialize | both
owner: string
risk_tags: [string]
app:
  base_url: string
  route: string
  environment: string
preconditions:
  auth_state: anonymous | seeded-user | admin | custom
  fixtures: [string]
  data_requirements: [string]
  browser_support: [chromium, firefox, webkit]
  viewports: [desktop-1440, tablet-1024, iphone-12]
steps:
  - id: string
    action: navigate | click | fill | select | submit | wait
    target: string
    value: string | number | boolean
    note: string
assertions:
  - id: string
    type: visible-text | url | field-state | network | accessibility | screenshot | perf
    expectation: string
negative_paths:
  - scenario_id: string
    purpose: string
    assertions:
      - id: string
        type: visible-text | url | field-state | network | accessibility | screenshot | perf
        expectation: string
recovery_paths:
  - scenario_id: string
    purpose: string
    assertions:
      - id: string
        type: visible-text | url | field-state | network | accessibility | screenshot | perf
        expectation: string
evidence:
  screenshots_on: [pass, fail]
  trace_on_fail: true
  a11y_snapshot: true
  perf_trace: false
materialization:
  promote_to: [e2e, a11y-smoke]
  ci_tier: pr-smoke | nightly | release
  flake_risk: low | medium | high
cleanup:
  reset_data: string
  sign_out: boolean
timeouts:
  scenario_sec: number
  step_sec: number
```

---

## Example

```yaml
schema_version: 1
project: acme-shop
feature: checkout
scenario_id: checkout-invalid-card
priority: critical
mode: both
owner: growth-platform
risk_tags: [payments, forms, mobile, accessibility]
app:
  base_url: https://preview.acme-shop.test
  route: /checkout
  environment: preview
preconditions:
  auth_state: seeded-user
  fixtures: [cart-with-one-physical-item, payment-gateway-sandbox]
  data_requirements: [seeded-user-has-default-address, test-card-decline-number-available]
  browser_support: [chromium, firefox, webkit]
  viewports: [desktop-1440, iphone-12]
steps:
  - id: open-checkout
    action: navigate
    target: /checkout
  - id: fill-card-number
    action: fill
    target: card-number-input
    value: "4000000000000002"
  - id: fill-expiry
    action: fill
    target: card-expiry-input
    value: "12/30"
  - id: fill-cvc
    action: fill
    target: card-cvc-input
    value: 123
  - id: submit-payment
    action: submit
    target: checkout-submit-button
assertions:
  - id: error-visible
    type: visible-text
    expectation: inline payment error is visible near the form
  - id: order-not-created
    type: url
    expectation: url does not transition to /confirmation
  - id: input-preserved
    type: field-state
    expectation: non-sensitive fields remain filled after failure
  - id: keyboard-focus
    type: accessibility
    expectation: focus moves to error summary or first invalid field
evidence:
  screenshots_on: [fail]
  trace_on_fail: true
  a11y_snapshot: true
  perf_trace: false
materialization:
  promote_to: [e2e, a11y-smoke]
  ci_tier: pr-smoke
  flake_risk: low
cleanup:
  reset_data: reset-cart-and-payment-attempts
  sign_out: false
timeouts:
  scenario_sec: 180
  step_sec: 20
```

---

## How to Use It

- **Browser audit** uses the route, fixtures, auth state, viewports, and assertions.
- **Materialization** uses the assertions, CI tier, and flake risk to decide what becomes durable tests.
- **Spot checks** may use only a subset of the file when a full scenario lifecycle is not justified.
