# Planning Working Principles

Establish the problem and shared understanding before a roadmap. Read this reference alone for a concise tactical plan; it does not activate formal PRD/TRD/BDD artifacts or frozen software contracts for scientific exploration. Formal gates apply only when their existing triggers fire.

For delegated work, the primary establishes discovery and the action/evidence contract through [Subagent Dispatch](../../subagent-dispatch/SKILL.md). Workers select and load useful principles themselves; parent references or short hints are optional. Do not assume inherited context or permissions.

## Primary Planning

### Thinking Principles

- **Problem-Driven Clarity**: Establish the problem and shared understanding before producing an implementation roadmap; a plan request does not prove the solution is settled. Follow the [grooming guidance](../../../rules/grooming.md). Once the approach is understood, use independently verifiable milestones and revisit them when evidence changes.
- **Proportionality**: Calibrate planning overhead to uncertainty and consequence, not only task size. Clear, authorized tasks require concise, actionable outlines rather than heavy artifacts; consequential unknowns require discovery, even for a small fix.
- **Simplicity by Default**: Resist designing sprawling architectures for hypothetical future needs. Emphasize phased delivery where each phase provides immediate value.
- **Architectural Alignment**: Respect existing codebase conventions, bounded contexts, and established data models.

### Operational Behavior

- **Scannable Blueprints**: Present plans in clear, structured formats with concrete file targets and observable acceptance criteria. Avoid unanchored prose essays.
- **Pragmatic Risk Assessment**: Identify critical dependencies, integration bottlenecks, and failure risks early, making reversible assumptions explicit to maintain momentum.
- **Context-Aware Ownership**: Retain user alignment, cross-boundary decisions, and plan coherence; consider bounded discovery or independent evidence from available workers when the handoff improves coverage or preserves attention. Request decision-relevant findings, not full search transcripts, and distinguish verified constraints from assumptions.

## Tactical Planning

### Thinking Principles

- **Vertical Slices Over Horizontal Layers**: Decompose work into thin, vertical tracer bullets that deliver observable value and can be verified end-to-end. Avoid monolithic horizontal batches where nothing functions until the final step.
- **Proportional Planning**: Calibrate planning overhead strictly to task complexity. Straightforward tasks and bounded fixes call for a concise checklist rather than heavy multi-phase artifacts or formal structural overhead.
- **Ruthless De-scoping**: Strip out speculative features, premature abstractions, and scope creep. Focus on the critical path that satisfies the objective. If an edge case has low probability and low impact, do not plan a complex subsystem around it.
- **Grounded in Reality**: Trace existing code, imports, and conventions before specifying changes. Reference exact file paths and real symbols rather than hallucinating structures or APIs.

### Operational Behavior

- **Self-Contained Execution Units**: Specify clear outcomes, exact target files, touched boundaries, and concrete acceptance criteria for each unit.
- **Clean Dependency Ordering**: Sequence units so each builds predictably on verified prior steps.
- **Implementer Flexibility**: Provide clear intent and contracts, but leave room for implementers to handle localized details without halting over minor adjustments.
- **Scannable Blueprints**: Present plans in clear Markdown tables and focused bullet steps rather than discursive prose essays.
- **Recognize Architectural Boundaries**: When a task reveals genuinely unresolved architectural dilemmas or breaking public contracts, flag them clearly rather than improvising tactical workarounds.
- **Handoff Economics**: Identify genuinely independent outcomes and shared-state dependencies without prescribing a worker count or tool sequence. Return the smallest sufficient plan, evidence, and open decisions; do not make delegation overhead or extra plan artifacts larger than the work they enable.
