---
name: swarm-intelligence
description: Multi-agent swarm pipeline. Use when user says "crowdsource", "swarm", "run swarm", "multi-agent", "parallel agents", or wants a Research → Spec → Execution pipeline.
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

### Model References

- `references/models/free.json` — free tier models for high-volume passes
- `references/models/premium.json` — premium models for quality-critical nodes

## Safety Protocol

- Verify `swarminator` is available before relying on it (e.g., `command -v swarminator`).
  - If not installed: `brew tap InNoobWeTrust/tap && brew install swarminator`
- Validate outputs against the task before applying them.
- For high-stakes work, prefer human review before applying consequential outputs.

## Persona Organization

Personas are stored as individual Markdown files in `references/personas/` grouped by functional role (Ingest, Analysis, Synthesis, Review, Synthesis-Revise, Decompose, Maker, Maker-Fix, Breaker, Finance). Each file includes YAML frontmatter with metadata (`id`, `name`, `group`, `description`, `domain`, `tags`, `created_at`, `updated_at`, `status`) followed by the detailed system prompt.

To discover and inspect personas, use the shell helper:
```
.agents/skills/swarm-intelligence/references/discover-personas.sh list
.agents/skills/swarm-intelligence/references/discover-personas.sh search <pattern>
.agents/skills/swarm-intelligence/references/discover-personas.sh frontmatter <name>
.agents/skills/swarm-intelligence/references/discover-personas.sh prompt <name>
.agents/skills/swarm-intelligence/references/discover-personas.sh by-group <group>
.agents/skills/swarm-intelligence/references/discover-personas.sh by-tag <tag>
```

Discovery is three-level:
1. **Filename scan** — list available persona names by scanning `personas/{group}/*.md`.
2. **Frontmatter parse** — read `id`, `name`, `group`, `description`, `tags`, `domain` to filter by use case.
3. **Body load** — extract full prompt content (after second `---`) to pass to the model.

The monolithic `personas.md` has been removed; use individual persona files or the discovery script.

Finance-domain personas carry additional frontmatter fields (`domain: finance`, `subdomain: <area>`) to enable domain-specific filtering.

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
