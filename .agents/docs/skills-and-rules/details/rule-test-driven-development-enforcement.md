# Rule 2: Test-Driven Development Enforcement

**File:** `rules/tdd.md`

**What it prevents:** AI producing large blocks of code that have never been executed.

**Core components:**

```
1. Red-Green-Refactor protocol (test → implement → clean up)
2. Strict gate for logic components (parsers, validators, algorithms, state managers)
3. Exceptions for non-logic changes (CSS, config, markdown, typos)
4. AI must output test execution results as compliance evidence
```

**Without this rule:** The AI will write 300 lines of implementation, declare it done, and hand you code with silent logic bugs that would have been caught by even basic tests. Worse, the code will be untestable because it was designed without tests in mind.

**What "TDD" means in practice for this rule:**
- The AI writes the interface signature and test cases FIRST
- The AI runs the test command and confirms it FAILS (RED)
- The AI writes the minimum implementation to pass (GREEN)
- The AI cleans up and re-runs tests (REFACTOR)
- The AI posts the test output as proof

If the AI skips any phase, the rule is violated.
