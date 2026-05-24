# Rule: Test-Driven Development (TDD) Enforcement

This rule applies to **all non-trivial logic implementations, service additions, validators, and refactoring tasks**. It enforces the strict Red-Green-Refactor loop to ensure code is correct, modular, and fully covered by tests from its inception.

---

## 🧪 Why Test-Driven Development?

*   **Prevents Code Swelling**: Prevents agents from writing large, monolithic blocks of code that have never been executed or verified.
*   **Forces Interface Integrity**: If a unit is hard to test, it is poorly designed. TDD forces you to design clean, isolatable interfaces first.
*   **Rapid Feedback Loops**: Running small, local unit tests gives you and the user absolute confidence in correctness.

---

## 🔁 The Red-Green-Refactor Protocol

For any new logical component or modification:

1.  **Phase 1: Define Interface & Write Test (RED)**
    *   Create the interface definitions (signatures, enums, TypeScript interfaces, Python type stubs).
    *   Write the unit test file. Specify multiple test cases covering the happy path, boundary conditions, and error states.
    *   Run the test command (e.g. `npm run test`, `pytest`, `jest`). **Confirm the tests fail** (or fail to run due to missing implementation).
2.  **Phase 2: Write Minimum Implementation (GREEN)**
    *   Write the *minimum* amount of code required to make the test cases pass.
    *   Do not add speculative "future-proof" features. Keep it simple (KISS).
    *   Run the test command and **confirm all tests pass**.
3.  **Phase 3: Clean up & Refactor (REFACTOR)**
    *   Clean up variable names, nesting, and structure to comply with `rules/code-quality.md`.
    *   Rerun the tests to verify that no refactoring introduced regressions.

---

## ⚡ Execution Gates & Exceptions

*   **Strict Gate**: Any logic component (parsers, validators, mathematical algorithms, data processing units, state managers) **MUST** use this protocol.
*   **Exceptions**: You may bypass TDD only for:
    *   Pure CSS / design changes.
    *   Static configuration or JSON file edits.
    *   Pure markdown documentation tasks.
    *   Simple typos or rename-only operations.
*   When executing TDD, the agent must output the test execution command and its results in its response as evidence of compliance.
