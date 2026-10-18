---
version: alpha
name: Design Review Studio
description: Official Carbon components and themes for studio and preview
design-system: "@carbon/styles 1.117.0"
themes: [white, g100]
---

## Overview
Use the actual pinned IBM Carbon styles for studio chrome as well as generated content. Hono renders semantic Carbon HTML patterns; this does not claim a React-hydrated host. The canvas stays primary, with initially collapsed left revision history. No custom widget skin, bespoke radii, decorative panel shadows or recreated typography. Official Carbon Sass themes and component styles supply visual values.

## Colors
Emit official Carbon White and g100 themes using Carbon's Sass theme mixin, scoped to the studio document marker. System follows native prefers-color-scheme, including changes while open; explicit Light/White or Dark/g100 overrides it. The labeled System/Light/Dark select changes only the document attribute, without storage or JavaScript media detection. Consume --cds-* variables directly, not copied hexadecimal palettes. The preview lacks the studio marker and retains its independently selected White theme.

Generated content uses IBM Carbon's stock White theme and actual Carbon components, not a custom Carbon-like palette. Official Sass emits the White tokens; the isolated document uses matching --cds-background/--cds-text-primary and a light native color scheme, independent of host theme or browser preference. Notifications use the native lowContrast variant. The approved carbon-white-charts-1 catalog adds official Carbon Charts line and grouped-bar adapters with its stock White theme, native series palette and legend. Its export toolbar is disabled; no external assets, custom chart colors or fake SVG substitute. Existing processes are not silently migrated. Only layout glue is application-specific; no theme customization, remote fonts or browser fetches. Runtime/browser proof for this chart addition is recorded separately, not implied by this specification.

## Typography
Use official Carbon typography/type-style mixins and spacing tokens. Font-face emission stays disabled, so Carbon's built-in fallback stack works without external font requests. Do not customize tracking, heading weights or component type sizes.

## Layout
Root dashboard: reuse stock Carbon typography, tiles and Open board/Refresh links in a centered readable-width, vertically stacked layout. Show escaped title, optional caller-supplied chat label, acquisition time, short unique board id and revision; no source/transcript/event preview. On mobile stack actions below text with no horizontal scrolling. Empty state is read-only; no second chat, release button or automatic page refresh. Root uses native System theme and links to the unchanged canvas workspace.

Canvas-first workspace: one slim top bar with history toggle, session title, compact visible revision/connection status and theme mode selector. The canvas fills the remaining viewport. A 16rem LEFT revision sidebar is hidden initially; opening it allocates space on desktop/tablet. Below 768px it is a non-modal left overlay capped at min(16rem, viewport minus 3rem), independently scrollable, with a close button. Escape closes and returns focus to the toggle. No discussion/composer, technical log, right panel, duplicate preview toolbar or footer wall of metadata. Sessions still last until release or MCP shutdown; put the short ownership explanation inside optional history, not permanent chrome.

Header target 3.5rem; canvas outer gutters at most .5rem. Keep body text and 44px targets. History closed must release its width entirely; history open must not introduce host horizontal scrolling. The native revision selector and retained notes (number, existing label, advisory render status) live only in history. Keep current revision and important stale/render/report/release errors visible without opening it. No new notes editor or persistence. Measure actual canvas and chart geometry at 1440/820/390 rather than claim a layout percentage from source alone.

## Elevation & Depth
Use official Carbon surfaces/borders. No custom panel shadows, glow, gradients or decorative animation.

## Shapes
Use Carbon's stock square component shapes and official focus/hover/disabled states. Do not override them with generic button/select CSS. Retain accessible control names and stock large controls instead of shrinking them.

## Components
Keep title/status/visible/badge/revisions/preview/empty-state IDs. Replace theme-toggle and its pressed semantics with theme-mode (native select, associated Theme label, values system/light/dark, system selected initially). History contract: history-toggle (button, aria-controls=revision-sidebar, aria-expanded=false initially), revision-sidebar (aside, hidden initially), history-close (button), revision-notes (retained labels/advisory status), report-status (polite error status, hidden when empty). No browser chat/composer/logs. Empty-state remains OUTSIDE preview because mounting replaces preview children; hidden revision-zero iframe still loads for catalog bootstrap and stays out of keyboard order. User text uses textContent, never HTML. No backend event-schema/API changes; mock/render reports remain revision-bound and agent-inspectable. Host name/routes/catalog identity and iframe security remain unchanged.

## Do's and Don'ts
- **Do** visibly label pinned and disconnected drafts.
- **Do** keep optional revision notes on the left and discuss changes in the existing agent conversation.
- **Do not** infer literal whiteboard colors from the MCP name, or copy a reference application's branding.
- **Do not** animate the host or use external fonts/assets. Small static inline SVG shell icons may use currentColor.
- **Do not** call a browser observation validation or approval.
