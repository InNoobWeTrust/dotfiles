---
name: strategic-problem-solving
description: >
  Strategic and systematic thinking for problem-solving. Use this skill to
  debug tricky bugs, investigate failures, perform root cause analysis, make
  architectural decisions, or untangle complex multi-concern situations. Also
  use when stuck going in circles, when a user reports vague or recurring
  symptoms, or asks "why does this keep happening." Activate when the user says
  "debug this", "troubleshoot", "figure out why", "root cause", "what's going
  wrong", "fix this bug", or "this keeps breaking". Includes advanced elicitation
  methods (structured reasoning second passes) — activate when output feels
  shallow, or the user says "go deeper", "rethink this", "first principles",
  "pre-mortem", "red team this", or "inversion".
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

## Phase 2 — Find the Root Cause

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
from `references/adversarial-protocol.md` (Mode 2: Self-Challenge). This means:
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

- **`strategic-codebase-navigation`** — Use before this skill when the problem involves unfamiliar code. Navigate first, then debug.
- **`edge-case-hunter`** — Use after solving to verify no unhandled paths remain in the fix.
- **`adversarial-reviewer`** — Phase 4 of this skill applies adversarial challenge; the standalone skill provides a deeper protocol.
