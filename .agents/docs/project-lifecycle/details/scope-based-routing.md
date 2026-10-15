# Scope-Based Routing

Default for implementation tasks: load `code-craft`. Load it any time
you write or modify code logic.

| Task Type | Load This Skill | Skip When |
|---|---|---|
| Write/refactor code | `code-craft` | Typos, formatting, config changes |
| Debug a bug | `systematic-investigation` | Task is creative brainstorming |
| Define product intent/outcomes | `brainstorming` | Intent is already clear and no product document is requested |
| Decide technical constraints/trade-offs | `architecture-design` | No architecture decision or technical specification is needed |
| Specify acceptance behavior (even without implementation) | `code-craft` testing reference | Behavior and evidence are already clear |
| Review code/specs | `reviewer` | User only asked for implementation |
| Navigate unknown code | `codebase-exploration` | Relevant files already known |
```

For consequential unknowns, use `working-principles/references/planning.md`; no fixed PRD/TRD/BDD chain is required. `ui-ux` owns journeys and `doc-craft` owns document presentation.

#### Strategy: Embed Composition Pathways into the Instructions File

Skill composition pathways can be embedded as a concise section so the agent knows how to chain skills for complex tasks:

```
