# Category B: Process Failures

#### B1. Untested Code Delivery

**Symptom:** The AI writes a complete feature implementation and declares it done without running any tests.

**What happens:** The code compiles but has logic errors. The AI's confidence is indistinguishable from correctness. You only discover the bugs in manual testing.

**Defending rule:** TDD Enforcement

**Escalation:** Require the AI to post test output as part of its completion message. If tests weren't run, the task isn't done.

#### B2. Specification Misalignment

**Symptom:** The AI builds a feature that technically works but doesn't match what the user wanted because it filled in ambiguous requirements with assumptions.

**What happens:** 2 hours of implementation → code review reveals wrong approach → 1 hour of rework. Total waste: 3 hours on a 1-hour task.

**Defending rule:** Grooming (Reverse Interview)

**Escalation:** If the AI skips the grooming interview, stop the task and re-prompt with: "Before implementing, ask me 3-5 clarifying questions about this feature."

#### B3. Skill Workflow Skipping

**Symptom:** The AI says "I'll use code-craft for this" and then writes code without going through the 5-phase workflow (design intent → SOLID check → write with standards → readability audit → tech debt inventory).

**What happens:** The code passes basic review but accumulates structural problems: mixed responsibilities, no error contracts, undocumented design decisions. Over 10 tasks, the module becomes unmaintainable.

**Defending rule:** Skill Compliance

**Escalation:** Add a checkpoint requirement — the AI must post its Design Intent block and SOLID checklist before writing code. If it doesn't, it's a rule violation.

#### B4. Horizontal Building

**Symptom:** The AI writes all database schemas first, then all APIs, then all UI. Nothing is testable until everything is done.

**What happens:** Integration bugs are discovered late. A schema mistake discovered after the UI is built requires changing everything.

**Defending rule:** Vertical Slicing

#### B5. Agreement Bias in Self-Review

**Symptom:** The AI reads its own implementation (or a candidate solution already in context) and declares it correct. A test run "looks green" and the AI stops checking. It produces confident, articulate reasoning that *justifies* the artifact rather than *interrogating* it.

**What happens:** Bugs the AI actually knows how to catch slip through, because success criteria were never stated independent of the artifact — the AI checked the code against itself, a circular loop that always passes. This is distinct from B1 (no tests were run at all): here tests may run and even pass, but they don't test the actual requirement, or the "verification" was really just re-reading the code with a favorable eye.

**Defending rule:** Self-Grounded Verification (`rules/self-grounded-verification.md`) — state artifact-independent success criteria and a disconfirming check FIRST, then evaluate the artifact against them with cited evidence.

**Escalation:** If the AI keeps declaring things "done" without a Step-1/Step-2 split, require it to output the Success Criteria checklist before the Verification Result table in any completion message. If in-context bias persists even with the checklist, escalate to delegation — hand the review to an independent subagent (see `reviewer` skill's Author Bias Gate) since no amount of single-context restructuring fully eliminates shared-context bias.

**Note:** This differs from `reviewer`'s Author Bias Gate. That gate is about *whether to delegate at all* when you're the author. This pattern is about *what to do inside a single context* when delegation isn't available or the check is lightweight — the two are complementary layers, not competing fixes.
