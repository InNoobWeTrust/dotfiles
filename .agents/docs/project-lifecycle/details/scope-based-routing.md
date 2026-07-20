# Scope-Based Routing

Default for implementation tasks: load `code-craft`. Load it any time
you write or modify code logic.

| Task Type | Load This Skill | Skip When |
|---|---|---|
| Write/refactor code | `code-craft` | Typos, formatting, config changes |
| Debug a bug | `systematic-investigation` | Task is creative brainstorming |
| Design a feature | `requirements-driven-dev` | Small well-scoped fix from existing plan |
| Review code/specs | `reviewer` | User only asked for implementation |
| Navigate unknown code | `codebase-exploration` | Relevant files already known |
```

#### Strategy: Embed Composition Pathways into the Instructions File

Skill composition pathways can be embedded as a concise section so the agent knows how to chain skills for complex tasks:

```
