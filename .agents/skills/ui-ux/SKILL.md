---
name: ui-ux
description: "Use this skill when building or polishing user interfaces — user journey mapping, interaction design, layout planning, visual design, DESIGN.md systems, and frontend implementation with design-code drift prevention. Activate when designing a UI feature, building a multi-screen experience, creating a design system, polishing visual quality, or doing any frontend work where UX methodology matters. Enforces design-before-code: written UX specs must exist before implementation begins. Uses UX-SPEC.md as the design contract, 10-State UI Matrix for state exhaustion, and DESIGN.md tokens for visual consistency."
---

# UI-UX Design Skill

Design-driven UI development: discover → journey → layout → states → style → code → verify.

**Core principle**: No UI code before written design specs. Every design decision lives in `UX-SPEC.md`, not in the agent's context window.

Progressive disclosure — load refs only when the phase needs them:

| When | Load |
|---|---|
| Phase 1 (Discovery interview) | `references/discovery-questions.md` |
| Phase 4 (State Matrix) | `references/state-matrix.md` |
| Creating UX-SPEC.md | `references/ux-spec-template.md` |
| Choosing track or composing skills | `references/scaling-and-composition.md` |
| Phase 5 (DESIGN.md work) | `references/design-md-spec.md` |

---

## Phase 0 — Route & Scale

Before starting, determine the track. Load `references/scaling-and-composition.md` if unsure.

| Track | When | Phases |
|---|---|---|
| **Quick** | Single component, existing design system, unambiguous spec | 5 → 6 → 7 |
| **Standard** (default) | New feature, multi-screen, ambiguous requirements | All 1–7 |
| **Deep** | Product redesign, design system creation, multi-persona | All 1–7 + extra gates |

**Default to Standard.** Scale down to Quick only when ALL Quick criteria are met (see reference).

For redesigns or polish of existing UI, perform a brief visual audit as part of Phase 3 context gathering — check for generic colors, poor spacing, token violations, and a11y failures.

---

## Phase 1 — Discovery

**Purpose**: Understand what we're building, for whom, under what constraints.

1. Load `references/discovery-questions.md`
2. Select 3–5 highest-impact questions based on the request
3. Interview the user (or self-groom per `rules/grooming.md` AFK mode)
4. Create `UX-SPEC.md` from `references/ux-spec-template.md`
5. Write findings to `UX-SPEC.md` § Discovery

**GATE**: UX-SPEC.md § Discovery must be written to file before proceeding.

---

## Phase 2 — User Journey & Flow

**Purpose**: Map user paths through the feature before designing screens.

1. Identify user personas and entry points from Discovery
2. Map the primary journey: phases → actions → goals → emotions → pain points → opportunities
3. Create user flow with decision branches (Mermaid `flowchart TD`)
4. Build screen inventory — every view/screen the feature needs
5. Write to `UX-SPEC.md` § User Journey, § User Flow, § Screen Inventory

**GATE**: Journey map + flow diagram + screen inventory must be written before proceeding.

---

## Phase 3 — Layout & Wireframe

**Purpose**: Define information architecture and spatial organization per screen.

For each screen in the inventory:
1. Define content hierarchy (primary → secondary → tertiary)
2. Describe layout structure and grid
3. Create an **SVG wireframe** for every non-trivial screen (more than two regions) — save it inline in `UX-SPEC.md` § Layout in an `xml` fenced block. Use ASCII art only for trivial one- or two-region splits where SVG adds no clarity.
4. Specify responsive behavior at mobile / tablet / desktop breakpoints in prose alongside the SVG
5. Note navigation and wayfinding elements
6. Write all content to `UX-SPEC.md` § Layout

For redesigns: audit existing UI here — identify token violations, spacing issues, a11y failures.

**GATE**: Layout descriptions, written responsive behavior at desktop/tablet/mobile breakpoints, and SVG wireframes for all non-trivial screens must be written to `UX-SPEC.md` § Layout before proceeding.

---

## Phase 4 — State Matrix

**Purpose**: Exhaustively enumerate component states to prevent happy-path-only UI.

1. Load `references/state-matrix.md` for the 10-State UI Matrix and applicability guide
2. For each interactive component identified in layout, fill applicable states
3. Document loading strategy (skeleton vs. spinner vs. progressive)
4. Document error recovery UX and empty state content
5. Write to `UX-SPEC.md` § State Matrix

**GATE**: State matrix for all interactive components must be written before proceeding.

---

## Phase 5 — Visual Design

**Purpose**: Define the visual identity — colors, typography, spacing, motion.

### 5a. DESIGN.md Check

| Situation | Action |
|---|---|
| `DESIGN.md` exists and passes lint | Extract tokens; use as source of truth |
| `DESIGN.md` exists but incomplete | Run `npx @google/design.md lint DESIGN.md`, fix, proceed |
| No `DESIGN.md` and project has UI | Offer to scaffold per `references/design-md-spec.md` |

### 5b. Taste Sliders (1–10)

Calibrate creative direction. Ask or infer from Discovery context:

- **DESIGN_VARIANCE** — 1–3: standard layouts, system fonts. 4–7: curated pairings, considered asymmetry. 8–10: experimental, boutique.
- **MOTION_INTENSITY** — 1–3: subtle 200ms transitions. 4–7: entrance animations, scroll-reveal. 8–10: parallax, 3D transforms.
- **VISUAL_DENSITY** — 1–3: generous whitespace. 4–7: balanced. 8–10: compact data grids.

Defaults when unspecified: DESIGN_VARIANCE=5, MOTION_INTENSITY=4, VISUAL_DENSITY=5.

### 5c. Token Mapping

Map design tokens to layout decisions from Phase 3. Define motion tokens if MOTION_INTENSITY > 3.

Write to `UX-SPEC.md` § Visual Design.

**GATE**: Visual design decisions documented before proceeding to code.

---

## Phase 6 — Implement

**Purpose**: Write code that faithfully implements the written specs.

**PREREQUISITE**: `UX-SPEC.md` must exist with Phases 1–5 sections populated.

1. **Read UX-SPEC.md** as the source of truth — all sections
2. **Check existing components** — search project component tree before writing new HTML
3. **Follow code-craft** — load `code-craft` skill for implementation methodology
4. **Token compliance** — zero hardcoded hex colors or arbitrary px values; all styling references DESIGN.md tokens or CSS variables
5. **State exhaustion** — implement ALL states from the State Matrix
6. **Accessibility by default**:
   - Semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`)
   - ARIA labels and roles where semantic HTML is insufficient
   - Keyboard navigation and visible focus states
   - WCAG AA minimum (4.5:1 text, 3:1 non-text contrast)
   - `prefers-reduced-motion` respected
   - Touch targets ≥ 44×44px
7. **Responsive implementation** — test at breakpoints specified in Layout section
8. **Output policy** — deliver full production-ready files, no placeholders

---

## Phase 7 — Verify

**Purpose**: Verify implementation matches written design specs.

1. **Spec cross-reference** — walk UX-SPEC.md § Verification Checklist, checking each item
2. **Token compliance** — grep for hardcoded hex colors (`#[0-9a-fA-F]{3,8}`) and arbitrary px values in component files
3. **State audit** — verify each state from the State Matrix is implemented
4. **DESIGN.md lint** (if applicable): `npx @google/design.md lint DESIGN.md`
5. **Accessibility check** — contrast ratios, keyboard nav, ARIA attributes, focus management
6. **Responsive check** — verify layout at specified breakpoints
7. **Produce verification report** — pass/fail per checklist item

For Deep track: delegate browser verification to `web-qa-audit` skill.

---

## Stop Conditions

- **Ambiguous requirements**: If Discovery interview reveals fundamental ambiguity, STOP and clarify with user before proceeding
- **No design spec**: Do NOT write UI code if UX-SPEC.md doesn't exist or relevant sections are empty
- **Accessibility violation**: Do not ship UI that fails WCAG AA — halt and fix
- **Tech stack conflict**: If changes would introduce a conflicting CSS methodology, STOP and ask
- **Scope creep**: If a request implies redesign beyond original scope, confirm with user
- **Missing states**: If State Matrix is incomplete for a component, fill it before coding

## Deliverables

- [ ] Track selected (Quick / Standard / Deep) with justification
- [ ] Discovery completed — UX-SPEC.md § Discovery written (Standard/Deep)
- [ ] User journey + flow mapped — UX-SPEC.md § Journey + Flow written (Standard/Deep)
- [ ] Layout defined — `UX-SPEC.md` § Layout written with SVG wireframes for all non-trivial screens at desktop, tablet, and mobile breakpoints (Standard/Deep)
- [ ] State matrix filled — UX-SPEC.md § State Matrix written (Standard/Deep)
- [ ] Visual design established — DESIGN.md check + taste sliders + tokens mapped
- [ ] Implementation: full production-ready code, all states, all breakpoints
- [ ] All colors/spacing/typography trace to tokens — zero hardcoded values
- [ ] WCAG AA contrast verified, keyboard nav works, ARIA complete
- [ ] Verification checklist completed — pass/fail per item

## Anti-Patterns

| Temptation | Why Wrong | Correct Path |
|---|---|---|
| Jump to code after reading requirements | Produces UI that drifts from intent — no written spec to anchor against | Complete Phases 1–5, write UX-SPEC.md, THEN code |
| Skip Discovery ("requirements are clear") | Every ambiguity becomes an ad-hoc decision conflicting with user intent | Ask at least 3 questions; write findings to file |
| Design only the happy path | Users spend 80% of time in edge states (loading, error, empty) | Fill 10-State Matrix before coding |
| Pick colors/fonts before understanding user journey | Visual decisions without UX context produce pretty but unusable UI | Journey → Layout → States → THEN Visual |
| Keep designs in context window only | Context eviction = design amnesia mid-implementation | Write every decision to UX-SPEC.md |
| Hardcode hex colors and px values | Unmaintainable styling that drifts from design system | Reference DESIGN.md tokens via CSS variables |
| Write new components without checking existing ones | Fragments the design system, duplicates effort | Search project component tree first |
| Skip responsive planning | Desktop-only UI that breaks on mobile | Specify breakpoint behavior in Layout |
| Treat accessibility as post-hoc | Retrofitting ARIA and contrast is 5× harder than building in | Semantic HTML + WCAG AA from Phase 6 start |
| Default to Quick track to save time | Skips journey/states, produces shallow UI | Standard is default; Quick requires ALL criteria met |
| Use ASCII art for complex multi-region layouts | Ambiguous spatial relationships, no breakpoint semantics, hard to review | Create an SVG wireframe per `references/ux-spec-template.md` § Layout covering desktop, tablet, and mobile breakpoints; save in `UX-SPEC.md` § Layout |

---

## References

- `references/discovery-questions.md` — Stakeholder question bank (6 categories, 25 questions)
- `references/state-matrix.md` — 10-State UI Matrix with applicability guide and motion tokens
- `references/ux-spec-template.md` — UX-SPEC.md template with section completion rules
- `references/scaling-and-composition.md` — Quick/Standard/Deep tracks and skill composition
- `references/design-md-spec.md` — Full DESIGN.md format specification (Google Labs)
- Compose with: `code-craft` (Phase 6 methodology), `reviewer` (design audit), `web-qa-audit` (Phase 7 browser verification), `project-foundation` (DESIGN.md bootstrap), `illustration-craft` (empty state graphics)
