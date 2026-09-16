# Agentic Engineering Practices & Iterative Agent Improvement

Learnings from iterative prompt refinement, multi-agent review gating, and observed model behavior.

## 1. Separation of Concerns in Agent Architecture
- **Rules (`.agents/rules/`)**: Negative constraints and hard safety invariants (what agents must NEVER do: unauthorized git mutations, process exhaustion, secret exposure).
- **Skills (`.agents/skills/`)**: Operational workflows, progressive disclosure checklists, domain heuristics, and deep references loaded *just-in-time* on demand.
- **System Prompts (`.config/kilo/agent/`)**: Core mindset, identity, values, and engineering disciplines (who the agent is and how it evaluates trade-offs).

## 2. Prompt Crafting: Avoid Procedural Bloat & Meta-Leakage
- **Frontier models lose intelligence under rigid micromanagement**: Do not saddle frontier models with 70–100 line procedural flowcharts, mandatory 5-step checklists, or rigid Markdown return schemas. These cause malicious compliance and agreement bias where thinking budget is wasted filling out ceremonial forms.
- **Translate user intent; do not leak conversational metaphors**: When the user explains intent using conceptual framing (e.g. "give the agent soul and characteristics"), never leak meta-words like `& Soul` into production headings. Use professional, authoritative headings like `## Core Mindset`.
- **Focus on mindset & disciplines**: Ground the agent in engineering values:
  - Pragmatism & YAGNI: simplicity must be defended; complexity must fight for its life.
  - Ostrich principle: low probability × low impact edge cases should be ignored or handled simply.
  - Evidence-driven: positive verification via tests/builds before completion claims.
  - Honest friction reporting: halt and surface contract defects immediately rather than hacking workarounds.

## 3. Swarm-Based Cross-Correction over Self-Discipline
- **Producers cannot reliably self-review**: Frontier models suffer from agreement bias and will rationalize over-engineered architectures or hallucinated vulnerability findings if asked to self-check.
- **Architectural cross-validation**: Route outputs through independent challenger agents:
  - Plans & Architecture → `reviewer` with `pragmatic-triage` lens (Ostrich algorithm challenge) + `adversarial` lens.
  - Review & Security Findings → `reviewer` with `findings-skeptic` lens (false-positive detection) + `pragmatic-triage` lens.
- **Runtime gating is mandatory**: A review or challenge lens is useless unless enforced at the dispatch receiving boundary (`subagent-dispatch`). Every challenge step must be wired into the parent agent's execution loop before synthesis.

## 4. Iterative Improvement from Observed Behaviors
- **Observe the failure mode**: Watch what models actually produce (e.g. bypassed review, over-engineered designs, exaggerated severity).
- **Prune before adding**: When an agent misbehaves, resist the urge to add more rules to the prompt. Check if existing over-constraints are suffocating the model's judgment, or if a separate challenger agent with a focused lens is needed.
