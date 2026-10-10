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
- **Prune scaffolding before close**: One-off verification files (`_verify_*`, mock/stub modules, throwaway generators) never ship in `skills/*/scripts/`. Close requires `find . -name '*_verify*' -o -name '*mock*' -o -name '*stub*'` (excluding data dirs) returning empty with only the real script remaining.

## 5. MCP Interface Design — Explicit User Preference (2026-10-11)
- **Default-callable tools:** Treat Delegate like Sandbox for invocation policy: allow ordinary MCP calls by default. Do not add a routine approval gate merely because delegation can spend model time or access files.
- **Centralize operational complexity:** MCP implementations absorb CLI quirks and enforce supported limits/refusals; MCP and tool descriptions expose remaining constraints so agents can act predictably. Prefer this boundary over repeated caller-side procedures and redundant routing or permission layers.
- **Preserve actual boundaries:** Default callability does not expand task authority or equate Delegate's isolation with Sandbox's. Explicit escalation and safety constraints still apply; descriptions communicate residual limits, not replace enforceable checks.
- **Verified choice:** The user staged both `delegate_delegate_status` and `delegate_delegate_run` as `allow` and removed the extra run-approval paragraph from the harness guide. Apply this preference when designing future MCP interfaces.
- **No obsolete command layer:** The current agent setup has no commands. Do not restore command-routing rules or index entries; use the existing skill discovery surface rather than maintain a redundant command map.
