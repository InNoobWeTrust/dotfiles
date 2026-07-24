# Skill Wiring

Central registry for skill composition. Individual skills are self-contained
modules — they describe what THEY do, not what other skills do. This file is
the single source of truth for how skills relate, compose, and hand off.

> **Maintenance rule**: When adding, renaming, or removing a skill, update
> this file. Do NOT add cross-references inside individual skills.

---

## Composition Patterns

### Investigation → Fix → Review

When debugging or fixing a problem:

1. `codebase-exploration` — if the codebase is unfamiliar, navigate first
2. `systematic-investigation` — root cause analysis
3. `code-craft` — disciplined implementation of the fix
4. `reviewer` (design-rigor lens) — verify the fix was disciplined

### Feature Implementation

1. `requirements-driven-dev` — if the feature is large or ambiguous
2. `codebase-exploration` — if touching unfamiliar areas
3. `code-craft` — disciplined implementation
4. `reviewer` — post-implementation review

### UI/UX Implementation

1. `ui-ux` — design quality lens & DESIGN.md visual system authority
2. `code-craft` — SOLID/modularity on component logic
3. `reviewer` (security lens) — input validation, auth on visual interfaces

### Browser Automation

1. `codebase-exploration` — map unfamiliar site structure before writing domain skills
2. `cdp-browser-automation` — automation implementation
3. `reviewer` (security lens) — for auth flows, cookies, sensitive data

### Bounded Iteration

1. `swarm-intelligence` (Full Swarm or design-first) — if the task needs design or decomposition first
2. `codebase-exploration` — if the codebase is unfamiliar
3. `bounded-iteration` — bounded iterative execution
4. `systematic-investigation` — if the loop hits oscillation or verifier failures
5. `reviewer` (security lens) — for auth, dependency, secrets, or network-facing work before AFK mode

### Delegated Execution / Swarminator

Any time a background worker, delegated agent, or external node is launched:

1. `subagent-dispatch` — construct the structured delegation prompt (scope, output contract, allowed actions, stop conditions)
2. **Environment-native delegated worker** when available, else **`swarm-intelligence`**:
   - Mode Single-Node — one bounded swarminator node (`swarm-intelligence/references/single-node.md`); pin via `/external-subagent` when that command exists
   - Mode Full Swarm — multi-phase multi-model orchestration; pin via `/swarm` when that command exists

### Project Foundation (Bootstrap, Materialize, Audit/Evolve)

When setting up or keeping a project's AI-augmented foundation honest:

1. `project-foundation` — Mode A Bootstrap | Mode B Audit/Evolve | Mode C Materialize core pack (full skill trees, not INDEX stubs)
2. `codebase-exploration` — if glossary/architecture need a domain map of an unfamiliar repo
3. `architecture-writer` — deep architecture doc when system design is complex
4. `devsecops` — CI/CD pipeline + integrated security scanning for the specific platform
5. `reviewer` — review generated governance files after bootstrap or major evolve

### DevSecOps Hardening

When hardening an existing project's pipeline and security posture:

1. `devsecops` — CI/CD design + full security audit (secrets, deps, SAST, IaC, audit trails) + scanner integration
2. `code-craft` — implement remediations for security findings
3. `reviewer` (security lens) — verify fixes address root vulnerabilities

### Strategic Positioning via OSINT

When public signals should shape outreach, direction, or decision-making:

1. `strategic-osint` — gather and translate public evidence into priorities, positioning, and next actions
2. Use `strategic-osint` for researching the target organization, decision-maker, or market to shape outreach; use `talent-screening` for evaluating people as candidates or hiring prospects
3. `brainstorming` — expand options after the signal map is clear
4. `requirements-driven-dev` — formalize the chosen direction into a PRD/TRD/spec if needed
5. `reviewer` (editorial or adversarial lens) — stress-test the resulting narrative or recommendation

### Skill Authoring & Maintenance

When creating or maintaining the .agents/ governance layer:

1. `skill-author` — Workflow A (create new skill) or Workflow B (quarterly audit + failure review)
2. `project-foundation` — if the audit reveals missing foundational files
3. `reviewer` (adversarial lens) — challenge the new skill or audit conclusions
4. `codebase-exploration` — if the new skill needs domain knowledge of the codebase

---

## Handoff Points

Natural transitions between skills:

| From | To | Trigger |
|---|---|---|
| `codebase-exploration` | `systematic-investigation` | "I understand the codebase, now I need to debug" |
| `codebase-exploration` | `code-craft` | "I understand the codebase, now I need to implement" |
| `systematic-investigation` | `brainstorming` | "Root cause analyzed, now brainstorming potential solutions" |
| `systematic-investigation` | `code-craft` | "Root cause found, now implementing the fix" |
| `systematic-investigation` | `skill-author` | "Failure pattern discovered, cataloging for governance review" |
| `brainstorming` | `requirements-driven-dev` | "Ideation complete, translating concepts to PRD/specs" |
| `brainstorming` | `code-craft` | "Concepts finalized, ready to prototype/implement" |
| `code-craft` | `reviewer` | "Implementation complete, ready for review" |
| `requirements-driven-dev` | `code-craft` | "Specs approved, now implementing" |
| `requirements-driven-dev` | `reviewer` (editorial lens) | "Polish specs before sharing with stakeholders" |
| `requirements-driven-dev` | `multi-perspective-deliberation` | "Draft specs completed, launching persona review to challenge assumptions" |
| `multi-perspective-deliberation` | `code-craft` | "Deliberation complete, starting implementation of the peer-reviewed design" |
| `multi-perspective-deliberation` | `model-benchmarking` | "Deliberation complete, optimizing model assignments for the selected architecture" |
| `model-benchmarking` | `swarm-intelligence` | "Models selected, ready to launch multi-agent swarm" |
| `model-benchmarking` | `requirements-driven-dev` | "Token costs and model limits analyzed, feeding into TRD/PRD architectural specs" |
| `talent-screening` | `reviewer` (editorial lens) | "Evaluation reports completed, ready for peer review" |
| `strategic-osint` | `brainstorming` | "The public-signal map is clear; now generate options or paths" |
| `strategic-osint` | `requirements-driven-dev` | "OSINT clarified priorities; now formalize the chosen direction" |
| `strategic-osint` | `reviewer` (editorial lens) | "Positioning draft is ready; now polish or challenge the narrative" |
| Any skill | `memory` (Capture) | "Handoff requested, serializing context and saving progress" |
| `memory` (Recall) | Any skill | "Session restored, resuming active work" |
| Any skill | `memory` (Consolidate via Subagent) | "Commit pending or explicit dream-cycle request, running report-only consolidation first" |
| `memory` (Consolidate via Subagent) | `memory` (Consolidate) | "Approval received or delegation unavailable; applying approved memory writes" |
| `memory` (Consolidate) | `memory` (Evict) | "Long-term size limits passed, running eviction pass" |
| Any skill | `memory` (Structure) | "Applying progressive-disclosure pattern to a docs directory or code module" |
| Any implementation skill | `reviewer` | "Review my work" |
| `subagent-dispatch` | `swarm-intelligence` (Single-Node) | "Prompt constructed, one bounded swarminator node (or equivalent explicit single-node mode)" |
| `subagent-dispatch` | `swarm-intelligence` (Full Swarm) | "Prompt constructed, multi-node orchestration (or equivalent explicit full-swarm mode)" |
| `swarm-intelligence` (Single-Node) | `swarm-intelligence` (Full Swarm) | "Bounded node insufficient; escalate to full swarm" |
| `multi-perspective-deliberation` | `subagent-dispatch` | "Launching delegated persona workers for the deliberation" |
| `project-foundation` | `architecture-writer` | "Project scaffolded, now writing detailed architecture doc" |
| `project-foundation` | `ui-ux` | "Project scaffolded with UI/frontend components; initializing DESIGN.md visual system" |
| `project-foundation` | `devsecops` | "Project scaffolded, now designing CI/CD with integrated security" |
| `project-foundation` | `reviewer` | "Governance files created, ready for review" |
| Any skill | `project-foundation` (Mode B) | "INDEX routes to missing skill, FOUNDATION.md missing, or architecture/glossary clearly stale vs repo" |
| `project-foundation` (Mode C) | `project-foundation` (Mode B) | "Core pack materialized; run full drift audit" |
| `devsecops` | `code-craft` | "Vulnerabilities found, now implementing remediations" |
| `devsecops` | `reviewer` (security lens) | "Pipeline and security config complete, verifying" |
| `architecture-writer` | `project-foundation` | "Architecture mapped, updating GLOSSARY.md with discovered terms" |
| `architecture-writer` | `reviewer` (design-rigor lens) | "Architecture doc written, now reviewing for design discipline" |
| `skill-author` (Workflow B) | `skill-author` (Workflow A) | "Audit reveals skill gap — creating new skill to fill it" |
| `skill-author` (Workflow B) | `project-foundation` | "Audit reveals missing foundational files — bootstrapping them" |
| `skill-author` (Workflow B) | `reviewer` | "Audit complete, challenging conclusions" |
| `skill-author` (Workflow A) | `reviewer` | "New skill written, ready for adversarial review" |
| `skill-author` (Workflow A) | `skill-author` (Workflow B) | "New skill registered, queued for next quarterly audit" |

---

## Provenance

Some reviewer sub-lenses are derived from implementation skills. The sub-lens
reviews whether the skill's principles were followed — it does not re-run the
skill.

| Reviewer Sub-Lens | Derived From | Relationship |
|---|---|---|
| `reviewer/references/sub-reviewers/design-rigor.md` | `code-craft`, `systematic-investigation` | Reviews whether design discipline and investigation rigor were applied |

---

## Default Composition Rules

- **Default for implementation**: load `code-craft`. Any task that writes or
  modifies code logic should use `code-craft` as the primary skill unless a
  narrower skill already covers the design dimension.
- `code-craft` can be composed with any other primary skill as a design lens —
  e.g. `systematic-investigation` (primary) + `code-craft` (design lens).
- Prefer no skill for simple edits (formatting, config values, renaming only).
- Prefer the narrowest skill that matches the user intent.
- **Project setup**: `project-foundation` → `devsecops` (foundation first, then secure the pipeline).
- **Security hardening**: `devsecops` → `code-craft` → `reviewer` (security lens).
- **Governance maintenance**: `skill-author` is the entry point; it routes to `project-foundation` or back to itself (Workflow A) as gaps are found.
- **Management reporting**: Not a skill — refer to `docs/ai-augmented-project-setup-and-evolution.md` §9 for what to report. Define your org's reporting template and generate ad-hoc using `data-storytelling` for data interpretation.
