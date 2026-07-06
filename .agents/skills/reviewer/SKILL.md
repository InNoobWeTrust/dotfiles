---
name: reviewer
description: "Multi-lens review orchestrator for code, specs, architecture, config, docs, and infrastructure. Hybrid execution: direct technical review using sub-reviewer references, or delegate to subagents for multi-perspective/audit/specialized reviews. Sub-lenses: code-quality, design-rigor, adversarial, security, edge-case, editorial. Activate on \"review\", \"check\", \"audit\", \"challenge\", \"QA\", or any explicit review request."
---

# Reviewer

Multi-lens review orchestrator with **hybrid execution**: perform technical reviews directly using sub-reviewer references, or delegate to subagents for multi-perspective, audit, or specialized domain reviews.

## ⚠️ CRITICAL RULE: Author Bias Gate

**If you (main agent) created or edited the artifacts being reviewed, you MUST delegate to subagents for ALL reviews.**

Author self-review is ineffective regardless of methodology due to confirmation bias. Using sub-reviewer references while reviewing your own work creates the illusion of objectivity without achieving it.

**Authorship check is the FIRST gate in the decision tree** — before considering review type, complexity, or available lenses.

## When to Use This Skill

**Explicit triggers**: "review this", "check for issues", "code review", "audit", "challenge this", "QA", "security review", "pull request review"

**Proactive triggers**: When you produce non-trivial work (code, specs, architecture) and should self-review before presenting.

---

## Execution Protocol: Direct vs Delegation

**Your first decision**: Can I review this directly, or should I delegate?

### Decision Framework

Use `references/delegation/framework.md` for the full decision tree. Quick summary:

| Review Type | Approach | Why |
|-------------|----------|-----|
| **Main agent is author** | MUST delegate ALL reviews to subagents | Author cannot objectively review own work — confirmation bias |
| **Audit review** | MUST delegate to highest-intelligence subagent | Requires independent judgment; main context creates confirmation bias |
| **Multi-perspective** (PO, PM, SRE, stakeholder) | MUST delegate with persona prompts | Single context contaminates all viewpoints |
| **Specialized domain** (performance, accessibility, threat modeling) | Should delegate if specialized subagent available | Domain expertise and dedicated focus |
| **Pure technical** (code quality, edge cases, security vectors) | Can handle directly using sub-reviewer references (ONLY if not author) | Single technical perspective, no persona needed |
| **Mixed** (technical + stakeholder) | Split: technical direct (if not author), stakeholders delegated | Separate concerns |

**Golden rules**:
1. **Author = Always delegate** (main agent cannot review own work)
2. **Audit = Always delegate** (if capable subagent exists)
3. **Multiple hats = Always delegate separately** (avoid bias contamination)
4. **Technical only = Can handle directly** (use sub-reviewer references, ONLY if not author)

Read `references/delegation/framework.md` for:
- Full decision tree
- How to detect available subagents (harness-agnostic)
- Delegation prompt patterns
- Synthesis protocol after multi-agent reviews

---

## Direct Review Mode (Single Technical Perspective)

**CRITICAL PREREQUISITE**: Use this mode ONLY if you (main agent) did NOT create or edit the artifacts being reviewed. If you are the author, you MUST delegate to subagents instead.

Use this mode for pure technical reviews where you apply one or more sub-reviewer lenses from a single agent context.

### Discovery Mechanism

Sub-reviewers live in `references/sub-reviewers/`. To load one, use Read tool on the relevant file. Each reference is a self-contained reviewer specification with attack vectors, protocol, and output format.

> **Lazy loading**: Do not load all references. Select only those matching the artifact type using the routing table below.

### Routing Table

| Artifact Type | Sub-Reviewers (load these files) | Order |
|---|---|---|
| Code / diffs / pull requests | `references/sub-reviewers/code-quality.md`, `references/sub-reviewers/design-rigor.md`, `references/sub-reviewers/adversarial.md`, `references/sub-reviewers/security.md`, `references/sub-reviewers/edge-case-hunter.md` | Structure first, then design process, then logic, then security, then paths |
| Specs / PRDs / TRDs | `references/sub-reviewers/adversarial.md`, `references/sub-reviewers/editorial.md` | Challenge reasoning, then structure |
| Architecture / design docs | `references/sub-reviewers/code-quality.md`, `references/sub-reviewers/design-rigor.md`, `references/sub-reviewers/adversarial.md`, `references/sub-reviewers/security.md` | Structure decisions, then design process, then challenge, then threat model |
| Documentation / prose | `references/sub-reviewers/editorial.md` | Structure, then prose if needed |
| Config / infra | `references/sub-reviewers/security.md`, `references/sub-reviewers/edge-case-hunter.md` | Security first, then boundaries |
| Compliance / audit reports | `references/sub-reviewers/security.md`, `references/sub-reviewers/adversarial.md`, `references/sub-reviewers/editorial.md` | Security posture, then reasoning gaps, then clarity |
| Bug fixes / incident response | `references/sub-reviewers/design-rigor.md`, `references/sub-reviewers/code-quality.md`, `references/sub-reviewers/adversarial.md`, `references/sub-reviewers/edge-case-hunter.md` | Investigation rigor first, then structure, then logic, then paths |
| BDD specs / test plans | `references/sub-reviewers/adversarial.md`, `references/sub-reviewers/edge-case-hunter.md` | Coverage gaps, then path tracing |
| API contracts | `references/sub-reviewers/code-quality.md`, `references/sub-reviewers/design-rigor.md`, `references/sub-reviewers/adversarial.md`, `references/sub-reviewers/security.md`, `references/sub-reviewers/edge-case-hunter.md` | Structure/abstraction, then design process, then logic, then security, then boundaries |
| Skill / command definitions | `references/sub-reviewers/adversarial.md`, `references/sub-reviewers/editorial.md` | Challenge logic, then clarity |
| Quality gates / governance docs | `references/sub-reviewers/adversarial.md`, `references/sub-reviewers/design-rigor.md` | Challenge coverage gaps, then design process |
| Management reports / metrics | `references/sub-reviewers/adversarial.md`, `references/sub-reviewers/editorial.md` | Challenge data confidence, then clarity |

### Orchestration

1. **Identify artifact type** from user intent, content markers, file extension, and path
2. **Apply user overrides** (e.g., "skip security", "focus on performance")
3. **For mixed artifacts**, run the union of matching sub-reviewers in primary artifact order
4. **Quick mode**: run only the first sub-reviewer listed
5. **Deep mode**: run all listed sub-reviewers
6. **Aggregate findings** by severity, include file:line references, keep findings as primary output

If a required sub-reviewer reference is unavailable, skip it and note the gap.
If a critical security review is unavailable for security-sensitive work, stop and report the blocker.

### Sub-Reviewer Summaries

Quick orientation before loading full references:

| Sub-Reviewer | Axis | Best For |
|---|---|---|
| `references/sub-reviewers/adversarial.md` | Reasoning, decisions, assumptions | "Why did we do this?" challenges |
| `references/sub-reviewers/code-quality.md` | Architecture, code smells, AI laziness | Structure rot, SOLID violations, demo-code-in-production |
| `references/sub-reviewers/design-rigor.md` | Design discipline, investigation process | "Was this designed or grown? Was the root cause found?" |
| `references/sub-reviewers/security.md` | Threats, vulnerabilities, secrets | Auth, injection, data exposure, supply chain |
| `references/sub-reviewers/edge-case-hunter.md` | Control-flow paths, boundary conditions | Unhandled branches, off-by-one, null handling |
| `references/sub-reviewers/editorial.md` | Prose clarity, document structure | Ambiguous writing, poor organization |
| `references/sub-reviewers/doc-attack-vectors.md` | Documentation threats, compliance gaps | Docs that mislead, omit, or contradict governance rules |

---

## Delegation Mode (Multi-Perspective or Specialized)

Use this mode when:
- Review requires **audit-level independence**
- Need **multiple stakeholder perspectives** (PO, PM, SRE, end-user, security, ops)
- Need **specialized domain expertise** (performance, accessibility, threat modeling)
- Harness provides suitable subagents (check descriptions for capability/intelligence)

### Step 1: Check Available Subagents

Query your harness for available subagents. Look for:

**For audit reviews** (need highest intelligence):
- Model indicators: "claude-sonnet-4", "gpt-4", "o1", "advanced reasoning"
- Capability: "expert analysis", "complex problem solving", "senior", "principal"

**For specialized reviews** (need domain expertise):
- **Debug/Investigation**: "debug", "troubleshoot", "root cause", "systematic"
- **Architecture**: "architecture", "design patterns", "system design", "trade-off"
- **Security**: "security", "threat modeling", "vulnerability", "penetration"
- **Performance**: "performance", "optimization", "profiling", "bottleneck"

**For persona-based reviews** (need role-playing):
- **General**: "general-purpose", "multi-task", "flexible", supports persona prompts

### Step 2: Select Delegation Strategy

Choose delegation pattern based on review need:

| Need | Pattern | Template |
|------|---------|----------|
| Independent audit | Single high-intelligence subagent | `references/delegation/framework.md` → Audit Review |
| Multiple stakeholders | Separate subagent per persona | `references/delegation/personas.md` → Select personas |
| Specialized domain | Domain-specific subagent | `references/delegation/framework.md` → Specialized Domain |
| Mixed (technical + stakeholders) | Technical direct + persona delegation | Hybrid approach |

### Step 3: Delegate with Persona/Context Isolation

Use templates from `references/delegation/personas.md`:

**Stakeholder personas**: Product Owner, Project Manager, Business Analyst, End User
**Domain experts**: SRE, Security Analyst, Performance Engineer, Accessibility Specialist, Data Privacy Officer

**Delegation pattern**:
```
Review [artifact] from a [PERSONA] perspective.

[Include full persona prompt from references/delegation/personas.md]

Artifact:
[Include artifact content or reference]

Focus on: [Specific concerns for this review]
```

### Step 4: Synthesize Multi-Agent Findings

When you receive findings from multiple subagents:

1. **Aggregate by severity**: CRITICAL → HIGH → MEDIUM → LOW
2. **Identify conflicts**: Where perspectives disagree (valuable signal)
3. **Highlight trade-offs**: Where one fix harms another (security vs usability)
4. **Prioritize**: Combine severity + feasibility + business impact
5. **Present**: Findings first, then analysis, then recommendations

**Output format**:
```markdown
## Critical Findings (Address Immediately)
[List with source perspective and file:line refs]

## High Priority (Address Before Merge)
[List with source perspective]

## Medium Priority (Address in Follow-up)
[List with source perspective]

## Perspective Conflicts
[Where PO/SRE/Security disagree — trade-off decisions needed]

## Recommendations
[Prioritized action items]
```

---

## Fallback Strategy (No Suitable Subagents Available)

If harness doesn't provide suitable subagents for required multi-perspective or audit review:

### When main agent is NOT the author:
1. **Warn the user**: "This review ideally requires independent subagents, but none are available. Proceeding with single-context review; findings may have confirmation bias."
2. **Use sub-reviewer references directly**: Load applicable technical reviewers
3. **Explicitly note bias risks**: In output, mark sections where independent judgment would be beneficial
4. **Recommend external review**: For audit-critical work, suggest human review or external tool

### When main agent IS the author:
1. **Do NOT attempt self-review**: Author self-review is ineffective regardless of methodology
2. **Inform the user**: "I created these artifacts and cannot objectively review them. No suitable subagents are available for independent review."
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
When you produce work, **you MUST delegate review to subagents** due to confirmation bias.

**DO NOT attempt self-review using sub-reviewer references** — this creates the illusion of objectivity while still suffering from author bias.

**Proper approach**:
1. Check available subagents (general, debug, or highest-intelligence available)
2. Delegate with appropriate review focus:
   - For code: Check TODO/FIXME, debug statements, error handling, placeholder implementations
   - For specs: Run adversarial challenge (assumptions, alternatives, failure scenarios)
   - For architecture: Run design rigor (was this designed or grown?)
3. Present subagent findings with your work

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
6. Fallback (no subagents available)

---

## References

**Delegation framework** (progressive discovery):
- `references/delegation/framework.md` — When to delegate, subagent detection, prompt patterns, synthesis protocol
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
1. **MUST delegate** → Check available subagents (general, debug, highest-intelligence)
2. Delegate with technical review focus using sub-reviewer lens guidance
3. Present subagent findings

### For Architecture Review (when NOT the author)
1. Check delegation framework → Is this audit-level? → Delegate if yes
2. If not audit → Load: code-quality, design-rigor, adversarial, security
3. Consider SRE perspective for operational concerns → Delegate if needed

### For Architecture Review (when you ARE the author)
1. **MUST delegate** → Prefer highest-intelligence subagent or specialized architect agent
2. Include full context but no defense of decisions
3. Request adversarial challenge and design rigor lenses

### For Spec Review (when NOT the author)
1. Load: adversarial (challenge reasoning), editorial (clarity)
2. Consider stakeholder perspectives (PO, PM, BA) → Delegate if multi-perspective needed
3. Aggregate findings

### For Spec Review (when you ARE the author)
1. **MUST delegate** → Use general subagent with adversarial lens
2. Request challenge of assumptions, alternatives, and failure scenarios
3. Consider stakeholder delegation if acceptance needed

### For Security Review
1. **Authorship check first** → If you're the author → MUST delegate
2. Check delegation framework → Specialized security subagent available? → Delegate if yes
3. If not author and no specialized agent → Load: sub-reviewers/security, sub-reviewers/edge-case-hunter
4. For high-stakes → MUST delegate to highest-intelligence subagent (audit mode)

**Remember**: If you created the artifacts, you MUST delegate ALL reviews; pure technical reviews can be handled directly ONLY by non-authors.
