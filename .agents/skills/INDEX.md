# Skill Index

Use this index before loading any skill body. Select one primary skill by default. Add one review or safety lens only when the task clearly needs it.

| Skill | Cost | Use When | Do Not Use When |
| --- | --- | --- | --- |
| `code-craft` | medium | **Any non-trivial code write, feature addition, or refactor.** Adding a function/class/module, touching more than one file, or any task where the temptation is to add to an existing unit instead of making a new one. Load this by default for implementation tasks. | Typos, formatting, config value changes, or renaming without logic changes |
| `systematic-investigation` | medium | **Debugging, root cause, recurring failures, first-principles diagnosis, architectural decisions, pre-mortem, red-teaming.** | The task is a creative brainstorming session or a straightforward edit. |
| `brainstorming` | low | **Creative ideation, product design, open-ended problem solving, conceptual exploration.** When you need to generate volume, switch perspectives, or prioritize options. | Purely analytical debugging, root-cause analysis of bugs, or structured fixes. |
| `codebase-exploration` | medium | Finding where behavior lives in a large unfamiliar repo, tracing architecture, pattern discovery, module auditing | Relevant files are already known |
| `requirements-driven-dev` | high | User requests PRD, TRD, BDD, specs, acceptance criteria, or ambiguous feature planning | Small well-scoped fixes or implementation from an existing plan |
| `external-subagent` | low | **One bounded `swarminator` delegation that returns an immutable artifact.** Use for isolated research, targeted second opinions, or patch-only edit suggestions when full swarm orchestration is unnecessary or native subagents are unavailable. | Tasks that need multi-phase multi-node orchestration, quorum, or delegated workspace writes |
| `swarm-intelligence` | high | User says swarm, multi-agent, parallel agents, diverse perspectives, or the risk is too high for one pass | Routine implementation or git writes |
| `bounded-iteration` | high | Bounded repetitive work with machine-verifiable completion criteria | Ambiguous, subjective, unsafe, or design-heavy work |
| `reviewer` | varies | Explicit review of any artifact — code, docs, config, infra, designs. Lazy-loads sub-reviewers by type. | User asked only for implementation and no review is needed |
| `ui-ux` | medium | UI design or frontend polish | Non-UI tasks |
| `cdp-browser-automation` | medium | Browser automation, scraping, clicking, filling forms, real page testing | Static code inspection is enough |
| `data-storytelling` | medium | Turning data into evidence-backed narrative | No dataset or narrative goal exists |
| `video-production` | medium | Video production workflow | Non-video tasks |
| `talent-screening` | medium | **Screening CVs, background vetting, organization audits, and OSINT profiles.** When evaluating job candidates or performing talent market research. | Straightforward code editing or general non-HR tasks |
| `model-benchmarking` | low | **LLM selection, cost optimization, ELO auditing, and provider catalog analysis.** When configuring model suites or selecting cost-effective task nodes. | General non-LLM pricing or cost questions |
| `session-handoff` | low | **Session context saving, restorations, branch transitions, and context checkpoints.** When preparing to exit a session or restoring progress. | Simple short tasks with no need for state checkpointing |
| `multi-perspective-deliberation` | low | **Persona debates, pre-mortem challenges, design stress-testing, and strategy deliberation.** Runs concurrent subagents if supported or simulated context dialogues. | Straightforward mechanical tasks or simple direct fixes |

## Routing Rules

- Prefer no skill for simple edits (formatting, config values, renaming only).
- Prefer the narrowest skill that matches the user intent.
- Use `external-subagent` for one bounded external node through `swarminator`; use `swarm-intelligence` for multi-phase multi-node orchestration.
- Quick/narrow explicit reviews use one primary matching reviewer skill.
- Broad, mixed, or deep explicit reviews use `/review` command (loads the `reviewer` skill).
- Load deep references only after the selected skill requests them.
- For skill composition patterns and handoff points, see `WIRING.md`.
