# Design decision anti-patterns (code-craft)

## Design Decision Anti-Patterns

These are the most common agent lazy-path shortcuts. Recognize and refuse them:

| Temptation | Why It's Wrong | Correct Path |
|---|---|---|
| "I'll add this method to the existing class — it's already there" | Violates Single Responsibility; grows the class beyond its domain | Create a separate module/service |
| "I'll add another parameter to handle the new case" | Grows function surface; callers must know about new parameter | Use composition or a strategy pattern |
| "I'll copy this logic here — it's only used twice" | Creates divergence; the copies will drift | Extract to a named shared function now |
| "I'll use a dict/map here — it's flexible" | Hides structure; readers cannot see what fields exist | Use a typed struct, dataclass, or interface |
| "The function is getting long but it all belongs together" | No function "belongs together" at 80 lines | Extract named sub-functions at logical boundaries |
| "I'll extract this 2-line calculation/lookup into a helper function to keep the caller extremely short" | Creates shallow, single-use methods that increase indirection and cognitive load, scattering cohesive logic | Keep simple calculations and registry mappings inline and self-documenting |
| "I'll put the business rule in the controller/handler" | Mixes layers; makes business logic untestable in isolation | Extract to a domain service |
| "I'll use a global flag to coordinate these modules" | Introduces invisible coupling and ordering dependency | Use explicit dependency injection or event passing |
| "I'll return `[]` / `null` / `false` here so callers don't break" | Hides contract ambiguity and turns real failure into fake success | Surface a typed/domain error or ask the user to define the expected behavior |
