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
from the `reviewer` skill's `references/sub-reviewers/adversarial.md` (Mode 2: Self-Challenge). This means:
running a pre-mortem, challenging across all attack vectors, and surfacing
tensions inline.

> 💡 **Elicitation opportunity**: After your initial challenge, consider running
> Pre-mortem Analysis, Inversion, or Red Team vs Blue Team from
> [elicitation-methods](elicitation-methods.md) for deeper scrutiny.

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
