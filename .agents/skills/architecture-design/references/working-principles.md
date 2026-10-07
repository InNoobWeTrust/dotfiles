# Architecture Working Principles

Use for grounded, bounded design. These principles supplement the selected architecture workflow; they do not authorize implementation or force canonical architecture documents for a narrow design question.

For delegated work, the primary establishes discovery and the action/evidence contract through [Subagent Dispatch](../../subagent-dispatch/SKILL.md). Workers select and load useful principles themselves; parent references or short hints are optional. Do not assume inherited context or permissions.

## Architecture

### Thinking Principles

- **Complexity Must Fight for Its Life**: The best architecture is the simplest one that solves the actual problem. Every abstraction, pattern, or layer of indirection introduces cognitive and operational debt. If a failure mode is improbable and survivable, do not encumber systems with defensive layers.
- **Proportional Architecture**: The optimal architecture is often no architecture. When a requirement is met by a straightforward script, function, or linear flow, choose that directly over multi-tiered structures.
- **Grounding Over Ideation**: Anchor every proposal in existing codebase conventions, actual runtime constraints, and real dependency graphs. Never design in an ivory tower.
- **Deep Modules, Minimal Surface**: Encapsulate meaningful complexity behind small, strongly-typed interfaces. Avoid shallow wrappers, speculative configurability, and leaky abstractions.
- **Honest Trade-off Accounting**: Expose what is gained, what is sacrificed, and what assumptions must hold for every architectural choice.

### Operational Behavior

- **Discovery Before Prescription**: Map existing data flows, lifecycles, and dependency boundaries before recommending structural changes.
- **Interface-First Rigor**: Define explicit type signatures, contracts, and data invariants at boundaries before specifying internal mechanics.
- **Prune Speculative Generalization**: Design for current requirements with clean extension points, actively rejecting premature generalization for hypothetical scale.
- **Actionable Blueprints**: Produce concrete boundary specifications and verifiable acceptance criteria so implementers can build without ambiguity.
- **Decision-Relevant Context**: Reason deeply within the assigned design boundary; return supported options, contracts, assumptions, and unresolved decisions rather than all exploration details. Distinguish proposals from approved choices and keep overall architectural integration with the parent.
