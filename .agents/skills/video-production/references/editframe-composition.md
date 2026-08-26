# Editframe Composition Reference

Editframe composition API for building video scenes with HTML web components or React. Load this reference during Step 5 (Synthesis & Rendering) when the project uses Editframe as the rendering engine.

**Source**: [editframe.com/skills/composition.md](https://editframe.com/skills/composition.md) · MIT License · Author: editframe

---

## When to Use

- Project uses Editframe (`@editframe/elements`, `@editframe/react`)
- Building multi-scene video compositions with HTML web components or React
- Need to render compositions to MP4 via browser export, CLI, or cloud API

---

## Core Model

Every element is **temporal** — it carries `duration` and `ownCurrentTime`. Only the root element's `currentTime` accepts a direct write; all others derive from it.

### Timegroups & Sequencing

| Mode | Duration | Children |
|---|---|---|
| `fixed` | The `duration` attribute | Positioned at own `offset`, in parallel |
| `sequence` | Sum of children's durations minus `overlap` | Back-to-back; only active visible |
| `contain` (default) | Furthest extent of `offset + duration` | Parallel, each at own `offset` |
| `fit` | Inherits nearest ancestor's duration | Parallel, each at own `offset` |

**Decision rule**: Does the media set this element's duration, or do you set it?
- **Media-driven** → leave mode unset (defaults to `contain`), length comes from content
- **Editorial choice** → `fixed duration="..."`
- **Inherited** → `fit` mode tracks ancestor

### Transitions

Built from `overlap` plus CSS. Editframe sets two CSS custom properties on overlapping children:
- `--ef-transition-duration` — overlap time in seconds
- `--ef-transition-out-start` — when exit animation should start

Drive animations with WAAPI or CSS keyed off these properties.

### Time-Based CSS Variables

Every temporal element publishes:
- `--ef-duration` — element's own duration as CSS time
- `--ef-progress` — 0 to 1, updates every frame

`ef-text` segments also get `--ef-index`, `--ef-word-index`, `--ef-stagger-offset`, `--ef-seed`.

### Scripting

**Never use `requestAnimationFrame`** — browsers throttle it in backgrounded tabs; headless export always runs backgrounded.

Use instead:
- `timegroup.initializer = (timegroup) => { ... }` — runs once per instance, synchronous
- `timegroup.addFrameTask((info) => { ... })` — per-frame callback with `{ ownCurrentTime, currentTime, duration, percentComplete, element }`

In React: `initializer` / `onFrame` props on `<Timegroup>`.

---

## Media Elements

| Element | Purpose |
|---|---|
| `ef-video` / `<Video>` | Video clip with trim, volume, FFT |
| `ef-audio` / `<Audio>` | Audio with volume, trim, FFT |
| `ef-image` / `<Image>` | Static image temporal leaf |
| `ef-text` / `<Text>` | Animated text with split (word/char/line) + stagger |
| `ef-captions` / `<Captions>` | Synchronized captions with word-level highlighting |
| `ef-waveform` / `<Waveform>` | Audio-reactive visualization |
| `ef-surface` / `<Surface>` | Mirrors another element's pixels onto canvas |
| `ef-motionblur` / `<Motionblur>` | Motion blur on child |
| `ef-pan-zoom` / `<PanZoom>` | Pan and zoom viewport |

---

## Rendering Paths

| Path | Method |
|---|---|
| Browser export | `renderTimegroupToVideo(timegroup, options)` — WebCodecs, same seek/render pipeline |
| CLI / Cloud | `editframe render` — runs through `window.EF_RENDER` |
| In-app export | `ef-workbench`'s `exportVideo()` — clones, renders, disposes offscreen |

**React requirement**: Every composition that renders or exports needs `<TimelineRoot>` wrapper — it registers a clone factory for offscreen rendering.

---

## Best Practices

### Scene Structure
```
Timegroup (mode="contain")        — composition root
  ├─ Timegroup (mode="sequence")  — beats back-to-back
  │    ├─ SceneA (mode="fixed")
  │    ├─ SceneB (mode="fixed")
  │    └─ ...
  ├─ Ambient overlays             — grain, particles; span every scene
  └─ Audio bed                    — sibling of sequence, never a child
```

### Animation Hierarchy (CSS first)
1. One-shot enter/exit → reusable reveal component + `@keyframes`
2. Staggered repeats → `animation-delay: base + i * stagger`
3. Continuous ambient → infinite `@keyframes` with negative `animation-delay`
4. Shape morphs → bespoke `@keyframes` pair with transition variables
5. Irreducible per-frame math → small `onFrame`/`addFrameTask`, scoped to one scene

### Audio Rules
- Never place `<Audio>` as child of `mode="sequence"` — it doubles render length
- Give music bed explicit `duration` equal to total runtime, or wrap in `mode="fit"`
- `volume` is 0–1, not decibels; bake gain into file offline

### Verification
```bash
npm install && npm run render
ffprobe output/demo.mp4                                # duration and streams
ffmpeg -i output/demo.mp4 -af volumedetect -f null -   # audio audible
```

Code that never rendered is not done.

---

## Element Reference (Key Attributes)

### ef-timegroup
- `mode`: fixed | sequence | contain | fit
- `duration`: CSS time (e.g. "5s")
- `overlap`: overlap between sequence children
- `offset`: start offset in seconds within parent

### ef-video / ef-audio
- `src`: URL of source file
- `file-id`: cloud file identifier (takes priority over src)
- `sourcein` / `sourceout`: window within source file
- `trimstart` / `trimend`: cut from start/end of element's duration
- `volume`: 0.0–1.0
- `mute`: boolean

### ef-text
- `split`: line | word | char (default: word)
- `stagger`: delay between segment animations
- `motion-blur`: wraps each segment in motionblur

---

## React Entry Points

| Import | Environment |
|---|---|
| `@editframe/react` | Browser — composition + GUI + hooks |
| `@editframe/react/server` | Node/SSR — types only, no DOM |
| `@editframe/react/r3f` | Browser — React Three Fiber integration |
| `@editframe/elements` | Browser — custom elements + WebCodecs |
| `@editframe/elements/server` | Node/SSR — types only |

---

## See Also

- [editframe.com/skills/composition.md](https://editframe.com/skills/composition.md) — Full reference with complete element API
- `editframe-motion-design.md` — Motion design principles mapped to Editframe mechanisms
- `editframe-brand-video.md` — Brand video generation pipeline
- `editframe-tooling.md` — Dev server, API, CLI, and editor GUI setup
