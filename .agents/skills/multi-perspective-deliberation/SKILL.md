---
name: multi-perspective-deliberation
description: "Use this skill to run multi-persona deliberation sessions — challenging assumptions, debating architectural decisions, and performing pre-mortems with diverse expert perspectives. Activate when the user wants a second opinion, asks to debate or challenge a design, or says \"party mode\" Uses concurrent delegated agents when available, or simulated dialogue in single-context environments."
---

# Multi-Perspective Deliberation & Deliberative Dialogue

A framework to challenge designs, stress-test plans, and synthesize multi-disciplinary viewpoints (Product, Architecture, Development, Security, and Adversarial) before finalizing critical decisions or committing code.

---

## Deliberation Personas

| Persona | Role | Key Lens |
| :--- | :--- | :--- |
| **Product Owner** | User & Value Advocate | "Does this solve a real user problem? Is the value worth the complexity?" |
| **Architect** | Design & Maintainability | "Is the architecture robust, decoupled, scalable, and elegant?" |
| **Developer** | Implementation Reality | "Can we build this easily? What are the hidden complexities and debt?" |
| **Security Auditor** | Trust & Security Skeptic | "What are the attack vectors, input hazards, and trust boundary risks?" |
| **Devil's Advocate** | Adversarial Challenger | "Why is this approach guaranteed to fail? What are the blind spots?" |

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
5. **Synthesis**: Produce a consensus and divergence summary. If multiple branches remain viable, use the branch-graft protocol in `../swarm-intelligence/references/branch-graft-synthesis.md` instead of forcing premature consensus.

---

## Phase 3: Deliberation Synthesis Output

Compile the deliberation results into the following structure:

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
