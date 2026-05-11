# Skill Index

Use this index before loading any skill body. Select one primary skill by default. Add one review or safety lens only when the task clearly needs it.

| Skill | Cost | Use When | Do Not Use When |
| --- | --- | --- | --- |
| `systematic-investigation` | medium | Debugging, root cause, recurring failures, first-principles diagnosis, architectural decisions, brainstorming solutions, ideation, pre-mortem, red-teaming | The task is a straightforward edit or known change |
| `codebase-exploration` | medium | Finding where behavior lives in a large unfamiliar repo, tracing architecture, pattern discovery, module auditing | Relevant files are already known |
| `requirements-driven-dev` | high | User requests PRD, TRD, BDD, specs, acceptance criteria, or ambiguous feature planning | Small well-scoped fixes or implementation from an existing plan |
| `swarm-intelligence` | high | User says swarm, multi-agent, parallel agents, diverse perspectives, or the risk is too high for one pass | Routine implementation or git writes |
| `ralph-loop` | high | Bounded repetitive work with machine-verifiable completion criteria | Ambiguous, subjective, unsafe, or design-heavy work |
| `adversarial-reviewer` | medium | Explicit review/challenge/stress test of a document, design, code, or decision | User asked only for implementation and no review is needed |
| `edge-case-hunter` | medium | Boundary-condition review for parsers, validators, state machines, auth, or branching logic | General prose or product strategy review |
| `security-reviewer` | medium | Auth, secrets, data handling, infrastructure, dependencies, supply chain, threat modeling | Non-security docs or simple local-only edits |
| `editorial-reviewer` | low | Polish, restructure, shorten, or clarify prose | Code behavior review |
| `ui-ux` | medium | UI design or frontend polish | Non-UI tasks |
| `ai-ui-generation` | medium | Integrating externally generated UI output | Hand-coded UI changes without external generation |
| `cdp-browser-automation` | medium | Browser automation, scraping, clicking, filling forms, real page testing | Static code inspection is enough |
| `data-storytelling` | medium | Turning data into evidence-backed narrative | No dataset or narrative goal exists |
| `video-production` | medium | Video production workflow | Non-video tasks |

## Routing Rules

- Prefer no skill for simple edits.
- Prefer the narrowest skill that matches the user intent.
- Quick/narrow explicit reviews use one primary matching reviewer skill.
- Broad, mixed, or deep explicit reviews use `review.prompt.md` orchestration.
- Load deep references only after the selected skill requests them.
