---
name: ui-ux
description: >
  UI/UX design companion for building polished, accessible, production-grade
  interfaces. Use this skill for any request involving design systems, component
  styling, color palettes, typography, layout patterns (Bento Grids, cards,
  dashboards), visual effects (glassmorphism, neumorphism, gradients),
  accessibility audits, responsive design, or legacy UI modernization. Also
  activate when the user wants a "modern", "premium", or "futuristic" look,
  asks for design tokens, mentions WCAG compliance, or needs help choosing
  colors, fonts, or spacing systems.
---

# UI-UX Design Skill

A design companion for creating polished, accessible interfaces — from
establishing design systems to modernizing legacy UIs.

## Core Principles

These principles apply whether or not cached data is available. They represent
fundamental design truths that produce good results from first principles.

### Visual Hierarchy

Guide the eye to what matters most. Users scan in predictable patterns
(F-pattern for text-heavy, Z-pattern for landing pages). Use size, weight,
color, and spacing to create clear information hierarchy:

- **Primary action**: Largest, highest contrast, most saturated
- **Secondary elements**: Medium weight, less contrast
- **Tertiary/metadata**: Smallest, lowest contrast, muted

### Spacing & Layout

Consistent spacing creates rhythm and reduces cognitive load:

- Use a **4px base grid** (4, 8, 12, 16, 24, 32, 48, 64, 96)
- Content sections need breathing room — generous padding > cramped information
- Group related elements tightly, separate unrelated elements with whitespace
- For responsive layouts, prefer CSS Grid for 2D and Flexbox for 1D

### Color

- Start with a **60-30-10 rule**: 60% neutral/background, 30% secondary, 10% accent
- Ensure **WCAG AA contrast** minimum (4.5:1 for text, 3:1 for large text/UI elements)
- Provide semantic color tokens: `--color-success`, `--color-error`, `--color-warning`, `--color-info`
- Dark mode: don't just invert — reduce saturation, use elevated surfaces for depth

### Typography

- Limit to **2 typefaces** maximum (one for headings, one for body)
- Use a **type scale** with consistent ratios (1.25 for compact, 1.333 for balanced, 1.5 for dramatic)
- Line height: 1.5 for body text, 1.2-1.3 for headings
- Maximum line length: 60-75 characters for readability

### Accessibility (WCAG 2.1 AA Baseline)

Every interface should meet these minimums:

- **Perceivable**: Color is never the only indicator. Alt text on images. Captions on video.
- **Operable**: All interactive elements keyboard-accessible. Focus indicators visible. No keyboard traps.
- **Understandable**: Labels on form fields. Error messages are specific and actionable. Consistent navigation.
- **Robust**: Semantic HTML elements (`<button>`, `<nav>`, `<main>`). ARIA attributes where needed. Works with screen readers.

---

## Aesthetic Patterns

### Glassmorphism
- Frosted glass effect: `backdrop-filter: blur(10-20px)`, semi-transparent background
- Use sparingly — works for modals, cards, and overlays against rich backgrounds
- Ensure text contrast remains WCAG-compliant against varying backgrounds
- Pair with subtle borders (`1px solid rgba(255,255,255,0.2)`) for edge definition

### Bento Grid
- Asymmetric grid layouts inspired by Japanese bento boxes
- Mix card sizes: 1x1, 2x1, 1x2, 2x2 for visual variety
- Each cell is self-contained with clear purpose
- Works well for dashboards, portfolios, feature showcases

### Neumorphism
- Soft, extruded appearance using dual shadows (light + dark)
- Low contrast by nature — **verify accessibility rigorously**
- Best for decorative elements, toggles, buttons on light backgrounds
- Avoid for text-heavy interfaces where readability is critical

### Modern Minimal
- High whitespace, limited color palette (2-3 colors), strong typography
- Content-first — let the information be the hero
- Micro-interactions for delight (hover states, transitions)

---

## Methodology

### For New Projects

1. **Establish design tokens** — Define the core token set (colors, spacing, typography, shadows, radii) as CSS custom properties or Tailwind config
2. **Choose an aesthetic direction** — Match the product's personality to a pattern above
3. **Build the component system** — Start with atoms (buttons, inputs, labels), compose into molecules (form groups, cards), then organisms (headers, sections)
4. **Verify accessibility** — Run through the WCAG checklist above for every component

### For Legacy Modernization

1. **Audit current state** — Screenshot key screens, identify anti-patterns (inconsistent spacing, mixed type scales, accessibility failures)
2. **Gap analysis** — Compare against the Core Principles above
3. **Prioritize** — Fix accessibility violations first (legal risk), then consistency (design tokens), then aesthetics
4. **Incremental migration** — Introduce design tokens alongside existing styles, migrate screen by screen

### Design Token Generation

When generating tokens, produce this structure:

```css
:root {
  /* Colors — 60-30-10 palette */
  --color-bg-primary: ;
  --color-bg-secondary: ;
  --color-bg-tertiary: ;
  --color-text-primary: ;
  --color-text-secondary: ;
  --color-accent: ;
  --color-accent-hover: ;

  /* Semantic */
  --color-success: ;
  --color-error: ;
  --color-warning: ;
  --color-info: ;

  /* Spacing — 4px grid */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Typography */
  --font-heading: ;
  --font-body: ;
  --text-xs: ;
  --text-sm: ;
  --text-base: ;
  --text-lg: ;
  --text-xl: ;
  --text-2xl: ;

  /* Shadows & Effects */
  --shadow-sm: ;
  --shadow-md: ;
  --shadow-lg: ;
  --radius-sm: ;
  --radius-md: ;
  --radius-lg: ;
}
```

---

## Data Augmentation (Optional)

This skill can be enhanced with curated design data from external sources.
When the cache is available, it provides industry-specific color palettes,
typography pairings, and framework-specific best practices.

### Sync Command

```bash
bun run .agents/skills/ui-ux/scripts/sync_data.ts
```

### Cache Location

Defined by `UI_UX_CACHE` environment variable (defaults to `~/.cache/ui-ux-skill`).

### Using Cache Data

If the cache exists, search these files for data-driven recommendations:
- `ui-ux-pro-max/colors.json` — WCAG-compliant palettes by product type
- `ui-ux-pro-max/styles.json` — Technical specs for aesthetic patterns
- `ui-ux-pro-max/ux-guidelines.json` — Best practices and anti-patterns
- `ui-ux-pro-max/typography.json` — Font pairings and scaling
- `ui-ux-pro-max/stacks/*.json` — Framework-specific guidance (Next.js, shadcn, etc.)

**If cache is unavailable**, apply the Core Principles above from first
principles. The cache adds specificity but is not required for good design
decisions.

---

## Rules

1. **Accessibility is non-negotiable** — Every recommendation must meet WCAG AA minimum
2. **Show, don't describe** — Provide production-ready CSS/tokens, not vague advice
3. **Context-aware** — Respect existing tech stack constraints (Tailwind vs vanilla CSS vs CSS-in-JS)
4. **Evolutionary** — Designs should be adaptable; avoid patterns that lock in a single aesthetic

## Related Skills

- **`adversarial-reviewer`** — Challenge UI/UX decisions (especially the Usability attack vector for visual and developer-facing interfaces).
- **`edge-case-hunter`** — Empty states, loading states, error states, and responsive breakpoints are edge cases.
- **`editorial-reviewer`** — For copy and microcopy quality in the interface.
