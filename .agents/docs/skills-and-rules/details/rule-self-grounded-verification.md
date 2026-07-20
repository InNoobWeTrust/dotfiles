# Rule 7: Self-Grounded Verification

**File:** `rules/self-grounded-verification.md`

**What it prevents:** AI validating its own (or a user's) work because it is already in context — *agreement bias*.

**Core components:**

```
1. Two-step verification: elicit success criteria BEFORE examining the artifact
2. Step 1 criteria derived from requirement/contract only — NOT from the artifact
3. Every criteria set includes a disconfirming check ("what would prove this wrong?")
4. Step 2 evaluates artifact against each criterion: PASS / FAIL / UNVERIFIED + cited evidence
5. Verdict is PASS only if every criterion is PASS
6. Compose with delegation (reviewer skill): delegation removes shared context; SGV hardens in-context checks
```

**Without this rule:** The AI reads its own implementation, decides it looks correct, sees a green-looking test run, and declares the task done — generating confident reasoning that rationalizes rather than interrogates. Bugs that the AI actually *knows how to catch* slip through because it never separated "what should be true" from "what the code does."

**The research grounding:** Andrade et al., "Let's Think in Two Steps: Mitigating Agreement Bias in MLLMs with Self-Grounded Verification" (ICLR 2026), found that MLLM verifiers over-validate flawed agent behavior *even when they hold correct, human-aligned priors* about success. The bias is pervasive across model families and **resilient to test-time scaling** — thinking harder in one pass produces more elaborate rationalization, not better detection. Their fix (SGV) decouples verification: retrieve priors unconditionally (without the artifact), then evaluate conditioned on those self-generated priors. This yielded up to 20-point gains in failure detection. The rule ports this two-step discipline into the agent's verification and self-review moments.
