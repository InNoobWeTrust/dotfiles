---
description: "Applies when user requests or slash commands map to workflows. Directly routes slash commands and command triggers to skills instead of intermediate prompt files."
globs: "*"
alwaysApply: false
trigger: model_decision
---

# Command & Slash Shortcut Routing

Harnesses increasingly deprecate standalone command prompts in favor of tagging skills directly. When a user invokes a slash shortcut or command-like trigger phrase, map it directly to the primary skill and workflow reference below:

| User / Slash Command | Target Skill & Workflow | Notes |
| --- | --- | --- |
| `/requirements`, "requirements", "PRD", "TRD", "BDD", "spec this" | `requirements-driven-dev` | Load `references/core/lifecycle.md` for full lifecycle |
| `/swarm`, "swarm", "multi-agent", "parallel agents" | `swarm-intelligence` | Select Mode Full Swarm |
| `/external-subagent`, "single-node", "subagent worker" | `swarm-intelligence` | Select Mode Single-Node |
| `/bounded-iteration`, `/ralph`, "loop", "run until done", "bounded iteration" | `bounded-iteration` | Machine-verifiable iteration loop |
| `/memory`, "save handoff", "checkpoint", "save context", "remember this", "resume", "consolidate memory", "dream cycle", "prune memory" | `memory` | Two-tier session memory and consolidation |
| `/benchmark-agents`, `/benchmark`, "optimize agents", "model comparison" | `model-benchmarking` | Model benchmarking, ELO, pricing comparison |
| `/sync-mcp`, "sync mcp", "update mcp config" | `project-foundation` | Load `references/mcp-sync.md` to sync `.agents/mcp.json` |
| `/brainstorming`, `/brainstorm`, "ideate" | `brainstorming` | Structured multi-phase ideation |
| `/sync-remote-skills`, "sync remote skills", "pull remote skills" | `skill-author` | Load `references/remote-skills-sync.md` (`sync-remotes.sh`) |
| `/cv-screening`, "screen CVs", "review candidates" | `talent-screening` | Structured CV + OSINT candidate evaluation |
| `/shard-doc`, "shard doc", "split document", "chunk document" | `doc-craft` | Load `references/progressive-disclosure.md` §Pattern B |
| `/index-docs`, "index docs", "build doc index", "documentation index" | `doc-craft` | Load `references/progressive-disclosure.md` §Directory Indexing |
| `/party-mode`, "party mode", "coordinate agents" | `multi-perspective-deliberation` | Multi-persona adversarial stress testing |
| `/grill-me`, "grill me", "informed alignment" | `rules/grooming.md` + `code-craft` | Explain-first informed alignment interview |
