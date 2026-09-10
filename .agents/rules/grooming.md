---
description: "Applies to all planning, requirements definition, and high-ambiguity execution tasks. Enforces explain-first informed alignment, Design Concept discovery, and the Locked Core Implementation Plan Gate."
globs: "*"
alwaysApply: false
trigger: model_decision
---

# Rule: Grooming & Design Concept Alignment

This rule applies to **all planning, requirements definition, and high-ambiguity execution tasks**. It establishes explain-first informed alignment to construct a shared mental model (the "Design Concept") between you and the user before any implementation begins.

---

## 🎯 What is the Design Concept?

The **Design Concept** is the ephemeral mental model of what is being built. Misalignment between human and AI occurs when this concept remains unexpressed.
*   **Do not** assume the initial prompt contains all requirements or constraints.
*   **Do not** begin implementation until the Design Concept is aligned and the Locked Core Implementation Plan Gate is satisfied in the plan.

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

## 🔒 Locked Core Implementation Plan Gate (before plan approval)

An implementation plan (`implementation_plan.md`, `plan.md`, `task.md`, or atomic slice specification) is **incomplete and non-executable** if it lacks any of the three locked core parts:

1. **Locked Code Interfaces & DTO Contracts**:
   - Explicitly specify all types, field names, optionality, nullability, validation rules, port/service method signatures, parameter types, and return types (including explicit error variants/unions such as `Result<T, E>`) in concrete code blocks (e.g., TypeScript interfaces, Pydantic schemas, Go structs). Never describe payload fields or boundary contracts in loose prose.
   - **Avoid Invented Interfaces**: Zero contract degrees of freedom for implementers. Implementers are strictly forbidden from altering method signatures, reordering parameters, changing DTO shapes, or inventing public/internal contracts not approved during planning.
   - **Contract Defect Stop Condition**: If an implementer discovers during coding that a locked contract is flawed or unworkable, it must NOT silently modify the interface or write ad-hoc adapters. It must stop immediately and report `INCOMPLETE: CONTRACT_DEFECT` back to the planner with the proposed adjustment.

2. **Locked Scope Boundary & Scoped File Tree Structure**:
   - **Do NOT dump the full repository tree**: A full repo tree is excessive and bloats context. Limit the file tree strictly to the **affected scope / boundary** covered by the plan.
   - **Explicit Scope Boundaries**:
     - **In-Scope Boundary**: Explicitly lock which directories, files, or subsystems are in-scope (to be created, modified, or deleted).
     - **Out-of-Scope Boundary**: Explicitly lock adjacent or tempting components/paths that must NOT be touched. Other irrelevant parts of the repository are implicitly understood to be out-of-scope and unchanged.
   - **Scoped Target File Tree**: Provide an explicit target file tree covering only the in-scope boundary. Explicitly annotate every file operation: `[CREATE]` for new files (with exact relative path and concise role), `[MODIFY]` for existing files, `[DELETE]` for removed files, and `[CLEANUP]` for temporary/scratch artifacts.
   - **Avoid Invented Files & Incomplete Cleanup**: Zero file degrees of freedom within or outside the declared boundary. Implementers are forbidden from creating files not declared in the locked scoped tree or touching out-of-scope paths. All temporary, intermediate, or scratch files must be explicitly cleaned up before completing work. No unexpected or orphaned files may remain.

3. **Smaller Separate Implementation Phases in Separate Files (Referenced in Main Plan)**:
   - The main plan file (`plan.md` or `implementation_plan.md`) serves as the orchestrator and index: containing high-level goals, the locked scope boundaries, the scoped target file tree, cross-cutting contracts, and markdown links to each separate phase file. Never dump an entire multi-phase implementation into a single monolithic file.
   - Decompose execution into smaller, sequentially numbered phase files (e.g., `phases/01-phase-name.md`, `phases/02-phase-name.md`, or `phase-01-*.md`).
   - Each phase file is self-contained and specifies:
     - Exact slice objective & dependencies
     - The specific subset of locked interfaces/DTOs to be implemented in this phase
     - The exact file tree delta for this phase (files created, modified, or deleted within the in-scope boundary)
     - Concrete step-by-step TDD implementation steps (RED → GREEN → REFACTOR)
     - Concrete verification criteria and exact test/check commands
   - Implementers execute against one referenced phase file at a time, keeping context bounded and preventing hallucination or drift.

---

## Rewrite & Consumer Interface Gate

For a rewrite, overhaul, or delete-and-rebuild task, complete this gate before handing work to `code-craft`:

1. List the old semantics and interfaces, marking each **delete** or **preserve**. Do not retain behavior by default.
2. If a public API or consumer app is affected, define consumer-facing signatures/schema and stubs, then obtain sign-off.
3. **Stop and clarify** if that consumer contract is missing or unapproved; implementation must not infer or hide it.
