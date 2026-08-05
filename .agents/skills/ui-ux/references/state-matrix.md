# 10-State UI Matrix

This reference defines the 10 core states every interactive UI component must account for. Load during Phase 4 (State Matrix) of the ui-ux skill. Not every component needs all 10 states — use the applicability guide below.

## The 10 States

| # | State | Trigger | Visual Spec | Behavioral Spec | A11y Requirement |
|---|---|---|---|---|---|
| 1 | Default | Rest state / page load | Baseline tokens for color, elevation, layout | Interactive elements respond to input | Semantic HTML, proper roles |
| 2 | Hover | Cursor enters boundary | Background shifts 1 step in brightness, cursor: pointer | Tooltip may appear after 500ms delay | Must not be sole interaction method (touch devices) |
| 3 | Active | Mouse down / touch press | `transform: scale(0.98)`, shadow compresses | Visual feedback for press action | Active state must be visually distinct |
| 4 | Focus Visible | Keyboard Tab navigation | 2px focus ring (`--color-focus-ring`) with 2px offset | Focus follows logical DOM order | WCAG 2.4.7 — focus must be visible, high contrast |
| 5 | Disabled | Feature unavailable / permission gated | `opacity: 0.5`, `cursor: not-allowed` | `pointer-events: none`, no click handlers fire | `aria-disabled="true"`, explain WHY disabled if possible |
| 6 | Loading | Async operation pending | Skeleton pulse for known dimensions, spinner for unknown | Interactions disabled during load | `aria-busy="true"`, `aria-live="polite"` |
| 7 | Empty | Zero data returned | Illustration + descriptive text + primary CTA | Distinguish first-use empty vs. filter-zero-results | Meaningful alt text on illustration |
| 8 | Error | Validation failure / network error | Red border + error icon + recovery text | Inline errors near the field, not just toast | `aria-invalid="true"`, `aria-describedby` linking to error message |
| 9 | Success | Operation completed | Green checkmark animation / confirmation banner | Toast auto-dismisses in 4s, or persistent until acknowledged | `aria-live="polite"` for transient, `role="alert"` for critical |
| 10 | Permission/Locked | User role lacks access | Blur content or lock icon badge | Show upgrade/login CTA, don't just hide the feature | Explain what access is needed |

## Applicability Guide

Not every component needs all 10 states. Below is a mapping of component types to applicable states:

| Component Type | Must Have | Should Have | Optional |
|---|---|---|---|
| Button / CTA | Default, Hover, Active, Focus, Disabled | Loading (if async) | - |
| Form Input | Default, Focus, Disabled, Error | Hover, Success (validation) | - |
| Data Table | Default, Loading, Empty, Error | Hover (rows), Focus | Permission |
| Card / Tile | Default, Hover | Loading (skeleton), Empty | Active, Permission |
| Modal / Dialog | Default, Loading | Error, Success | - |
| Navigation Item | Default, Hover, Active, Focus | Disabled | Permission |
| Toggle / Switch | Default, Hover, Active, Focus, Disabled | - | - |
| Toast / Banner | Success, Error | - | - |
| Page / View | Default, Loading, Empty, Error | Permission | - |
| Skeleton Placeholder | Loading | - | - |

## Loading Strategy Decision Tree

A guide for choosing the right loading pattern:
- **Known dimensions** (table rows, cards, text blocks) → Skeleton screens with pulse animation
- **Unknown dimensions** (first load, search results) → Centered spinner or progress bar
- **Partial data available** → Progressive/streaming render (show what you have)
- **Long operations** (>3s) → Progress indicator with percentage or step count
- **Background operations** → No blocking UI; show completion toast

## Motion Tokens

Standard motion tokens for state transitions (CSS custom properties):

```css
:root {
  /* Durations */
  --motion-duration-fast: 150ms;   /* Micro-interactions: buttons, toggles */
  --motion-duration-base: 250ms;   /* Component transitions: dropdowns, modals */
  --motion-duration-slow: 400ms;   /* Page transitions, expansion panels */

  /* Easing */
  --motion-ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);    /* Entering elements */
  --motion-ease-in: cubic-bezier(0.4, 0.0, 1, 1);        /* Exiting elements */
  --motion-ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);  /* Moving within */
}

/* Reduced motion guardrail — MANDATORY */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Empty State Design Patterns

Three types of empty states:
1. **First-use / Onboarding**: Welcoming illustration + explanation + primary CTA to get started
2. **Filter/search zero results**: Explain why empty + suggest clearing filters or broadening search
3. **Cleared / completed**: Celebratory or neutral confirmation that the inbox/queue is empty

## Error Recovery UX Patterns

For each error type, document recovery approach:
- **Validation error**: Inline, near the field, explain what's wrong and how to fix it
- **Network error**: Banner with retry button, auto-retry after 5s for idempotent operations
- **Permission error**: Explain what access is needed and link to request/upgrade flow
- **Server error (500)**: Apologize, suggest retry, offer alternative path or support contact
- **Timeout**: Show last known good state + retry, or partial results with "load more"
