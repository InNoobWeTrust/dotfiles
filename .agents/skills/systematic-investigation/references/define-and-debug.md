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

> **Iron Law**: no durable fixes without root-cause investigation and supporting evidence first.
> Before Phase 1 is complete, do not propose a durable fix as if its cause were established. Explicitly authorized containment and bounded probes remain unresolved interventions, not verified resolution.

Use for ANY technical issue: test failures, bugs, unexpected behavior, performance problems, build failures, integration issues.

**Especially when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

### Emergency containment before diagnosis

Time pressure alone does not change the diagnostic requirements. If effective
constraints have failed and stabilization is needed, only act when the human owner
has explicitly authorized the specific containment scope; otherwise escalate
without acting. Keep stabilization minimal, preserve diagnostic evidence where
safe, and record scope, owner, observations, stop/rollback limits and the next
review. Reassess after stabilization and resume the four phases for durable
remediation. A symptom disappearing is not causal confirmation or resolution.

When context is uncertain or mixed, the optional [Cynefin lens](cynefin.md) helps
distinguish analysis, a bounded hypothesis probe and containment. Probes require
its hypothesis/owner/limits/observation/stop-or-rollback/review contract and actual
execution authority. Missing authority or an unsafe probe blocks action, not
reporting an unresolved diagnosis.

### The Four Phases

#### Phase 1: Root Cause Investigation

**BEFORE attempting durable remediation:**

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

1. **Form Single Hypothesis** — "I think X is a causal factor because Y"; test one hypothesis at a time without excluding other contributing causes by assumption
2. **Test Minimally** — SMALLEST possible change to test hypothesis, one variable at a time
3. **Verify Before Continuing** — Did the observation support the causal explanation and distinguish relevant alternatives? If so, proceed to Phase 4 within authority. A symptom change alone is insufficient; retain uncertainty or form a new hypothesis.
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

**Note on external root causes:** If evidence traces the problem to something you don't own or can't change (vendor API behavior, external service, OS-level issue), document the constraint and distinguish completed diagnosis from verified remediation. Propose appropriate handling within authority; mitigation does not establish that the external cause is resolved.

### Red Flags - STOP

- "Quick fix for now, investigate later" presented as resolution; containment without specific human authorization
- "Just try changing X and see if it works"
- Proposing durable fixes before tracing data flow
- **"One more fix attempt"** (when already tried 2+)
- Each fix reveals new problem in different place
- 3+ fixes failed = architectural problem, question fundamentals

### Debugging Rationalizations (STOP and follow process)

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too |
| "Emergency, no time for process" | Only specifically human-authorized containment can precede diagnosis; preserve unresolved status and resume investigation |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from start |
| "I'll write test after confirming fix works" | Untested fixes don't stick |
| "Multiple fixes at once saves time" | Can't isolate what worked, causes new bugs |
| "Reference too long, I'll adapt the pattern" | Partial understanding guarantees bugs |

---
