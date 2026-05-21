---
description: >
  Analyze agent model assignments using live benchmark, availability, and
  pricing data from the providers relevant to the current decision. Fetches
  benchmark and pricing data, compares against current agent configs, and
  recommends changes while respecting user constraints such as primary-agent
  usage, quality floor, subscriptions, and budget. Use when you want to
  benchmark, optimize, or re-evaluate agent models before making changes.
  Triggered by: "benchmark", "update agents", "check model rankings",
  "optimize agents", "model comparison", "provider comparison", "pricing".
---

## Setup
You are executing a model evaluation and agent configuration optimization.

To ensure your cost estimates, ELO mapping, and schema checks align with standards, **load and adhere to the `model-benchmarking` skill**.

## Execution Protocol
1. **Analyze Constraints**: Prompt the user to lock down subscriptions, regional boundaries, quality floors, and target optimization modes as outlined in **Phase 1: Capture Constraints & Workflow Classification**.
2. **Fetch Rankings & Catalogs**: Fetch live pricing and ELO ranks from providers following the guidelines in **Phase 2**, and validate IDs using `models.dev` schemas.
3. **Conduct Per-Model Research**: Perform deep audits on SWE-Pro, Terminal Bench, and reasoning metrics as outlined in **Phase 3**.
4. **Run Scenario Evaluation**: Run complete hybrid scenario checks as mapped in **Phase 4**.
5. **Formulate Recommendation Report**: Compile a comparison report following the exact format described in **Phase 5: Recommendation & Report Format**.

---

## Invocation Arguments

Additional command input, if any, appears below exactly as provided:

```text
$ARGUMENTS
```

Follow the instructions above to work on the user's benchmarking request right below.
