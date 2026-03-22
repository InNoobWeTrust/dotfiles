# Project Context Convention

A per-project context file that acts as a **constitution** for AI agents —
documenting tech stack, critical rules, and conventions that agents wouldn't
infer from reading code alone.

## Purpose

AI agents make implementation decisions constantly. Without explicit guidance,
they follow generic best practices that may not match *your* codebase. The
project context file solves this by centralizing what agents need to know.

## File Location

Configurable via `{PROJECT_CONTEXT}` variable in host `AGENT.md`. Default:

```
docs/project-context.md
```

If no file exists, agents proceed without it — project context is never required.

## When to Create

| Situation | Action |
|---|---|
| New project with strong tech preferences | Create manually before architecture |
| After architecture/TRD phase | Generate from architecture decisions |
| Existing project, adding AI workflows | Generate from codebase analysis |
| Small/one-off task | Skip — not needed |

## What Goes In It

### Technology Stack & Versions

```markdown
## Technology Stack & Versions
- Node.js 20.x, TypeScript 5.3, React 18.2
- State: Zustand (not Redux)
- Testing: Vitest, Playwright, MSW
- Styling: Tailwind CSS with custom design tokens
```

### Critical Implementation Rules

Things agents might get wrong without explicit guidance:

```markdown
## Critical Implementation Rules

**TypeScript Configuration:**
- Strict mode enabled — no `any` types without explicit approval
- Use `interface` for public APIs, `type` for unions/intersections

**Code Organization:**
- Components in `/src/components/` with co-located `.test.tsx`
- API calls use the `apiClient` singleton — never fetch directly

**Testing Patterns:**
- Unit tests focus on business logic, not implementation details
- Integration tests use MSW to mock API responses
```

### What NOT to Include

- Standard practices that apply universally (e.g., "write clean code")
- Implementation details that change frequently
- Information already in `AGENT.md` or `TRD`

Focus on **what's unobvious** — things agents wouldn't infer from reading a
few code files.

## Loading

Execution-phase workflows (`executor`, `verifier`, `reviewer`) automatically
load this file when it exists:

1. **Read at session start** — before any code generation or review
2. **Treat as constraints** — rules in project-context override generic defaults
3. **Violations are bugs** — if an agent produces output that contradicts
   project-context, that's a defect to fix, not a preference to weigh

Planning-phase agents (`prd-writer`, `trd-writer`) respect it for consistency
but don't require it.

## Updating

Update the project context when:
- Architecture decisions change (new ADRs)
- You discover agents repeatedly making the same mistake
- Stack versions change significantly

Keep it lean — project context should be fast to read, not comprehensive
documentation. Target: under 100 lines.
