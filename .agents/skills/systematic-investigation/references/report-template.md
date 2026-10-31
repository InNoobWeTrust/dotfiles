## Done Checklist

Use the remediation checklist only for a durable resolution claim. An unresolved
diagnosis, authorized containment or probe can be handed off without inventing a
root cause or checking remediation items as complete; state its status explicitly.

- [ ] Problem **defined clearly** (someone uninvolved could understand it)
- [ ] Status and verification scope explicitly stated
- [ ] For durable remediation: causal explanation **confirmed with evidence** (not just a theory); multiple contributing causes retained where warranted
- [ ] For durable remediation: solution addresses the **evidenced causes**, not just the symptom
- [ ] Solution **challenged from first principles** (Phase 4)
- [ ] Action plan has **concrete steps**
- [ ] **Verification plan** exists
- [ ] **Prevention measures** in place

For containment/probe handoff instead: record actual authority (specific human
scope for chaotic containment), owner, limits, observations, stop/rollback and next
review. For probes also record the hypothesis and disconfirming check. Keep causal
and resolution status unresolved; bounded feedback is not proof of a durable fix.

## Problem-Solving Report Template

Fill this out when systematically tackling a problem.

```markdown
# Problem-Solving Report: [Title]

**Status:** [unresolved diagnosis / authorized containment / hypothesis probe / verified remediation]
**Evidence scope:** [target, revision, conditions, time window; checks executed and unavailable]
**Context, if the optional lens was useful:** [bounded concern, provisional posture, evidence, disconfirmers, reassessment point]

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
5. Why? → **Candidate cause: [Answer; confirming/disconfirming evidence]**

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

**Causal finding:** [evidenced factors and alternatives excluded, or explicitly unresolved hypotheses; do not force one root cause]

## 3. Solution (5 Hows)

For durable remediation, complete the 5 Hows below. For containment or a probe,
replace them with the bounded intervention contract; do not invent a final fix.

1. How to fix? → [direction]
2. How to implement? → [approach]
3. How to execute? → [steps]
4. How to verify? → [test/metric]
5. How to prevent? → [systemic change]

### If containment or probe (not resolution)

- **Hypothesis and disconfirmer (probe):** [mechanism/pattern, alternative, discriminating observation]
- **Owner and authorization:** [actual authority; specific human-authorized scope for chaotic containment]
- **Limits:** [affected surface, permitted changes, time/resources, bounded downside]
- **Observation:** [baseline, signals, observed results and interpretation limits]
- **Stop/rollback:** [thresholds, responsible owner, feasible recovery]
- **Review:** [who/when reassesses, evidence still needed, next permitted check]

## 4. Action Plan

| #   | Action | Owner | Timeline | Done? |
| --- | ------ | ----- | -------- | ----- |
| 1   |        |       |          | [ ]   |
| 2   |        |       |          | [ ]   |

## 5. Verification

- **Success Metric:** [for remediation: evidence that causes and behavior are addressed; for containment/probe: bounded observation only]
- **Observed vs. expected:** [actual results, negative findings, unavailable checks; symptom disappearance is not causal proof]
- **Resolution status:** [verified only within evidenced scope, otherwise unresolved]
- **Check Date:** [when to verify]
- **Lessons Learned:** [what to carry forward]
```
