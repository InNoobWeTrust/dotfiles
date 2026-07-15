## Fallback Strategy (No Suitable Independent Reviewers Available)

If the current environment doesn't provide suitable delegated agents/workers for required multi-perspective or audit review:

### When main agent is NOT the author:
1. **Warn the user**: "This review ideally requires independent delegated reviewers, but none are available. Proceeding with single-context review; findings may have confirmation bias."
2. **Use sub-reviewer references directly**: Load applicable technical reviewers
3. **Explicitly note bias risks**: In output, mark sections where independent judgment would be beneficial
4. **Recommend external review**: For audit-critical work, suggest human review or external tool

### When main agent IS the author:
1. **Do NOT attempt self-review**: Author self-review is ineffective regardless of methodology
2. **Inform the user**: "I created these artifacts and cannot objectively review them. No suitable independent delegated reviewers are available."
3. **Recommend alternatives**:
   - Wait for human review
   - Use external code analysis tools (linters, static analyzers, security scanners)
   - Checkpoint the work and request review in a fresh session
4. **For trivial changes only**: Note that change is trivial (<10 lines, no structural impact) and can proceed without review

---

## Review Modes (All Execution Paths)

### Mode 1: Explicit Review (On-Demand)
User explicitly requests review. Follow full protocol: decision framework → direct or delegate → findings.

**Triggers**: "review this", "check for issues", "audit this", "challenge this design"

### Mode 2: Self-Review (Before Presenting)
When you produce work, **you MUST delegate review to independent agents/workers** due to confirmation bias.

**DO NOT attempt self-review using sub-reviewer references** — this creates the illusion of objectivity while still suffering from author bias.

**Proper approach**:
1. Check available independent reviewers (general, debug, or strongest available)
2. Delegate with appropriate review focus:
   - For code: Check TODO/FIXME, debug statements, error handling, placeholder implementations
   - For specs: Run adversarial challenge (assumptions, alternatives, failure scenarios)
   - For architecture: Run design rigor (was this designed or grown?)
3. Present delegated-review findings with your work

**Exception**: For trivial changes (<10 lines, no structural impact), you may skip review entirely rather than self-review

### Mode 3: Proactive Review (In Conversation)
During conversation, when you spot review-worthy concerns, **flag without being asked**:

- Structural decay being introduced
- Security vulnerabilities in proposed changes
- Unchallenged assumptions being built upon
- Design decisions that won't age well

**When NOT to challenge proactively**:
- Rapid prototyping / throwaway code
- Hotfix branches (speed is priority)
- Trivial changes (<10 lines, no structural impact)
- When concern already raised and addressed

---

## Examples

See `references/examples/delegation-scenarios.md` for worked examples:
1. Audit review (must delegate)
2. Multi-stakeholder panel (PO + SRE + Security)
3. Specialized domain (performance + accessibility)
4. Pure technical (code quality, no delegation)
5. Mixed approach (technical direct + stakeholder delegated)
6. Fallback (no independent delegated reviewers available)

---

## References

**Delegation framework** (progressive discovery):
- `references/delegation/framework.md` — When to delegate, reviewer/worker detection, prompt patterns, synthesis protocol
- `references/delegation/personas.md` — Pre-built stakeholder and domain expert persona prompts

**Technical sub-reviewers** (lazy-loaded by artifact type):
- `references/sub-reviewers/code-quality.md` — Architecture, SOLID, code smells, AI laziness
- `references/sub-reviewers/design-rigor.md` — Design discipline, investigation process
- `references/sub-reviewers/adversarial.md` — Challenge decisions, assumptions, reasoning
- `references/sub-reviewers/security.md` — Threats, vulnerabilities, secrets, auth, injection
- `references/sub-reviewers/edge-case-hunter.md` — Control-flow, boundary conditions, null handling
- `references/sub-reviewers/editorial.md` — Prose clarity, document structure

**Examples** (worked scenarios):
- `references/examples/delegation-scenarios.md` — 6 complete delegation scenarios with prompts and synthesis

---

## Quick Start

**FIRST**: Check if you (main agent) created/edited the artifacts. If YES → Skip to delegation mode below.

### For Code Review (when NOT the author)
1. Check routing table → Load: code-quality, design-rigor, adversarial, security, edge-case
2. If multi-perspective needed (stakeholder sign-off) → Delegate with persona templates
3. Aggregate findings by severity

### For Code Review (when you ARE the author)
1. **MUST delegate** → Check available independent reviewers (general, debug, strongest available)
2. Delegate with technical review focus using sub-reviewer lens guidance
3. Present delegated-review findings

### For Architecture Review (when NOT the author)
1. Check delegation framework → Is this audit-level? → Delegate if yes
2. If not audit → Load: code-quality, design-rigor, adversarial, security
3. Consider SRE perspective for operational concerns → Delegate if needed

### For Architecture Review (when you ARE the author)
1. **MUST delegate** → Prefer the strongest available independent reviewer or a specialized architecture reviewer
2. Include full context but no defense of decisions
3. Request adversarial challenge and design rigor lenses

### For Spec Review (when NOT the author)
1. Load: adversarial (challenge reasoning), editorial (clarity)
2. Consider stakeholder perspectives (PO, PM, BA) → Delegate if multi-perspective needed
3. Aggregate findings

### For Spec Review (when you ARE the author)
1. **MUST delegate** → Use a general independent reviewer with an adversarial lens
2. Request challenge of assumptions, alternatives, and failure scenarios
3. Consider stakeholder delegation if acceptance needed

### For Security Review
1. **Authorship check first** → If you're the author → MUST delegate
2. Check delegation framework → Specialized security reviewer available? → Delegate if yes
3. If not author and no specialized agent → Load: sub-reviewers/security, sub-reviewers/edge-case-hunter
4. For high-stakes → MUST delegate to the strongest available independent reviewer (audit mode)
