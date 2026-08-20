# Skill Wiring

Central registry for skill composition. Individual skills are self-contained
modules — they describe what THEY do, not what other skills do. This file is
the single source of truth for how skills relate, compose, and hand off.

> **Maintenance rule**: When adding, renaming, or removing a skill, update
> this file. Composition policy lives here; individual skills may still mention operational handoff triggers when another skill boundary materially affects execution.

---

## Composition Patterns

### Investigation → Fix → Review

When debugging or fixing a problem:

1. `codebase-exploration` — if the codebase is unfamiliar, navigate first
2. `systematic-investigation` — root cause analysis
3. `code-craft` — disciplined implementation of the fix
4. `reviewer` (design-rigor lens) — verify the fix was disciplined

### Feature Implementation

Apply `rules/phased-delivery.md` for its trigger. Keep the active milestone
packet as the contract passed between steps.

1. Shallow research (`codebase-exploration` only for unfamiliar areas) — stop
   when the active decision, slice boundary, and non-deferrable boundaries are clear
2. Roadmap — only for multi-milestone work; otherwise select the active milestone
3. Active-milestone architecture calibration → phase and vertical-slice planning
4. `code-craft` — implement and verify one active slice at a time
5. `reviewer` — phase-aware review of the active contract, evidence, and compromises
6. Record evidence and feedback; select the canonical feedback decision in `rules/phased-delivery.md`

Use `requirements-driven-dev` and PRD/TRD/BDD artifacts only when the
phased-delivery escalation rules require formalization. When delegating,
`subagent-dispatch` receives the complete Active Milestone Packet contract.

### UI/UX Implementation

1. `ui-ux` — design-driven workflow: discover → journey → layout → states → style → code → verify (writes UX-SPEC.md as design contract)
2. `code-craft` — Phase 6 implementation methodology (SOLID/modularity on component logic)
3. `reviewer` (security lens) — input validation, auth on visual interfaces
4. `web-qa-audit` — optional Phase 7 browser-based verification for Deep track

### Data Story → Visual → Illustration

1. `data-storytelling` — derive the answer-first narrative, evidence, and supporting chart needs
2. `illustration-craft` — only when Mermaid or standard charts are insufficient and bespoke composition is required
3. `reviewer` (editorial or design-rigor lens) — optional polish pass for high-stakes deliverables

### Architecture → Story → Illustration

1. `architecture-design` — map the system, tradeoffs, and current/target state
2. `data-storytelling` — shape the architecture findings into an audience-aware narrative when the audience is non-technical or decision-oriented
3. `illustration-craft` — produce the final bespoke explainer only if Mermaid/C4 alone cannot carry the message

### Browser Automation

1. `codebase-exploration` — map unfamiliar site structure before writing domain skills
2. `cdp-browser-automation` — automation implementation and quick live repros / mechanical page verification
3. `reviewer` (security lens) — for auth flows, cookies, sensitive data

### Web QA Audit

**Default (eng-only audience):**

1. `reviewer` (black-box-qa lens) — decide whether executable QA is required
2. `web-qa-audit` — audit scope, scenario shape, evidence contract, materialization plan
3. `cdp-browser-automation` — browser mechanics for live interaction and evidence capture
4. `reviewer` — judge findings or review the resulting QA plan when needed

**Branch — non-dev / business / release-owner audience (after machine evidence exists):**

- B1. `web-qa-audit` (stakeholder-report path) — *(intra-skill path switch)* project YAML/MD into Excel / PDF / static HTML under projection gates
- B2. `data-storytelling` — optional polish for high-stakes executive narrative **after** projection gates pass
- B3. `reviewer` — judge findings or review the pack when needed

Do **not** run branch steps B1–B2 for eng-only spot checks or eng-only audits.

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
3. `architecture-design` — deep architecture doc, system design, or ADR writing when system architecture is complex
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

### Database Design → Database Access Implementation

When schema design is complete and the access layer must be implemented:

1. `db-design` — schema modeling, migrations, typed DTO mapping design
2. `database-access` — implement repositories/adapters, session lifecycle, write contracts, test strategy
3. `code-craft` — disciplined implementation of non-trivial adapter code (SOLID, modularity)
4. `reviewer` (security lens) — verify parameterization, entity boundary, injection risks

When data-access boundaries or capabilities must be decided at an architectural level first:

1. `architecture-design` — decide data-access boundaries, facade selection, capability declaration
2. `database-access` — implement the declared boundaries and capability contract
3. `code-craft` — disciplined adapter implementation
4. `reviewer` (design-rigor lens) — verify boundary discipline

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
| Feature planning | `requirements-driven-dev` | "The active milestone has a material PRD/TRD/BDD escalation trigger" |
| `code-craft` | `reviewer` | "Active slice complete; review its contract, evidence, and compromises" |
| `reviewer` | Feature planning | "Select or revisit the canonical phased-delivery feedback decision" |
| `systematic-investigation` | `brainstorming` | "Root cause analyzed, now brainstorming potential solutions" |
| `systematic-investigation` | `code-craft` | "Root cause found, now implementing the fix" |
| `systematic-investigation` | `skill-author` | "Failure pattern discovered, cataloging for governance review" |
| `brainstorming` | `requirements-driven-dev` | "Ideation complete, translating concepts to PRD/specs" |
| `brainstorming` | `code-craft` | "Concepts finalized, ready to prototype/implement" |
| `code-craft` | `reviewer` | "Implementation complete, ready for review" |
| `requirements-driven-dev` | `code-craft` | "Specs approved, now implementing" |
| `reviewer` (black-box-qa lens) | `web-qa-audit` | "Heuristic review says live browser evidence or structured QA is required" |
| `web-qa-audit` (grooming path) | `web-qa-audit` (browser-audit path) | "Audit-request/run-card is now explicit and QA has approved the scope" |
| `web-qa-audit` | `cdp-browser-automation` | "Audit scope is set; now perform browser interaction and evidence capture" |
| `web-qa-audit` | `web-qa-audit` (stakeholder-report path) | "Machine evidence ready **and** audience is non-dev/business/release-owner — *(intra-skill path switch)*" |
| `web-qa-audit` (stakeholder-report path) | `data-storytelling` | "Projection gates passed; high-stakes executive narrative polish requested" |
| `data-storytelling` | `illustration-craft` | "The story is clear, but Mermaid or standard charts cannot carry the message cleanly" |
| `architecture-design` | `illustration-craft` | "The architecture is documented, but the final artifact needs a bespoke explainer, infographic, or presentation-grade visual beyond Mermaid" |
| `architecture-design` | `data-storytelling` | "Architecture is mapped, but the audience needs an answer-first narrative or decision framing" |
| `illustration-craft` | `reviewer` (editorial lens) | "Illustration drafted, ready for critical readability / communication review" |
| `web-qa-audit` | `reviewer` | "Executable QA produced findings or a plan that needs critical judgment" |
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
| `strategic-osint` | `investment-assessment` | "Public signals gathered; now size/allocate or diligence a product" |
| `brainstorming` | `investment-assessment` | "Options framed; now diligence or allocate capital" |
| `investment-assessment` | `multi-perspective-deliberation` | "Draft memo ready; finance cast challenge" |
| `investment-assessment` | `reviewer` (investment-memo lens) | "Memo complete; independent suitability/regime review" |
| `investment-assessment` | `swarm-intelligence` (finance domain) | "High-stakes allocation; multi-model finance personas" |
| `reviewer` (investment-memo lens) | `investment-assessment` | "Review failed gates; revise size/allocation" |
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
| `project-foundation` | `architecture-design` | "Project scaffolded, now writing detailed architecture doc or selecting patterns" |
| `project-foundation` | `ui-ux` | "Project scaffolded with UI/frontend components; initializing DESIGN.md visual system" |
| `project-foundation` | `devsecops` | "Project scaffolded, now designing CI/CD with integrated security" |
| `project-foundation` | `reviewer` | "Governance files created, ready for review" |
| Any skill | `project-foundation` (Mode B) | "INDEX routes to missing skill, FOUNDATION.md missing, or architecture/glossary clearly stale vs repo" |
| `project-foundation` (Mode C) | `project-foundation` (Mode B) | "Core pack materialized; run full drift audit" |
| `devsecops` | `code-craft` | "Vulnerabilities found, now implementing remediations" |
| `devsecops` | `reviewer` (security lens) | "Pipeline and security config complete, verifying" |
| `architecture-design` | `project-foundation` | "Architecture mapped, updating GLOSSARY.md with discovered terms" |
| `architecture-design` | `reviewer` (design-rigor lens) | "Architecture doc written, now reviewing for design discipline" |
| `skill-author` (Workflow B) | `skill-author` (Workflow A) | "Audit reveals skill gap — creating new skill to fill it" |
| `skill-author` (Workflow B) | `project-foundation` | "Audit reveals missing foundational files — bootstrapping them" |
| `skill-author` (Workflow B) | `reviewer` | "Audit complete, challenging conclusions" |
| `skill-author` (Workflow A) | `reviewer` | "New skill written, ready for adversarial review" |
| `skill-author` (Workflow A) | `skill-author` (Workflow B) | "New skill registered, queued for next quarterly audit" |
| `architecture-design` | `mermaid-validation` | "Mermaid diagram generated, validating syntax before embedding" |
| `data-storytelling` | `mermaid-validation` | "Mermaid visual created, validating syntax before embedding" |
| `db-design` | `database-access` | Schema finalized — implement the access layer (repositories, session lifecycle, write contracts) |
| `architecture-design` | `database-access` | Data-access boundaries and capability contract decided — implement them |
| `database-access` | `code-craft` | Non-trivial adapter implementation needs SOLID/modularity discipline |
| `database-access` | `reviewer` | Access layer complete — security lens (injection, entity exposure) or design-rigor lens (boundary discipline) |
| `db-design` | `mermaid-validation` | "ER diagram generated, validating syntax before embedding" |

---

## Provenance

Some reviewer sub-lenses are derived from implementation skills. The sub-lens
reviews whether the skill's principles were followed — it does not re-run the
skill.

| Reviewer Sub-Lens | Derived From | Relationship |
|---|---|---|
| `reviewer/references/sub-reviewers/design-rigor.md` | `code-craft`, `systematic-investigation` | Reviews whether design discipline and investigation rigor were applied |
| `reviewer/references/sub-reviewers/investment-memo.md` | `investment-assessment`, swarm finance personas | Reviews rails, regime, role discipline, class-fit, sizing vs pain |

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
- **Personal/portfolio investing (multi-asset)**: `investment-assessment` (author) → optional `multi-perspective-deliberation` finance cast or `reviewer` investment-memo lens → `swarm-intelligence` finance domain only for high-stakes multi-model. Personas under `swarm-intelligence/references/personas/finance/` via `discover-personas.sh`.
- **Management reporting**: Not a skill — refer to `docs/ai-augmented-project-setup-and-evolution.md` §9 for what to report. Define your org's reporting template and generate ad-hoc using `data-storytelling` for data interpretation.
