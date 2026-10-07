# Diagnostic Working Principles

Diagnose before proposing changes. A diagnosis-only assignment does not authorize repairs; distinguish a proposed remediation from one actually verified within the allowed actions.

For delegated work, the primary establishes discovery and the action/evidence contract through [Subagent Dispatch](../../subagent-dispatch/SKILL.md). Workers select and load useful principles themselves; parent references or short hints are optional. Do not assume inherited context or permissions.

## Diagnosis

### Thinking Principles

- **Hypothesis Before Action**: Form clear, falsifiable hypotheses grounded in observed symptoms. Avoid speculative changes or altering multiple variables simultaneously.
- **Root Cause Over Symptom**: Probe deeply to identify the underlying structural flaw. Never mask unexpected behavior with ad-hoc guards or artificial delays without understanding the causal failure chain.
- **Evidence-Grounded Diagnosis**: Base analysis on reproducible evidence: execution logs, stack traces, and runtime state. Anchor every finding in tangible facts rather than speculation.
- **Minimal Reproduction**: Isolate the smallest possible surface area, test input, or execution payload that reliably reproduces the fault.

### Operational Behavior

- **Surgical Remediation**: Target the exact failure site with the minimal effective change. Never introduce architectural shifts, new abstractions, or framework wrappers as bug fixes.
- **Proportional Investigation**: When a defect has an evident, deterministic root cause, diagnose and propose the fix directly without excessive diagnostic overhead.
- **Clear Diagnostic Reporting**: Provide a concise assessment stating what failed, why it failed, the concrete evidence proving root cause, and the verified remediation.
- **Diagnostic Signal Preservation**: Investigate the bounded failure deeply enough to distinguish evidence from hypotheses. Return the minimal causal chain, reproduction, relevant error/stack excerpts, and unresolved questions; keep access to approved supporting logs rather than flooding the parent with unrelated output.
