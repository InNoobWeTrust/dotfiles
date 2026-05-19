# Skill Index

Use this index before loading any skill body. Select one primary skill by default. Add one review or safety lens only when the task clearly needs it.

| Skill | Cost | Use When | Do Not Use When |
| --- | --- | --- | --- |
| `code-design` | medium | **Any non-trivial code write, feature addition, or refactor.** Adding a function/class/module, touching more than one file, or any task where the temptation is to add to an existing unit instead of making a new one. Load this by default for implementation tasks. | Typos, formatting, config value changes, or renaming without logic changes |
| `systematic-investigation` | medium | Debugging, root cause, recurring failures, first-principles diagnosis, architectural decisions, brainstorming solutions, ideation, pre-mortem, red-teaming | The task is a straightforward edit or known change |
| `codebase-exploration` | medium | Finding where behavior lives in a large unfamiliar repo, tracing architecture, pattern discovery, module auditing | Relevant files are already known |
| `requirements-driven-dev` | high | User requests PRD, TRD, BDD, specs, acceptance criteria, or ambiguous feature planning | Small well-scoped fixes or implementation from an existing plan |
| `swarm-intelligence` | high | User says swarm, multi-agent, parallel agents, diverse perspectives, or the risk is too high for one pass | Routine implementation or git writes |
| `ralph-loop` | high | Bounded repetitive work with machine-verifiable completion criteria | Ambiguous, subjective, unsafe, or design-heavy work |
| `reviewer` | varies | Explicit review of any artifact — code, docs, config, infra, designs. Lazy-loads sub-reviewers by type. | User asked only for implementation and no review is needed |
| `ui-ux` | medium | UI design or frontend polish | Non-UI tasks |
| `cdp-browser-automation` | medium | Browser automation, scraping, clicking, filling forms, real page testing | Static code inspection is enough |
| `data-storytelling` | medium | Turning data into evidence-backed narrative | No dataset or narrative goal exists |
| `video-production` | medium | Video production workflow | Non-video tasks |

## Routing Rules

- **Default for implementation: load `code-design`.** Any task that writes or modifies code logic should use `code-design` as the primary skill unless a narrower skill (e.g. `systematic-investigation` for debugging) already covers the design dimension.
- Prefer no skill for simple edits (formatting, config values, renaming only).
- Prefer the narrowest skill that matches the user intent.
- Quick/narrow explicit reviews use one primary matching reviewer skill.
- Broad, mixed, or deep explicit reviews use `/review` command (loads the `reviewer` skill).
- Load deep references only after the selected skill requests them.
- `code-design` can be composed with any other primary skill as a design lens — e.g. `systematic-investigation` (primary) + `code-design` (design lens).
