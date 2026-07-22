# DESIGN.md Format Specification

Reference for the Google Labs DESIGN.md standard — the open, plain-text format for communicating visual identity to AI coding agents and human developers.

Upstream: https://github.com/google-labs-code/design.md

---

## Structure

A `DESIGN.md` file has two layers:

1. **YAML frontmatter** — Machine-readable design tokens, delimited by `---` fences at the top of the file.
2. **Markdown body** — Human-readable design rationale organized into `##` sections.

The tokens are the **normative values**. The prose provides context for *why* those values exist and *how* to apply them. Prose may use descriptive color names (e.g. "Midnight Forest Green") that correspond to systematic token names (e.g. `primary`).

---

## Token Schema

```yaml
---
version: alpha                # optional, current: "alpha"
name: <string>                # required
description: <string>         # optional
colors:
  <token-name>: <Color>
typography:
  <token-name>: <Typography>
rounded:
  <scale-level>: <Dimension>
spacing:
  <scale-level>: <Dimension | number>
components:
  <component-name>:
    <property>: <string | token reference>
---
```

The `<scale-level>` placeholder represents a named level in a sizing or spacing scale. Common level names: `xs`, `sm`, `md`, `lg`, `xl`, `full`. Any descriptive string key is valid.

### Token Types

| Type | Format | Examples |
|:-----|:-------|:--------|
| **Color** | Any valid CSS color string | `"#1A1C1E"`, `"oklch(62% 0.18 250)"`, `"rgb(26, 28, 30)"`, `"color-mix(in srgb, ...)"` |
| **Dimension** | Number + unit suffix (`px`, `em`, `rem`) | `48px`, `-0.02em`, `1.5rem` |
| **Token Reference** | `{path.to.token}` | `{colors.primary}`, `{rounded.md}`, `{typography.label-md}` |
| **Typography** | Object with font properties (see below) | — |

**Color details**: Supported formats include hex (`#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`), named colors, functional (`rgb()`, `rgba()`, `hsl()`, `hsla()`, `hwb()`), wide-gamut (`oklch()`, `oklab()`, `lch()`, `lab()`), and mixing (`color-mix(in srgb, ...)`). All values are internally converted to sRGB for WCAG contrast checking. The original format is preserved for display and export. **Hex (`#RRGGBB`) is the recommended default** for simplicity and broad tooling support.

**Typography properties**:
- `fontFamily` (string) — required
- `fontSize` (Dimension) — required
- `fontWeight` (number) — e.g. `400`, `700`. Bare number or quoted string both valid in YAML.
- `lineHeight` (Dimension | number) — unitless number = multiplier of fontSize (recommended CSS practice).
- `letterSpacing` (Dimension)
- `fontFeature` (string) — maps to CSS `font-feature-settings`
- `fontVariation` (string) — maps to CSS `font-variation-settings`

**Token References**: Must be wrapped in curly braces containing an object path to another value in the YAML tree. For most token groups, the reference must point to a **primitive value** (e.g. `colors.primary`), not a group. Within `components`, references to **composite values** (e.g. `{typography.label-md}`) are permitted.

---

## Prose Sections (Canonical Order)

Sections use `##` headings. They can be omitted, but those present **must appear in this order**:

| # | Section | Aliases | Purpose |
|:--|:--------|:--------|:--------|
| 1 | **Overview** | Brand & Style | Brand personality, target audience, emotional tone, high-level style guidance |
| 2 | **Colors** | — | Palette roles and usage guidance. At minimum, define `primary`. |
| 3 | **Typography** | — | Type hierarchy, font pairing rationale, scale |
| 4 | **Layout** | Layout & Spacing | Grid system, spacing scales, responsive breakpoints |
| 5 | **Elevation & Depth** | Elevation | Shadows, borders, glassmorphism, layering hierarchy |
| 6 | **Shapes** | — | Corner radii, border treatments, iconographic style |
| 7 | **Components** | — | Key UI patterns (buttons, cards, inputs, navigation) |
| 8 | **Do's and Don'ts** | — | Explicit constraints, forbidden patterns |

An optional `<h1>` heading may appear for document titling but is not parsed as a section.

---

## Component Tokens

Components map a name to a group of sub-token properties:

```yaml
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 12px 24px
  button-primary-hover:
    backgroundColor: "{colors.tertiary-container}"
```

**Valid component properties**: `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`.

Variants (hover, active, pressed, disabled) are expressed as **separate component entries** with a related key name (e.g. `button-primary-hover`).

---

## Consumer Behavior for Unknown Content

| Scenario | Behavior |
|:---------|:---------|
| Unknown section heading | Preserve; do not error |
| Unknown color token name | Accept if value is valid CSS color |
| Unknown component property | Preserve; do not error |
| Unresolvable token reference | Error — report the broken path |

---

## Tooling & Validation

### Lint

```bash
npx @google/design.md lint DESIGN.md
```

Checks:
- Token schema validity and YAML structure
- Token reference resolution (detects broken `{path.to.token}` references)
- WCAG contrast ratios for color combinations
- Structural findings (missing required fields, section order)

Output: structured JSON that agents can parse and act on.

```json
{
  "findings": [
    {
      "severity": "warning",
      "path": "components.button-primary",
      "message": "textColor (#ffffff) on backgroundColor (#1A1C1E) has contrast ratio 15.42:1 — passes WCAG AA."
    }
  ],
  "summary": { "errors": 0, "warnings": 1, "info": 1 }
}
```

### Diff

```bash
npx @google/design.md diff DESIGN.md DESIGN-v2.md
```

Detects added, removed, or modified tokens and prose regressions between versions:

```json
{
  "tokens": {
    "colors": { "added": ["accent"], "removed": [], "modified": ["tertiary"] },
    "typography": { "added": [], "removed": [], "modified": [] }
  },
  "regression": false
}
```

---

## Implementation Mapping

When implementing UI code from `DESIGN.md` tokens:

### CSS Custom Properties (Vanilla CSS)
```css
:root {
  --color-primary: #1a1c1e;
  --color-secondary: #6c7278;
  --color-tertiary: #b8422e;
  --color-neutral: #f7f5f2;
  --font-heading: 'Public Sans', sans-serif;
  --radius-sm: 4px;
  --radius-md: 8px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}
```

### Tailwind CSS Config
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#1a1c1e',
        secondary: '#6c7278',
        tertiary: '#b8422e',
        neutral: '#f7f5f2',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
      },
      spacing: {
        sm: '8px',
        md: '16px',
        lg: '24px',
      },
    },
  },
};
```

### Component Application
Apply component-level token references directly to styled elements. All styling must reference `DESIGN.md` tokens or derived CSS variables — zero hardcoded magic numbers or rogue colors in component files.

---

## Complete Example

```markdown
---
version: alpha
name: Heritage
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  tertiary: "#B8422E"
  neutral: "#F7F5F2"
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  body-md:
    fontFamily: Public Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 0.75rem
    fontWeight: 500
    letterSpacing: 0.08em
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.sm}"
    padding: 12px 24px
  button-primary-hover:
    backgroundColor: "{colors.primary}"
---

## Overview

Architectural Minimalism meets Journalistic Gravitas. The UI evokes a
premium matte finish — a high-end broadsheet or contemporary gallery.

## Colors

The palette is rooted in high-contrast neutrals and a single accent color.

- **Primary (#1A1C1E):** Deep ink for headlines and core text.
- **Secondary (#6C7278):** Sophisticated slate for borders, captions, metadata.
- **Tertiary (#B8422E):** "Boston Clay" — the sole driver for interaction.
- **Neutral (#F7F5F2):** Warm limestone foundation, softer than pure white.

## Typography

Two type families create a clear hierarchy: Public Sans for structured
content, Space Grotesk for labels and UI controls.

## Do's and Don'ts

- **Do** use the tertiary color exclusively for interactive elements.
- **Don't** introduce additional accent colors — the single-accent constraint
  is the defining characteristic of this system.
```
