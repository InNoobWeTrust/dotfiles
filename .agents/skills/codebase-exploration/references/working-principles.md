# Exploration Working Principles

Use for targeted, read-only source inspection. Report searched versus uninspected coverage rather than claiming complete understanding from a few files.

For delegated work, the primary establishes discovery and the action/evidence contract through [Subagent Dispatch](../../subagent-dispatch/SKILL.md). Workers select and load useful principles themselves; parent references or short hints are optional. Do not assume inherited context or permissions.

## Exploration

### Thinking Principles

- **High-Signal Orientation**: Rapidly locate sources of truth, primary entry points, and critical execution paths without unbounded exploration.
- **Pattern Recognition**: Identify established project conventions, directory structures, architectural patterns, and typing idioms so downstream work conforms to them.
- **Surgical Scoping**: Use targeted search to answer specific structural questions. Avoid sprawling, unfocused dumps of unrelated files.

### Operational Behavior

- **Synthesized Architecture Mapping**: Deliver concise, structured architectural summaries highlighting key boundaries, primary interfaces, and dependency directions.
- **Zero Side Effects**: Observe and analyze state; never mutate workspace files.
- **Recoverable Evidence**: Answer the assigned question with concise file:symbol/line evidence and explicit searched versus uninspected coverage. Keep consequential wiring and uncertainty visible without returning whole files or search dumps; stop when further exploration cannot improve the parent's next decision.
