## Phase 1.5 — Governance Capture (Failure Review Integration)

When this investigation uncovers a pattern that warrants governance attention (recurring failure, rule/skill gap), capture findings for future audits. This is advisory — it does not prescribe a specific tool or protocol. The organization's audit system determines how findings are preserved.

1. **Record the failure pattern**: After root cause is found, document as a short-term memory entry (see `memory` skill, Capture mode):
   - What was the AI's mistake (if an AI-authored change is the source)?
   - Was there a rule that should have prevented this? If yes, why didn't it work?
   - Was there no rule covering this pattern? Should there be?
   - Could a skill have prevented this? Does such a skill exist?

2. **Propose rule/skill evolution**: If a gap was found, propose a concrete rule or skill change. The proposal goes in the Problem-Solving Report under a new "Governance Gap" section.

3. **Route for audit**: Make findings discoverable through short-term memory entries (tag with `governance-gap` or equivalent org convention). During the next Consolidate pass (see `memory` skill, Dream Cycle), the finding can graduate to long-term so quarterly audits (see `skill-author` skill, Workflow B) surface them.

---

## Phase 2 — Find the Root Cause

> **Iron Law**: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.
> If you haven't completed Phase 1, you cannot propose fixes.

> 💡 **Elicitation opportunity**: After analysis, consider running a named
> elicitation method to push deeper. See [elicitation-methods](elicitation-methods.md)
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
