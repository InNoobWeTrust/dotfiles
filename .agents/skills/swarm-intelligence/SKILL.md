---
name: swarm-intelligence
description: Orchestrates multi-agent swarms for parallel, read-only execution and multi-phase output synthesis.
---

Swarm-intelligence orchestrates a three-phase workflow by calling `swarminator` once per node (one model + one persona prompt per invocation) and synthesizing Markdown artifacts between phases. All CLI interface details are obtained at runtime from `swarminator` itself.

## Quick References (Runtime)

```bash
$SHELL -l -c 'swarminator --help'              # CLI flags, examples, tutorial mode
$SHELL -l -c 'swarminator --list-agents'        # available agent binaries & status
$SHELL -l -c 'swarminator --list-models --agent NAME'  # models per agent
$SHELL -l -c 'swarminator --tutorial swarm'     # built-in swarm orchestration guide
$SHELL -l -c 'swarminator --phases'             # intent-to-phase map
$SHELL -l -c 'swarminator --protocol'           # envelope format
$SHELL -l -c 'swarminator --tutorial "agent modes"'  # ACP agent mode docs
$SHELL -l -c 'swarminator --tutorial rules'     # exit codes & safety rules
```

## Preconfigured References

All files are relative to this skill directory (`~/.agents/skills/swarm-intelligence/`):

- **Personas:** `references/personas/<group>/<name>.md` — YAML frontmatter + system prompt body.
- **Persona discovery:** `./references/discover-personas.sh` — lists, searches, and retrieves full prompt text from persona files.
- **Model catalogs:** `references/models/free.json` and `references/models/premium.json` — pre-vetted model IDs grouped by tier.
- **`deepseek-v4-pro` (command-code):** Open-weight 1.6T MoE (49B active), 1M context, MIT license. Listed in both catalogs under `engine: "command-code"`. Via Command Code: 75% off through 2026-05-31 ($0.435/$0.87/M tokens, promo list price $1.74/$3.48). #1 open-source coding model — SWE-Bench Verified 80.6%, LiveCodeBench 93.5%, Terminal-Bench 2.0 67.9%, Codeforces 3206. WARNING: promo expires 2026-05-31 — cost will rise 4×; reclassify placement in catalogs before then if it should move from free-tier to premium-tier.
- **senior-reviewer persona:** Defined inline below (no file — always use the inline definition).

## Preflight Checklist

1. Confirm user wants multi-agent swarm orchestration.
2. Identify primary domain (code, skill-review, writing, slides, design, pm, finance).
3. Clarify final deliverable shape.
4. Confirm read-only node constraint is acceptable.
5. Verify swarminator: `$SHELL -l -c 'command -v swarminator'`.
6. Inspect CLI: `$SHELL -l -c 'swarminator --help'`.
7. List agents: `$SHELL -l -c 'swarminator --list-agents'`.
8. Review model catalogs (`references/models/{free,premium}.json`) and select agent+model pairs.
9. Ensure persona discovery script exists and is executable: `references/discover-personas.sh`.
10. Confirm required personas have retrievable prompts via discover-personas.sh (senior-reviewer is always inline — define it manually).

## Repeated Node Pattern

```bash
PROMPT=$(references/discover-personas.sh prompt "PersonaName")
$SHELL -l -c 'printf "%s" "$TASK" | swarminator --agent=AGENT -m MODEL -p "$(printf "%s" "$PROMPT")" -t TIMEOUT'
```

One call per persona+model pair. Orchestrator collects stdout and merges outputs externally.

## Phase Workflow

### Phase 1 — Gather Inputs (2–3 models per persona)
1. Run `Ingest` persona → collect outputs.
2. Run `Analysis` persona → collect outputs.
3. Synthesize phase summary with: `## Goals And Constraints`, `## Key Inputs`, `## Extracted Findings`, `## Open Questions`, `## Synthesis Log`.

### Phase 2 — Synthesize and Challenge (2–3 models per persona)
1. Run `Synthesis` persona → collect outputs → unify into **Specification**.
2. Run `Review` persona → collect critiques.
3. If critical gaps found, run `Synthesis-Revise` → re-review. Max 3 review cycles total.
4. After 2 Review rejections: escalate to `senior-reviewer`.
5. Deliverable: `## Specification Summary`, `## Design Decisions`, `## Acceptance Criteria`, `## Task Decomposition Hints`, `## Open Questions`, `## Synthesis Log`.

### Phase 3 — Decompose and Produce (2–3 models per persona)
1. Run `Decompose` persona → numbered **Task List**.
2. For each task: run `Maker` → run `Breaker` → read verdict.
3. If verdict is `NEEDS REVISION` or `FAIL` (or malformed), run `Maker-Fix` (max 2 iterations).
4. Assemble: `## Executive Summary`, `## Task Results`, `## Blocked Tasks`, `## Open Items`, `## Synthesis Log`.

## Persona Group Map

| Group | Persona IDs |
| :--- | :--- |
| **Ingest** | `business-analyst`, `technical-documentation-auditor`, `audience-analyst`, `technical-analyst`, `communications-strategist`, `ux-researcher`, `product-researcher` |
| **Analysis** | `adversarial-reviewer`, `technical-analyst`, `business-analyst-pm`, `content-analyst`, `design-systems-analyst` |
| **Synthesis** | `solution-architect`, `content-strategist`, `senior-ux-designer`, `review-plan-synthesizer`, `senior-product-manager` |
| **Review** | `senior-engineer`, `qa-engineer`, `plan-challenger`, `critical-stakeholder-reviewer`, `senior-editor`, `usability-and-accessibility-specialist`, `senior-reviewer` |
| **Decompose** | `technical-lead`, `review-lead`, `content-lead`, `design-lead`, `product-lead` |
| **Maker** | `code-maker`, `technical-writer-finding`, `feature-writer`, `slide-content-writer`, `component-designer` |
| **Breaker** | `code-breaker`, `qa-reviewer-finding`, `design-quality-reviewer`, `product-spec-reviewer`, `slide-quality-reviewer`, `copy-editor` |
| **Maker-Fix** | `code-maker-fix`, `technical-writer-finding-fix`, `writer-fix`, `component-designer-fix` |
| **Synthesis-Revise** | `solution-architect-reviser`, `review-plan-reviser`, `outline-reviser`, `strategist-reviser` |

Fetch Persona prompt text for all personas except **senior-reviewer** via `discover-personas.sh prompt "Name"`. Locate **senior-reviewer** definition inline below (no file — always use the inline definition).

**senior-reviewer** has no file — inline definition below. Cannot be retrieved via discover-personas.sh; define it manually.

## Domain Mapping

| Domain | Output Format | Primary Persona Groups |
| :--- | :--- | :--- |
| code | Code package, patch plan, diff-based implementation | Ingest, Analysis, Synthesis, Review, Decompose, Maker, Breaker |
| skill-review | Skill or document review, findings report, patch diff | Ingest, Analysis, Synthesis, Review, senior-reviewer |
| writing | Structured prose, synthesis notes, editorial output | Ingest, Analysis, Synthesis, Review, Decompose, Maker, Breaker |
| slides | Slide outline, talking points, narrative structure | Ingest, Analysis, Synthesis, Review, Decompose, Maker, Breaker |
| design | Design brief, interface spec, critique notes | Ingest, Analysis, Synthesis, Review, Decompose, Maker, Breaker |
| pm | Plan, milestones, risks, acceptance criteria | Ingest, Analysis, Synthesis, Review, Decompose, Maker, Breaker |
| finance | Analysis memo, assumptions, risks, recommendation | Ingest, Analysis, Synthesis, Review, Decompose, Maker, Breaker |

## Breaker Output Template

```markdown
### Verdict: [PASS | NEEDS REVISION | FAIL]

### Critical Flaws
- ...
```

Orchestrator reads `### Verdict:` line (case-insensitive). Missing/invalid → retry once; second failure → treat as FAIL.

## Synthesis Log Format

```markdown
### Phase [N] — [Phase Name]
- **Models consulted:** [model IDs per persona]
- **Agreement level:** [AGREED | DISAGREED | UNCERTAIN]
- **Key contradictions:** [list; "none" if full agreement]
- **Resolution rationale:** [how resolved, or "N/A"]
```

## Error Handling

| Tier | Trigger | Action |
| :--- | :--- | :--- |
| Tier 1 Retry | Non-zero exit; output < 10 chars; malformed Breaker verdict | Retry same persona with different-family model, max 2 retries |
| Tier 2 Degrade | Only one provider family available; synthesis DISAGREED/UNCERTAIN; single Review rejection | Continue with `confidence: reduced`; run Synthesis-Revise for disagreement/uncertainty; add another review cycle |
| Tier 3 Stop | senior-reviewer rejects; >2 Review rejections; critical task blocked after 2 Maker-Fix iterations; safety violation; swarminator unavailable; required persona missing | STOP; write `blocker_summary.md` |

**Hard stop conditions:** user intent unclear; domain undetermined; deliverable shape ambiguous; swarminator unavailable; cannot assemble 2–3 model quorum; Phase 1 unusable after retries; Phase 2 rejected after review limits; all critical tasks blocked; safety boundary crossed.

## Inline Persona Definitions

### senior-reviewer

```yaml
id: senior-reviewer
name: Senior Reviewer
group: Review
domain: general
```
You are a Senior Reviewer with final escalation authority. Review the provided synthesis and review histories. Produce a single verdict: APPROVED or REJECTED with brief rationale. Your decision is final.

### Persona Group Purposes (for writing inline prompts)

| Group | Purpose |
| :--- | :--- |
| Ingest | Collect raw requirements, constraints, and context |
| Analysis | Normalize inputs, extract facts, surface gaps |
| Synthesis | Merge inputs into one coherent specification |
| Review | Critique for gaps, contradictions, weak assumptions |
| Synthesis-Revise | Repair rejected synthesis |
| Decompose | Break specification into atomic tasks |
| Maker | Produce task implementations |
| Breaker | Validate outputs; judge pass/fail |
| Maker-Fix | Repair rejected task outputs |
| senior-reviewer | Final escalation gate when reviews reject |
