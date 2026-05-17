---
name: systematic-investigation
description: Systematic ideation and investigation for complex problems. Use this skill to debug tricky bugs, investigate failures, perform root cause analysis, make architectural decisions, brainstorm solutions, or untangle complex multi-concern situations. Also use when stuck going in circles, when a user reports vague or recurring symptoms, or asks "why does this keep happening." Activate when the user says "debug this", "troubleshoot", "figure out why", "root cause", "what's going wrong", "fix this bug", "this keeps breaking", "brainstorm solutions", "ideate on", "generate ideas", "creative problem solving", "first principles", "pre-mortem", "red team this", "challenge assumptions", "go deeper", "rethink this", or "inversion".
---

# Strategic Problem-Solving

Tackle any problem — bugs, design flaws, performance issues, architectural decisions, or unknown failures — using structured frameworks rather than trial and error.

## The Three Phases

Every problem-solving effort flows through three phases. Pick the right framework for each.

```
DEFINE  ──────►  ANALYZE  ──────►  SOLVE & ACT  ──────►  CHALLENGE
(What's the      (Why is it        (How do we            (Will this
 problem?)        happening?)       fix it?)              hold up?)
```

## Framework Selection

| Situation                     | Use                                         | Phase            |
| ----------------------------- | ------------------------------------------- | ---------------- |
| Vague or unclear symptom      | **5W** → **5 Whys**                         | Define → Analyze |
| Multiple possible causes      | **Ishikawa (Fishbone)**                     | Analyze          |
| Recurring / systemic issue    | **Iceberg Model**                           | Analyze          |
| Stuck on assumptions          | **First Principles**                        | Analyze          |
| Urgent, live incident         | **OODA Loop**                               | Solve            |
| Iterative process improvement | **PDCA**                                    | Solve            |
| Need a stakeholder report     | **A3 Report**                               | Solve            |
| Complex multi-concern mess    | **Kepner-Tregoe SA** → split and prioritize | Define           |

---

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

## Phase 2 — Find the Root Cause

> **Iron Law**: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.
> If you haven't completed Phase 1, you cannot propose fixes.

> 💡 **Elicitation opportunity**: After analysis, consider running a named
> elicitation method to push deeper. See [elicitation-methods](references/elicitation-methods.md)
> for the full library. Good starters: Socratic Questioning for requirements,
> Constraint Removal for stuck situations.

### 5 Whys

Drill past symptoms to the root cause.

1. State the problem clearly (use your 5W output).
2. Ask: **"Why is this happening?"** — answer with facts, not assumptions.
3. Take that answer and ask **"Why?"** again.
4. Repeat 3–7 times until you reach a cause you can directly act on.
5. If the chain branches (multiple causes), follow each branch.

**Watch out**: stopping too early (symptom-level fix) or going too deep (philosophical, not actionable).

### Ishikawa (Fishbone) Diagram

Systematically brainstorm and categorize all possible causes when the root cause is unclear.

Place the **problem** at the head. Draw branches for each category:

| Category        | Check for                                                              |
| --------------- | ---------------------------------------------------------------------- |
| **Methods**     | Flawed processes, missing steps, wrong workflows                       |
| **Machines**    | Tool bugs, infrastructure issues, hardware, dependency problems        |
| **Materials**   | Bad data, wrong inputs, config errors, corrupted dependencies          |
| **Manpower**    | Knowledge gaps, miscommunication, missing documentation                |
| **Measurement** | Missing metrics, misleading logs, observability gaps                   |
| **Environment** | OS differences, network issues, cloud region, external service outages |

For each category, brainstorm specific possible causes. Evaluate each against evidence to narrow down.

### Iceberg Model

Look beyond the visible event to find deeper systemic forces. Use for _recurring_ problems.

Work through four levels, from surface to depth:

1. **Event** — What just happened? (the immediate symptom)
2. **Pattern** — Has this happened before? What trends recur?
3. **Structure** — What systems, processes, or code architecture produce this pattern?
4. **Mental Model** — What beliefs or assumptions allow the structure to persist?

Intervene at the deepest feasible level. Fixing events = firefighting. Changing structures = prevention.

### First Principles Thinking

Break free from assumptions. Use when you're stuck because "that's just how it works."

1. **Question every assumption** — "Why do we believe X must be this way?"
2. **Decompose to fundamental truths** — What are the undeniable facts? (physics, math, API contracts, spec guarantees)
3. **Reconstruct from scratch** — Given only these truths, what's the optimal solution? Ignore how it's "always been done."

Example: Instead of "this library is slow, find a faster one," ask "what computation do we actually need? Can we avoid it entirely?"

---

## Phase 3 — Solve & Act

### 5 Hows

Once you know the root cause, develop a concrete solution.

1. **"How can we fix [root cause]?"** → Solution direction
2. **"How do we implement that?"** → Specific approach
3. **"How do we execute?"** → Concrete steps
4. **"How do we verify?"** → Test or metric
5. **"How do we prevent recurrence?"** → Systemic change

Each "How" should be more concrete than the last — ladder from abstract to executable.

### OODA Loop (Observe → Orient → Decide → Act)

Rapid decision-making under uncertainty. Use for live incidents, active debugging, or unfamiliar territory.

- **Observe** — Gather information: logs, metrics, user reports, reproduction steps. Cast a wide net.
- **Orient** — Analyze observations. Form a hypothesis. Identify your biases.
- **Decide** — Choose a course of action. Treat it as a hypothesis to test, not a final commitment.
- **Act** — Execute quickly. Loop back to Observe to see the effect.

Speed of iteration beats perfection. A fast OODA loop beats a slow, thorough one.

### PDCA (Plan → Do → Check → Act)

Deliberate iterative improvement. Use when you have time to measure and reflect.

- **Plan** — Define the objective, hypothesize the solution, design the experiment, define success metrics.
- **Do** — Implement on a small scale (feature flag, staging env, single module).
- **Check** — Measure results against success metrics. Any side effects?
- **Act** — If successful, standardize and expand. If not, analyze why and start a new Plan.

### A3 Report

Force clarity by constraining the entire narrative to a single structured report. Use when communicating to stakeholders.

Fill in these sections, keeping each brief:

1. **Background** — Why does this problem matter?
2. **Current Condition** — What is happening now? (data, facts)
3. **Target Condition** — What should be happening?
4. **Root Cause** — Why the gap? (use 5 Whys or Ishikawa)
5. **Countermeasures** — Proposed changes with owners and deadlines.
6. **Implementation Plan** — Specific steps, timeline, responsibilities.
7. **Follow-up** — How will you verify success? When?

---

## Phase 4 — Challenge & Validate

Before committing to a solution, apply the adversarial self-challenge protocol
from the `reviewer` skill's `references/adversarial.md` (Mode 2: Self-Challenge). This means:
running a pre-mortem, challenging across all attack vectors, and surfacing
tensions inline.

> 💡 **Elicitation opportunity**: After your initial challenge, consider running
> Pre-mortem Analysis, Inversion, or Red Team vs Blue Team from
> [elicitation-methods](references/elicitation-methods.md) for deeper scrutiny.

### Solution-Specific Questions

Beyond the general attack vectors, also ask:

- Does this fix the **root cause** or just the symptom?
- What happens if the **same problem recurs** after this fix?
- Is this solution **proportional** to the problem's severity?
- Could we **defer** this and solve a simpler version first?

### Challenge Verdict

````markdown
## Solution Challenge: [Title]

**Proposed solution**: [summary]
**Pre-mortem result**: [what could go wrong in 6 months]
**Challenges found**: <N>

### Concerns

1. [attack vector] <concern> — <severity: blocking / warning / minor>

### Verdict

PROCEED / REVISE / RETHINK
````

If challenges are blocking, revise the solution and re-challenge.

## Done Checklist

- [ ] Problem **defined clearly** (someone uninvolved could understand it)
- [ ] Root cause **confirmed with evidence** (not just a theory)
- [ ] Solution addresses the **root cause**, not just the symptom
- [ ] Solution **challenged from first principles** (Phase 4)
- [ ] Action plan has **concrete steps**
- [ ] **Verification plan** exists
- [ ] **Prevention measures** in place

## Problem-Solving Report Template

Fill this out when systematically tackling a problem.

```markdown
# Problem-Solving Report: [Title]

## 1. Problem Definition (5W)

- **Who:** [affected / reporter]
- **What:** [symptoms vs. expected behavior]
- **Where:** [file, module, environment]
- **When:** [start, frequency, pattern]
- **Impact:** [business/user impact]
- **Statement:** "[Who] experiences [What] in [Where] since [When], causing [impact]."

## 2. Root Cause Analysis

### Method: [5 Whys / Ishikawa / Iceberg / First Principles]

#### If 5 Whys:

1. Why? → [Answer]
2. Why? → [Answer]
3. Why? → [Answer]
4. Why? → [Answer]
5. Why? → **Root Cause: [Answer]**

#### If Ishikawa:

| Category    | Possible Causes | Evidence | Verdict |
| ----------- | --------------- | -------- | ------- |
| Methods     |                 |          |         |
| Machines    |                 |          |         |
| Materials   |                 |          |         |
| Manpower    |                 |          |         |
| Measurement |                 |          |         |
| Environment |                 |          |         |

#### If Iceberg:

- **Event:** [what happened]
- **Pattern:** [recurring trend]
- **Structure:** [system causing pattern]
- **Mental Model:** [belief sustaining it]

**Root Cause:** [confirmed statement]

## 3. Solution (5 Hows)

1. How to fix? → [direction]
2. How to implement? → [approach]
3. How to execute? → [steps]
4. How to verify? → [test/metric]
5. How to prevent? → [systemic change]

## 4. Action Plan

| #   | Action | Owner | Timeline | Done? |
| --- | ------ | ----- | -------- | ----- |
| 1   |        |       |          | [ ]   |
| 2   |        |       |          | [ ]   |

## 5. Verification

- **Success Metric:** [how we know it's fixed]
- **Check Date:** [when to verify]
- **Lessons Learned:** [what to carry forward]
```

---

For framework origins and academic references, see `references/origins.md`.

For the advanced elicitation methods library (structured second passes using
named reasoning methods), see [elicitation-methods](references/elicitation-methods.md).

## Related Skills

- **`codebase-exploration`** — Use before this skill when the problem involves unfamiliar code. Navigate first, then debug.
- **`reviewer`** (edge-case hunter lens) — Use after solving to verify no unhandled paths remain in the fix.
- **`reviewer`** (adversarial lens) — Phase 4 of this skill applies adversarial challenge; the reviewer skill provides a deeper protocol.
