---
name: swarm-intelligence
description: Orchestrates multi-agent swarms for parallel, read-only execution and multi-phase output synthesis.
---

Swarm-intelligence orchestrates a three-phase workflow using `swarminator`. The orchestrator runs autonomously, invoking one node (one model+persona) per call, and synthesizes Markdown artifacts across phases.

## Core Rules
1. **One node per call.** Each `swarminator` invocation runs one model on one persona prompt.
2. **Orchestrator automation.** No human intervention between phases; protocol proceeds stepwise.
3. **Read-only nodes.** Nodes read local/web context but never write or materialize files.
4. **Login shell.** Always invoke via `$SHELL -l -c 'swarminator …'`.
5. **Freeform interpretation.** Outputs are Markdown/plain text; orchestrator interprets natural language.
6. **Multi-model quorum.** Run each persona across 2–3 models from different provider families.
7. **Diff blocks for code.** All implementation changes expressed as ` ```diff ` blocks.
8. **Preflight or abort.** Verify all prerequisites before starting; any rule violation is a hard stop.

## Preflight Checklist
1. Confirm user explicitly wants multi-agent swarm orchestration.
2. Identify primary domain from Domain Mapping.
3. Clarify desired final deliverable shape.
4. Confirm read-only node constraint is acceptable.
5. Verify `swarminator` exists: `$SHELL -l -c 'command -v swarminator'`.
6. Check CLI surface: `$SHELL -l -c 'swarminator --help'`.
7. List available agents: `$SHELL -l -c 'swarminator --list-agents'`.
8. Verify model catalogs: `references/models/{free,premium}.json` (or `SWARM_MODEL_CATALOG_DIR`).
9. Determine per-model agent & mode flags from help/listing; document required flags before each invocation.
10. Ensure persona discovery script exists: `references/discover-personas.sh` exists and is executable.
11. Confirm `senior-reviewer` persona is discoverable (via `senior-reviewer.md` or inline definition).

## swarminator Interface
- **Required flags:** `-m MODEL_ID`, `-p "PERSONA_PROMPT_TEXT"`, `-t SECONDS`.
- **Persona prompt (`-p`):** Must supply the full literal persona prompt text (not an ID). Retrieve from persona files (`references/personas/<group>/<file>.md`, body after second `---`) or via `discover-personas.sh prompt "Name"`. Quote the entire prompt string.
- **CLI safety:** Ensure prompt length fits within system `ARG_MAX` (typically > 128KB). If prompts approach this limit, consider consolidating or using system-level quoting safeguards.
- **Agent routing:** Some model IDs require explicit `--agent=NAME`:
  - `codex-*` → `--agent=codex`
  - `oai-gateway/*` → `--agent=kilo`
  - `google/gemini-*` → `--agent=gemini`
  - `github-copilot/*` → `--agent=claude` or `--agent=codex`
  Verify per-model agent via `--list-agents`.
- **Agent modes:** ACP agents (gemini, claude) support `--agent-mode=MODE` (e.g., `default`, `autoEdit`, `yolo`). Consult `--tutorial "agent modes"`.
- **Exit codes:** `0` = success (stdout), non-zero = failure (stderr).
- **Stdin:** Document content piped to node; nodes must not require interactive input.

## Workflow

### Phase 1 — Gather Inputs
**Purpose:** Extract requirements, constraints, and context.

**Persona groups:** One `Ingest` persona + one `Analysis` persona (each on 2–3 diverse models).

**Execution:** Run selected `Ingest` and `Analysis` personas across 2–3 models each. Collect Markdown outputs. Orchestrator synthesizes a **Phase 1 Summary** that contains:
- `## Goals And Constraints`
- `## Key Inputs`
- `## Extracted Findings`
- `## Open Questions`
- `## Synthesis Log`
Validate required headings via Heading Detection before proceeding.

**Pass/Fail:** PASS if both branches produce substantive, coherent, mergeable outputs. FAIL if usable output not produced after 2 retries or contradictions irreconcilable.

### Phase 2 — Synthesize and Challenge
**Purpose:** Create a unified specification, then stress-test it.

**Persona groups:** `Synthesis` → `Review` → (optional) `Synthesis-Revise`.

**Execution:** Run `Synthesis` (2–3 models) → synthesize **Specification**. Run `Review` (2–3 models) → collect critiques. If reviewers identify critical gaps, run `Synthesis-Revise` (2–3 models) to address feedback. Allow up to 2 additional review cycles (max 3 total). If specification remains rejected after 2 Review rejections, escalate to `senior-reviewer`.

Deliverable: **Approved Specification** containing:
- `## Specification Summary`
- `## Design Decisions`
- `## Acceptance Criteria`
- `## Task Decomposition Hints`
- `## Open Questions`
- `## Synthesis Log`

**Pass/Fail:** PASS when the orchestrator judges the specification has no critical gaps. FAIL if `senior-reviewer` rejects or if 3 total review cycles yield no approval.

### Phase 3 — Decompose and Produce
**Purpose:** Break the specification into atomic tasks, produce implementations, and validate.

**Persona groups:** `Decompose` → `Maker` (per task) → `Breaker` (per task) → (optional) `Maker-Fix`.

**Execution:**
1. Run `Decompose` (2–3 models) → **Task List**.
2. For each task:
   - Run `Maker` (1–3 models depending on stakes) → implementation in Markdown using ` ```diff ` blocks.
   - Run `Breaker` (2–3 models) → validate output; collect verdict in Verdict Envelope (see below).
   - If verdict is `NEEDS REVISION` or `FAIL` (or output malformed), run `Maker-Fix` (2–3 models, max 2 iterations).
3. Assemble final deliverable with required Phase 3 headings:
   - `## Executive Summary`
   - `## Task Results`
   - `## Blocked Tasks`
   - `## Open Items`
   - `## Synthesis Log`

**Pass/Fail:** PASS if zero critical tasks blocked after retries. FAIL if any critical task remains blocked after 2 `Maker-Fix` iterations.

## Orchestration Operations
- **Synthesis:** Merge common themes, consensus, and divergences from multiple outputs; summarize key assertions.
- **Heading Detection:** Identify Markdown headings (`#`, `##`, `###`) and normalize; match against required heading lists case-insensitively with whitespace folding.
- **Verdict Extraction:** Read the `### Verdict:` line and extract `PASS`, `NEEDS REVISION`, or `FAIL` (case-insensitive). Missing or invalid → malformed → treat as FAIL after one retry.

## Synthesis Log Format

For each phase, append one block to the synthesis log:

```markdown
### Phase [N] — [Phase Name]
- **Models consulted:** [list of model IDs used for each persona]
- **Agreement level:** [AGREED | DISAGREED | UNCERTAIN]
- **Key contradictions:** [list; "none" if full agreement]
- **Resolution rationale:** [how contradictions were resolved, or "N/A"]
```

**Agreement level criteria:**
- **AGREED:** At least two models make the same core claim, even if wording differs.
- **DISAGREED:** Models make conflicting claims that materially change the recommendation, scope, or risk posture.
- **UNCERTAIN:** Outputs too thin, mixed, or ambiguous to support confident synthesis.

## Personas & Models

**Persona discovery:** Use `references/discover-personas.sh` relative to the skill directory. This script lists personas and retrieves prompts. If the script is missing or non-executable, stop. Do not fall back to global paths.

**Quorum policy:** Run every persona on at least 2 models from different provider families. Include at least one premium model for high-stakes nodes (`Synthesis`, `Review`, complex `Maker`). Use exact model `id` strings from `references/models/free.json` and `references/models/premium.json`.

**senior-reviewer fallback:** If two Review rejections occur, escalate to `senior-reviewer`. The `senior-reviewer` persona must be available either as `senior-reviewer.md` with `group: Review` frontmatter, or via the inline definition below.

**Timeout guidance:** Use `-t 120` for fast models, `-t 300` or higher for reasoning-heavy models (those containing `thinking`, `reasoning`, or specific `deepseek-r1`, `o3`, `claude-opus-4-6-thinking`). Derive recommendation from the model catalog's `use_for` field when present.

**Persona Group Purpose**

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

**Persona Group Map**

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
| **Finance** (subdomain overlay) | `financial-data-analyst`, `financial-investment-analyst`, `financial-reviewer`, `portfolio-manager`, etc. |

## Error Handling

| Tier | Trigger | Action |
| :--- | :--- | :--- |
| Tier 1 Retry | Non-zero node exit; output < 10 chars; malformed Breaker verdict (missing/invalid) | Retry same persona with a different-family model, max 2 retries |
| Tier 2 Degrade | Only one provider family available; synthesis `DISAGREED`/`UNCERTAIN`; single Review rejection | Continue with `confidence: reduced`; auto-run `Synthesis-Revise` for disagreement/uncertainty; add another review cycle |
| Tier 3 Stop | `senior-reviewer` rejects; >2 Review rejections; critical task blocked after 2 `Maker-Fix` iterations; safety violation; `swarminator` unavailable; required persona missing | STOP; write `blocker_summary.md` |

Stop immediately if:
- User intent is not clearly swarm orchestration.
- Primary domain cannot be determined.
- Desired final deliverable shape is ambiguous.
- `swarminator` not available after preflight.
- Cannot assemble 2–3 model quorum from different families for any required persona.
- Phase 1 unusable after retries or contradictions irreconcilable.
- Phase 2 rejected after review limits or `senior-reviewer` returns `REJECTED`.
- All tasks for a critical branch blocked after Tier 1 retries.
- Safety boundary crossed.

## Breaker Output Template
```markdown
### Verdict: [PASS | NEEDS REVISION | FAIL]

### Critical Flaws
- ...
```
Verdict keywords: `PASS`, `NEEDS REVISION`, `FAIL` (case-insensitive). Missing or invalid `### Verdict:` → Tier 1 retry; second failure → treat as `FAIL`.

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

## Invocation Pattern
```bash
$SHELL -l -c 'swarminator -m MODEL_ID -p "PERSONA_PROMPT_TEXT" -t 120'
```
Nodes are read-only; provide document via stdin. Any protocol violation is a hard stop.

## Inline Persona Definitions
Example:
```yaml
id: senior-reviewer
name: Senior Reviewer
group: Review
domain: general
```
You are a Senior Reviewer with final escalation authority. Review the provided synthesis and review histories. Produce a single verdict: APPROVED or REJECTED with brief rationale. Your decision is final.
