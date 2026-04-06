---
name: ai-ui-generation
description: >
  Workflow for AI-assisted web UI generation and integration. Use whenever the
  user wants to design or scaffold UI with external AI design tools such as
  Google Stitch, Stitch with Google, pencil.dev, v0, Lovable,
  screenshot-to-code tools, or similar systems, then import the result into a
  real codebase. Also use when the user asks to turn wireframes/screenshots
  into app structure, refine exported HTML/CSS, integrate an AI-generated mockup
  into React or Next.js, bind generated UI to real data, or adapt prototype
  output to templating systems or dashboard/internal-tool architectures.
  Activate even when the user does not name the tool explicitly but the task is
  clearly "generate outside the repo, then integrate inside the repo."
---

# AI UI Generation

This skill is for AI-first UI workflows where an external generation tool
produces the first draft and the agent turns that draft into production-ready
application code.

Use this skill with:
- `ui-ux` for taste, accessibility, visual hierarchy, and polish.
- `requirements-driven-dev` when the feature needs PRD/TRD/BDD structure first.

## Trigger Boundary

Use this skill when the workflow crosses a tool boundary:
- the user wants a prompt package for Stitch, pencil.dev, v0, or a similar tool
- the user has screenshots, wireframes, or exports from an external generator
- the repo needs integration work after AI-generated HTML/CSS or component output

Do not use this as the primary skill for ordinary in-repo UI implementation,
restyling, or accessibility cleanup where no external generator is part of the
workflow. In those cases, prefer `ui-ux`.

## Decision Rule

Prefer this as a separate skill instead of folding it into `ui-ux`.

Reason:
- `ui-ux` is a design-quality lens.
- This skill is a tool-and-integration workflow.
- The same workflow applies across Stitch, pencil.dev, v0, Lovable, and future tools.

## Default Deliverables

Produce these artifacts unless the user clearly wants a lighter pass:
- A UI architecture blueprint tied to product behavior.
- A generation prompt for the external tool.
- An integration plan for the target stack.
- Refactored code that replaces placeholders with real structure/state hooks.
- A QA checklist for responsiveness, empty states, errors, and accessibility.

If the external tool is unavailable from the current environment, still produce:
- the blueprint
- the prompt package
- the import/refactor plan
- the review checklist for the user to run after export

## Phase 1: Context Gathering And Blueprinting

Before generating anything, map the UI to product reality.

Capture:
- **Application scope**: dashboard, admin panel, CRM, marketing page, multi-step form, data explorer, portfolio, internal tool.
- **User flows**: first load, auth states, empty states, loading, errors, success, destructive actions, mobile behavior.
- **Data models**: inputs, outputs, table schemas, filters, pagination, mutations, modal payloads, backend response shapes.
- **Design constraints**: existing design system, CSS stack, layout pattern, brand restrictions, typography, motion tolerance.
- **Integration target**: React, Next.js, Vue, server templates, static HTML, Tailwind, CSS modules, vanilla CSS.

Then create a component tree such as:

`AppShell -> Header -> Nav -> Main -> PageSection -> Table/Card/Form -> Modal/Drawer -> Feedback States`

Do not prompt the external tool with vague visual asks alone. Include structure,
states, and data intent.

For reusable output formats, see `references/prompt-package.md`.

## Phase 2: Prompt Synthesis For External Tools

Write prompts that are spatially explicit and behavior-aware.

Prompt must include:
- Page purpose and primary user.
- Exact regions: header, sidebar, filters, content area, detail pane, actions, footer.
- Required components: tables, charts, accordions, tabs, forms, toasts, pagination, drawers.
- State variants: loading skeleton, empty state, populated state, inline validation, API error, disabled actions.
- Responsive rules: mobile stacking, tablet breakpoints, desktop density.
- Constraints from the live product: existing colors, tokens, spacing scale, icon style, component conventions.

When the tool supports references, provide:
- Existing screenshots for consistency.
- Wireframes or annotated mockups.
- Short notes on what must remain stable versus what may be redesigned.

When the user asks for "a Stitch prompt" or equivalent, use the templates in
`references/prompt-package.md` instead of improvising the structure from scratch.

## Phase 3: Iteration Inside The Generation Tool

Use the external tool for layout exploration, not final architecture truth.

Iterate in focused passes:
1. Lock the macro layout.
2. Fix component density and hierarchy.
3. Add stateful regions and variant screens.
4. Improve responsive behavior.
5. Export only after the layout and state model are coherent.

Prefer regional edits like:
- "Convert this section to a responsive 12-column grid."
- "Add sticky table header, row actions, and pagination."
- "Turn this form area into a two-step flow with validation feedback."

## Phase 4: Codebase Integration

Treat exported code as a starting asset, not finished application code.

Required integration steps:
- Import the export into the correct app slice instead of dumping it wholesale.
- Split monolith markup into project-native components.
- Replace inline literals with props, state, tokens, and shared primitives.
- Remove redundant wrappers and one-off CSS where the existing system already has patterns.
- Preserve semantic HTML and accessible labels while refactoring.

For behavior, wire:
- Real fetch/state flows.
- Expand/collapse and modal state.
- Validation and submission lifecycle.
- Sorting, filtering, pagination, and optimistic UI where relevant.
- Empty/loading/error/success states that match backend reality.

## Phase 5: Backend And Runtime Binding

Generated UI often lies about data shape. Verify every surface against the real system.

Check:
- API response fields actually exist.
- Lists have stable keys and pagination metadata.
- Actions map to real endpoints or handlers.
- Permissions/auth states are reflected in the UI.
- Placeholder media, copy, and counts are removed.

If the backend is not implemented yet, leave explicit adapter seams:
- typed view models
- loader/action stubs
- mock fixtures colocated with the component

Be explicit about what is real versus mocked. Generated UI work becomes brittle
when fake data contracts are left ambiguous.

## Phase 6: Responsive QA And Finish

Before handing off, audit:
- Mobile, tablet, desktop layout behavior.
- Overflow and truncation in dense data views.
- Keyboard and screen-reader basics.
- Contrast and focus states.
- Motion restraint and perceived performance.

Generated UIs usually miss edge states. Add them proactively.

Minimum state checklist:
- loading
- empty
- partial data
- validation error
- network/API failure
- success confirmation

## Tool Adapters

This workflow is tool-agnostic. Adapt the same phases to the tool in front of you.

- **Google Stitch**: best for structural prompt + screenshot/wireframe-guided layout generation, then export raw HTML/CSS for refactor.
- **pencil.dev**: use for rapid exploration and iteration, but still convert the result into project-native components.
- **Other AI UI tools**: keep the workflow constant and swap only the prompt/export details.

Do not let tool-specific convenience override project architecture.

## Output Rules

- Always distinguish generated prototype code from production-integrated code.
- Prefer narrow, reviewable integration diffs over dumping the full export untouched.
- State assumptions when backend contracts or design tokens are guessed.
- If the user only wants the prompt/blueprint, stop before code integration and hand off the exact prompt plus constraints.

## Related Skills

- **`ui-ux`**: Use for visual quality, accessibility, hierarchy, layout polish, and taste decisions.
- **`requirements-driven-dev`**: Use when the UI work should start from PRD/TRD/behavior specs before generation or integration.
