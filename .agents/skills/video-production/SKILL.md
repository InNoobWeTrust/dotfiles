---
name: video-production
description: >
  High-Agency video production pipeline. Enforces a structured 5-step workflow
  (Visual DNA -> Story -> Assets -> Shot List -> Render) to prevent generic output
  and ensure cinematic consistency.
---

# Video Production Skill

A professional pipeline for transforming concepts into AI-animated videos, 
prioritizing visual continuity and technical precision.

## High-Agency Pipeline (The 6-Step Flow)

Follow this sequence strictly. Each step is a mandatory "Review Gate."

### Step 0: Visual DNA & Style Guide
- **Action**: Before any generation, define the "Visual DNA."
- **Constraints**: 
  - Specify **Art Style** (e.g., Cinematic 3D, Hand-drawn, Anime).
  - Define **Lighting Palette** (e.g., Neon-Noir, Golden Hour, Moody Flat).
  - Define **Camera Language** (e.g., Wide-angle, shallow depth of field, handheld).
- **Goal**: Create a master `style_guide.json` used to prefix every future prompt.

### Step 1: Story & Scripting
- **Action**: Analyze genre/tone and match the target duration (30s, 60s, 2m+).
- **Mandate**: Every scene must have a clear "Visual Hook" and emotional beat.
- **Output**: `story.md`.

### 2. Asset Extraction (Consistency Layer)
- **Action**: Identify and extract unique entities into `characters.json` and `backgrounds.json`.
- **Anti-Lazy Rule**: Every character must have a "Visual Anchor" (e.g., "always wearing a red scarf", "glowing blue eyes") to stabilize identity across frames.

### 3. Asset Generation
- **Action**: Call Image APIs (Flux, DALL-E 3, etc.).
- **Mandate**: Generate "Reference Sheets" for characters and "Clean Plates" for environments.
- **Caching**: Use the `VIDEO_PROD_CACHE` to reuse assets across projects.

### 4. Shot Listing (Director's Cut)
- **Action**: Break scenes into cinematic beats (default: 8s).
- **Prompt Pattern**: `[Style Guide Prefix], [Shot Type], [Action], [Environment], [Lighting], [Motion Hint]`.
- **Output**: `shots.json`.

### 5. Synthesis & Rendering
- **Action**: 
  - **Composite**: Layer character sprites onto backgrounds via FFmpeg.
  - **Animate**: Send to Video Gen APIs (Providers are abstracted; focus on the Prompt).
  - **Finalize**: Merge, Grade, and Audio-sync via FFmpeg.

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
This skill is enhanced by curated prompts and style seeds synced via:
```bash
.agents/scripts/sync-remotes.sh --apply
```

### Cache Location
- `VIDEO_PROD_CACHE` or `~/.cache/video-production-skill`.

---

## Rules
1. **Visual DNA First**: Never generate assets before the Style Guide is approved.
2. **Character Anchors**: Every character prompt MUST include their visual anchor.
3. **No Truncation**: Deliver full JSON manifests and scripts.
4. **Cinematic Intent**: Camera movements must be purposeful (Pan to reveal, Zoom for emotion).
