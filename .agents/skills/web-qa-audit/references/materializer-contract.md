# Materializer Contract

Contract for turning scenario files into durable QA automation outputs.

---

## Goal

Given one or more scenario files, deterministically answer:
- what tests should be created or updated
- what remains heuristic-only
- which CI tier each output belongs to
- what evidence is required to call generation successful

This skill owns the orchestration and manifest. The downstream implementation may use Playwright, Selenium, or another E2E-capable stack.

---

## Invocation Contract

```text
materialize-scenarios \
  --scenarios qa/scenarios/checkout-invalid-card.yaml,qa/scenarios/checkout-happy-path.yaml \
  --framework playwright \
  --mode plan|generate|regenerate \
  --output-root tests/ \
  --manifest-out qa/materialized/run-2026-07-27.manifest.yaml
```

### Exit behavior
- `0` in `plan` mode when the manifest was produced and every scenario resolved to `create`, `update`, or `skip`
- `0` in `generate`/`regenerate` only when the manifest and requested outputs were produced successfully
- `2` for retryable blockers or incomplete generation
- `3` for misconfiguration or invalid schema
- `4` when automation is unsafe or should remain heuristic-only

---

## Validation Rules

Reject explicitly when:
- required top-level fields are missing
- assertion ids are duplicated
- CI tier is unknown
- unsupported output types are requested
- required auth/fixture/setup contracts are absent for a promoted critical scenario
- `schema_version` is unsupported

Silent schema coercion is forbidden.

---

## Manifest Shape

```yaml
run_id: string
schema_version: 1
source_scenarios:
  - path: string
    scenario_id: string
framework:
  e2e: playwright
  a11y: playwright-axe-smoke
  visual: screenshot-diff
  perf: optional
outputs:
  - output_id: string
    type: e2e | a11y-smoke | responsive | visual | perf
    path: string
    source_scenario: string
    assertions: [string]
    ci_tier: pr-smoke | nightly | release
    status: create | update | skip
    rationale: string
verification:
  required_checks:
    - generated-files-compile
    - mapped-assertions-accounted-for
    - no-unbound-critical-scenarios
notes: [string]
```

---

## Assertion Mapping Contract

Each generated output should preserve an explicit mapping:

```yaml
assertion_map:
  - assertion_id: error-visible
    source_type: visible-text
    emitted_as: expect(page.getByText(...)).toBeVisible()
    selector_source: accessibility-role | explicit-test-id | contract-placeholder
    status: mapped | unverified | skipped
```

### Selector precedence
1. explicit automation contracts (`data-testid`, documented accessibility roles, form labels)
2. stable semantic selectors
3. page-object / locator registry
4. `contract-placeholder` only in plan mode or explicit `UNVERIFIED` state

If a critical assertion has no stable selector source:
- `plan` mode may emit `UNVERIFIED`
- `generate` mode must skip with rationale or fail the run
- the manifest must record the unresolved contract gap

---

## Promotion Rules

### Promote to E2E when
- the scenario protects a business-critical path
- route, auth, and fixtures are controllable
- assertions are explicit and reproducible

### Promote to a11y smoke when
- keyboard flow or error discoverability is central
- the checks can be automated without deep manual AT judgment

### Promote to responsive / visual / perf when
- the scenario risk is explicitly viewport, layout, or performance driven

### Keep heuristic-only when
- the feature is still moving
- third-party systems are unstable
- the assertion is mostly visual/taste-based
- the result would create flaky blocking CI

---

## Verification Contract

A successful run should prove:
- every selected scenario resolved to `create`, `update`, or `skip`
- every critical assertion was mapped or explicitly skipped
- generated files compile and are discoverable by the target runner
- smoke execution is reported when required by mode or CI tier

Example positive proof:

```yaml
verification:
  scenarios_selected: 4
  outputs_created: 5
  outputs_updated: 2
  outputs_skipped: 1
  critical_assertions_mapped: 12
  critical_assertions_unmapped: 0
  compile_check: pass
  test_discovery_check: pass
  smoke_execution_check: optional-pass
```
