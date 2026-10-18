# IBM Carbon — Default Design System

> Official docs: <https://carbondesignsystem.com>  
> `@carbon/react` (components + styles + icons): <https://carbondesignsystem.com/developing/frameworks/react/>  
> Themes reference: <https://carbondesignsystem.com/building-blocks/foundations/themes/>  
> Charts (`@carbon/charts-react`): <https://carbon-design-system.github.io/carbon-charts/>

## When to use

IBM Carbon is the ready-made starting default for projects without an established design system or committed DESIGN.md tokens. Its components, stock themes and tokens avoid a new styling exercise when dedicated requirements do not exist. Use the stock **White** theme after verifying framework compatibility. Accessibility features support accessible composition; they do not guarantee application-level WCAG AA compliance.

## Packages

| Package | Purpose |
|---|---|
| `@carbon/react` | Official React components, styles and icons — White theme preset by default |
| `@carbon/charts-react` | Data visualization; separate package — add only if charts are needed |

Verify actual installed versions, exports, style tooling and peerDependencies. Follow the project's dependency-resolution conventions and installation authority; missing dependencies do not authorize an install or a Carbon-look imitation.

## Themes

With Carbon's official styles loaded, components use **White** by default. Four built-in themes:

| Theme | Use case |
|---|---|
| **White** (default) | Light, clean, minimalist stock default |
| Gray 10 (`g10`) | Slight off-white background variant |
| Gray 90 (`g90`) | Dark UI |
| Gray 100 (`g100`) | Dark UI with the darkest background |

Keep White unless requirements call for another stock theme. Follow the official theme instructions for the selected package/version; do not invent Sass configuration or runtime selectors.

## Compatibility gating — verify before adopting

1. **Framework**: `@carbon/react` is React-only. For another framework, verify an actual compatible binding, its maintenance/support tier and its styling contract. Community bindings are not equivalent to first-party support. If unsuitable, select a project-compatible alternative.
2. **Styles**: Verify the official style entry points and required Sass/build tooling for the selected version. Do not assume a prebuilt CSS bundle, remote assets or bundler configuration are available.
3. **Peer dependencies**: Verify `react`/`react-dom` version compatibility per the `@carbon/react` peerDependencies before recommending.
4. **Existing system**: Active design system or committed DESIGN.md tokens → preserve it unless migration is explicitly authorized. Carbon is a starting default, not an automatic migration.
5. **Brand / dedicated styling**: Committed brand requirements, custom component catalogs, or platform constraints trigger alternatives — explain the reason, do not default silently.

## Phase 0 routing decision

```
Existing project system? → Reuse it unless migration is authorized.
Otherwise, dedicated brand/platform/style constraints? → Compare suitable alternatives.
Otherwise, compatible Carbon implementation and style tooling? → Use stock White.
Otherwise → Explain the incompatibility; select a project-compatible alternative.
```

## What Carbon White provides out of the box

- 40+ production components: Button, Modal, DataTable, Dropdown, TextInput, Tabs, Tile, Notification, UI shell, and more
- Design tokens: color (`$background`, `$text-primary`, `$layer-01`, …), spacing, typography
- 2× grid system (16-column)
- Icons via the `@carbon/react/icons` entry point
- Accessibility features to verify in the actual composed UI, not automatic WCAG compliance

For generative UI, register the actual approved components in the renderer and generate its matching catalog/prompt. A stock OpenUI catalog does not become Carbon by recoloring it. Add official Carbon Charts only when needed and compatible; do not assume charts are included in `@carbon/react`.

## Stop conditions

- Missing package, peer or style capability → report the gap; resolve only within project conventions and authorized scope.
- Do not handcraft Carbon-look widgets — use official catalog components only.
- Do not recolor incompatible catalog entries — use official tokens and themes only.
- Do not override an existing DESIGN.md or migrate an active design system merely because Carbon is the default.
- Do not use `@carbon/react` in Vue, native, or Web Components projects.

Lifecycle: **Prototype**, 2026-10-18. Review routing overhead and real component use after 1–2 uses or by 2027-01-18; source checks do not prove future agent adherence.
