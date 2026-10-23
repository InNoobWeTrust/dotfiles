# Scaling Tracks & Skill Composition

This reference defines when to use Quick, Standard, or Deep tracks, and how the ui-ux skill composes with other skills.

## Scaling Tracks

### Rendering branch (independent of track)

Traditional UI uses developer-authored screens. Generative UI lets a model compose
registered components at runtime; load [generative-ui.md](generative-ui.md), and
[openui.md](openui.md) when using OpenUI. Select Quick/Standard/Deep separately.
A new generative surface normally needs Standard: catalogs, streaming states and
action boundaries are new behavior, not a shortcut around written design.
An isolated change inside an already specified generative component can be Quick
only when all Quick criteria below hold. Preserve the existing phase gates.

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
- Phase 7 deep: Use a browser-QA executor with the approved UX-SPEC, journeys/states, sanctioned target, browser/viewport matrix and evidence contract; if none is authorized or capable, mark live verification blocked/unverified rather than claiming completion.

## Skill Composition

The workflow may consume or hand off to these capabilities; no named skill or
particular deployment is required:

| Capability | Required input | Output/evidence | Absence behavior |
|---|---|---|---|
| Product-intent owner | Goals, users, scope, use cases, source evidence | Settled product intent or clearly marked open decisions | Ask the owner or mark reversible assumptions; stop on unresolved consequential choices |
| Behavior/acceptance owner | Observable outcomes, examples, failure behavior | Acceptance criteria usable in discovery and the state matrix | Do not invent product behavior; request the missing contract |
| Technical-constraint owner | Existing stack, APIs/data, performance, privacy and compatibility constraints | Source-backed constraints and known unknowns | Preserve the existing stack; stop affected design/implementation when required constraints cannot be verified |
| Implementation capability | Approved UX-SPEC Phases 1–5, source scope, acceptance criteria, write permissions | Production changes and pass/fail/unverified checks | No code before written design or without explicit authority/source access |
| Independent design evaluator | Original intent, current UX-SPEC, changed artifact and acceptance evidence | Evidence-linked findings and unresolved risks | If required for author-independent review and unavailable, do not simulate independence; report review pending |
| Browser-QA executor | Sanctioned target, journeys/states, browser/viewport matrix and evidence contract | Observed scenario results and requested screenshots/traces | Mark live checks blocked/unverified; do not substitute a different browser or artifact silently |
| Visual-asset capability (optional) | Approved storyboard/state, destination, formats and accessibility needs | Editable source, embeddable asset, alt text and usage note | Keep a simpler permitted treatment or mark the asset blocked; do not invent a production export |
| Design-system bootstrap capability (optional) | Existing brand/platform constraints and requested token scope | Existing or initial `DESIGN.md` tokens and compatibility evidence | Follow the in-skill Carbon/default and compatibility rules, or stop if a required owner decision is missing |

## Composition Patterns

### Pattern 1: Full Product Design (Most Common)
```
settled product intent (if needed) → ui-ux (all phases) → authorized implementation capability
```

A formal product brief/PRD is optional, not a prerequisite for UX discovery. Reuse existing intent and acceptance criteria. Obtain technical constraints from an authoritative source when needed; do not create a specification chain solely to satisfy process.

### Pattern 2: Feature Addition
```
ui-ux (Standard track) → authorized implementation capability (Phase 6)
```

### Pattern 3: Design System Bootstrap
```
available design-system tokens or an authorized initial token owner → ui-ux (Deep track) → authorized implementation capability
```

### Pattern 4: Quick Polish
```
ui-ux (Quick track) → authorized implementation capability (Phase 6)
```

### Pattern 5: Design Review
```
ui-ux (Phases 1–5) → independent evaluator (design findings) → ui-ux (revise) → authorized implementation capability
```

## AFK / Non-Interactive Mode

When the user is not available for the Discovery interview:
1. Review the available sources first, distinguish observed evidence from assumptions, and preserve owner decisions; user absence grants no new authority
2. Analyze codebase for existing design patterns, component library, DESIGN.md
3. Infer discovery answers from requirements/PRD/existing code
4. Mark all inferred answers with `⚠️ Assumed:` in UX-SPEC.md
5. Proceed with Standard track only within authorized scope and reversible assumptions; stop affected work on unresolved consequential decisions
6. Flag UX-SPEC.md for human review before considering work "done"

## Existing UI Audit (Replaces Old Phase 2)

For redesign or polish tasks (not greenfield), perform a brief audit before Phase 3:
1. Identify visual issues: generic colors, poor spacing, inconsistent typography, a11y failures
2. Prioritize by visual impact per effort
3. Check token compliance: hardcoded magic numbers vs. design system tokens
4. Feed findings into Phase 3 (Layout) and Phase 5 (Visual Design)

This audit is part of Phase 3 context gathering, not a separate phase.
