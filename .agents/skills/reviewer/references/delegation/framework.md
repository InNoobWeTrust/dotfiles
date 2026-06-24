# Review Delegation Framework

This guide helps you decide when to perform reviews directly vs when to delegate to subagents for multi-perspective or specialized analysis.

## Core Principles

1. **Single-perspective technical reviews** can be performed by the main agent using sub-reviewer references
2. **Multi-perspective reviews** should delegate to subagents with distinct personas to avoid bias contamination
3. **Audit reviews** must use the most intelligent available subagent (check subagent descriptions for capability indicators)
4. **Specialized aspect reviews** should delegate to domain-specific subagents when available (debug, architect, security-specialist, etc.)

---

## Decision Tree

```
Review request received
│
├─ Did I (main agent) just create/edit the artifacts being reviewed?
│  └─ YES → MUST delegate to subagents for ALL reviews
│           (Author cannot objectively review own work — confirmation bias)
│           (Proceed to delegation selection below)
│
├─ Is this an AUDIT review?
│  └─ YES → MUST delegate to highest-intelligence subagent
│           (Audit requires independent, unbiased judgment)
│
├─ Does it need MULTIPLE PERSPECTIVES/HATS?
│  (PO, PM, stakeholder, domain expert, end-user, ops, etc.)
│  └─ YES → MUST delegate with persona prompts
│           (Main context would bias all perspectives)
│
├─ Does it need SPECIALIZED DOMAIN KNOWLEDGE?
│  (Performance analysis, accessibility, security-specific threat modeling)
│  └─ YES → Prefer delegation to specialized subagent if available
│           (Check harness for: debug, architect, security, perf agents)
│
├─ Is it PURE TECHNICAL REVIEW?
│  (Code quality, design patterns, edge cases, security vectors)
│  └─ YES → Main agent can handle using sub-reviewer references
│           (Single technical perspective, no persona needed)
│           (ONLY if main agent did NOT create the artifacts)
│
└─ Is it MIXED?
   (Technical + stakeholder perspectives)
   └─ SPLIT: Technical review (main agent if not author), 
             then delegate stakeholder perspectives
```

---

## When to Delegate

### ✅ MUST Delegate

| Scenario | Reason | Subagent Requirements |
|----------|--------|----------------------|
| **Main agent is author** | Cannot objectively review own work; confirmation bias makes self-review ineffective | Any suitable subagent; choose based on review type (technical/audit/multi-perspective) |
| **Audit review** | Requires independent, unbiased judgment; main agent context creates confirmation bias | Highest intelligence available; check descriptions for reasoning/analysis capability |
| **Multi-hat review** | Each perspective needs distinct context/persona; single-context review contaminates all viewpoints | One subagent per perspective OR general agent with explicit persona isolation |
| **Pre-mortem / Red team** | Adversarial thinking requires genuine attempt to break, not defend | General or specialized adversarial agent; must not have implementation context |
| **Stakeholder acceptance** | Product Owner, PM, business analyst perspectives need domain context separate from technical | General agent with stakeholder persona prompt |

### ⚠️ Should Delegate (When Available)

| Scenario | Reason | Preferred Subagent |
|----------|--------|-------------------|
| **Security threat modeling** | Deep security expertise, current CVE/attack pattern knowledge | Security-specialized agent if available, else general with high intelligence |
| **Performance analysis** | Profiling, bottleneck detection, optimization patterns | Performance/debug agent if available |
| **Accessibility audit** | WCAG compliance, assistive technology considerations | Accessibility-specialized agent or general with explicit persona |
| **Architecture review** | System design patterns, trade-off analysis at scale | Architect agent if available, else general with high intelligence |
| **Ops/SRE perspective** | Operational concerns, observability, failure modes | SRE/ops agent if available, else general with ops persona |

### ✅ Can Handle Directly (ONLY if main agent is NOT the author)

| Scenario | Approach |
|----------|----------|
| **Code quality review** | Load `references/sub-reviewers/code-quality.md`, apply SOLID/smells |
| **Design rigor check** | Load `references/sub-reviewers/design-rigor.md`, verify investigation process |
| **Edge case hunting** | Load `references/sub-reviewers/edge-case-hunter.md`, trace control flows |
| **Security vector scan** | Load `references/sub-reviewers/security.md`, check auth/injection/secrets |
| **Adversarial challenge** | Load `references/sub-reviewers/adversarial.md`, debate decisions |
| **Editorial review** | Load `references/sub-reviewers/editorial.md`, check prose clarity |
| **Quick review** | Single sub-reviewer, artifact <200 lines |
| **Routine PR review** | Code + tests, standard patterns, no novel architecture |

**Critical rule**: If you (main agent) created or edited the artifacts, you MUST delegate. Author self-review is ineffective due to confirmation bias.

---

## Detecting Available Subagents

**Harness-agnostic approach**: Most harnesses provide subagent capability information. Look for:

### Intelligence Indicators (for audit reviews)
- Model name/tier in description: "claude-sonnet-4", "gpt-4", "powered by X"
- Capability descriptions: "advanced reasoning", "complex problem solving", "expert analysis"
- Role descriptions: "senior", "principal", "architect", "specialist"

### Specialized Agents (for domain-specific reviews)
- **Debug/Investigation**: descriptions mentioning "debug", "troubleshoot", "root cause", "systematic investigation"
- **Architecture**: descriptions mentioning "system design", "architecture", "design patterns", "trade-off analysis"
- **Security**: descriptions mentioning "security", "threat modeling", "vulnerability", "penetration testing"
- **Performance**: descriptions mentioning "performance", "optimization", "profiling", "bottleneck"

### General Agents (for persona-based reviews)
- **General-purpose**: descriptions mentioning "general", "multi-purpose", "flexible", "broad capability"
- Check if they support: persona prompts, role-playing, stakeholder simulation

**If no suitable subagents exist**: Fallback to main agent review with explicit bias warnings in output.

---

## Delegation Prompt Patterns

### Pattern 1: Audit Review

```
Perform an independent audit review of [artifact].

You are a senior auditor with no prior context. Your role is to:
1. Verify compliance with [standards/requirements]
2. Identify gaps, risks, and non-conformance
3. Challenge assumptions without defending them
4. Provide independent judgment

Do NOT assume the author's decisions are correct.
Do NOT accept "best practices" without evidence.

Apply full adversarial protocol from reviewer skill.
Return findings with severity: CRITICAL / HIGH / MEDIUM / LOW.
```

### Pattern 2: Multi-Perspective (Stakeholder Panel)

Delegate separate subagents for each perspective, then synthesize:

**Product Owner perspective:**
```
Review [artifact] from a Product Owner perspective.

You are the Product Owner responsible for:
- Feature acceptance criteria
- User story alignment
- Value delivery to end users
- Scope vs timeline trade-offs

Evaluate:
- Does this meet acceptance criteria?
- Will end users benefit?
- Are there missing user scenarios?
- Is scope appropriate for the goal?

Return findings as: ACCEPT / CONDITIONAL / REJECT with reasoning.
```

**Ops/SRE perspective:**
```
Review [artifact] from an SRE/Operations perspective.

You are the SRE who will be paged at 3 AM when this breaks.

Evaluate:
- Observability: Can we debug it in production?
- Resilience: What breaks under load?
- Operational burden: How hard to deploy/maintain?
- Failure modes: What are the blast radius risks?

Return findings as operational risks with mitigation suggestions.
```

**Security Analyst perspective:**
```
Review [artifact] from a Security Analyst perspective.

You are the security analyst responsible for:
- Threat modeling
- Vulnerability assessment
- Compliance verification
- Attack surface analysis

Evaluate using references/sub-reviewers/security.md attack vectors.
Return findings with threat severity and exploitability ratings.
```

### Pattern 3: Specialized Domain Review

**Performance analysis:**
```
Review [artifact] for performance characteristics.

You are a performance engineer. Analyze:
- Time complexity of critical paths
- Memory allocation patterns
- I/O bottlenecks
- Scalability limits

Return findings with:
- Expected performance at 1x, 10x, 100x scale
- Bottleneck locations (file:line references)
- Optimization recommendations ranked by impact
```

**Accessibility audit:**
```
Review [artifact] for accessibility compliance.

You are an accessibility specialist. Evaluate against:
- WCAG 2.1 Level AA standards
- Screen reader compatibility
- Keyboard navigation
- Color contrast and visual clarity

Return findings with:
- WCAG criterion violations (with reference numbers)
- Impact on users with disabilities
- Remediation steps ranked by effort
```

---

## Synthesis Protocol (After Delegation)

When you receive findings from multiple subagents:

1. **Aggregate by severity**: CRITICAL → HIGH → MEDIUM → LOW
2. **Identify conflicts**: Where perspectives disagree (this is valuable signal)
3. **Highlight trade-offs**: Where one perspective's fix harms another (e.g., security vs usability)
4. **Prioritize**: Combine severity + feasibility + business impact
5. **Present**: Findings first, then analysis, then recommendations

**Format:**
```markdown
## Critical Findings (Address Immediately)
[List with source perspective and file:line refs]

## High Priority (Address Before Merge)
[List with source perspective]

## Medium Priority (Address in Follow-up)
[List with source perspective]

## Perspective Conflicts
[Where PO, SRE, Security disagree — trade-off decisions needed]

## Recommendations
[Prioritized action items]
```

---

## Examples

See `references/examples/delegation-scenarios.md` for worked examples showing:
1. Audit review delegation (independent judgment required)
2. Multi-stakeholder review (PO + SRE + Security)
3. Specialized domain review (performance + accessibility)
4. Single-agent technical review (code quality, no delegation needed)
5. Mixed approach (technical direct, stakeholder delegated)
