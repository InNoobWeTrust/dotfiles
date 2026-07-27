# Anti-Patterns (Deep Leaf)

Short catalog of failure modes when adopting agentic QA/QC.

---

## Portfolio anti-patterns

| Anti-pattern | Symptom | Better |
|---|---|---|
| **Agent ice-cream cone** | Thousands of generated E2E, hollow unit layer | Pyramid + selective materialization |
| **Coverage cosplay** | Lines of tests as KPI | Risk-based scenarios; flake-aware green |
| **Pyramid amnesia** | "E2E is enough with AI" | High-level fail → lower-level regression |
| **Tool brand religion** | Skill/vendor name as strategy | Mental model first |

---

## Process anti-patterns

| Anti-pattern | Symptom | Better |
|---|---|---|
| **Author self-QA** | Builder grades own work alone | Independent evaluator / delegated review |
| **Rubric after the fact** | Criteria invented to fit output | Rubric-first |
| **Unverified laundering** | Blocked runs reported green | Fail-closed grades |
| **Promote everything** | One audit → permanent suite | Written promote/skip rationale |
| **Shift-right theater** | Agent demo only at release | Feedback sensors from Phase 1 |
| **Prod wandering** | Live prod as playground | Sanctioned targets only |

---

## Reporting anti-patterns

| Anti-pattern | Symptom | Better |
|---|---|---|
| **Deck as source of truth** | Excel edited; YAML ignored | Machine record canonical |
| **Happy-path brochure** | Fails omitted from PDF | Full grade distribution |
| **Sensitive leak** | Traces with PII in business pack | stakeholder_safe flags |
| **Metric vanity** | "97% agent pass rate" without env notes | Context + unverified rate |

---

## Safety anti-patterns

| Anti-pattern | Symptom | Better |
|---|---|---|
| **Permission hunger** | Agent has prod DB + email + browser | Least privilege scopes |
| **Secret in prompt** | Tokens pasted into chat | Secret refs / vault patterns |
| **Unsafe test endpoints** | Agent hits destructive admin APIs | Allowlists; read-only where possible |
| **Silent exfil paths** | "Helpful" uploads of logs off-box | Explicit data handling policy |

---

## Skill / toolkit anti-patterns

| Anti-pattern | Symptom | Better |
|---|---|---|
| **Cargo-cult skills** | Copy repo skills = "we do agentic QA" | Score operational maturity |
| **One mega-skill** | Review + browser + report + CI in one blob | Separated roles |
| **Reference overload** | Load entire tree every run | Progressive disclosure by intent |
| **English-only org assumption** | Locale/templates baked into generic skill | Target-repo localization |

---

## Recovery heuristic

When an agentic QA initiative feels "off":

1. Re-state the **risk** and **rubric**
2. Check **portfolio shape** (too much E2E?)
3. Inspect **grades** (unverified hidden?)
4. Inspect **env sanction**
5. Split **judgment / orchestration / mechanics**
6. Demote unstable automation back to exploratory
