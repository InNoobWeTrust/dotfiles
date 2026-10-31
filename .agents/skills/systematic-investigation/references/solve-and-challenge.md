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
- **Orient** — Analyze observations. Form a hypothesis. Identify your biases. When context is uncertain or mixed, optionally use [Cynefin](cynefin.md) to reassess the posture; urgency is not evidence of chaos.
- **Decide** — Choose an evidence-seeking step within actual authority. For probes, define hypothesis, owner, limits, observation, stop/rollback and review first. Chaotic-context containment requires explicit human authorization for the specific scope; otherwise escalate without acting.
- **Act** — Execute only the authorized bounded step, observe its effect and reassess. If authority or safe limits are absent, return the gap without acting. Neither a probe nor containment establishes verified resolution.

Prefer timely feedback within those bounds, not speed over authority or evidence.
Keep containment/probe results explicitly unresolved. Durable remediation still
requires causal investigation, supporting evidence and verification; OODA is not
an exception to that requirement.

### PDCA (Plan → Do → Check → Act)

Deliberate iterative improvement. Use when you have time to measure and reflect.

- **Plan** — Define the objective, hypothesize the solution, design the experiment, define success metrics.
- **Do** — Implement on a small scale (feature flag, staging env, single module).
- **Check** — Measure results against success metrics. Any side effects?
- **Act** — If evidence supports the intended outcome, propose standardization or expansion within authority; a small-scale signal alone grants neither. If not, analyze why and start a new Plan. Keep probes distinct from verified remediation.

### A3 Report

Force clarity by constraining the entire narrative to a single structured report. Use when communicating to stakeholders.

Fill in these sections, keeping each brief:

1. **Background** — Why does this problem matter?
2. **Current Condition** — What is happening now? (data, facts)
3. **Target Condition** — What should be happening?
4. **Root Cause** — Why the gap? (use 5 Whys or Ishikawa where applicable); distinguish evidence, causal hypotheses and unresolved factors.
5. **Countermeasures** — Proposed changes with owners and deadlines.
6. **Implementation Plan** — Specific steps, timeline, responsibilities.
7. **Follow-up** — How will you verify success? When?

---

## Phase 4 — Challenge & Validate

State whether the proposal is durable remediation, containment or a learning
probe. For the latter two, challenge authority, limits, observations, recovery and
next review; PROCEED means only that bounded step, never verified resolution.

Before committing to a solution, run an adversarial self-challenge: conduct a
pre-mortem, test plausible failure/abuse vectors for the actual scope, identify
assumptions and tensions, and record a PROCEED | REVISE | RETHINK verdict with
supporting evidence. Do not claim independent review from self-challenge. If the
problem needs specialist adversarial coverage that is unavailable, state that gap
and limit the conclusion; do not invent completed review.

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
