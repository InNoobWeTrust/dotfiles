# Editframe Brand Video Generator Reference

Two-pass pipeline for generating video compositions from brand websites or descriptions. Load this reference during Step 1 (Story & Scripting) when the project is a brand video and the rendering engine is Editframe.

**Source**: [editframe.com/skills/brand-video-generator.md](https://editframe.com/skills/brand-video-generator.md) · MIT License · Author: editframe

---

## When To Use

- Building a brand video (launch, product-demo, explainer, brand-awareness, social)
- Need to derive creative direction from a brand's website or description
- Using Editframe as the rendering engine for the final composition

---

## Input

- **Brand**: URL or text description
- **Video Type**: `launch` | `product-demo` | `explainer` | `brand-awareness` | `social`
- **Duration**: `15s` | `30s` | `60s` | `90s` (optional)
- **Platform**: `web` | `instagram` | `tiktok` | `youtube` | `linkedin` (optional)

---

## Pass 1 — The Brief (Required Output)

Do not skip to HTML. The brief is required output that the developer inspects, corrects, or approves before generation begins.

### Step 0 — Fetch the Brand (Do This First)

**If a URL is supplied**: immediately fetch it with WebFetch or browser tool — before reading further instructions, before thinking about the brief. Extract exact hex codes from the page's CSS. Download or note 3–5 brand assets (logo, product screenshots, key imagery).

**If you cannot access the URL**: stop here. Report the failure and ask whether to proceed from a text description.

**If only a text description is supplied**: ask the user for anything critical missing — specific product names, hex codes, recognizable visual marks — before generating the brief.

Do not infer colors or visual language from memory. Only exact values from the live page are acceptable.

### 1. Structural Truth

One thing true of this brand that is false of any direct competitor. Not a marketing claim — a material fact: a decision the brand made, a relationship it has, a mechanism it invented.

**Substitute test**: swap the brand name into the statement. Does it still hold? If yes, it's not specific enough.

### 2. Formal Constraint

What the structural truth forces on the video's *mechanics* — not its subject matter. Structure means timing, motion logic, and compositional form.

State it as a rule: "Because [truth], this video [does X mechanically]."

**Single argument**: "This video argues [X] by showing [Y]." If [Y] could illustrate a different argument, the form isn't embodying the truth yet.

### 3. Authorial Angle

What the video argues that the brand's own marketing does not say.

Complete: *"This video argues [X] which this brand's marketing never says because [Y]."*

If [X] is already on their homepage, the composition is illustration, not argument. Find the interpretation: what tension does this truth create? What does it reveal about the audience?

**Category trap**: If the angle could be claimed by any direct competitor, it's a category truth, not an angle.

### 4. Felt Arc

The emotional journey from frame 1 to the last frame.

Name the emotion at entry and at exit. They must differ. Define the minimum path — the fewest distinct state changes required.

**Scene budget**: `floor(duration_seconds / 10)` maximum. 15s → 2 scenes. 30s → 3. 60s → 6.

### Brief Checkpoint

After outputting the brief, pause and ask:
> "Does this brief look right? I'll generate the composition once you confirm, or adjust any section now."

---

## Pass 2 — The Composition

Generate HTML from the confirmed brief. Every decision traces back to the brief's formal constraint.

### The Single Gate

Before placing any element, ask:
> **Could a direct competitor's marketing team use this exact element unchanged?**

If yes: delete it and find what only this brand could use. Apply recursively.

### Scene Rules

- Each scene earns its place by changing the viewer's emotional state. State the transition for every scene.
- No two adjacent scenes may leave the viewer in the same state.
- Feature sequences must build causally — if scenes can be reordered without loss, they're a list, not an argument.
- Prove, don't assert: "unified" is shown by one element appearing in multiple contexts, not by text saying "unified."

### Hard Stops

**Colors**: Use exact hex codes from the brief. Do not estimate.

**Canvas**:
- Use `addFrameTask`, never `requestAnimationFrame`
- A canvas without a complete `addFrameTask` script renders nothing — delete the scene rather than ship broken code
- Canvas visual state at second 1 must differ visibly from second 20

**People**: Circles and gradient blobs cannot represent faces. Use real photography or draw recognizable facial features.

**Logo geometry**: Render from the brand's actual geometry. `fillRect()` for clothing or organic forms is prohibited.

**Named products**: At least one specific product name (not a category description) must appear.

### Completeness Check

Before outputting:
- [ ] Scene durations sum to target duration EXACTLY
- [ ] No canvas element without a complete `addFrameTask` script
- [ ] Output ends with closing tags (`</ef-timegroup>`, `</script>`, `</style>`)
- [ ] Every scene passes the substitutability gate
- [ ] The single argument is traceable through every scene
- [ ] Final scene exists (closing/CTA, typically 4–8s)
- [ ] Duration accounting comment before output: `<!-- Scene 1: 8s, Scene 2: 12s, ... = Xs total -->`

---

## Factual Verification Requirement

Every statistic, figure, or quantified claim in the brief MUST be:
1. Directly sourced from the brand's website, press releases, or official communications
2. Attributed with specific context (what, where, when)
3. If no verifiable figure exists, state the structural truth qualitatively rather than fabricating a number

**Do not invent statistics.** When in doubt, quote the brand's own language verbatim.

---

## Reference Files (Editframe Ecosystem)

- [Brand Examples and Category Guidance](https://editframe.com/skills/brand-video-generator/brand-examples.md) — Category-specific structural truths and visual specificity
- [Composition Patterns](https://editframe.com/skills/brand-video-generator/composition-patterns.md) — Canvas patterns and visual specificity requirements
- [Emotional Arcs](https://editframe.com/skills/brand-video-generator/emotional-arcs.md) — Arc patterns and short-form compression
- [Genre Selection](https://editframe.com/skills/brand-video-generator/genre-selection.md) — Genre palette and fitness checks
- [Editing — What to Cut](https://editframe.com/skills/brand-video-generator/editing.md) — Discipline of omission
- [Visual Metaphors](https://editframe.com/skills/brand-video-generator/visual-metaphors.md) — Visual metaphor library
- [Video Archetypes](https://editframe.com/skills/brand-video-generator/video-archetypes.md) — Industry patterns
- [Typography Personalities](https://editframe.com/skills/brand-video-generator/typography-personalities.md) — Font personality and timing
- [Video Fundamentals](https://editframe.com/skills/brand-video-generator/video-fundamentals.md) — Transitions, arcs, brand basics
- [Color Psychology](https://editframe.com/skills/brand-video-generator/color-psychology.md) — Emotional associations and palette selection
- [Transition Styles](https://editframe.com/skills/brand-video-generator/transition-styles.md) — Cut, dissolve, wipe, motion transitions

---

## See Also

- [editframe.com/skills/brand-video-generator.md](https://editframe.com/skills/brand-video-generator.md) — Full brand video generator reference
- `editframe-composition.md` — Editframe composition API and element reference
- `editframe-motion-design.md` — Motion design principles mapped to Editframe
- `editframe-tooling.md` — Dev server, API, CLI, and editor GUI setup
