---
name: ui-ux
description: "Use this skill when building or polishing user interfaces — layout, typography, color, motion, responsive design, dark mode, visual polish, or DESIGN.md design systems. Activate when the user asks to design a UI, make something look better, add animations, create or audit a DESIGN.md visual system, or do any frontend work where visual quality matters. Uses taste sliders, DESIGN.md specs, and audit-first methodology to prevent generic output."
---

# UI-UX Design Skill

Design companion for creating polished, accessible interfaces. Combines "High-Agency" creative principles with the Google Labs `DESIGN.md` specification for structured, token-driven visual identity.

Progressive disclosure: this file is the workflow router. Deep specification detail lives in `references/design-md-spec.md`.

---

## Phase 1 — Establish Design Context

Before writing any UI code, gather context and calibrate creative direction.

### 1a. DESIGN.md Check

Look for a root `DESIGN.md` in the project. Three outcomes:

| Situation | Action |
|---|---|
| `DESIGN.md` exists and passes lint | Extract tokens; use them as the source of truth for all color, typography, spacing, and component decisions. |
| `DESIGN.md` exists but is incomplete/failing | Run `npx @google/design.md lint DESIGN.md`, fix findings, then proceed. |
| No `DESIGN.md` and project has UI | Offer to scaffold one per the spec (`references/design-md-spec.md`). If the user declines, derive implicit tokens from existing CSS/Tailwind and document assumptions. |

### 1b. Taste Sliders (1–10)

Calibrate the creative budget. Ask the user or infer from context:

- **DESIGN_VARIANCE** — 1–3: standard layouts, system fonts, predictable grids. 4–7: curated type pairings, considered asymmetry. 8–10: boutique typography, experimental overlapping elements.
- **MOTION_INTENSITY** — 1–3: discrete 200ms transitions, subtle hover scale. 4–7: entrance animations, scroll-reveal. 8–10: scroll-linked parallax, magnetic cursors, 3D CSS transforms.
- **VISUAL_DENSITY** — 1–3: high whitespace (luxury), 1–2 elements per viewport. 4–7: balanced information display. 8–10: compact data grids, multi-pane dashboards.

Defaults when unspecified: DESIGN_VARIANCE=5, MOTION_INTENSITY=4, VISUAL_DENSITY=5.

### 1c. Tech Stack Awareness

Identify the project's styling approach (Vanilla CSS, Tailwind, CSS Modules, styled-components, etc.) and map `DESIGN.md` tokens to the appropriate format. Never introduce a new CSS methodology without asking.

---

## Phase 2 — Audit Existing UI

Before rewriting code, perform a brief visual audit:

1. **Identify issues**: Generic colors, poor spacing, inconsistent typography, accessibility failures, outdated patterns (heavy borders, standard drop shadows).
2. **Prioritize by visual impact**: Rank fixes from highest to lowest visual improvement per effort.
3. **Modernize**: Replace outdated patterns with modern alternatives — subtle depth cues, glassmorphism, refined shadows, fluid spacing.
4. **Validate against DESIGN.md**: Cross-check existing styles against token values. Flag hardcoded magic numbers and rogue colors that don't trace back to the design system.

**Skip this phase** for greenfield projects where no existing UI exists.

---

## Phase 3 — Implement

Apply changes following these core principles:

### Visual Hierarchy & Typography
- Guide the eye using size, weight, color, and spacing contrast.
- Prefer modern typefaces (Inter, Geist, Playfair Display, Space Grotesk) over system defaults. Use `DESIGN.md` typography tokens when available.
- Maintain 60–75 character line lengths for body text readability.

### Spacing & Layout
- Use a base-4 grid (4, 8, 12, 16, 24, 32, 48, 64, 96 px). Map to `DESIGN.md` spacing tokens.
- Group related elements tightly; separate unrelated sections with generous whitespace.
- Ensure responsive behavior — test at mobile, tablet, and desktop breakpoints.

### Color & Accessibility
- Apply the **60-30-10 rule**: 60% neutral/background, 30% secondary, 10% accent.
- **WCAG AA minimum** (4.5:1 text contrast, 3:1 non-text). Color must never be the sole indicator of state.
- Use `DESIGN.md` color tokens exclusively — no ad-hoc hex values in component files.

### Output Policy
- Deliver full, production-ready files. Never use placeholders (`// ... rest of code`, `/* implementation here */`).
- Exception: files exceeding 1000 lines may use targeted surgical edits via `replace` tools, but all logic within the edited scope must be complete.

---

## Phase 4 — Validate

1. **DESIGN.md lint** (if the project has one):
   ```bash
   npx @google/design.md lint DESIGN.md
   ```
2. **Visual regression**: Verify no unintended style changes outside the target scope.
3. **Accessibility check**: Confirm contrast ratios, keyboard navigation, and ARIA attributes.
4. **Token compliance**: Grep for hardcoded color/spacing values that should reference design tokens.

---

## DESIGN.md Specification (Quick Reference)

Full spec: `references/design-md-spec.md`. Key points:

- **Format**: YAML frontmatter (tokens) + Markdown body (rationale). Tokens are normative; prose explains intent.
- **Token groups**: `colors`, `typography`, `rounded`, `spacing`, `components`. Cross-reference with `{path.to.token}` syntax.
- **Section order**: Overview → Colors → Typography → Layout → Elevation & Depth → Shapes → Components → Do's and Don'ts.
- **Validation**: `npx @google/design.md lint` checks schema, token references, and WCAG contrast. `npx @google/design.md diff` detects regressions between versions.
- **Consumer behavior**: Unknown section headings and unknown token names with valid values are accepted — do not error on extensibility.

---

## Data Augmentation

Curated design data (palettes, component specs) synced as raw CSV files from external repositories.

- **Cache**: `$UI_UX_CACHE` or `~/.cache/ui-ux-skill/ui-ux-pro-max/`
- **Query with csvkit**: `csvgrep -c color -m "#3B82F6" ~/.cache/ui-ux-skill/ui-ux-pro-max/*.csv`
- **Query with ripgrep**: `rg "glassmorphism" ~/.cache/ui-ux-skill/ui-ux-pro-max/`
- **Sync**: `../../scripts/sync-remotes.sh --apply`

---

## Aesthetic Patterns

Reference patterns for high variance/motion calibration:

| Pattern | Characteristics | Slider Profile |
|---|---|---|
| Premium Minimalist (Linear/Notion) | Monochrome palettes, 1px borders, generous whitespace | V:3 M:2 D:3 |
| Modern Brutalist | Bold Swiss typography, stark contrast, raw mechanical feel | V:8 M:3 D:6 |
| Glassmorphism | Frosted glass via `backdrop-filter: blur(20px)`, layered depth | V:6 M:5 D:5 |
| 3D Scroll (Apple-style) | Interactive motion driven by scroll progress, cinematic | V:7 M:9 D:4 |

---

## Stop Conditions

- **No design context**: If no `DESIGN.md` exists and the user declines to create one, proceed with inferred tokens but document the gap.
- **Accessibility violation**: Do not ship UI that fails WCAG AA. Halt and fix before proceeding.
- **Tech stack conflict**: If the requested change would introduce a conflicting CSS methodology, stop and ask.
- **Scope creep**: If a "make it look better" request implies a full redesign beyond the original scope, confirm scope with the user.

## Deliverables

- [ ] Design context established (DESIGN.md check + taste sliders calibrated)
- [ ] Visual audit completed (or skipped for greenfield with justification)
- [ ] Implementation delivered with full production-ready code
- [ ] All colors, spacing, and typography trace to DESIGN.md tokens or documented CSS variables
- [ ] WCAG AA contrast verified
- [ ] `npx @google/design.md lint DESIGN.md` passes (if applicable)

## Anti-Patterns

| Temptation | Why Wrong | Correct Path |
|---|---|---|
| Jump straight to code without checking DESIGN.md | Produces styles that drift from the design system, creating token/implementation mismatch | Phase 1a first — read or scaffold DESIGN.md |
| Hardcode hex colors and px values inline | Creates unmaintainable, un-auditable styling that can't be lint-checked | Reference DESIGN.md tokens via CSS variables or theme config |
| Skip the audit on existing UI | Misses the highest-impact improvements and risks introducing inconsistencies | Phase 2 audit takes 2 minutes and shapes the entire approach |
| Use system fonts "for performance" | Visually generic output that fails the premium quality bar | Load 1–2 curated fonts via DESIGN.md typography tokens |
| Ignore accessibility until review | Retrofitting contrast and ARIA is 5× harder than building it in | Apply WCAG AA during implementation, not as a post-hoc fix |
| Introduce Tailwind into a Vanilla CSS project (or vice versa) | Methodology conflicts create maintenance debt | Match the existing tech stack; ask before switching |
| Treat taste sliders as decorative | Without calibration, output defaults to safe/generic | Set explicit slider values — even defaults are a conscious choice |

---

## References

- `references/design-md-spec.md` — Full DESIGN.md format specification, token schema, and implementation mapping
- Upstream spec: https://github.com/google-labs-code/design.md
- Compose with: `code-craft` (component logic), `reviewer` (security lens for visual interfaces), `project-foundation` (DESIGN.md setup during bootstrap)
