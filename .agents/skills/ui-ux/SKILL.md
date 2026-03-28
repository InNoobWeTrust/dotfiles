---
name: ui-ux
description: >
  UI/UX design companion for building polished, accessible, production-grade
  interfaces. Enforces modern layouts, typography, and motion to prevent "AI slop"
  using High-Agency principles and taste-driven design.
---

# UI-UX Design Skill

A design companion for creating polished, accessible interfaces using "High-Agency" principles.

## High-Agency Principles

Beyond basic design, follow these rules to ensure premium, production-ready output:

### 1. Taste Sliders (1-10)
Establish the "creative budget" using these three sliders. AI should interpret them as follows:
- **DESIGN_VARIANCE**: 
  - 1-3: Standard layouts (centered, F-pattern), system fonts, predictable grids.
  - 8-10: Asymmetric layouts, boutique typography, experimental overlapping elements.
- **MOTION_INTENSITY**: 
  - 1-3: Discrete 200ms transitions, subtle hover scale (1.02x).
  - 8-10: Scroll-linked parallax, magnetic cursors, 3D CSS transforms (Apple-style).
- **VISUAL_DENSITY**: 
  - 1-3: High whitespace (luxury), large type, 1-2 elements per viewport.
  - 8-10: Compact data grids, multi-pane dashboards, high information-to-ink ratio.

### 2. Audit-First Redesign
Before rewriting code, perform a brief audit:
- **Audit**: Identify visual issues (generic colors, poor spacing, bad typography).
- **Prioritize**: Rank fixes by visual impact.
- **Modernize**: Replace outdated patterns (heavy borders, standard shadows) with modern alternatives (subtle depth, glassmorphism).

### 3. Output Policy (Anti-Lazy)
**ABSOLUTE BANS**:
- Never use placeholders like `// ... rest of code` or `/* implementation here */`.
- Never skip code blocks.
- **MANDATE**: Deliver the full, production-ready file for every request.
- **EXCEPTION**: For files exceeding 1000 lines, provide a targeted "Surgical Update" using `replace` tools, but ensure all logic within the edited scope is complete.

---

## Core Principles

### Visual Hierarchy & Typography
- **Hierarchy**: Guide the eye using size, weight, color, and spacing.
- **Typography**: Prefer modern sans-serif/serif (Inter, Geist, Playfair) over system defaults.
- **Line Length**: 60-75 characters for optimal readability.

### Spacing & Layout (4px Grid)
- **Scale**: Use a base-4 grid (4, 8, 12, 16, 24, 32, 48, 64, 96).
- **Grouping**: Group related elements tightly; separate unrelated sections with generous whitespace.

### Color & Accessibility
- **60-30-10 Rule**: 60% neutral, 30% secondary, 10% accent.
- **Accessibility**: Minimum WCAG AA (4.5:1 contrast). Color must not be the only indicator.

---

## Data Augmentation

This skill can be enhanced with curated design data (palettes, component specs) synced from external repositories.

### Sync Command

```bash
.agents/scripts/sync-remotes.sh --apply
```


### Cache Location
- `UI_UX_CACHE` or `~/.cache/ui-ux-skill`.

---

## Aesthetic Patterns (Examples)

These patterns demonstrate high variance/motion combinations:
- **3D Scroll (Apple-style)**: Interactive motion driven by scroll progress.
- **Premium Minimalist (Linear/Notion)**: Monochrome palettes, 1px borders, high-quality whitespace.
- **Modern Brutalist**: Bold Swiss typography, stark contrast, raw mechanical components.
- **Glassmorphism**: Frosted glass effect using `backdrop-filter: blur(20px)`.

---

## Rules

1. **No Truncation**: Deliver full files only (see Output Policy for exceptions).
2. **Accessibility First**: WCAG AA is the absolute baseline.
3. **Context-Aware**: Respect existing tech stack (Tailwind vs Vanilla CSS).
4. **Audit Before Action**: Briefly state design rationale before making changes.
