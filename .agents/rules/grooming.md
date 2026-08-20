# Rule: Grooming & Design Concept Alignment

This rule applies to **all planning, requirements definition, and high-ambiguity execution tasks**. It establishes the "Reverse Interview" discipline to construct a shared mental model (the "Design Concept") between you and the user before any implementation begins.

---

## 🎯 What is the Design Concept?

The **Design Concept** is the ephemeral mental model of what is being built. Misalignment between human and AI occurs when this concept remains unexpressed.
*   **Do not** assume the initial prompt contains all requirements or constraints.
*   **Do not** begin implementation or generate an `implementation_plan.md` until the Design Concept is externalized and aligned.

---

## 🎤 The Reverse Interview Workflow

When this rule is activated (by a plan request, the `/grill-me` command, or ambiguity in requirements):

1.  **Stop & Probe**: Before writing code, analyze the request for gaps, implicit assumptions, and boundary conditions.
2.  **Formulate 3–5 High-Value Questions**: Ask the user direct, focused questions. Do not spam questions; limit to a maximum of 5, prioritized by architectural impact.
3.  **Target the Core Dimensions**:
    *   **Goal & Boundaries**: What is the ultimate "Definition of Done"? What is explicitly *out of scope*?
    *   **Edge Cases & Failure Modes**: How should the system handle missing data, network timeouts, or filesystem limits?
    *   **Dependencies**: What libraries, services, or files does this hook into? Are there strict versioning or performance bounds?
    *   **Interface Concept**: What does the inputs-outputs flow look like from the perspective of the caller/user?

---

## ⚡ Graceful Scaling (Process Efficiency)

*   **Standard / Deep Tasks**: Perform a full reverse interview when ambiguity is genuine, reversibility is expensive, or the work needs standard/deep design scrutiny. Wait for the user's answers before drafting the corresponding plan or spec.
*   **Quick / MVP Slice**: Proceed when the user intent, current task scope boundary, acceptance check, and non-deferrable safety constraints are clear. Do not impose a full interview gate. If a small ambiguity remains, ask *one* focused question or record a reversible assumption; escalate to the full interview if it materially affects outcome, cost of reversal, safety, data, or a public contract.
*   **Non-Interactive / Automated / AFK Mode** (e.g., scheduled cron, background bounded iteration): Do not block execution waiting for a prompt. Instead, perform a **Self-Grooming Audit** by analyzing the codebase, documenting your design concept and assumptions clearly in the task log or scratch space, and proceeding with execution. The Self-Grooming block MUST use this structure:
    ```markdown
    ### 🤖 Self-Grooming Audit (AFK Mode)
    - **Inferred Goal**: [what the task aims to achieve]
    - **Codebase Constraints Identified**: [dependencies, existing helper structures found]
    - **Assumptions Made**: [list of critical assumptions that bypass human review]
    - **Perceived Risks & Mitigations**: [risk points e.g., thread safety, backwards compatibility, and how they are handled]
    ```
