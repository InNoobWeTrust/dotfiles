## Phase 1 — Define the Problem

### 5W Framework

Establish a complete problem statement before analyzing anything.

1. **Who** — Who is affected? Who reported it?
2. **What** — What exactly is happening vs. what's expected?
3. **Where** — Where does it occur? (file, module, environment)
4. **When** — When did it start? Intermittent or constant? Any temporal patterns?
5. **Why it matters** — What's the impact?

Produce a crisp statement: _"[Who] experiences [What] in [Where] since [When], causing [impact]."_

### Kepner-Tregoe Situation Appraisal

Use when facing a tangle of issues and you don't know where to start.

1. **List all concerns** — enumerate every threat, issue, and opportunity.
2. **Separate** — break compound issues into single, distinct concerns.
3. **Prioritize** — rank each by urgency (time pressure), seriousness (impact), and growth (will it worsen?).
4. **Route** — for each concern, decide: does it need root cause analysis, a decision, or risk prevention?

---

## Systematic Debugging Protocol

> **Iron Law**: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.
> If you haven't completed Phase 1, you cannot propose fixes.

Use for ANY technical issue: test failures, bugs, unexpected behavior, performance problems, build failures, integration issues.

**Especially when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

### The Four Phases

#### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully** — Don't skip past errors or warnings
2. **Reproduce Consistently** — Can you trigger it reliably? What are exact steps?
3. **Check Recent Changes** — What changed that could cause this?
4. **Gather Evidence in Multi-Component Systems** — Add diagnostic instrumentation at each boundary layer (log what enters, what exits, verify environment/config propagation)
5. **Trace Data Flow** — Where does the bad value originate? What called this with bad value? Keep tracing backward until you find the source. Fix at source, not symptom.

**Silent failures:** If there are NO error messages — hanging processes, timing-dependent behavior, memory leaks, or silent data corruption — treat the absence of observable errors as the symptom to investigate. Define "correct behavior" first, then find where reality diverges.

#### Phase 2: Pattern Analysis

**Find the pattern before fixing:**

1. **Find Working Examples** — Locate similar working code in same codebase
2. **Compare Against References** — Read reference implementations COMPLETELY (don't skim)
3. **Identify Differences** — What's different between working and broken?
4. **Understand Dependencies** — What other components, settings, environment does this need?

#### Phase 3: Hypothesis and Testing

**Scientific method:**

1. **Form Single Hypothesis** — "I think X is the root cause because Y"
2. **Test Minimally** — SMALLEST possible change to test hypothesis, one variable at a time
3. **Verify Before Continuing** — Did it work? Yes → Phase 4. Didn't work? NEW hypothesis.
4. **When You Don't Know** — Say "I don't understand X", don't pretend to know

#### Phase 4: Implementation

**Fix the root cause, not the symptom:**

1. **Create Failing Test Case** — Simplest possible reproduction (use TDD cycle)
2. **Implement Single Fix** — Address root cause identified, ONE change at a time
3. **Verify Fix** — Test passes now? No other tests broken?
4. **If Fix Doesn't Work:**
   - If < 3 fixes: Return to Phase 1, re-analyze with new information
   - If ≥ 3 fixes: STOP and assess. Two possible patterns:
     - **Each fix reveals new shared state/coupling/problem in different place** → architectural problem, question fundamentals
     - **Root cause found but fix is outside your control** (external dependency, vendor API, legacy system) → document the constraint, implement appropriate handling (retry, timeout, error message), add monitoring

**Note on external root causes:** If you've traced the problem to something you don't own or can't change (vendor API behavior, external service, OS-level issue), you've still completed the process. Document the constraint, handle it gracefully, and move on.

### Red Flags - STOP

- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- Proposing solutions before tracing data flow
- **"One more fix attempt"** (when already tried 2+)
- Each fix reveals new problem in different place
- 3+ fixes failed = architectural problem, question fundamentals

### Debugging Rationalizations (STOP and follow process)

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too |
| "Emergency, no time for process" | Systematic debugging is FASTER than guess-and-check |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from start |
| "I'll write test after confirming fix works" | Untested fixes don't stick |
| "Multiple fixes at once saves time" | Can't isolate what worked, causes new bugs |
| "Reference too long, I'll adapt the pattern" | Partial understanding guarantees bugs |

---
