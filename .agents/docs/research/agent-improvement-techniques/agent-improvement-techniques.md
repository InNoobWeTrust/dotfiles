# Agent Improvement Techniques — Research Map & Backlog

> **Status:** research-phase (not battle-tested).  
> **Audience:** skill authors, leads evolving `code-craft` / memory / multi-agent skills.  
> **Language:** English-first (agent-searchable wiki).

Research-backed practices for improving *how agents work* (prompts, workflows, memory, tools)—not model training. Maps each technique to what already exists in this repo, gaps, and a prioritized backlog for a later skill patch. Promote to a battle-tested section only after review and adoption.

**Decisions locked for this pass (grooming 2026-07-23):**

| Decision | Choice |
|---|---|
| Delivery | Docs only first |
| RL papers (STAPO / RAPO / T-STAR) | Prompt-level analogs only (no training claims) |
| SOAR | Self-observation loop (tool/env ground truth each step) |
| DoD | Mapping + backlog only |

Deep source notes (paper abstracts, links): [details/agent-improvement-research-notes.md](./details/agent-improvement-research-notes.md).

---

## Problem statement

Agents in this repo already have strong discipline (code-craft phases, memory, multi-perspective deliberation, evaluator-style review). Research still offers *named patterns* we have not fully labeled or wired. Goal: make those patterns explicit, avoid re-implementing training-time RL, and backlog skill/doc changes without bloating always-on prompts.

---

## Coverage matrix

Legend: **Strong** = first-class skill/rule · **Partial** = present but unlabeled or incomplete · **Gap** = missing or only accidental.

| Technique | Source family | Repo home today | Coverage | Prompt-level takeaway |
|---|---|---|---|---|
| Spec-as-docs | Karpathy-style agent ops | `requirements-driven-dev`, `rules/grooming.md`, `rules/slicing.md` | **Strong** | Specs (PRD/TRD/BDD) are the durable interface; implement against them, not chat. |
| Context-as-wiring-diagram | Karpathy / context eng. | `docs/.../skill-composition.md`, `AGENTS.md` hierarchy, `codebase-exploration` maps | **Partial** | Prefer a small map of systems + handoffs over dumping files; treat wiring as first-class context. |
| Multi-agent panels | Karpathy / Anthropic parallelization | `multi-perspective-deliberation`, `swarm-intelligence`, `reviewer` | **Strong** | Independent lenses beat one overloaded monologue; synthesize, don’t average. |
| ACI (Agent–Computer Interface) | Anthropic *Building effective agents* | Tool docs in harness; `subagent-dispatch` pillars; partial in skill templates | **Partial** | Design tools/skills like junior-dev APIs: clear names, absolute paths, poka-yoke, minimal overlap. |
| Evaluator–optimizer loop | Anthropic workflows | `bounded-iteration`, `reviewer` + `rules/self-grounded-verification.md`, TDD in code-craft | **Partial** | Separate *generate* from *score against criteria*; loop only when criteria are objective. |
| Just-in-time context | Anthropic context eng. | `codebase-exploration` progressive load; skill progressive disclosure | **Strong** | Hold identifiers (paths, queries); load detail on demand; hybrid: small always-on index + JIT leaves. |
| Context compaction | Anthropic context eng. | Memory dream cycle; subagent return summaries | **Partial** | Summarize high-fidelity before window rot; clear stale tool results; keep decisions + open bugs. |
| Structured note-taking | Anthropic agentic memory | `memory` skill (short-term / long-term) | **Strong** | Persist NOTES outside the window; re-read after compaction/session reset. |
| Trajectory awareness (STAPO analog) | STAPO arXiv:2607.04963 | Implicit in long sessions; no explicit mid-trajectory restatement | **Gap** | Re-anchor goal + history at uncertain steps; penalize “forgetting the thread.” |
| Retrieval-augmented policy (RAPO analog) | RAPO arXiv:2603.03078 | Memory recall; clone-and-mutate exploration | **Partial** | Retrieve *step-level* prior traces (similar bug/fix), not only full sessions; condition next action on them. |
| Thought grafting (T-STAR analog) | T-STAR arXiv:2604.07165 | Multi-agent branch compare; no formal graft | **Gap** | At divergence, contrast success vs fail branches; graft the successful reasoning into the failing path. |
| SOAR / self-observation | Interpreted per grooming | Tool loops + tests; weak as explicit habit | **Partial** | Every step: observe env ground truth → update belief → act; chunk winning procedures into memory/skills. |

---

## Technique briefs (operational, not academic)

### Karpathy-style frameworks

1. **Spec-as-docs** — The durable artifact is a written spec (acceptance criteria, interfaces, non-goals). Chat is ephemeral. Already aligned with `requirements-driven-dev` and code-craft Design Intent.
2. **Context-as-wiring-diagram** — Before deep file reads, produce a small diagram/map: modules, data ownership, call edges, skill handoffs. Prefer that map as context over raw dumps.
3. **Multi-agent panels** — Parallel specialized roles (product, arch, security, adversarial) with a synthesis step. Already `multi-perspective-deliberation` / swarm modes.

### Anthropic guidelines

1. **ACI** — Tools and skills are the agent’s keyboard. Invest in descriptions, examples, non-overlapping capabilities, failure-hard-to-do formats (absolute paths, structured outputs).
2. **Evaluator–optimizer** — Generator produces; evaluator scores with explicit criteria and may request revision. Fits translation, search completeness, and code against tests/acceptance.
3. **Just-in-time context** — Don’t preload the haystack; keep pointers and fetch.
4. **Compaction** — When long-horizon: summarize (architecture decisions, open issues, last files) and restart context; clear obsolete tool payloads.
5. **Structured notes** — External memory files with re-injection protocol (this repo’s memory skill).

### Recent paradigms → prompt analogs only

| Paper | Training idea (do not implement here) | Agent habit we *can* adopt |
|---|---|---|
| **STAPO** | RL focuses sparse credit on trajectory-neglect steps via normalized entropy | Mid-task **trajectory checkpoint**: restate goal, last 3 facts, open risks when confidence drops or after N tool turns |
| **RAPO** | Hybrid rollout + retrieved off-policy step traces expands exploration | **Retrieve-then-act**: pull similar past fixes/traces from memory or repo before exploring blindly |
| **T-STAR** | Merge trajectories into a cognitive tree; graft thoughts at critical forks | **Branch graft**: keep short failed-path notes; when a parallel attempt succeeds, import its reasoning at the fork |
| **SOAR (self-observation)** | (Interpretation) learn from observed outcomes | **Observe → note → act**: never plan past unverified tool results; promote repeated successes into short-term then long-term memory |

---

## Gap analysis (actionable)

| ID | Gap | Why it hurts | Candidate later home |
|---|---|---|---|
| G1 | No explicit **trajectory checkpoint** protocol | Long sessions drift from goal (trajectory neglect) | `code-craft` Phase 3/4 note, or always-on light rule pointer |
| G2 | No **compaction checklist** for operators | Context rot → wrong edits | `memory` Structure/Capture + session ops doc |
| G3 | ACI not named in skill/tool authoring | Skill authors under-document tools | `skill-author` + `subagent-dispatch` refs |
| G4 | Evaluator–optimizer not a first-class *named* loop outside tests | Subjective “looks good” reviews | Link `bounded-iteration` + `reviewer` criteria-first |
| G5 | Thought-graft / branch contrast not templated | Parallel agents waste successful reasoning | `swarm-intelligence` / multi-perspective synthesis template |
| G6 | Wiring-diagram artifact optional | Agents dump files instead of maps | `codebase-exploration` report templates (already partial) |
| G7 | RAPO-style **step-level** retrieval weak | Session digests too coarse | `memory` recall templates: “similar incident steps” |

Non-goals for skill work:

- Implementing RL training, reward models, or paper reproductions.
- New harness-specific memory tools (repo memory stays file-based / harness-agnostic).
- Alias skill directories after merges.

---

## Prioritized backlog (post-docs)

Originally ordered for a future implementation slice. **P1–P7 are now materialized in the live skill setup (prompt-level only).**

| Prio | Item | Effort | Depends on | Acceptance / Status |
|---|---|---|---|---|
| P0 | Keep this map current; link from skills-and-rules INDEX | Done (this doc) | — | Entry discoverable from section INDEX |
| P1 | Add **trajectory checkpoint** micro-protocol to code-craft progressive ref | S | G1 | **Done** — `code-craft` loads `references/trajectory-checkpoint.md` on long tool chains |
| P2 | Name **evaluator–optimizer** in bounded-iteration + reviewer cross-links | S | G4 | **Done** — criteria-before-generation/review wired into both skills |
| P3 | ACI checklist in skill-author / tool-writing guidance | S | G3 | **Done** — `skill-author` loads `references/aci-checklist.md` |
| P4 | Compaction + note re-injection checklist in memory refs | M | G2 | **Done** — memory refs now define context compaction use |
| P5 | Branch-graft synthesis section in multi-perspective / swarm | M | G5 | **Done** — shared branch-graft protocol added for synthesis conflicts |
| P6 | Step-level “similar trace” recall template in memory | M | G7 | **Done** — Recall can query prior incidents by step/blocker/recovery shape |
| P7 | Optional “wiring diagram” first deliverable in codebase-exploration | S | G6 | **Done** — architecture-map template is now the default system-understanding deliverable |

Implementation order shipped: **code-craft** → **bounded-iteration/reviewer** → **skill-author** → **memory** → **swarm / multi-perspective** → **codebase-exploration**.

---

## Idea dump (diverge — not committed)

- Single always-on rule “attention budget” with 5 bullets (too heavy? prefer progressive refs).
- Session-end auto prompt: “write trajectory summary to short-term” (ties to memory pre-commit checkpoint).
- Eval harness for skills themselves (golden tasks) — out of scope for first skill patch.
- External research agent periodically refreshes paper links in details leaf.
- Map Anthropic workflow names (routing, orchestrator-workers) onto existing AGENTS routing table.

---

## Top recommendations (converge)

1. **Ship docs-only map** (this page + research notes) — *done earlier*.
2. **Ship prompt-level skill materialization** for P1–P7 — *done in the live setup*.
3. **Do not** train or claim STAPO/RAPO/T-STAR implementations; keep paper fidelity in the details leaf and operational habits in skills.
4. **Reuse** existing evaluator machinery (tests, self-grounded verification, bounded-iteration) rather than a new skill.

---

## Next experiments (when skill work is approved)

1. Dry-run a multi-agent fix with forced branch-graft synthesis; measure whether duplicate work drops.
2. Observe whether trajectory checkpoints reduce thrash in long implementation threads.
3. Promote specific patterns from research to battle-tested docs only after repeated use evidence.

---

## Related repo docs

- [Skill composition / WIRING (battle-tested)](../../skills-and-rules/skill-composition.md)
- [Designing skills (battle-tested)](../../skills-and-rules/designing-skills.md)
- [Failure patterns catalog (battle-tested)](../../skills-and-rules/failure-patterns-catalog.md)
- [Working with AI agents (battle-tested)](../../project-lifecycle/working-with-ai-agents.md)
- [Research INDEX (not battle-tested)](../INDEX.md)
- Primary skills: `code-craft`, `memory`, `requirements-driven-dev`, `multi-perspective-deliberation`, `swarm-intelligence`, `bounded-iteration`, `subagent-dispatch`, `reviewer`
