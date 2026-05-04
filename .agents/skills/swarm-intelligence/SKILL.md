---
name: swarm-intelligence
description: Multi-agent swarm pipeline. Use when user says "swarm", "run swarm", "multi-agent", "parallel agents", or wants a Research → Spec → Execution pipeline.
---

## Core Law

`swarminator` runs one node per invocation. It does not enforce output format; callers must request the desired artifact (patch, JSON, Markdown, etc.) through persona (`-p`) and prompt (stdin). The user is responsible for validating and applying any outputs.

## Definitions

- **node**: one `swarminator` invocation / model run.
- **persona**: the role or perspective requested by the caller.
- **swarm**: multiple nodes and/or personas used together for broader coverage.

## When to Use

- Multi-agent parallel analysis or generation
- Research → Spec → Execution pipelines
- Situations where diverse model perspectives improve output quality

## Persona / Model Policy

- At least 3 models per persona is the baseline in all cases.
- For low-stakes work, free models are acceptable across all personas.
- For high-stakes work, prefer including at least 1 premium model when it is worthwhile — this is additive, not a replacement for the baseline cardinality.
- Final model choice remains agent judgment; there is no hard-coded routing rule.

## Safety Protocol

- Verify `swarminator` is available before relying on it (e.g., `command -v swarminator`).
- Validate outputs against the task before applying them.
- For high-stakes work, prefer human review before applying consequential outputs.

## Invocation

This skill governs when to use swarm intelligence and the minimum standards; `swarminator` self-documentation governs current CLI mechanics. Use a login shell when invoking `swarminator`. Always check `swarminator --help` first. Consult `--tutorial`, `--phases`, and `--protocol` for up-to-date CLI details.

## Stop Conditions

- All phases completed.
- Agreement remains below 50% after retries.
- User rejects the output.
- Timeout or resource limit reached.
- A required input is missing.

## Output Rule

Intermediate outputs may be free-form. Only the final artifact format is caller-defined.
