# Prompt Package Template

Use this reference when the user wants a deliverable they can paste into Google
Stitch, pencil.dev, v0, or another external AI UI tool.

## Contents

- [Blueprint Template](#blueprint-template)
- [Generation Prompt Template](#generation-prompt-template)
- [Integration Handoff Template](#integration-handoff-template)

## Blueprint Template

Fill this in before writing the generation prompt.

```md
# UI Blueprint

## Product context
- Application type:
- Primary user:
- Primary job to be done:

## Page or flow
- Screen name:
- Entry point:
- Success outcome:

## Required states
- Loading:
- Empty:
- Populated:
- Validation error:
- API/network error:
- Permission-restricted:

## Data model
- Inputs:
- Outputs:
- Filters/sorts:
- Pagination:
- Mutations:

## Layout regions
- Header:
- Navigation:
- Sidebar or filters:
- Main content:
- Secondary panel:
- Footer or global actions:

## Components
- Tables:
- Cards:
- Forms:
- Charts:
- Modals/drawers:
- Toasts/banners:

## Design constraints
- Existing design system:
- Typography direction:
- Color restrictions:
- Motion tolerance:
- Responsive constraints:

## Integration target
- Stack:
- Styling system:
- State/data layer:
- Backend/API source:
```

## Generation Prompt Template

Use this after the blueprint is complete.

```md
Design a [screen/page/flow] for a [application type] used by [primary user].

Goal:
- Help the user accomplish [job to be done].

Layout:
- Create a [sidebar/top-nav/split-pane/grid] layout.
- Include [header/sidebar/filter rail/main content/detail pane/footer].
- Use responsive behavior:
  - Mobile: [stacking rule]
  - Tablet: [intermediate rule]
  - Desktop: [full layout rule]

Components:
- Include [tables/cards/forms/charts/tabs/accordions/modals/toasts].
- The main content must support [sorting/filtering/pagination/inline actions].

States:
- Show designed variants for loading, empty, populated, validation error, and API error.
- Disabled or permission-restricted actions should be visually distinct.

Interaction behavior:
- [drawer/modal/tabs/form] should support [specific interaction].
- Preserve clear primary and secondary actions.

Visual constraints:
- Match this product style: [design system or screenshot guidance].
- Use [token/color/spacing/icon] constraints.
- Avoid placeholder lorem ipsum where specific labels are known.

Export intent:
- The output will be integrated into a real [React/Next.js/Vue/server-template] codebase.
- Favor clear structure, semantic markup, and reusable component regions over decorative complexity.
```

## Integration Handoff Template

Use this when you need to accompany the prompt with a concrete implementation plan.

```md
# Integration Handoff

## Export assumptions
- Tool used:
- Expected export format:
- Known limitations:

## Refactor plan
1. Split export into:
2. Replace static content with:
3. Bind state to:
4. Connect data from:
5. Add missing states:

## QA checklist
- Responsive:
- Accessibility:
- Data binding:
- Empty/error/loading states:
- Visual regressions:
```
