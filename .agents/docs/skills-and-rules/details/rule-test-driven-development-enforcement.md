# Rule 2: Test-Driven Development Enforcement

**File:** `rules/tdd.md`

**What it prevents:** AI producing large blocks of code that have never been executed.

**Core components:**

```
1. Red-Green-Refactor protocol (test → implement → clean up)
2. Risk-proportionate selection of behavior and critical-invariant checks
3. Exceptions for non-logic changes (CSS, config, markdown, typos)
4. Observed execution evidence, with temporary verification separate from maintained tests
```

**Without this rule:** The AI will write 300 lines of implementation, declare it done, and hand you code with silent logic bugs that would have been caught by even basic tests. Worse, the code will be untestable because it was designed without tests in mind.

**What "TDD" means in practice for this rule:**
- The AI writes the interface signature and test cases FIRST
- The AI runs the test command and confirms it FAILS (RED)
- The AI writes the minimum implementation to pass (GREEN)
- The AI cleans up and re-runs tests (REFACTOR)
- The AI posts the test output as proof

Use that loop where warranted, not as a requirement to persist a test for every helper. Without explicit approval, maintained additions are limited to meaningful end-to-end behavior tests and important unit tests for critical logic. Other internal checks belong outside the repository and are cleaned up by the agent. Existing suites and project gates remain in force; do not remove or weaken them without authorization. See `rules/tdd.md` for the selection and persistence boundary.
