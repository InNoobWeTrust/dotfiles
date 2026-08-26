# Editframe Motion Design Reference

Professional motion graphics principles mapped to Editframe's composition system. Load this reference during Step 0 (Visual DNA) and Step 4 (Shot Listing) when designing motion for Editframe compositions.

**Source**: [editframe.com/skills/motion-design.md](https://editframe.com/skills/motion-design.md) · MIT License · Author: editframe

---

## Core Rules

1. **One focus at a time** — never animate unrelated elements simultaneously
2. **Intent first** — every animation serves the message
3. **Material consistency** — same material moves the same way
4. **Exits faster than entrances** — 30–40% shorter
5. **Respect physics** — unless style intentionally breaks it

---

## Editframe Mechanism Mapping

| Motion Concept | Editframe Mechanism |
|---|---|
| Easing / physics | CSS `animation-timing-function` + `@keyframes` |
| Stagger | `ef-text split="word"` + `--ef-word-index` |
| Progress-driven | `--ef-progress` (0–1, updates every frame) |
| Per-frame procedural | `addFrameTask` on a timegroup |
| Exit timing | `--ef-transition-out-start` |
| Scene overlap | `overlap="1s"` on `ef-timegroup[mode="sequence"]` |

---

## Intent → Strategy Framework

### 1. Extract Core Message
What's the single most important thing?

**Good**: "User action succeeded, continue with confident"
**Bad**: "Make it look cool"

### 2. Determine Target Emotion

| Emotion | Timing | Easing | Material | Exaggeration |
|---------|--------|--------|----------|--------------|
| Playful | Fast (250ms) | Bounce | Rubber | High (120%) |
| Confident | Medium (400ms) | Smooth | Metal/Glass | Low (102%) |
| Calm | Slow (800ms) | Gentle | Paper/Wood | Minimal (101%) |
| Urgent | Very fast (200ms) | Sharp | Stone/Metal | None |
| Premium | Slow (600ms) | Fluid | Leather/Glass | Subtle (103%) |
| Friendly | Medium (350ms) | Slight bounce | Plastic | Moderate (105%) |

### 3. Context Modifiers
- **Social media (mobile)**: 200–400ms, attention-grabbing
- **Explainer video**: 500–800ms, clear and readable
- **Cinematic**: 1000–1600ms, dramatic
- **Ads**: Fast to medium, hook within 3 seconds

### 4. Communication vs Decoration Test
**Ask**: If I remove this animation, does the message weaken?
- **Communication** (keep): directs attention, shows relationships, emphasizes moments
- **Decoration** (remove): "looks pretty" without purpose, distracts, adds time without clarity

---

## Material Properties (Source of Truth)

| Material | Base Duration | Deformation | Bounce | Friction | Density |
|----------|---------------|-------------|---------|----------|---------|
| Feather  | 2000ms        | 80%         | 0%      | Low      | Very low |
| Paper    | 800ms         | 30-40%      | 10%     | Medium   | Low |
| Leather  | 500ms         | 20-30%      | 15%     | High     | Medium |
| Rubber   | 600ms         | 60-80%      | 80%     | High     | Medium |
| Wood     | 500ms         | 5-10%       | 20%     | Medium   | Medium |
| Plastic  | 350ms         | 10-20%      | 30%     | Low      | Medium |
| Glass    | 400ms         | 0%          | 25%     | Low      | Medium-high |
| Metal    | 300ms         | 0-5%        | 5%      | Medium   | High |
| Stone    | 600ms         | 0%          | 5%      | High     | Very high |
| Liquid   | 1400ms        | 100%        | 0%      | Variable | Low |

---

## Physics Model

### Duration Calculation
```
Duration = Material.base × WeightMultiplier × DistanceFactor
```

**Weight multipliers**: Light (0.5–0.7×), Medium (1.0×), Heavy (1.5–2.0×)

**Distance factor**: actualDistance / 100px (cap at 3× linear, use √distance for very long movements)

### Frame Rate Alignment
- 24fps: 1 frame ≈ 42ms (round to multiples of 42)
- 30fps: 1 frame ≈ 33ms (round to multiples of 33)
- 60fps: 1 frame ≈ 17ms (round to multiples of 17)

### Volume Conservation
When objects deform, volume stays constant: `scaleX(1.25) × scaleY(0.8) = 1.0`

### Easing as Force
- **Falling (ease-in)**: `cubic-bezier(0.55, 0, 1, 0.45)`
- **Rising (ease-out)**: `cubic-bezier(0, 0.55, 0.45, 1)`
- **Within-screen (ease-in-out)**: `cubic-bezier(0.45, 0, 0.55, 1)`
- **Tight spring**: `cubic-bezier(0.68, -0.1, 0.265, 1.1)`
- **Loose spring**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)`

---

## Attention Flow

### Stagger Timing by Granularity

| Unit | Delay | Use Case |
|------|-------|----------|
| Character | 30–50ms | Text reveals, typing effects |
| Word | 80–120ms | Headline emphasis |
| Line | 200–300ms | Paragraph reveals |
| List item | 50–80ms | Navigation, bullet lists |
| Card | 100–150ms | Grid layouts, galleries |
| Section | 400ms+ | Page sections, major blocks |

### Total Duration
```
Total = (NumItems - 1) × StaggerDelay + ItemDuration
```
Keep under 2 seconds for UI; for video, scale with scene duration.

### Stagger Patterns
- **Sequential (Linear)**: 0, 100, 200, 300ms — reads naturally
- **Cascading (Accelerating)**: 0, 80, 140, 180ms — builds momentum
- **Wave (Center-out)**: Focus center first, reveal context
- **Decelerating (Slowing)**: 0, 50, 120, 220ms — gentle arrival

### Reading Order
Animate in natural reading order (left→right, top→bottom) unless intentionally disrupting.

---

## Editframe Implementation Patterns

### Easing → CSS `animation-timing-function`
```html
<ef-text style="animation: 400ms title-enter both; animation-timing-function: cubic-bezier(0, 0.55, 0.45, 1)">
  Professional Title
</ef-text>
```

### Stagger → `ef-text` split + CSS variables
```html
<ef-text split="word" class="text-white text-4xl"
  style="animation: 0.5s word-in both; animation-delay: calc(var(--ef-word-index) * 80ms)">
  Your message builds word by word
</ef-text>
```

Available CSS variables on split elements:
- `--ef-word-index`, `--ef-char-index`, `--ef-line-index`
- `--ef-stagger-offset` (for inverse stagger)
- `--ef-seed` (stable random for organic variation)

### Progress-Driven → `--ef-progress`
```html
<ef-timegroup mode="fixed" duration="10s" class="w-full h-2 bg-slate-700">
  <div class="h-full bg-blue-400" style="width: calc(var(--ef-progress) * 100%)"></div>
</ef-timegroup>
```

### Per-Frame Procedural → `addFrameTask`
```javascript
scene.addFrameTask((ownCurrentTimeMs, durationMs) => {
  const progress = ownCurrentTimeMs / durationMs;
  // Pure function of ownCurrentTimeMs — no Date.now() or Math.random()
});
```

### Overlapping Choreography → `overlap` + CSS delays
```html
<ef-timegroup mode="sequence" overlap="1s">
  <ef-timegroup mode="contain" class="absolute w-full h-full"
    style="animation: 1s fade-out var(--ef-transition-out-start) both">
    <!-- Scene A -->
  </ef-timegroup>
  <ef-timegroup mode="contain" class="absolute w-full h-full"
    style="animation: 1s fade-in both">
    <!-- Scene B -->
  </ef-timegroup>
</ef-timegroup>
```

### Exit Timing → `--ef-transition-out-start`
```html
<ef-timegroup mode="contain" duration="6s" class="absolute w-full h-full"
  style="animation: 1s fade-out var(--ef-transition-out-start) both">
  <ef-text style="animation: 0.4s exit-down var(--ef-transition-out-start) both">Headline</ef-text>
</ef-timegroup>
```

---

## Systematic Iteration (Four Phases)

| Phase | Time | Focus |
|---|---|---|
| 1. Broad Strokes | 40% | Sequence, rhythm, basic opacity/position, linear easing |
| 2. Easing | 20% | Replace linear with appropriate curves, ±50ms tuning |
| 3. Secondary Motion | 25% | Squash & stretch, anticipation, overshoots, rotation |
| 4. Polish | 15% | Edge cases, performance, accessibility, cross-browser |

### Phase Success Criteria
- **Phase 1**: Sequence makes sense, attention flows, nothing overlaps wrong
- **Phase 2**: Motion feels natural, no jarring speed changes, material evident
- **Phase 3**: Has personality, elements feel weighty, not overdone
- **Phase 4**: Works across browsers, 60fps, handles edge cases, accessible

### Knowing When To Stop
Animation is done when it: serves the message, guides attention, feels natural, performs at 60fps, survives 10+ repeated views, works on target devices, handles edge cases, passes accessibility checks.

**The 10-View Test**: Watch 10 times in a row. If annoying by view 7, simplify or remove.

---

## Accessibility

- No flashing faster than 3Hz (seizure risk)
- Sufficient contrast for legibility
- Longer read times for critical text
- Alternative static versions available
- Captions/subtitles always available

---

## Anti-Patterns

| Temptation | Why Wrong | Correct Path |
|---|---|---|
| All animations same duration/easing | Mechanical, monotonous | Vary at least one: duration, easing, or delay |
| Simultaneous unrelated motion | Viewer doesn't know where to look | Sequence: one focus at a time |
| Polishing too early | Wastes time if sequence is wrong | Broad strokes → easing → secondary → polish |
| Linear easing everywhere | Feels robotic | Use appropriate curves for material |
| Ignoring weight | Large elements feel wrong | Apply weight multiplier (heavy 1.5–2×) |
| Not frame-aligned | Stuttery motion | Round to whole frame counts |

---

## See Also

- [editframe.com/skills/motion-design.md](https://editframe.com/skills/motion-design.md) — Full motion design reference
- `editframe-composition.md` — Editframe composition API and element reference
- `editframe-brand-video.md` — Brand video generation pipeline
- `editframe-tooling.md` — Dev server, API, CLI, and editor GUI setup
