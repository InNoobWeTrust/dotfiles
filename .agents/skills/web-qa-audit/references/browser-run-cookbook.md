# Browser Run Cookbook

Repo-agnostic cookbook for running web QA browser audits in a controlled, repeatable way.

---

## Goal

Standardize:
- startup and readiness
- fixture/bootstrap assumptions
- auth/session handling
- artifact capture
- teardown expectations

Use `cdp-browser-automation` for the actual browser-control mechanics.

---

## Preflight Checklist

Before a run, lock answers for:
1. target environment (local / preview / staging)
2. readiness signal (port / log / health endpoint)
3. fixture source (seed command / fixture API / shared preview state)
4. auth model (anonymous / seeded credentials / cookie bootstrap / test endpoint)
5. artifact root and naming

If any are unknown, stop or downgrade.

---

## Runner Invocation Contract

```text
run-browser-audit \
  --run-card qa/artifacts/browser-audits/2026-07-27/bbqa-checkout-smoke/run-card.yaml \
  --scenario qa/scenarios/checkout-invalid-card.yaml \
  --browser chromium \
  --viewport iphone-12 \
  --artifacts-root qa/artifacts/browser-audits/2026-07-27/bbqa-checkout-smoke/
```

### Exit semantics
- `0` when requested scenarios ended in pass/fail/unverified with required artifacts recorded
- `2` for retryable blockers or partial execution
- `3` for misconfigured runner/run-card
- `4` for unsafe or missing startup/auth/fixture contracts

Required outputs:
- `summary.md`
- `run-card.yaml`
- `artifacts-manifest.yaml`
- evidence files under the artifact root

---

## Startup Patterns

### Already running
```text
startup_contract: already-running
base_url: https://preview.example.com
readiness: GET /health -> 200
```

### Local dev server
```text
startup_contract:
  command: npm run dev
  readiness:
    type: port
    value: 3000
    poll_interval_ms: 500
  timeout_sec: 120
```

### Preview build
```text
startup_contract:
  command: npm run build && npm run preview
  readiness:
    type: log-pattern
    value: Local: http://localhost:4173
  timeout_sec: 180
```

### Containerized app
```text
startup_contract:
  command: docker compose up web
  readiness:
    type: health-endpoint
    value: http://localhost:8080/health
    http_timeout_sec: 3
    accepted_statuses: 200
  timeout_sec: 240
```

### Target process ownership
If the runner starts the app, record:
- process owner (`runner-managed` or `external`)
- startup log location
- process id when available
- teardown action (`stop-on-complete`, `leave-running`, `external-owner`)

---

## Fixture and Cleanup Patterns

```text
fixture_contract:
  command: make seed-qa-data
  proof: "seeded 12 users, 4 carts"
```

```text
fixture_contract:
  command: POST /test/seed-checkout
  proof: 200 OK
```

Cleanup model must declare one of:
- `per-run-isolated`
- `reset-command`
- `shared-preview`

If the scenario is stateful and no cleanup model exists, downgrade or block the run.

---

## Auth and Secret Handling

### Patterns
- anonymous
- seeded credentials
- cookie/session bootstrap
- test-session endpoint

Rules:
- never hardcode credentials into scenario files or summaries
- use QA-generated sessions only, never harvested real-user sessions
- redact tokens and session ids in summaries/manifests
- clear injected cookies or ephemeral sessions when possible
- any test-only login/bootstrap endpoint must be unreachable in production

---

## Artifact Convention

```text
qa/artifacts/browser-audits/2026-07-27/bbqa-checkout-smoke/
  summary.md
  run-card.yaml
  findings.yaml
  artifacts-manifest.yaml
  screenshots/
  traces/
  a11y/
  reports/                    # derived stakeholder pack only; git-ignore
    stakeholder-summary.pdf   # or labeled interim .md
    stakeholder-results.xlsx  # or labeled interim .csv
    html/                     # optional; auth or non-guessable URL + TTL if hosted
```

Example filenames:
- `screenshots/checkout-invalid-card--iphone-12--fail.png`
- `traces/checkout-invalid-card--iphone-12.trace.zip`
- `a11y/checkout-invalid-card--desktop-1440.snapshot.txt`

Every stored artifact should be linked from `artifacts-manifest.yaml`.
Artifact roots should be git-ignored and access-controlled.

Mark auth-bearing captures explicitly:

```yaml
run_id: bbqa-checkout-smoke-2026-07-27
artifacts:
  - type: screenshot
    path: screenshots/checkout-invalid-card--iphone-12--fail.png
    scenario_id: checkout-invalid-card
    required: true
    when: fail
    sensitive: false
    stakeholder_safe: true   # only after content check
  - type: trace
    path: traces/checkout-invalid-card--iphone-12.trace.zip
    scenario_id: checkout-invalid-card
    required: true
    when: fail
    sensitive: true            # default for traces with network/cookies
    stakeholder_safe: false  # eng-only; exclude from Excel/HTML evidence index
retention:
  policy: keep-14-days
  owner: qa-platform
```

Stakeholder exports under `reports/` are **derived** from `run-card.yaml`, findings, `summary.md`, and the artifacts manifest — only after projection gates in `stakeholder-report-pack.md` (sanitize, sensitive exclude, evidence_grade provenance, count consistency). Do not treat Excel/PDF/HTML as the canonical record. Do not link `sensitive: true` artifacts into stakeholder Evidence Index or HTML assets.

Hosted HTML under `reports/html/` requires sanctioned hosting plus **authentication or a non-guessable URL**, plus documented TTL/retention for release packs.

---

## Browser Matrix Rules

Minimum matrix:
- Chromium desktop
- one mobile viewport

Expand when:
- the feature is release-critical
- browser-sensitive behavior is involved
- responsive/mobile is core to the flow
- prior non-Chromium regressions exist

Record the selected matrix in the audit summary or scenario execution metadata.

---

## Escalation Conditions

Escalate instead of continuing when:
- readiness never occurs
- fixture proof cannot be established
- auth bootstrap fails
- shared-state isolation is not trustworthy
- artifacts cannot be collected reliably
- the task drifts into backend/security/perf root-cause work beyond audit scope
