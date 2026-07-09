# Rule: Self-Grounded Verification (Anti Agreement-Bias)

This rule applies to **every verification, self-review, and completion-claim moment**. It defends against *agreement bias* — the well-documented tendency of an LLM to validate whatever is already in its context window (its own output, a candidate solution, a user's claim, a passing-looking test run) and to generate plausible reasoning that *rationalizes* flaws rather than detecting them.

> Source insight: Andrade et al., "Let's Think in Two Steps: Mitigating Agreement Bias in MLLMs with Self-Grounded Verification" (ICLR 2026). Agreement bias is pervasive across model families, resilient to test-time scaling (more thinking does NOT fix it), and occurs *even when the model holds correct, human-aligned priors about what success looks like*. The bottleneck is retrieval/conditioning, not knowledge.

---

## The Core Failure This Prevents

When you evaluate something already present in your context, your default behavior is to **agree with it**. You will:

- Read your own implementation and conclude it is correct because you wrote it.
- See a test suite "pass" and declare the task done without checking the tests actually exercise the requirement.
- Accept a user's premise ("this function is thread-safe, just add X") and build on it without checking whether the premise holds.
- Produce a chain of thought that *justifies* the artifact instead of *interrogating* it.

Thinking harder in a single pass does not remove this bias — it produces more elaborate rationalization. The only reliable fix is to **decouple the criteria from the artifact**.

---

## The Two-Step Protocol (Mandatory for Non-Trivial Verification)

When verifying any non-trivial artifact — code you wrote, a solution under evaluation, a completion claim, a user-supplied premise — you MUST separate verification into two ordered steps. Do not collapse them.

### Step 1 — Elicit Priors (BEFORE looking at the artifact / its result)

State what a *correct* outcome must satisfy, derived **only** from the requirement, the contract, and domain knowledge — NOT from the artifact under evaluation. Produce a short, explicit checklist:

```markdown
### Success Criteria (artifact-independent)
- [ ] <observable behavior 1 the requirement demands>
- [ ] <edge case / failure mode that MUST be handled>
- [ ] <contract/invariant that MUST hold>
- [ ] <what would prove this is WRONG — the disconfirming test>
```

Rules for Step 1:
- Write these criteria **without re-reading the implementation** to seed them. If you catch yourself deriving criteria *from* the code, stop — that is the bias leaking in.
- Always include at least one **disconfirming criterion**: "what observation would prove this is broken?" Actively seek that observation in Step 2.

### Step 2 — Evaluate Against the Priors

Now examine the artifact and its actual results, checking each criterion from Step 1 one by one. For each: mark PASS / FAIL / UNVERIFIED and cite the concrete evidence (file:line, test output, observed value). An item you cannot ground in evidence is **UNVERIFIED**, never PASS.

```markdown
### Verification Result
- [PASS] criterion 1 — evidence: test_foo asserts X, ran green (paste/point to output)
- [FAIL] criterion 2 — evidence: no handling for empty input at parser.ts:88
- [UNVERIFIED] criterion 3 — could not execute; missing DB fixture
```

The verdict is **PASS only if every criterion is PASS**. Any FAIL or UNVERIFIED blocks a "done" claim — report it explicitly.

---

## When This Rule Fires

| Situation | Applies? |
|---|---|
| Declaring a task/feature "done" or "working" | Yes — run the two-step before claiming completion |
| Verifying your own code (self-review fallback, no subagent) | Yes — this is the highest-bias scenario |
| Judging a candidate solution / tool output / test result | Yes |
| Evaluating a user's premise before building on it | Yes, when the premise is load-bearing and checkable |
| Confirming a bug is actually fixed | Yes — define "fixed" independent of the patch, then check |
| TDD RED/GREEN gate | Compose: the failing test IS the disconfirming criterion; confirm it fails for the *right* reason |
| Trivial edits (typos, formatting, config values, renames) | No — skip to avoid process bloat |

---

## Relationship to Delegation (reviewer skill)

Delegation to an independent subagent is the **strongest** debiasing tool and remains the required path when you are the author of the artifact under audit (see `../skills/reviewer/SKILL.md` — Author Bias Gate).

Self-Grounded Verification is the **within-context** technique for the many moments where delegation is unavailable, unwarranted, or too heavy: it does not replace delegation, it hardens single-context verification. Order of preference:

1. Independent subagent review (best — no shared context).
2. Self-Grounded Verification two-step (when reviewing in-context is unavoidable).
3. Never: unstructured self-review that reads the artifact and pronounces it good.

---

## Forbidden Patterns (signals of agreement bias)

These phrases/behaviors in your reasoning mean the bias is active — stop and run the two-step:

- "This looks correct" / "This should work" without an artifact-independent criterion checked against evidence.
- Deriving your success criteria by reading the implementation, then checking the implementation against them (circular).
- Treating a green test run as proof without confirming the tests assert the actual requirement.
- Accepting a user's technical claim as fact and building on it without verifying the checkable part.
- Producing reasoning that explains *why the artifact is fine* instead of reasoning that *tries to break it*.

---

## Escalation

If you run the two-step and still cannot reach a grounded verdict (criteria keep landing UNVERIFIED), do not paper over it. Report the specific unverifiable criteria and either request the missing capability (fixture, credential, environment) or delegate to an independent reviewer. Uncertainty reported honestly beats a fabricated PASS.
