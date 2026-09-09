# Rule: Grooming & Design Concept Alignment

This rule applies to **all planning, requirements definition, and high-ambiguity execution tasks**. It establishes explain-first informed alignment to construct a shared mental model (the "Design Concept") between you and the user before any implementation begins.

---

## 🎯 What is the Design Concept?

The **Design Concept** is the ephemeral mental model of what is being built. Misalignment between human and AI occurs when this concept remains unexpressed.
*   **Do not** assume the initial prompt contains all requirements or constraints.
*   **Do not** begin implementation or generate an `implementation_plan.md` until the Design Concept is externalized and aligned.

---

## Two Modes: Active Exploration vs. Commitment Gate

1. **Active Exploration (Interactive Q&A / Design Discovery)**:
   - **Main thread only**: Never delegate active problem exploration, brainstorming, or interface co-design to subagents. Intermediate thinking belongs in the main thread.
   - **Ping-pong cadence**: Focus on one architectural tension or layer per turn. Do not go "all-in" or attempt to resolve the entire problem in a single turn.
   - **Outside-in ordering**: Always align on macro-consistency and topology first (how does this fit existing system architecture and caller conventions?) before descending into interface shapes, state mechanics, and edge cases.
   - **Proportional context**: Provide 1–2 plain-language sentences framing the specific trade-off or tension before asking the question. Do not generate an 8-part `Material decision brief` for exploratory turns.

2. **Commitment Gate (Formal Material Decision)**:
   - Triggered when exploration converges and an irreversible choice, breaking contract, or implementation plan must be locked. Follow the Informed Alignment Sequence below.

---

## Informed Alignment Sequence (explain → questions → synthesis)

A decision is material when it changes user-visible behavior, data semantics, security/privacy, compatibility, operational cost, reversibility, or architecture boundaries. The explain-first minimum applies to material decisions based on main-thread investigation as well as delegated work.

When this rule is activated at a commitment gate (by a plan request, the `/grill-me` command, or ambiguity in requirements), follow this order. Do not ask questions first:

1.  **Explain**: state verified facts vs. inferences vs. unknowns in plain language. Define decision-relevant technical terms before using them. Give one concrete project-specific example or small before/after flow when the abstraction is non-obvious. State why each pending decision matters and the practical consequences of the options. Keep internal reasoning, subagent transcripts, and orchestration noise out; report only a concise evidence summary leading to the decision.
2.  **Ask**: ask only genuinely unresolved decisions — never a mandatory quota. For deep interviews, 3–5 questions is a maximum, prioritized by architectural impact. Target the core dimensions:
    *   **Goal & Boundaries**: What is the ultimate "Definition of Done"? What is explicitly *out of scope*?
    *   **Edge Cases & Failure Modes**: How should the system handle missing data, network timeouts, or filesystem limits?
    *   **Dependencies**: What libraries, services, or files does this hook into? Are there strict versioning or performance bounds?
    *   **Interface Concept & Compatibility**: What does the inputs-outputs flow look like from the caller/user perspective? For rewrites or major overhauls, which old interfaces or semantics are deleted, which remain, and is this a breaking public-contract change?
3.  **Synthesize & confirm**: restate the resulting model (goal, interface contract, boundaries, resilience) and identify remaining uncertainty. Request explicit decision confirmation only when a material unresolved decision exists; do not require ritual confirmation for quick clear tasks with no material unresolved decision. An answer given without adequate context is non-binding: explicitly say the earlier answer lacked context, present the missing context, and ask the user to confirm or change that decision; never silently upgrade the old answer.

## Material decision brief

For material decisions at commitment gates, use the canonical `Material decision brief` in `../skills/subagent-dispatch/references/pillars-and-templates.md` — do not duplicate it here. Require its full form when options differ materially; allow a proportional compact form otherwise. Do not generate this multi-section template during active exploratory Q&A turns. Include a recommendation when evidence justifies one; otherwise state explicitly that there is no recommendation and what evidence is missing.

---

## ⚡ Graceful Scaling (Process Efficiency)

*   **Standard / Deep Tasks**: Perform the full explain → questions → synthesis sequence when ambiguity is genuine, reversibility is expensive, or the work needs standard/deep design scrutiny. Wait for the user's answers and explicit decision confirmation (only when a material unresolved decision exists) before drafting the corresponding plan or spec.
*   **Quick / MVP Slice**: Proceed when the user intent, current task scope boundary, acceptance check, and non-deferrable safety constraints are clear. Do not impose a full interview gate. If a small ambiguity remains, ask *one* focused question or record a reversible assumption; escalate to the full interview if it materially affects outcome, cost of reversal, safety, data, or a public contract.
*   **Rewrite-Scoped Tasks**: When the user says "rewrite," "overhaul," "delete and rebuild," or "complete redesign," ask one additional probe: "Which prior interfaces or behaviors must be deleted rather than preserved?" If the answer is vague or affects a public contract, escalate to the full interview.
*   **Non-Interactive / Automated / AFK Mode** (e.g., scheduled cron, background bounded iteration): Do not block execution waiting for a prompt. Instead, perform a **Self-Grooming Audit** by analyzing the codebase, documenting your design concept and assumptions clearly in the task log or scratch space, and proceeding with execution. The Self-Grooming block MUST use this structure:
    ```markdown
    ### 🤖 Self-Grooming Audit (AFK Mode)
    - **Inferred Goal**: [what the task aims to achieve]
    - **Codebase Constraints Identified**: [dependencies, existing helper structures found]
    - **Assumptions Made**: [list of critical assumptions that bypass human review]
    - **Perceived Risks & Mitigations**: [risk points e.g., thread safety, backwards compatibility, and how they are handled]
    ```

---

## Rewrite & Consumer Interface Gate

For a rewrite, overhaul, or delete-and-rebuild task, complete this gate before handing work to `code-craft`:

1. List the old semantics and interfaces, marking each **delete** or **preserve**. Do not retain behavior by default.
2. If a public API or consumer app is affected, define consumer-facing signatures/schema and stubs, then obtain sign-off.
3. **Stop and clarify** if that consumer contract is missing or unapproved; implementation must not infer or hide it.
