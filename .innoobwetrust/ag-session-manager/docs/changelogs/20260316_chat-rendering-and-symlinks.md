# Changelog: AG Session Manager v1.2.0

> **Date**: 2026-03-16
> **Type**: feature, bugfix
> **Spec**: docs/specs/chat-interaction.md (v2), docs/specs/directory-browser.md (v2), docs/trds/ag-session-manager.md (v3)

## Summary

Three areas of improvement: scrollable chat rendering via DOM snapshots with dark
mode CSS, scroll synchronization between phone and desktop, and cross-volume
symlink support in the directory browser.

## Changes

### Modified Files

- **`lib/cdp-bridge.js`**
  - `captureSnapshot()`: Replaced `Page.captureScreenshot` (pixel image) with DOM
    snapshot approach (clone chat DOM, strip input area, fix inline elements,
    convert local images to base64, extract CSS). Returns `{html, css, scrollInfo, hash}`.
  - `remoteScroll(scrollPercent)`: New method — syncs phone scroll position back to
    the desktop Antigravity window via CDP `Runtime.evaluate`.
  - `startScreencast()` / `stopScreencast()`: New methods — `Page.startScreencast` /
    `Page.stopScreencast` with frame ACK and `onFrame` callback (available as
    alternative transport).

- **`server.js`**
  - New endpoint: `POST /api/sessions/:id/scroll` — receives `{scrollPercent}` and
    calls `bridge.remoteScroll()`.
  - WebSocket: `subscribe`/`unsubscribe` message handling for screencast streaming.
  - `BROWSE_ROOTS` parsing: added `$HOME`, `${HOME}`, `$USER` expansion (dotenv
    compatibility).

- **`lib/dir-browser.js`**
  - `_validatePath()`: Accept path if **either** the logical path (before symlink
    resolution) **or** the real path is under a root. Enables cross-volume symlinks.
  - `list()`: Use `fs.statSync` (follows symlinks) instead of `fs.lstatSync` for
    entry type detection. Broken symlinks fall back to `lstatSync`. Entries include
    `isSymlink: true` flag.

- **`public/js/app.js`**
  - Snapshot rendering: inject HTML+CSS with dark mode overrides (from reference
    project) instead of rendering a static screenshot image.
  - Scroll sync: `onscroll` handler sends scroll position to desktop via `/scroll` API.
  - Smart auto-scroll: auto-scroll to bottom only if user was near bottom; preserve
    position if user scrolled up; percentage-based restore during active scrolling.
  - Mobile copy buttons on multi-line code blocks.

- **`.env`**
  - Fixed `BROWSE_ROOTS` to use `~` instead of `$HOME` (dotenv doesn't expand
    shell variables).

### Revised Documents

- **`docs/specs/chat-interaction.md`** → v2: scroll sync, screencast, dark mode, revised validation
- **`docs/specs/directory-browser.md`** → v2: cross-volume symlinks, env expansion, symlink detection
- **`docs/trds/ag-session-manager.md`** → v3: scroll API, screencast, directory browser revisions

## Verification

- DOM snapshot renders scrollable chat content on phone
- Scroll position syncs from phone to desktop Antigravity window
- Dark mode CSS overrides produce readable text on dark background
- Copy buttons appear on multi-line code blocks
- Symlinks to other volumes (/Volumes/ExternalSSD) are navigable
- Symlinked directories display as `dir` type (not `file`)
- `BROWSE_ROOTS=~,/Volumes/SS850Evo/Developer` works in `.env`
