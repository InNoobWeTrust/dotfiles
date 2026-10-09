---
description: "Applies to problem/solution discovery, planning, requirements definition, and high-ambiguity tasks. Establishes shared understanding and outcome-linked evidence before implementation; formal plan gates apply only where required."
globs: "*"
alwaysApply: false
trigger: model_decision
---

# Rule: Grooming & Design Concept Alignment

This rule applies to **problem/solution discovery, planning, requirements definition, and high-ambiguity tasks**. It establishes explain-first informed alignment to construct a shared mental model (the "Design Concept") between you and the user before implementation. Discussion and investigation do not require a formal implementation plan.

First apply [Delivery Ownership](delivery-ownership.md). The dialogue sequences below govern collaborative exploration and genuine user commitment gates. In autonomous delivery the primary researches, documents, and approves choices within delegated scope; it does not run a mandatory interview or require the user to approve each plan. Missing outcome/authority and safety boundaries still require clarification.

---

## 🎯 What is the Design Concept?

The **Design Concept** is the ephemeral mental model of what is being built. Misalignment between human and AI occurs when this concept remains unexpressed.
*   **Do not** assume the initial prompt contains all requirements or constraints.
*   **Do not** begin implementation until the Design Concept is aligned and, where applicable, the Locked Core Implementation Plan Gate is satisfied in the plan.

## Shared problem-solving, not specification extraction

Apply the shared-understanding contract in [AGENTS.md](../AGENTS.md#informed-alignment-universal-invariant). The user may be discovering both the problem and the solution; helping them understand is part of the work, not a prerequisite they must supply.

- **Locate the uncertainty**: distinguish an unclear problem (what is wrong or which outcome matters), an unclear solution (which approach fits), and implementation details of an agreed approach. Do not silently turn a symptom into a diagnosis or a suggested tool into the chosen design.
- **Advance understanding**: investigate what can be learned within authorized boundaries. Bring back decision-relevant facts, their practical meaning, a justified recommendation or evidence gap, and what could change the recommendation. Ask for goals, constraints, or preferences only the user can supply; do not outsource researchable technical questions to them.
- **Explain before choosing**: use a concrete example and define unfamiliar terms at the point of need. An option list or unexplained approval question is not informed alignment. Keep each exchange focused; no lecture, comprehension quiz, or requirement that the user audit unfamiliar internals.
- **Separate inquiry from implementation**: research, comparison, or design requests do not authorize behavior changes. Propose the next evidence-gathering action when understanding is insufficient; experiments that write files, install tools, or affect services still require the relevant action authority. Once implementation is authorized within an understood scope, proceed without repeatedly asking about ordinary details.
- **Reopen when evidence changes**: pause affected implementation and revise the design before proceeding. The primary may reapprove a changed approach or assumption inside delegated authority, recording evidence and rerunning affected checks. A changed goal, authority, or safety boundary requires user realignment. Do not keep patching to defend an earlier design.

### Understandable evidence before substantial implementation

Establish success and failure observations from the user's outcome, not from the proposed implementation. Use the existing conversation or plan; no separate artifact is required just for this guidance.

- Explain what observation would support the approach and what would disconfirm it. Choose proportionate examples, reference results, failure cases, or independent observations; follow [self-grounded verification](self-grounded-verification.md) for evaluation.
- Code and tests can share a mistaken assumption. A green suite is not evidence that the right problem was solved unless the checks connect to the agreed outcome. When evidence is unavailable, state the gap rather than inventing certainty.
- Perform authorized checks the assistant can execute. Return expected versus observed behavior, how the evidence can be inspected or reproduced, and what remains unverified. Ask the user only for checks needing their access or judgment, explaining the steps and expected result; do not dump the verification burden on them.
- Keep scientific exploration open-ended: these observations guide experiments and learning, not premature implementation contracts or formal verification freezes.

**Example:** “The scan is slow” does not yet justify concurrency. Inspect a representative timing breakdown first. If reads dominate, compare a bounded read strategy while checking identical results and resource use; if transformations dominate, revisit the approach. The evidence—not the size of a proposed patch—determines the next step.

---

## Two Modes: Active Exploration vs. Commitment Gate

1. **Active Exploration (Interactive Q&A / Design Discovery)**:
   - **Dialogue ownership**: Keep active user exploration, brainstorming, interface co-design, and overall decisions in the main thread. Supporting bounded source checks or independently answerable questions may be delegated; do not replace the dialogue with an isolated all-in proposal.
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
*   **Fast-Path / Utility Scripting & Automation (Trajectory 3)**: For single-file tools, shell scripts, CLI utilities, dotfiles configurations, or bounded fixes ($\le 2$ files, under ~100 lines), waive formal plan artifacts and the Locked Core Implementation Plan Gate—not shared understanding or authorization. When intent, behavior, an acceptance observation, and safety are clear, a 2–3 line explanation is sufficient; implement and verify directly. Resolve consequential uncertainty through focused discovery or dialogue even if the eventual patch is tiny; do not introduce heavy planning merely to do so.
*   **Rewrite & Refactor Tasks (Backward Compatibility Probe)**: Resolve preserve/delete intent using `delivery-ownership.md`. Ask only for consequential compatibility intent not already authorized; never silently retain shims or break an existing public promise.
*   **Non-Interactive / Automated / AFK Mode**: Analyze the codebase and record the design concept, constraints, consequential assumptions, sources, risks, and validation in the task area. Previously delegated technical/product choices remain the primary's responsibility while unattended; absence of a user is not new authority. Stop only affected work on unresolved user-only facts or safety/authority boundaries, with a checkpoint and actionable blocker.

## 🔒 Locked Core Implementation Plan Gate (before plan approval)

The Markdown plan/task/phase files below are agent-execution contracts, not a human-document default. Select saved human-facing specifications and reports using [Document format selection](document-formats.md); keep required execution and parser inputs native.

> **Scope & Exemption Gate:** This gate applies to multi-file software engineering features, substantial system overhauls, and architectural changes. It is **explicitly waived** for Trajectory 3 (Fast-Path / Utility Scripting, single-file tools, and bounded fixes $\le 2$ files). Never create multi-file plans or separate phase files for small scripts.

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

### 📋 Canonical Plan Template (`plan.md` / `implementation_plan.md`)

All implementation plans MUST adopt this scannable Markdown structure. Do not generate walls of discursive prose or deeply nested conversational bullet lists.

```markdown
# [Plan] <Feature or Task Title>

## Executive Summary

| Question | Answer |
|---|---|
| **Why change?** | Root motivation in 1–2 plain-language sentences |
| **What is being built?** | Primary artifact, package, or subsystem |
| **What stays out of scope?** | Explicit boundaries preserved untouched |
| **Key invariant / Safety guardrail?** | Non-negotiable integrity or correctness rule |

## Roadmap at a Glance

| # | Work Area / Phase | Primary Outcome | Phase Spec |
|---|---|---|---|
| 1 | <Slice 1 Name> | <One-line crisp outcome> | [`phases/01-<slice>.md`](phases/01-<slice>.md) |
| 2 | <Slice 2 Name> | <One-line crisp outcome> | [`phases/02-<slice>.md`](phases/02-<slice>.md) |

## ADR-Lite

- **Decision**: <1–2 sentence concrete architectural choice>
- **Rationale**: <Why this path was chosen over others>
- **Alternatives Rejected**: <Specific alternative rejected and reason>
- **Accepted Risks**: <Known trade-offs or technical debt accepted>

## 1. Scoped File Operations
| Op | Path | Responsibility |
|---|---|---|
| `[CREATE]` | `path/to/new_file.ts` | Concise purpose of the new file |
| `[MODIFY]` | `path/to/existing_file.ts` | Specific changes being introduced |
| `[DELETE]` | `path/to/deprecated.ts` | Rationale for removal |
| `[CLEANUP]`| `/tmp/scratch_fixture.json` | Temporary artifact to be deleted before done |

## 2. Locked Interface Contracts
> **RULE**: All boundary types and service signatures must be explicit code blocks. Zero prose descriptions.

```<language>
// Concrete DTOs, parameters, return types, and Result/Error unions
```

## 3. Phase Roadmap & Execution Index
- [ ] **Phase 1: <Slice Title>** → [`phases/01-<slice-name>.md`](phases/01-<slice-name>.md)
  - Objective: <one line summary>
- [ ] **Phase 2: <Slice Title>** → [`phases/02-<slice-name>.md`](phases/02-<slice-name>.md)
  - Objective: <one line summary>

## 4. Integrated Verification
- **Test Suite**: `<exact bash test command>`
- **Acceptance Criteria**:
  - [ ] Observable behavior 1
  - [ ] Observable behavior 2
```

### 📋 Canonical Phase File Template (`phases/01-<slice-name>.md`)

Each vertical slice MUST use this structure to guarantee bounded, executable context for implementers:

```markdown
# Phase 01: <Slice Name>

| Property | Value |
|---|---|
| **Slice Objective** | One-sentence concrete outcome delivered by this slice |
| **Prerequisites** | Prior phase(s) required, or "None" |
| **Target Files** | Exact subset of files created, modified, or deleted |

## 1. File Delta
| Op | Path | Notes |
|---|---|---|
| `[CREATE]` / `[MODIFY]` | `path/to/file.ts` | Specific role in this slice |
| `[CLEANUP]` | `path/to/scratch.tmp` | Must be removed before phase sign-off |

## 2. Phase Contracts
```<language>
// Specific subset of locked types/DTOs implemented in this phase
```

## 3. Step-by-Step TDD Implementation
1. **RED (Test)**: Write failing test in `<test-file>` asserting `<expected behavior>`.
   - Command: `<run test command>` (must fail with `<specific assertion error>`).
2. **GREEN (Code)**: Implement minimal logic in `<target-file>` to pass the test.
   - Command: `<run test command>` (must pass).
3. **REFACTOR (Polish)**: Clean up duplication, enforce `code-quality.md`, verify zero extraneous files.

## 4. Phase Verification & Exit Criteria
- **Verification Command**: `<exact shell command to verify slice>`
- [ ] Test ran green
- [ ] Zero invented interfaces outside locked contracts
- [ ] Zero unapproved files or scratch artifacts remaining
- [ ] Phase complete; ready for trajectory check (KEEP / ADJUST / ADVANCE / STOP)
```

---

## Rewrite & Consumer Interface Gate

For a rewrite, overhaul, or delete-and-rebuild task, complete this gate before handing work to `code-craft`:

1. List the old semantics and interfaces, marking each **delete** or **preserve**. Do not retain behavior by default.
2. If a public API or consumer app is affected, define consumer-facing signatures/schema and stubs, then obtain sign-off.
3. **Stop and clarify** if that consumer contract is missing or unapproved; implementation must not infer or hide it.
