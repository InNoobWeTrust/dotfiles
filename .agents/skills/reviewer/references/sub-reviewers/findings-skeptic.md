# Findings Skeptic

Review lens that cross-validates the *output* of other reviewers, auditors,
and security scanners. Where other lenses review artifacts (code, specs,
plans), this lens reviews *findings* — challenging whether reported issues
are real, correctly assessed, and worth acting on.

> **Core problem:** Frontier models hallucinate findings. Security auditors
> report theoretical vulnerabilities with dramatic severity. Reviewers flag
> "issues" that are actually intentional design decisions. Scanner tools
> produce false positives. Without a skeptical second pass, these findings
> flow unchallenged to the user, wasting time on phantom problems.

## When to Use

- After any delegated reviewer, auditor, or scanner produces findings
- When a security audit recommends defensive measures
- When a code review flags issues that feel disproportionate
- When a threat model assigns HIGH/CRITICAL to scenarios without evidence
- When multiple review passes produce conflicting findings

> **Relationship to other lenses**: This lens does not review the original
> artifact — it reviews the *review*. It composes with `pragmatic-triage.md`
> (which challenges proposed complexity) by applying the same probability ×
> impact logic to reported findings rather than proposed solutions.

---

## Mindset

- **Findings are claims, not facts.** Every reported issue is an assertion
  that needs evidence. "This could be exploited" is not evidence — it's a
  hypothesis.
- **Severity inflation is the default failure mode.** Models err toward
  dramatic assessments because they're trained on security content that
  emphasizes worst cases. Calibrate downward and demand specifics.
- **False positives are expensive.** Every phantom finding that gets acted
  on wastes engineering time, adds unnecessary complexity, and erodes trust
  in the review process. Catching false positives is as valuable as catching
  real bugs.
- **Context matters more than theory.** A SQL injection finding in a CLI
  tool with no network exposure is not the same as one in a public API.
  Findings must be evaluated against the actual deployment context.
- **The auditor is not infallible because they used a frontier model.**
  Agreement bias applies to reviewers too — they see code and are primed
  to find problems. Challenge that bias.

---

## Protocol

### Step 1: Inventory the Findings

List every finding from the source material with its claimed severity.
Do not evaluate yet — just extract.

```markdown
| # | Finding | Claimed Severity | Source |
|---|---------|-----------------|--------|
| 1 | ...     | CRITICAL        | security-auditor |
| 2 | ...     | HIGH            | reviewer-deep |
```

### Step 2: Evidence Check (Per Finding)

For each finding, answer:

1. **Is the finding specific?** Does it point to an exact location (file,
   line, function)? Vague findings ("the authentication could be improved")
   are suspect.
2. **Is the scenario realistic?** Does the finding describe a concrete
   attack/failure path, or a theoretical "what if"?
3. **Is the severity calibrated to context?** A finding valid in a
   public-facing SaaS may be irrelevant in an internal CLI tool.
4. **Can the finding be reproduced or verified?** Is there a concrete
   test case, or is it purely analytical?
5. **Does the finding actually exist in the code?** Models hallucinate
   code patterns. Verify the cited code actually says what the finding
   claims.

### Step 3: Classify Each Finding

```
┌──────────────────────────────────────────────────────────────┐
│ VERIFIED     — Evidence exists, scenario is realistic,       │
│                severity is proportional to context           │
├──────────────────────────────────────────────────────────────┤
│ OVERSTATED   — Real issue, but severity is inflated or       │
│                context makes it lower priority than claimed  │
├──────────────────────────────────────────────────────────────┤
│ UNVERIFIED   — Cannot confirm from available evidence;       │
│                may be real but needs investigation           │
├──────────────────────────────────────────────────────────────┤
│ FALSE        — Finding does not hold: code doesn't match     │
│                claim, scenario is impossible in context,     │
│                or the cited pattern doesn't exist            │
├──────────────────────────────────────────────────────────────┤
│ INTENTIONAL  — The "issue" is a deliberate design decision   │
│                that the auditor didn't recognize as such     │
└──────────────────────────────────────────────────────────────┘
```

### Step 4: Produce the Skeptic Report

```markdown
## Findings Skeptic Report: <Source Audit/Review>

**Findings reviewed**: N
**Verified**: N (real, actionable)
**Overstated**: N (real but inflated)
**Unverified**: N (needs investigation)
**False**: N (not real)
**Intentional**: N (by design)

### False Findings (Drop)

#### F<n>. <Finding Title>
- **Original claim**: <what the auditor said>
- **Why false**: <specific evidence — code doesn't match, scenario
  impossible, pattern doesn't exist>

### Overstated Findings (Recalibrate)

#### O<n>. <Finding Title>
- **Original severity**: <claimed>
- **Adjusted severity**: <actual, with reasoning>
- **Context**: <why the original assessment was disproportionate>

### Intentional Design (Acknowledge)

#### I<n>. <Finding Title>
- **Original claim**: <what the auditor flagged>
- **Design rationale**: <why this is intentional, with evidence>

### Verified Findings (Act On)

#### V<n>. <Finding Title>
- **Confirmed**: <evidence>
- **Severity**: <verified severity>
- **Recommendation**: <action>

### Unverified Findings (Investigate)

#### U<n>. <Finding Title>
- **What's missing**: <what evidence is needed to confirm or deny>
- **Suggested investigation**: <concrete steps>

### Net Assessment

Of N original findings, M are actionable at their claimed severity.
The review had a [false positive rate / accuracy assessment].
[Systemic pattern observation if applicable — e.g., "the auditor
consistently inflated severity on internal-only components."]
```

---

## Common False-Positive Patterns

These patterns frequently produce hallucinated or inflated findings:

| Pattern | Why It Happens | How to Check |
|---|---|---|
| **Phantom code** | Model "sees" a vulnerability in code that doesn't exist or works differently than claimed | Read the actual source at the cited location |
| **Context-free severity** | "SQL injection = CRITICAL" regardless of whether the input is user-controlled or the DB is local | Trace the data flow from source to sink |
| **Theoretical chains** | "If A happens, and then B happens, and then C..." where each step is individually unlikely | Multiply the probabilities; the chain is almost certainly LOW |
| **Pattern-matching false alarm** | Model recognizes a code shape that *looks like* a vulnerability but isn't (e.g., parameterized queries flagged as injection) | Check whether the defense the model missed is actually present |
| **Stale knowledge** | Finding based on a vulnerability in a library version the project doesn't use, or a pattern that was fixed upstream | Check actual dependency versions and code |
| **Best-practice conflation** | "Not using X is a vulnerability" when X is a preference, not a security requirement | Distinguish between "should" and "must" |
| **Severity anchoring** | First finding is CRITICAL, so subsequent findings anchor near that level | Evaluate each finding independently |

---

## Rules

1. **Check the code.** Before accepting any finding, verify the cited code
   actually matches the claim. Models hallucinate code patterns routinely.
2. **Context over theory.** A finding's severity depends on deployment
   context, not abstract vulnerability databases.
3. **Be fair to the auditor.** When a finding is verified, say so clearly.
   Skepticism is not cynicism — the goal is accuracy, not dismissal.
4. **Report patterns.** If the source audit has systemic bias (always
   inflates, misses context, hallucinates patterns), report the pattern
   so the user can calibrate future audits.
5. **Do not re-review the original artifact.** This lens reviews findings,
   not code. If you spot issues the original auditor missed, note them
   separately but keep them distinct from the skeptic analysis.

---

## Calibrating Intensity

| Source | Intensity | Reason |
|---|---|---|
| **Automated scanner** | High | Scanners are noisy by design |
| **Delegated security-auditor agent** | High | Models hallucinate findings frequently |
| **Delegated code-reviewer agent** | Medium | Code reviews are more grounded but still inflate severity |
| **Human reviewer** | Low | Verify only findings that feel disproportionate |
| **Full Swarm consensus** | Low | Multi-model agreement reduces hallucination risk |

---

## Related References

- **`pragmatic-triage.md`** — Applies probability × impact to proposed solutions; this lens applies it to reported findings.
- **`adversarial.md`** — Challenges the original artifact; this lens challenges the review of the artifact.
- **`security.md`** — The lens most likely to produce findings this lens should challenge.
