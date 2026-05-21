---
name: multi-perspective-deliberation
description: "Coordinate a multi-persona deliberation session to challenge assumptions, debate architectural decisions, and perform pre-mortems. Leverages concurrent subagents if supported by the harness, or falls back to single-context simulated dialogue. Trigger phrases: 'party mode', 'deliberation', 'multi-perspective', 'get a second opinion', 'debate this', 'challenge design'."
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

Determine the capability of the host agent harness:

### Mode A: Concurrent Subagent Deliberation (Preferred)
*Use when the harness supports subagents (`invoke_subagent` and `send_message` tools).*
1. **Spawn Subagents**: Define and launch separate, concurrent subagents for the selected personas (e.g., Architect, Developer, Security). Give each subagent its specific persona system prompt.
2. **Orchestrate Dialogue**: Use the messaging system to send the topic to all spawned subagents. Rotate turns, allowing subagents to respond to the topic and directly challenge each other's messages.
3. **Facilitate**: Prompt the subagents to address each other's concerns.

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
5. **Synthesis**: Produce a consensus and divergence summary.

---

## Phase 3: Deliberation Synthesis Output

Compile the deliberation results into the following structure:

```markdown
# Deliberation Report: [Topic]

- **Deliberation Mode**: [Subagent Swarm / Simulated Dialogue]
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
