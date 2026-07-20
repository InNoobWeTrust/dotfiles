# Why Rules and Skills Exist

### The Problem

AI coding agents are powerful but unreliable in predictable ways. Without guardrails, they will:

- Produce large blocks of untested code that has never been executed
- Add a method to an existing class instead of designing a new module
- Invent business rules when the answer is ambiguous
- Silently swallow errors to keep the code "working"
- Skip quality checks to save time
- Fabricate functions or APIs that don't exist in the codebase

Rules and skills exist to **eliminate these failure modes at the system level**, rather than relying on human vigilance in every code review.

### The Mental Model

Think of `.agents/` as the project's **engineering handbook for its AI workforce:**

| Artifact | Purpose | Analogy |
|---|---|---|
| **Rules** (`rules/*.md`) | Non-negotiable constraints active on every task | Coding standards + code review checklist |
| **Skills** (`skills/*/SKILL.md`) | Complete workflows loaded per-task | SOPs for specific job types |

Rules are always active. Skills are loaded on demand. Both are binding — once loaded, the AI must complete every step.

### Two Critical Design Principles

**Principle 1: Rules prevent, skills enable.**

A rule says "never swallow errors silently." A skill says "here is the 5-phase process for writing a new feature." Rules are about stopping bad behavior. Skills are about directing good behavior.

**Principle 2: Rules are reactive, not speculative.**

Every effective rule was created in response to a real failure. Rules written to prevent hypothetical problems rarely survive contact with real work. When you add a rule, ask: "What specific bad output have I seen that this would have prevented?"

---
