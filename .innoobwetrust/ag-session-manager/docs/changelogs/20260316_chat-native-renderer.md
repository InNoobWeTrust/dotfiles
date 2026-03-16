# Changelog: Native Chat Renderer

**Spec**: docs/specs/chat-interaction.md
**Status**: in-progress

---

## Session: 2026-03-16T03:45

### Summary

Updated the full requirements cascade (PRD → TRD → BDD spec) to bring structured
chat rendering (V2) into active scope. Ran adversarial challenge on the spec.

### Changes

- Modified: `docs/prds/ag-session-manager.md` — v3 → v4, added G6 (native chat rendering)
- Modified: `docs/trds/ag-session-manager.md` — v3 → v4, added `extractMessages()` and `/messages` endpoint
- Modified: `docs/specs/chat-interaction.md` — v2 → v3, 7 new scenarios, 2 challenge revisions

### Decisions

- Structured extraction approach chosen over DOM snapshot for chat rendering — typed message blocks give full control over styling and fix broken images/subagent rendering
- V1 snapshot endpoint retained as API but client no longer uses it
- Image size cap (500KB) to prevent response bloat from base64-encoded screenshots
- `extractionFailed` flag for graceful degradation when DOM structure changes

### Verification Status

- Spec adversarial challenge: 7 raised, 5 author-won, 2 challenger-won (revisions applied)

---

## Session: 2026-03-16T03:56

### Summary

Executed spec-driven implementation and verified all BDD scenarios. Applied both
challenge revisions (image size cap, extraction failure flag) across the full stack.

### Changes

- Modified: `lib/cdp-bridge.js` — Added `MAX_IMAGE_SIZE_BYTES` (500KB) cap with placeholder for oversized images, `extractionFailed` flag when extraction returns 0 messages but page has content
- Modified: `public/js/app.js` — Added extraction failure banner rendering, oversized image placeholder with icon, updated `createImageBlock()` signature
- Modified: `public/css/style.css` — Added `.chat-extraction-failed` banner styles and `.chat-image-placeholder` dashed-border styles

### Decisions

- Image size check uses blob.size for fetched images and string length * 0.73 for existing data URIs (accounting for base64 overhead)
- Extraction failure banner uses warning yellow color (#eab308) to distinguish from error states

### Verification Status

- Syntax checks: all 3 source files pass `node -c`
- CDPBridge module: loads correctly, `extractMessages` method confirmed
- Server routes: /messages ✅, /snapshot ✅, extractMessages() call ✅, 503 handling ✅
- Client spec compliance: 13/13 grep checks passed (renderMessages, extractionFailed, image placeholder, lightbox, clipboard, smart scroll, scroll lock, 1s polling, hash detection, CSS components)
