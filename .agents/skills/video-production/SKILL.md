---
name: video-production
description: "Use this skill for AI video production — animated videos, motion graphics, and cinematic content. Follows a structured pipeline: style guide → story/script → asset extraction → shot list → render. Activate when the user wants to create a video, animate content, build a storyboard, or produce motion graphics."
---

# Video Production Skill

A professional pipeline for transforming concepts into AI-animated videos,
prioritizing visual continuity and technical precision. Inputs are the authorized
brief, audience, destination, target duration, source/rights constraints, output
formats and available generation/rendering capabilities. Outputs are the approved
style guide, story, asset manifests, shot list and final render or an explicit
blocked/source-only handoff. Do not assume inherited provider access, cache paths
or permission to transmit content.

## High-Agency Pipeline (The 6-Step Flow)

Follow this sequence strictly. Each step is a mandatory "Review Gate."

### Step 0: Visual DNA & Style Guide
- **Action**: Before any generation, define the "Visual DNA."
- **Constraints**: 
  - Specify **Art Style** (e.g., Cinematic 3D, Hand-drawn, Anime).
  - Define **Lighting Palette** (e.g., Neon-Noir, Golden Hour, Moody Flat).
  - Define **Camera Language** (e.g., Wide-angle, shallow depth of field, handheld).
- **Goal**: Create a master `style_guide.json` used to prefix every future prompt. Obtain approval from the authorized project owner before asset generation; if unavailable, stop before calling any generator.

### Step 1: Story & Scripting
- **Action**: Analyze genre/tone and match the target duration (30s, 60s, 2m+).
- **Mandate**: Every scene must have a clear "Visual Hook" and emotional beat.
- **Accuracy**: For factual/technical narration, verify that the explanation is accurate for the named system; distinguish simplification from fact and avoid universal security/performance guarantees unless their conditions are stated. Prefer a qualified accurate explanation over a dramatic but misleading premise.
  - When comparing systems, distinguish properties being changed from properties both systems share; state material trust assumptions and test each contrast against an ordinary counterexample. Do not imply the baseline lacks a shared property; qualify the conditions or remove the claim.
- **Output**: `story.md`.

### 2. Asset Extraction (Consistency Layer)
- **Action**: Identify and extract unique entities into `characters.json` and `backgrounds.json`.
- **Anti-Lazy Rule**: Every character must have a "Visual Anchor" (e.g., "always wearing a red scarf", "glowing blue eyes") to stabilize identity across frames.

### 3. Asset Generation
- **Action**: Call Image APIs (Flux, DALL-E 3, etc.).
- **Mandate**: Generate "Reference Sheets" for characters and "Clean Plates" for environments.
- **Authority**: Before sending prompts/assets to an external provider, confirm the provider, data disclosure/retention, cost and explicit authorization. Do not install packages/tools or use hosted editors/renderers without authorization. If access or approval is missing, stop generation and return the prepared manifests/storyboard as incomplete; do not invent generated assets.
- **Caching**: Reuse assets only from a caller-supplied, authorized `VIDEO_PROD_CACHE` location. The variable is optional and has no assumed host default; when unset or unavailable, skip cache reuse. Do not guess, create, or clear a cache location without permission.

### 4. Shot Listing (Director's Cut)
- **Action**: Break scenes into cinematic beats (default: 8s).
- **Prompt Pattern**: `[Style Guide Prefix], [Shot Type], [Action], [Environment], [Lighting], [Motion Hint]`.
- **Output**: `shots.json`.

### 5. Synthesis & Rendering
- **Action**: 
  - **Composite**: Layer character sprites onto backgrounds via FFmpeg.
  - **Animate**: Send to an authorized video-generation API (provider choice and actual interface must be established before use).
  - **Finalize**: Merge, Grade, and Audio-sync via FFmpeg.
  - **Stop**: If FFmpeg or another required render/export capability is absent, do not install or substitute a hosted renderer. Return source/manifests and identify the blocked render step; do not claim a final video.

---

## Output Policy (Anti-Lazy)
**ABSOLUTE BANS**:
- No generic prompts like "a man walking." Prompts must be descriptive and follow the DNA.
- No placeholders in `shots.json`.
- No skipping the "Step 0" Style Guide.

---

## State Recovery & Verification
- **Idempotency**: Every script must check for existing JSON manifests before calling APIs.
- **Validation**: Before resuming, verify that `characters.json` contains valid URLs/paths, not just IDs.

## Data Augmentation
This skill is self-contained: the pipeline, output policy and references bundled in this directory are the whole contract. Optional prompt/style-seed packs may be read only from an authorized, caller-supplied cache; their absence does not create a prerequisite.

### Cache Contract

The optional input is a caller-provided `VIDEO_PROD_CACHE` path with read/write
permission and an understood retention policy. The skill defines no default host
path. If the value or permission is absent, skip cache reads/writes and continue
only if the authorized generation workflow can safely proceed without them.

---

## Editframe Integration

When the rendering engine is Editframe (HTML web components or React compositions), load the relevant reference below. These are bundled snapshots of the upstream Editframe skill docs; refresh them from editframe.com/skills by hand when upstream has moved.

| When | Load |
|---|---|
| Setting up project, dev server, API, or editor GUI | `references/editframe-tooling.md` |
| Step 0 (Visual DNA) — defining motion language | `references/editframe-motion-design.md` |
| Step 1 (Story & Scripting) — brand video from URL/description | `references/editframe-brand-video.md` |
| Step 5 (Synthesis & Rendering) — building compositions | `references/editframe-composition.md` |

All references: MIT License · Author: editframe · Source: [editframe.com/llms.txt](https://editframe.com/llms.txt) · [github.com/editframe/skills](https://github.com/editframe/skills)

---

## Rules
1. **Visual DNA First**: Never generate assets before the Style Guide is approved.
2. **Character Anchors**: Every character prompt MUST include their visual anchor.
3. **No Truncation**: Deliver full JSON manifests and scripts.
4. **Cinematic Intent**: Camera movements must be purposeful (Pan to reveal, Zoom for emotion).
