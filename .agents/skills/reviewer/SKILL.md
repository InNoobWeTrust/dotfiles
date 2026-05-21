---
name: reviewer
description: "Multi-lens review orchestrator for code, specs, architecture, config, docs, and infrastructure. Sub-lenses loaded by artifact type: code-quality (architecture/smells), design-rigor (design discipline), adversarial (reasoning/logic holes), security (threats/vulnerabilities), edge-case (control-flow/boundary paths), editorial (prose/clarity). Activate on \"review my code\", \"check for issues\", \"code review\", \"pull request review\", \"audit this\", \"check my work\", \"security review\", \"QA\", or any explicit review request."
---

# Reviewer

Lazy-loading review orchestrator. When activated, your first action is to read
this routing table, then load only the sub-reviewers needed for the artifact at
hand. Do not load all sub-reviewers blindly.

## Discovery Mechanism

Sub-reviewers live in `references/`. To load one, use your Read tool on
the relevant file. Each reference file is a self-contained reviewer specification
with attack vectors, protocol, and output format.

> **Do not load all references.** Select only those matching the artifact type
> in the routing table below.

## Routing Table

| Artifact Type | Sub-Reviewers (load these files) | Order |
|---|---|---|
| Code / diffs / pull requests | `references/code-quality.md`, `references/design-rigor.md`, `references/adversarial.md`, `references/security.md`, `references/edge-case-hunter.md` | Structure first, then design process, then logic, then security, then paths |
| Specs / PRDs / TRDs | `references/adversarial.md`, `references/editorial.md` | Challenge reasoning, then structure |
| Architecture / design docs | `references/code-quality.md`, `references/design-rigor.md`, `references/adversarial.md`, `references/security.md` | Structure decisions, then design process, then challenge, then threat model |
| Documentation / prose | `references/editorial.md` | Structure, then prose if needed |
| Config / infra | `references/security.md`, `references/edge-case-hunter.md` | Security first, then boundaries |
| Bug fixes / incident response | `references/design-rigor.md`, `references/code-quality.md`, `references/adversarial.md`, `references/edge-case-hunter.md` | Investigation rigor first, then structure, then logic, then paths |
| BDD specs / test plans | `references/adversarial.md`, `references/edge-case-hunter.md` | Coverage gaps, then path tracing |
| API contracts | `references/code-quality.md`, `references/design-rigor.md`, `references/adversarial.md`, `references/security.md`, `references/edge-case-hunter.md` | Structure/abstraction, then design process, then design, then security, then boundaries |
| Skill / command definitions | `references/adversarial.md`, `references/editorial.md` | Challenge logic, then clarity |

## Orchestration

1. Identify the artifact type from user intent, content markers, file extension, and path.
2. Apply explicit user reviewer overrides before the routing table (e.g., "skip security").
3. For mixed artifacts, run the union of matching sub-reviewers in the primary artifact order.
4. Use quick mode to run only the first sub-reviewer; use deep mode to run all listed.
5. Aggregate findings by severity, include file/line references where available, and keep findings as the primary output.

If a required sub-reviewer reference file is unavailable, skip it and note the gap.
If a critical security review is unavailable for security-sensitive work, stop and
report the blocker.

## Sub-Reviewer Summaries

For quick orientation before loading the full reference:

| Sub-Reviewer | Axis | Best For |
|---|---|---|
| `references/adversarial.md` | Reasoning, decisions, assumptions | "Why did we do this?" challenges |
| `references/code-quality.md` | Architecture, code smells, AI laziness | Structure rot, SOLID violations, demo-code-in-production |
| `references/design-rigor.md` | Design discipline, investigation process | "Was this designed or grown? Was the root cause found?" |
| `references/security.md` | Threats, vulnerabilities, secrets | Auth, injection, data exposure, supply chain |
| `references/edge-case-hunter.md` | Control-flow paths, boundary conditions | Unhandled branches, off-by-one, null handling |
| `references/editorial.md` | Prose clarity, document structure | Ambiguous writing, poor organization |
