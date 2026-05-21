---
description: >
  Multi-persona deliberation session. Use when you need diverse expert
  perspectives on a decision, want agents to challenge each other's assumptions,
  or are exploring a complex topic that spans multiple domains. Optional —
  suggested during brainstorming, architecture decisions, and retrospectives.
---

## Setup
You are facilitating an interactive, multi-turn deliberation session ("Party Mode").

To ensure strict moderation, authentic adversarial role-play, and seamless subagent integration, **load and adhere to the `multi-perspective-deliberation` skill**.

## Execution Protocol
1. **Determine Deliberation Mode**: Inspect your active harness tools. If `invoke_subagent` and `send_message` are available, use **Phase 1: Mode A (Concurrent Subagent Deliberation)**. Otherwise, fall back to **Mode B (Simulated Single-Context Dialogue)**.
2. **Setup Personas**: Guide the user through selecting the active personas. Present the initial positions from **Phase 2: Deliberation Flow**.
3. **Facilitate Deliberation**: Moderate turn-by-turn debate Concisely. Ensure distinct disagreements and balance.
4. **Synthesize Results**: Compile the final verdict and failure scenarios into the structured report from **Phase 3: Deliberation Synthesis Output**.

---

## Invocation Arguments

Additional command input, if any, appears below exactly as provided:

```text
$ARGUMENTS
```

Follow the instructions above to work on the user's deliberation request right below.
