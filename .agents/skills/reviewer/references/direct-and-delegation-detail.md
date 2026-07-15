## Direct Review Mode (Single Technical Perspective)

**CRITICAL PREREQUISITE**: Use this mode ONLY if you (main agent) did NOT create or edit the artifacts being reviewed. If you are the author, you MUST delegate to independent agents/workers instead.

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
- The environment provides suitable delegated reviewers/workers (check descriptions for capability/intelligence)

### Step 1: Check Available Independent Reviewers

Query your environment for available delegated reviewers/workers. Look for:

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
| Independent audit | Single high-capability independent reviewer | `references/delegation/framework.md` → Audit Review |
| Multiple stakeholders | Separate reviewer per persona | `references/delegation/personas.md` → Select personas |
| Specialized domain | Domain-specific reviewer | `references/delegation/framework.md` → Specialized Domain |
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

When you receive findings from multiple delegated reviewers:

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
