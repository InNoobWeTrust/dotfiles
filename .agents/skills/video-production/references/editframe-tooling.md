# Editframe Tooling Reference

Setup and workflow reference for Editframe's development tools: dev server, API, CLI, project scaffolding, editor GUI, and webhooks. Load this reference during project setup or when configuring the Editframe toolchain.

**Sources**:
- [editframe.com/skills/dev-server.md](https://editframe.com/skills/dev-server.md)
- [editframe.com/skills/editframe-api.md](https://editframe.com/skills/editframe-api.md)
- [editframe.com/skills/editframe-create.md](https://editframe.com/skills/editframe-create.md)
- [editframe.com/skills/editor-gui.md](https://editframe.com/skills/editor-gui.md)
- [editframe.com/skills/webhooks.md](https://editframe.com/skills/webhooks.md)

All MIT License · Author: editframe

---

## When To Use

- Setting up a new Editframe project from a template
- Configuring local development with on-demand transcoding
- Integrating Editframe's cloud rendering API into a workflow
- Building a custom video editing interface
- Handling render completion webhooks

---

## Editframe Create — Project Scaffolding

Start a new project from a template:
```bash
npm create @editframe
```

Generates project structure, installs dependencies, and sets up composition tooling to start immediately.

---

## Dev Server — Local Development

Local dev server adds on-demand video transcoding, local asset serving, and URL signing with no cloud dependency.

**Setup options**:
- Vite plugin
- Next.js plugin
- Framework-agnostic `dev-server` package

**Key features**:
- On-demand transcoding for preview
- Local asset serving
- URL signing for authenticated media

---

## Editframe API — Cloud Rendering SDK

JavaScript/TypeScript SDK and CLI for Editframe's video rendering API.

**Capabilities**:
- Create renders
- Upload and process video, image, and caption files
- Transcribe audio (WhisperX, compatible with `ef-captions`)
- Sign URLs for browser playback
- Render or preview compositions from the command line

**CLI commands**:
- `editframe render` — server-side composition rendering
- `editframe transcribe` — audio transcription

---

## Editor GUI — Custom Video Editing Interface

Build video editing interfaces with Editframe's GUI components.

**Available components**:
- Timeline
- Scrubber
- Canvas
- Preview
- Playback controls
- Volume control
- Mute button
- Fullscreen toggle
- Picture-in-picture toggle
- Resolution picker
- Trim handle
- Hierarchy panel

**Export**: Use `ef-workbench`'s `exportVideo()` method for in-app export — clones, renders, and disposes offscreen copy automatically.

---

## Webhooks — Render Notifications

Webhook notifications for render completion and file processing events.

**Setup**:
1. Configure an endpoint
2. Verify HMAC signatures
3. Handle real-time status payloads

---

## Workflow Integration

### Local Development Flow
```bash
# 1. Create project
npm create @editframe

# 2. Install dependencies
npm install

# 3. Start dev server (local transcoding + asset serving)
npm run dev

# 4. Preview in browser with instant rendering
```

### Cloud Rendering Flow
```bash
# 1. Upload assets
# 2. Create render job via API
# 3. Receive webhook on completion
# 4. Sign URL for playback
```

### In-App Export Flow
```javascript
// Use ef-workbench's exportVideo() for custom export actions
// It handles clone → render → dispose automatically
```

---

## Package Entry Points

| Import | Environment | Contains |
|---|---|---|
| `@editframe/elements` | Browser | All custom elements, canvas/WebCodecs rendering |
| `@editframe/elements/server` | Browser, Node, SSR | Types only, plus `getRenderInfo()` (browser-only at runtime) |
| `@editframe/elements/gui` | Browser | Editor GUI custom elements |
| `@editframe/elements/styles.css`, `/theme.css` | Browser | Base + theme styles |
| `@editframe/react` | Browser | React composition + GUI components, hooks |
| `@editframe/react/server` | Browser, Node, SSR | Composition components only, no hooks/GUI |
| `@editframe/react/r3f` | Browser | `CompositionCanvas`, `OffscreenCompositionCanvas`, `useCompositionTime` |

---

## React Hooks

| Hook | Purpose |
|---|---|
| `useTimingInfo()` | Attach ref to Timegroup, re-renders with `{ ownCurrentTime, duration, percentComplete }` |
| `useMediaInfo(ref)` | Returns `{ readyState, duration, currentTime, paused }` for Video/Audio |
| `usePanZoomTransform(ref)` | Returns transform state and helper methods for PanZoom |
| `useRenderData<T>()` | Read custom render data injected via `window.EF_RENDER_DATA` |
| `usePlayback(target)` | Subscribe to play, pause, seek, volume state |

---

## Configuration Element

`ef-configuration` / `<Configuration>` is opt-in infrastructure for production deployments:
- `api-host` / `apiHost`: Base URL for file/asset requests
- `signing-url` / `signingURL`: URL for signed bearer tokens (authenticated cross-origin media)
- `image-proxy` / `imageProxy`: Controls cross-origin image proxying ("auto" | "none")

Skip it for compositions using only local files with no cross-origin or authenticated media.

---

## See Also

- [editframe.com/skills/dev-server.md](https://editframe.com/skills/dev-server.md) — Dev server setup
- [editframe.com/skills/editframe-api.md](https://editframe.com/skills/editframe-api.md) — API and CLI reference
- [editframe.com/skills/editframe-create.md](https://editframe.com/skills/editframe-create.md) — Project scaffolding
- [editframe.com/skills/editor-gui.md](https://editframe.com/skills/editor-gui.md) — GUI component reference
- [editframe.com/skills/webhooks.md](https://editframe.com/skills/webhooks.md) — Webhook configuration
- `editframe-composition.md` — Editframe composition API and element reference
- `editframe-motion-design.md` — Motion design principles mapped to Editframe
- `editframe-brand-video.md` — Brand video generation pipeline
