---
name: multi-perspective-deliberation
description: "Use this skill for crowd/swarm thinking — multi-persona deliberation, second opinions, design challenge, pre-mortems, and cross-validation. Activate when the user asks to debate, challenge a plan or allocation, says party mode, swarm, multi-agent, or cross-validate. Uses concurrent delegated workers when available, or simulated dialogue otherwise. For investment drafts first load investment-assessment; challenge here with the finance cast."
---

# Multi-Perspective Deliberation (crowd/swarm thinking)

Universal metaskill for crowd thinking: challenge designs, stress-test plans, and synthesize multi-disciplinary viewpoints before finalizing critical decisions or committing code. Delegated workers supply independent perspectives; the host owns synthesis.

---

## Deliberation Personas

### Default product/engineering cast

| Persona | Role | Key Lens |
| :--- | :--- | :--- |
| **Product Owner** | User & Value Advocate | "Does this solve a real user problem? Is the value worth the complexity?" |
| **Architect** | Design & Maintainability | "Is the architecture robust, decoupled, scalable, and elegant?" |
| **Developer** | Implementation Reality | "Can we build this easily? What are the hidden complexities and debt?" |
| **Security Auditor** | Trust & Security Skeptic | "What are the attack vectors, input hazards, and trust boundary risks?" |
| **Devil's Advocate** | Adversarial Challenger | "Why is this approach guaranteed to fail? What are the blind spots?" |

### Finance / investment cast (persona library)

Use when deliberating **allocation, any asset class, cycle fit, or position sizing**. Load prompts via:

`references/discover-personas.sh prompt "Persona Name"`

| Persona | Key lens |
| :--- | :--- |
| **Financial Investment Analyst** | Thesis, alternatives, risk/return |
| **Portfolio Manager** | Weights, correlation, risk budget |
| **Macroeconomic Analyst** | Regime, CPI, FX, rates, cycle |
| **Microeconomic Analyst** | Issuer/business quality |
| **Money Flow Analyst** | Liquidity, funding, flows |
| **Sentiment Analyst** | Crowding / narrative extremes |
| **Investment Quality Reviewer** | Suitability gate |
| **Financial Reviewer** | Assumptions & disclosure integrity |
| **Devil's Advocate** (always) | Left tails, co-failure, role mismatch |

**Default investment-memo cast:** Investment Analyst + Portfolio Manager + Macro (if regime in scope) + Financial Reviewer or IQ Reviewer + Devil's Advocate.  
Add Money Flow for credit refinance; Sentiment for crowded crypto/thematic.  
**Authoring:** `investment-assessment`. This skill only **challenges** a draft.

### Extended persona library

Full catalog in `personas.csv` (63 rows; columns `id,name,group,domain,use_when,reference`). Discover the right lens with the search tool — do not browse files by hand:

```bash
python3 scripts/search_personas.py "<topic or lens needed>" [--group Finance] [--max-results 5]
python3 scripts/search_personas.py --list-groups
python3 scripts/search_personas.py --id <persona-id>
```

Load the selected prompt with `references/discover-personas.sh prompt "Name"` (resolves by YAML `name:`). Prefer the small default cast above; pull extended personas only when the topic needs that lens.

---

## Phase 1: Execution Mode Selection

Determine the capabilities of the current execution environment:

### Mode A: Concurrent Delegated Deliberation (Preferred)
*Use when the environment supports parallel delegated agents/workers plus a way to exchange prompts, intermediate positions, or results between them.*
1. **Launch Persona Workers**: Create separate, concurrent delegated workers/agents for the selected personas (e.g., Architect, Developer, Security). Give each worker a clear persona brief and scope.
2. **Orchestrate Dialogue**: Share the topic with all active workers. Rotate turns by relaying the other personas' positions, allowing them to respond to the topic and directly challenge each other's reasoning.
3. **Facilitate**: Prompt the workers to address each other's concerns, surface trade-offs, and refine their positions.

### Mode B: Simulated Single-Context Dialogue (Fallback)
*Use in single-agent environments.*
1. Adopt the persona roles sequentially in turn-by-turn dialogue within a single context window.
2. Ensure you represent each perspective with authentic disagreement. Avoid having the personas agree too quickly.

---

## Phase 2: Deliberation Flow

1. **Setup**: Identify the topic (or proposed implementation plan) and select 2-4 most relevant personas (default: Architect, Developer, Security).
2. **Opening Positions**: Each persona state their initial stance on the topic (2-3 sentences max).
3. **Discussion Rounds**: 
   - Personas respond to the topic and build or challenge other personas (e.g., "Building on what Architect said, but Developer's concern about timeline is valid because...").
   - Ensure turns are concise (no monologues) and the conversation remains balanced.
   - Introduce user interjections if running in human-in-the-loop mode.
4. **Convergence**: Each persona delivers their final adjusted position, noting what they agree on, what they still contest, and what they need to investigate.
5. **Synthesis**: Produce a consensus and divergence summary. If multiple branches remain viable, use the branch-graft protocol in `references/branch-graft-synthesis.md` instead of forcing premature consensus. When deliberation is part of jointly crafting a shared plan for a persistent multi-role task, the output feeds into the primary-owned versioned plan; primary must approve and record the revision following `team-operating-model`.

---

## Phase 3: Deliberation Synthesis Output

Compile the deliberation results into the following structure:

The outline is format-neutral for saved human reports: apply [Document format selection](../../rules/document-formats.md). Chat summaries and agent consensus records keep their required formats; no document file is necessary for a chat-only deliberation.

```markdown
# Deliberation Report: [Topic]

- **Deliberation Mode**: [Delegated Multi-Agent / Simulated Dialogue]
- **Participants**: [List of active personas]

## 1. Consensus (Points of Agreement)
- [List specific designs, boundaries, or constraints everyone agreed on]

## 2. Divergence (Unresolved Tensions)
- **[Persona A] vs. [Persona B]**: Describe the core conflict (e.g. security overhead vs. development speed).

## 3. Pre-Mortem (Failure Scenarios)
*If this plan fails in 6 months, why did it fail?*
- [Scenario A with mitigation]

## 4. Final Verdict & Action Items
- **Verdict**: [PROCEED / REVISE / RETHINK]
- **Action items**: [Specific tasks to resolve key disputes]
```

## Hard rules

1. Launch every delegated worker through `subagent-dispatch` with scope, output contract, allowed actions, and stop conditions. No tool-specific CLI.
2. Host owns synthesis; never forward worker prose verbatim as the decision.
3. Preserve the strongest dissent via `references/branch-graft-synthesis.md`; do not average contradictions into vague prose.
4. One instance = one perspective; simulated panels are not independent evidence.
