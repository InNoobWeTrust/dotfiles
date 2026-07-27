# Evidence Contracts (Deep Leaf)

Minimum shape for defensible agentic (or human) executable QA claims.

---

## Why contracts beat screenshots

A screenshot without:

- declared expectation
- environment identity
- outcome grade

…is marketing. Contracts force the claim to be falsifiable.

---

## Run card (orchestration input)

```yaml
run_id: optional-id
target:
  url_or_env: https://staging.example/app
  sanctioned: true
  notes: "non-prod; seeded tenant A"
auth:
  method: test-user | sso-sandbox | none
  secrets_ref: "env:QA_USER"   # never inline secrets
fixtures:
  - "seed:checkout-cart-basic"
browser:
  name: chromium
  viewport: "1280x720"
scenarios:
  - id: checkout-happy
    intent: "Complete checkout with valid card"
    expect:
      - "order confirmation visible"
      - "order id pattern ORD-*"
stop_conditions:
  - "auth failure"
  - "target 5xx > 2"
audience: eng-only | business | release-owner
```

---

## Outcome record (orchestration output)

```yaml
scenario_id: checkout-happy
outcome: pass | fail | unverified | blocked
evidence_grade: strong | weak | heuristic   # optional
observed: "confirmation page with ORD-1042"
artifacts:
  - path: artifacts/checkout-happy.png
    stakeholder_safe: true
  - path: artifacts/trace.zip
    stakeholder_safe: false
context:
  browser: chromium
  viewport: "1280x720"
  started_at: "2026-07-27T08:00:00Z"
blocker: null | "login 401"
```

---

## Grade semantics (normative)

| Outcome | Use when |
|---|---|
| **pass** | All expects met; env valid; no critical blocker |
| **fail** | At least one expect contradicted |
| **unverified** | Could not complete judgment (flake, ambiguity, partial run) |
| **blocked** | Prerequisite failed before expects could be tested |

**Forbidden:** mapping unverified/blocked → pass in any audience-facing summary.

---

## Projection gates (when business packs exist)

Before Excel/PDF/HTML:

1. **Sanitize** — no secrets, tokens, raw PII in tables
2. **Sensitive exclude** — traces/screens with PII not linked in business packs
3. **Provenance** — every row ties to scenario_id + outcome
4. **Count consistency** — totals match machine record
5. **No grade laundering** — unverified stays unverified

Machine YAML/MD (or JUnit) remains canonical.

---

## Heuristic review without a live run

Allowed, but must label:

```text
outcome: unverified
evidence_grade: heuristic
basis: "PR screenshots + AC only; app not exercised"
```

Never present as executable QA pass.

---

## Anti-patterns

- "Looks good" with no scenario_id
- Reusing prod credentials in agent context
- Single screenshot for multi-step journey
- Stakeholder HTML that omits fail/unverified rows
- Silent retry until green without recording flake
