---
description: >
  Proxy command that delegates to the swarm-intelligence skill.
  Loads the skill for domain configs, persona definitions, and model selection.
---

# Swarm — Multi-Agent Parallel Node Guidance

## Do This First

1. Read `~/.agents/skills/swarm-intelligence/SKILL.md`.
2. For normal orchestration, read only `references/orchestrator/minimal-flow.md`, one domain config, and `references/models/*.json`.
3. Pull extra files only when the skill routes you to them.

## Quick Start

```bash
# CORRECT — always use login shell so kilo-swarm is on PATH
zsh -l -c 'echo "Build a REST API" | kilo-swarm -d references/domains/code/config.json'
```

## Hard Rules

- `kilo-swarm` runs one node, not a full swarm.
- Phase 1 requires 2 valid JSON outputs per persona.
- If the skill says a phase is blocked, stop; do not improvise past the failure.
- Swarm nodes return JSON only and do not write files.
- `references/orchestrator/minimal-flow.md` is the canonical execution path.
- **Always use login shell** (`zsh -l -c '...'`) to ensure `kilo-swarm` is on PATH and user environment is properly sourced.
