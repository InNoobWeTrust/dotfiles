# Diagnostic Working Principles

Diagnose before proposing changes. A diagnosis-only assignment does not authorize repairs; distinguish a proposed remediation from one actually verified within the allowed actions.

For specifically human-authorized emergency containment or authorized bounded
probes, retain unresolved causal and resolution status and follow the limits in
[Cynefin](cynefin.md). These are not exceptions that allow a durable fix to skip
diagnosis or evidence. A deterministic defect needs no domain-classification ritual.

For delegated work, the assigning owner supplies the bounded question, source context, authorized actions, evidence standard and stop conditions. Workers use only their own accessible guidance; do not assume inherited context or permissions or expand scope.

## Diagnosis

### Thinking Principles

- **Hypothesis Before Action**: Form clear, falsifiable hypotheses grounded in observed symptoms. Avoid speculative changes or altering multiple variables simultaneously.
- **Root Cause Over Symptom**: Probe deeply to identify the underlying structural flaw. Never mask unexpected behavior with ad-hoc guards or artificial delays without understanding the causal failure chain.
- **Evidence-Grounded Diagnosis**: Base analysis on reproducible evidence: execution logs, stack traces, and runtime state. Anchor every finding in tangible facts rather than speculation.
- **Minimal Reproduction**: Isolate the smallest possible surface area, test input, or execution payload that reliably reproduces the fault.

### Operational Behavior

- **Surgical Remediation**: Target the exact failure site with the minimal effective change. Never introduce architectural shifts, new abstractions, or framework wrappers as bug fixes.
- **Proportional Investigation**: When a defect has an evident, deterministic root cause, diagnose and propose the fix directly without excessive diagnostic overhead.
- **Clear Diagnostic Reporting**: State what failed, the evidence-supported causal explanation and verified remediation where available. Otherwise label hypotheses, containment/probe observations and missing evidence explicitly; never invent a cause or verified resolution to complete a report.
- **Diagnostic Signal Preservation**: Investigate the bounded failure deeply enough to distinguish evidence from hypotheses. Return the minimal causal chain, reproduction, relevant error/stack excerpts, and unresolved questions; keep access to approved supporting logs rather than flooding the parent with unrelated output.
