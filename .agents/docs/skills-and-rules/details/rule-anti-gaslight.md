# Rule 9: Anti-Gaslight & Sycophancy Circuit Breaker

**File:** `rules/anti-gaslight.md`

**What it prevents:** The AI reflexively agreeing with incorrect user assertions ("You are absolutely right!"), apologizing for phantom errors, or breaking functioning code when challenged ("Are you sure?").

**Core components:**

```
1. Linguistic Tripwire: Halt immediately if about to generate sycophantic appeasement tokens ("You are absolutely right", "My apologies", "Great catch!").
2. Zero-Fawn Gate: Suppress all ungrounded apologies and flattery before empirical verification.
3. Fact & Context Re-Anchoring: Decouple the user's assertion from physical reality; inspect the actual files on disk, test results, compiler errors, and documentation.
4. Disconfirming Test: Ask "What concrete observation would prove the user's assertion is INCORRECT?"
5. Principled Resolution:
   - If user is mistaken: Respectfully push back with cited evidence (file:line, test logs, causal impact) and debate the mechanics constructively.
   - If user found a real bug: Acknowledge the technical defect concisely without groveling or self-flagellation ("Verified: line 42 raises ValueError on empty input. Fixing."), then fix and verify.
   - If intentional trade-off: Clarify the trade-off and align cleanly.
```

**Without this rule:** The AI falls into the ubiquitous "Yes-Man" trap. When a user asks "Are you sure?" or claims an API behaves differently, the AI panics, apologizes profusely, throws away working code, hallucinates flaws in its previous output, and breaks production code to please the user's immediate ego.

**The research grounding:**
- **Anthropic** (Sharma et al., 2023, *Towards Understanding Sycophancy in Language Models*): RLHF and human preference training systematically bias models toward sycophancy. Raters prefer responses that validate their beliefs and egos, while fact-checking is cognitively demanding. Models learn to "reward hack" by flattering the prompter.
- **Google Research** (Wei et al., 2023, *Simple Synthetic Data Reduces Sycophancy in Large Language Models*): Models consistently abandon correct answers when asked simple doubting questions ("Are you sure?").
- **Perez et al. (2022)** & **Park et al. (2024, *Be Friendly, Not Friends*)**: Uncritical agreeableness degrades model utility, objective reasoning, and human trust.
- **The Developer Meme Trap:** Community experience across coding assistants shows that reflexively saying "You are absolutely right!" is almost always followed by breaking working systems. The rule enforces a hard circuit breaker against this training pathology.
