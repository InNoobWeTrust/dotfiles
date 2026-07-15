# Agent Instructions

## Skill Compliance (Non-Negotiable)

**Loading or reading a skill's SKILL.md is a binding commitment to execute its complete workflow.** Complexity, length, and effort are NOT valid reasons to skip steps. See `../rules/skill-compliance.md` for full enforcement rules and swarm-intelligence hard-stop gates.

> You do NOT have discretion to simplify or abbreviate a skill's workflow once you have selected it.

## Code Quality & Engineering Principles (Always Active)

Rules live under `../rules/`. **Do not bulk-load every rule file.** Use `../rules/INDEX` as the map; load a rule body only when its trigger applies. The bullets below are the always-on pointers:

- **Code Quality Baseline**: `../rules/code-quality.md` applies to **every file you write or modify**, with no user request required. Before writing any function, class, or module, run the Pre-Implementation Design Checkpoint defined in that rule. Before finishing, verify the Prohibited Patterns list.
- **Grooming (Reverse Interviewing)**: `../rules/grooming.md` applies to **all plan creations and complex tasks**. Proactively grill the user with 3-5 high-value questions rather than accepting plans blindly.
- **Ubiquitous Language**: `../rules/ubiquitous-language.md` applies to **all logic modification tasks**. Always sync with the project's `GLOSSARY.md` before coding.
- **Test-Driven Development (TDD)**: `../rules/tdd.md` applies to **all logical modules, services, and algorithms**. Implement tests before concrete logic.
- **Vertical Slicing**: `../rules/slicing.md` applies to **all feature planning and execution checklists (`task.md`)**. Structure work in end-to-end vertical tracer bullets.
- **Self-Grounded Verification**: `../rules/self-grounded-verification.md` applies to **every verification, self-review, and "done" claim**. Defends against *agreement bias* (Andrade et al., ICLR 2026) — the tendency to validate whatever is already in context. Before declaring work correct, first state artifact-independent success criteria (including a disconfirming test), THEN evaluate the artifact against them with cited evidence. Never let a green-looking result or your own authorship substitute for grounded checking.
- **Autonomy Safety**: `../rules/autonomy-safety.md` applies whenever tools are auto-approved, the session is AFK/unattended, or the user waived per-step prompts. Consequence-first agency: reversible work may proceed inside agreed bounds; irreversible or high-blast-radius work requires human-in-the-loop. Allowlists grant capability, not authorization.
- **Memory**: `../rules/memory.md` applies to **all session save/restore work, dream-cycle consolidation, long-term memory eviction, and progressive-disclosure structuring of docs or code**. Short-term is unbounded; long-term is size-limited and grows only through human-approved consolidation. Handles the former handoff triggers plus consolidation and eviction. The full workflow lives in the `memory` skill.

## Scope-Based Routing

**Default for implementation tasks: load `code-craft`.** Load it any time you write or modify code logic. Use `../skills/INDEX.md` to select one primary skill; optionally add one review/safety lens when clearly beneficial.

### Always-On for Implementation
- **Any non-trivial code write, feature, or refactor** → Load `code-craft` (enforces SOLID, KISS, modularity, readability checkpoints)

### High-Impact Daily Skills
- **Bug/failure/debug "why" tasks** → Load `systematic-investigation`; compose with `code-craft` if the fix involves writing new code
- **Unfamiliar codebase navigation** → Load `codebase-exploration`
- **Auth/secrets/data handling** → Load `reviewer` for security review lens
- **Parsers, validators, branching logic** → Load `reviewer` for edge-case/boundary review
- **Explicit review requests** → Load `reviewer` (routes to the right sub-reviewer by artifact type)

### Specialized Skills (on explicit trigger)
- **Requirements/planning work** → Load `requirements-driven-dev`
- **Swarminator / multi-agent / single external node** → Load `swarm-intelligence` and pick Mode Single-Node or Full Swarm (Full Swarm preflight gates in skill-compliance.md). Prefer explicit mode selection; `/external-subagent` pins Single-Node and `/swarm` pins Full Swarm where those commands exist.
- **Bounded repetitive tasks** → Load `bounded-iteration`
- **UI/frontend polish** → Load `ui-ux`; compose with `code-craft` for component logic
- **Browser automation** → Load `cdp-browser-automation`
- **Data narratives/charts** → Load `data-storytelling`
- **Video workflow** → Load `video-production`
- **Foundation bootstrap / drift / missing core skills** → Load `project-foundation` (Mode A Bootstrap, B Audit/Evolve, or C Materialize). If `INDEX.md` points at a missing skill or `.agents/FOUNDATION.md` is absent in a repo that has `AGENTS.md`, prefer Mode B/C over continuing with a broken pack.

**Do not load skills** for: typos, formatting, config value changes, or renaming with no logic changes.

Use `../skills/INDEX.md` before loading skill bodies. Load one primary skill by default, plus at most one focused review or safety lens when justified.

## Git Safety

- Inspect status and diffs before staging or committing.
- Stage explicit files only; do not use `git add .` or `git add -A`.
- Do not stage secret-bearing files: `.env`, `*.pem`, `*.key`, `auth.json`, `credentials.json`.
- Do not run destructive operations such as `git reset`, `git restore`, `git clean`, `git stash`, or force push unless explicitly approved.
- Commit and push require separate user approvals.

## Process Management

- Do not kill or restart processes in zellij, tmux, or screen sessions.
- Do not start background processes with `&` or `nohup`.
- For server issues, identify and report the process or failure; do not restart it.

## Shell Invocation

Use a login shell for CLI commands when PATH or shell startup files matter:

```bash
$SHELL -l -c "swarminator --help"
```
