---
name: strategic-problem-solving
description: Strategic and Systematic Thinking for Problem-Solving
---

# Strategic and Systematic Thinking for Problem-Solving

## When to use this skill
A methodology for tackling any problem — bugs, design flaws, performance issues, architectural decisions, or unknown failures — using proven frameworks from Lean, Six Sigma, military strategy, and systems thinking. Apply this skill whenever you need to **define a problem clearly**, **find its root cause**, or **develop and validate a solution**.

---

## Meta-Process: The Three Phases

Every problem-solving effort flows through three phases. Pick the right framework(s) for each phase based on the situation.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  PHASE 1        │     │  PHASE 2        │     │  PHASE 3        │
│  DEFINE         │────▶│  ANALYZE        │────▶│  SOLVE & ACT    │
│                 │     │                 │     │                 │
│  5W             │     │  5 Whys         │     │  5 Hows         │
│  Kepner-Tregoe  │     │  Ishikawa       │     │  OODA Loop      │
│  Situation      │     │  Iceberg Model  │     │  PDCA           │
│  Appraisal      │     │  First          │     │  A3 Thinking    │
│                 │     │  Principles     │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Framework Selection Guide

| Problem Type | Recommended Frameworks | Why |
|---|---|---|
| **Unknown / vague symptom** | 5W → 5 Whys | Define first, then drill to root cause |
| **Multiple possible causes** | Ishikawa (Fishbone) | Visually map and categorize all candidates |
| **Recurring / systemic issue** | Iceberg Model | Look beyond events to structures & mental models |
| **Challenging assumptions** | First Principles | Strip away convention, rebuild from truths |
| **Urgent / real-time incident** | OODA Loop | Rapid observe-orient-decide-act cycles |
| **Process improvement** | PDCA or DMAIC | Iterative, data-driven improvement |
| **Need a single-page summary** | A3 Thinking | Structured report for stakeholder alignment |
| **Complex, multi-concern mess** | Kepner-Tregoe SA → PA | Separate concerns, prioritize, then analyze |

---

## Phase 1 — Problem Definition

### 1. The 5W Framework (Who / What / Where / When / Why)

* **Purpose**: Establish a complete, unambiguous problem statement before diving into analysis.
* **Execution**:
    * **Who** — Who is affected? Who reported it? Who owns the system?
    * **What** — What exactly is happening? What are the symptoms? What is the expected behavior?
    * **Where** — Where does it occur? (file, module, environment, geography)
    * **When** — When did it start? Is it intermittent or constant? Any temporal patterns?
    * **Why** — Why does it matter? What is the business/user impact?
* **Output**: A crisp problem statement: *"[Who] is experiencing [What] in [Where] since [When] because [initial Why], impacting [impact]."*

### 2. Kepner-Tregoe Situation Appraisal

* **Purpose**: When facing a complex, messy situation with multiple concerns, separate and prioritize them before analyzing.
* **Execution**:
    1. **List concerns** — Enumerate all threats, issues, and opportunities.
    2. **Separate & clarify** — Break compound issues into distinct, single concerns.
    3. **Set priority** — Rank by urgency (time pressure), seriousness (impact), and growth (will it worsen?).
    4. **Plan next steps** — For each concern, decide: Does it need Problem Analysis, Decision Analysis, or Potential Problem Analysis?
* **When to use**: You're overwhelmed by a tangle of issues and don't know where to start.

---

## Phase 2 — Root Cause Analysis

### 3. The 5 Whys

* **Origin**: Sakichi Toyoda, Toyota Production System.
* **Purpose**: Drill past symptoms to the root cause by iteratively asking "Why?".
* **Execution**:
    1. State the problem clearly (use your 5W output).
    2. Ask: **"Why is this happening?"** — Answer with facts, not assumptions.
    3. Take that answer and ask **"Why?"** again.
    4. Repeat until you reach a cause that, if fixed, would prevent recurrence (typically 3–7 iterations).
* **Rules**:
    * Each answer must be grounded in evidence/data.
    * If the chain branches (multiple causes), follow each branch.
    * Stop when you reach a cause you can directly act on.
* **Pitfall**: Stopping too early (symptom-level) or going too deep (philosophical/unhelpful).

### 4. Ishikawa / Fishbone Diagram

* **Origin**: Kaoru Ishikawa, quality management.
* **Purpose**: Systematically brainstorm and categorize all *possible* causes when the root cause is unclear and there are many candidates.
* **Execution**:
    1. Place the **problem** at the "head" of the fish.
    2. Draw major category "bones" using the **6 Ms**:
        * **Methods** — processes, procedures, workflows
        * **Machines** — tools, infrastructure, hardware, software dependencies
        * **Materials** — data, inputs, configurations, dependencies
        * **Manpower** — skills, knowledge, staffing, communication
        * **Measurement** — metrics, monitoring, observability gaps
        * **Mother Nature (Environment)** — OS, network, cloud region, external services
    3. For each category, brainstorm specific possible causes as sub-branches.
    4. Evaluate each candidate against evidence to narrow down the true root cause.
* **When to use**: Multiple people have different theories; you need a structured brainstorm.

### 5. Systems Thinking — Iceberg Model

* **Purpose**: Look beyond the visible event to find the deeper systemic forces at play. Especially useful for *recurring* problems.
* **Four Levels** (from surface to depth):

    | Level | Question | Example |
    |---|---|---|
    | **Events** | What just happened? | "Deploy failed at 3 AM" |
    | **Patterns** | What trends recur? | "Deploys fail every time after a config change" |
    | **Structures** | What systems/processes produce the pattern? | "No automated config validation in the pipeline" |
    | **Mental Models** | What beliefs/assumptions allow the structure to persist? | "We trust devs to manually verify configs" |

* **Execution**:
    1. Describe the **event** (the surface symptom).
    2. Look for **patterns** — has this happened before? When?
    3. Identify the **structures** (code architecture, processes, org design) that produce the pattern.
    4. Uncover the **mental models** (assumptions, cultural beliefs) that sustain those structures.
    5. Intervene at the deepest feasible level for maximum leverage.
* **Key insight**: Fixing events = firefighting. Changing structures/mental models = prevention.

### 6. First Principles Thinking

* **Origin**: Aristotle; popularized by Elon Musk.
* **Purpose**: Break free from conventional assumptions. Decompose the problem to its irreducible truths and reason up from there.
* **Execution**:
    1. **Identify and question every assumption** — "Why do we believe X must be this way?"
    2. **Decompose to fundamental truths** — What are the basic, undeniable facts? (physics, math, API contracts, language specs)
    3. **Reconstruct from scratch** — Given only these truths, what is the optimal solution? Ignore how it's "always been done."
* **When to use**:
    * You're stuck because "that's just how it works."
    * Existing solutions feel arbitrarily constrained.
    * You need a breakthrough, not an incremental fix.
* **Example**: Instead of "this library is slow, find a faster one," ask "what computation do we actually need? Can we avoid the computation entirely?"

---

## Phase 3 — Solution & Action

### 7. The 5 Hows

* **Purpose**: Once you've identified the root cause (via 5 Whys), develop a concrete solution by iteratively asking "How?".
* **Execution**:
    1. Start with the root cause: **"How can we fix [root cause]?"**
    2. Take that answer and ask: **"How do we implement that?"**
    3. Repeat until you have actionable, specific steps that someone can execute immediately.
    4. Each "How" should be more concrete than the last.
* **Output**: A ladder from abstract solution → concrete implementation steps.

### 8. OODA Loop (Observe → Orient → Decide → Act)

* **Origin**: Colonel John Boyd, USAF.
* **Purpose**: Rapid decision-making under uncertainty. Ideal for live incidents, debugging sessions, or any situation where conditions change fast.
* **Execution**:
    * **Observe** — Gather information: logs, metrics, user reports, reproduction steps. Cast a wide net.
    * **Orient** — Analyze what you've observed. Filter through your knowledge, past experience, and mental models. Identify biases. Form a hypothesis.
    * **Decide** — Choose a course of action. Treat it as a *hypothesis* to test, not a final commitment.
    * **Act** — Execute quickly. Then loop back to **Observe** to see the effect.
* **Key principle**: Speed of iteration beats perfection. A fast OODA loop beats a slow, thorough one.
* **When to use**: Production incidents, time-sensitive bugs, unfamiliar territory where you need to learn by doing.

### 9. PDCA (Plan → Do → Check → Act)

* **Origin**: Shewhart/Deming Cycle, Total Quality Management.
* **Purpose**: Continuous, iterative improvement. More deliberate than OODA — use when you have time to measure and reflect.
* **Execution**:
    * **Plan** — Define the objective, hypothesize the solution, design the experiment/change, define success metrics.
    * **Do** — Implement the change on a small scale (feature flag, staging env, single module).
    * **Check** — Measure results against your success metrics. Did it work? Any side effects?
    * **Act** — If successful, standardize and expand. If not, analyze why and start a new Plan.
* **When to use**: Refactoring, performance tuning, process improvement, any change where you can iterate safely.

### 10. A3 Thinking (Single-Page Problem-Solving Report)

* **Origin**: Toyota Production System.
* **Purpose**: Force clarity by constraining the entire problem → analysis → solution narrative to a single structured report. Excellent for communicating with stakeholders.
* **Sections**:
    1. **Background** — Why does this problem matter?
    2. **Current Condition** — What is happening now? (data, facts, observations)
    3. **Goal / Target Condition** — What should be happening?
    4. **Root Cause Analysis** — Why is the current state different from the goal? (use 5 Whys / Ishikawa here)
    5. **Countermeasures** — Proposed changes, with owners and deadlines.
    6. **Implementation Plan** — Specific steps, timeline, responsibilities.
    7. **Follow-up** — How will we verify success? When will we check?
* **When to use**: You need to present a problem and proposed solution to a team or decision-maker.

---

## Executable Template: Problem-Solving Report

*The agent should fill this out when systematically tackling a problem.*

```markdown
# Problem-Solving Report: [Title]

## 1. Problem Definition (5W)
- **Who:** [Who is affected / who reported it]
- **What:** [Exact symptoms and expected behavior]
- **Where:** [Location — file, module, environment]
- **When:** [When it started, frequency, temporal pattern]
- **Why it matters:** [Business/user impact]
- **Problem Statement:** "[Who] experiences [What] in [Where] since [When], causing [impact]."

## 2. Root Cause Analysis
### Method Used: [5 Whys / Ishikawa / Iceberg / First Principles]

#### If 5 Whys:
1. Why? → [Answer 1]
2. Why? → [Answer 2]
3. Why? → [Answer 3]
4. Why? → [Answer 4]
5. Why? → **Root Cause: [Answer 5]**

#### If Ishikawa:
| Category | Possible Causes | Evidence | Verdict |
|---|---|---|---|
| Methods | | | |
| Machines | | | |
| Materials | | | |
| Manpower | | | |
| Measurement | | | |
| Environment | | | |

#### If Iceberg:
- **Event:** [What happened]
- **Pattern:** [Recurring trend]
- **Structure:** [System/process causing pattern]
- **Mental Model:** [Belief sustaining the structure]

**Confirmed Root Cause:** [Statement]

## 3. Solution Development (5 Hows)
1. How to fix root cause? → [Solution direction]
2. How to implement? → [Specific approach]
3. How to execute? → [Concrete steps]
4. How to verify? → [Test/metric]
5. How to prevent recurrence? → [Systemic change]

## 4. Action Plan
| Step | Action | Owner | Timeline | Status |
|---|---|---|---|---|
| 1 | | | | [ ] |
| 2 | | | | [ ] |
| 3 | | | | [ ] |

## 5. Verification & Follow-up
- **Success Metric:** [How we know it's fixed]
- **Check Date:** [When to verify]
- **Lessons Learned:** [What to carry forward]
```

---

## Quick Reference: When Am I Done?

- [ ] Problem is **defined** clearly (someone uninvolved could understand it)
- [ ] Root cause is **confirmed** with evidence (not just a theory)
- [ ] Solution **addresses the root cause**, not just the symptom
- [ ] Action plan has **concrete steps** with owners and timelines
- [ ] **Verification** plan exists to confirm the fix worked
- [ ] **Prevention** measures are in place to stop recurrence

---

## References & Origins

| Framework | Origin | Key Source |
|---|---|---|
| 5W | Journalism / general inquiry | Classical methodology |
| 5 Whys | Sakichi Toyoda, Toyota | [businessmap.io](https://businessmap.io/lean-management/improvement/5-whys-analysis) |
| 5 Hows | Lean / ASQ | [asq.org](https://asq.org) |
| Ishikawa / Fishbone | Kaoru Ishikawa, 1960s | [asq.org/quality-resources](https://asq.org/quality-resources/fishbone) |
| PDCA | Shewhart / Deming | [asq.org/quality-resources](https://asq.org/quality-resources/pdca-cycle) |
| OODA Loop | Col. John Boyd, USAF | [fs.blog](https://fs.blog/ooda-loop/) |
| Kepner-Tregoe | Kepner & Tregoe, 1960s | [kepner-tregoe.com](https://kepner-tregoe.com) |
| A3 Thinking | Toyota Production System | [lean.org](https://lean.org) |
| First Principles | Aristotle / Elon Musk | [fs.blog](https://fs.blog/first-principles/) |
| Iceberg Model | Systems Thinking | [untools.co](https://untools.co/iceberg-model) |
