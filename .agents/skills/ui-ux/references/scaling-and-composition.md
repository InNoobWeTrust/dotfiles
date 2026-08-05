# Scaling Tracks & Skill Composition

This reference defines when to use Quick, Standard, or Deep tracks, and how the ui-ux skill composes with other skills.

## Scaling Tracks

### Quick Track
**When**: Single component within an existing design system, requirements are unambiguous, no new screens or user flows.

**Examples**:
- Add a button variant to an existing component library
- Restyle an existing card component
- Add dark mode to an existing component
- Fix a specific visual bug (spacing, color, alignment)

**Phases used**: Phase 5 (Visual Design) → Phase 6 (Implement) → Phase 7 (Verify)

**What's skipped**: Discovery (requirements are clear), Journey/Flow (no new user paths), Layout (existing layout), State Matrix (existing states or simple addition)

**Criteria — ALL must be true**:
- Working within an existing design system / DESIGN.md
- No new screens or navigation paths
- Requirements specify exactly what to build
- No ambiguity about user intent or interaction patterns
- Single component or isolated visual change

### Standard Track (Default)
**When**: New feature, multi-screen work, ambiguous requirements, or any task where the user journey isn't obvious.

**Examples**:
- Build a new dashboard page
- Design a multi-step form/wizard
- Create a settings panel with multiple sections
- Build a data visualization view
- Redesign an existing feature

**Phases used**: All 7 phases

**The agent should default to Standard unless Quick criteria are clearly met.**

### Deep Track
**When**: Product-level redesign, design system creation/overhaul, complex multi-persona interactions, or work that will establish patterns used across the product.

**Examples**:
- Create a project's design system from scratch
- Redesign a product's entire navigation architecture
- Build a complex interactive experience (e.g., drag-and-drop builder)
- Design for multiple user roles with different views
- Establish a component library with variants and theming

**Phases used**: All 7 phases + additional gates:
- Phase 1 deep: Full stakeholder interview (all 6 question categories)
- Phase 2 deep: Multiple persona journey maps, edge-case scenarios
- Phase 3 deep: SVG wireframes for every non-trivial screen at all breakpoints (mobile / tablet / desktop), saved in `UX-SPEC.md` § Layout
- Phase 5 deep: Formal DESIGN.md creation with full token specification
- Phase 7 deep: Delegate to `web-qa-audit` for browser-based verification

## Skill Composition

How ui-ux interacts with other skills:

| Composing Skill | Direction | Handoff Point | What's Exchanged |
|---|---|---|---|
| `requirements-driven-dev` | → ui-ux | PRD/BDD outputs feed Phase 1 Discovery | User stories, acceptance criteria, persona definitions |
| `brainstorming` | → ui-ux | Brainstorming outputs feed Phase 1 context | Ideas, concepts, competitive insights |
| `grooming` rule | ↔ ui-ux | Phase 1 IS the UX-specific grooming interview | Discovery questions, design concept alignment |
| `code-craft` | ← ui-ux | Phase 6 follows code-craft methodology | UX-SPEC.md as implementation contract |
| `reviewer` | ↔ ui-ux | Can review UX-SPEC.md before Phase 6, or review code after | Design review feedback, code quality assessment |
| `web-qa-audit` | ← ui-ux | Phase 7 can delegate browser verification | Verification checklist, expected states |
| `illustration-craft` | ↔ ui-ux | Empty state illustrations, onboarding graphics | SVG/image assets for UI states |
| `project-foundation` | → ui-ux | DESIGN.md setup during project bootstrap | Initial design tokens |

## Composition Patterns

### Pattern 1: Full Product Design (Most Common)
```
requirements-driven-dev (PRD) → ui-ux (all phases) → code-craft (implementation details)
```

### Pattern 2: Feature Addition
```
ui-ux (Standard track) → code-craft (Phase 6 implementation)
```

### Pattern 3: Design System Bootstrap
```
project-foundation → ui-ux (Deep track, DESIGN.md focus) → code-craft (component library)
```

### Pattern 4: Quick Polish
```
ui-ux (Quick track) → code-craft (Phase 6 implementation)
```

### Pattern 5: Design Review
```
ui-ux (Phases 1-5 only) → reviewer (design audit) → ui-ux (revise) → code-craft
```

## AFK / Non-Interactive Mode

When the user is not available for the Discovery interview:
1. Load `rules/grooming.md` AFK mode (Self-Grooming Audit)
2. Analyze codebase for existing design patterns, component library, DESIGN.md
3. Infer discovery answers from requirements/PRD/existing code
4. Mark all inferred answers with `⚠️ Assumed:` in UX-SPEC.md
5. Proceed with Standard track but document all assumptions
6. Flag UX-SPEC.md for human review before considering work "done"

## Existing UI Audit (Replaces Old Phase 2)

For redesign or polish tasks (not greenfield), perform a brief audit before Phase 3:
1. Identify visual issues: generic colors, poor spacing, inconsistent typography, a11y failures
2. Prioritize by visual impact per effort
3. Check token compliance: hardcoded magic numbers vs. design system tokens
4. Feed findings into Phase 3 (Layout) and Phase 5 (Visual Design)

This audit is part of Phase 3 context gathering, not a separate phase.
