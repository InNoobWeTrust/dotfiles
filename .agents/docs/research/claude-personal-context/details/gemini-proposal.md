---
audience: Agent-setup maintainers revisiting the original proposal
purpose: Retain the initial Gemini suggestions and their distinction from source evidence
scope: Faithful reconstruction from retained user-provided research summary, not verbatim correspondence
status: research
---

# Original Gemini Proposal — Reconstructed Summary

**Origin:** the user supplied a Vietnamese Gemini analysis of [this video](https://www.youtube.com/watch?v=Vo8DCzi6n2E), before we retrieved the captions. This preserves its substantive suggestions from the retained conversation summary; it is **not a verbatim archive** of the original message or the video.

| Foundation | Proposed purpose |
|---|---|
| Voice Profile | Reusable writing style drawn from authentic user samples |
| Personal Intelligence Blueprint | Strengths and resources discovered through CV/experience analysis and interviews |
| Story Repository | Real events, lessons, and analogies available for writing and positioning |

## Six proposed techniques

| Technique | Original proposed workflow | Important implementation distinction |
|---|---|---|
| Prompt optimization | Brain dump → “Clean up this prompt for clarity and impact” → super prompt with role, context, constraints, and output schema | Structured schema and an agent optimizer are implementation suggestions, not source-mandated standards |
| Voice extraction | Three authentic non-AI texts across chat/email/social, or labeled speech transcript; extract pacing, signature phrases, and dislikes; save `voice_profile.md` and inject automatically | File format and automatic injection need their own design; absence of a phrase does not prove dislike |
| Resume mining | Business-advisor, not hiring-manager reading; understanding confirmation and iterative interviews; save `personal_intelligence_blueprint.md` | Confirmation should demonstrate interpretation; inferred strengths must not become invented achievements |
| Story-bank management | Interview real experiences; proposed JSON fields below; recurring monthly day-3 interview/cron | Source supports a personal monthly calendar habit, not cron or autonomous interviewing |
| Day-1 validation | Filter opportunities by 30-day speed to revenue, lifestyle, current resources, and prior paid demand; identify contacts, outreach message, free/cheap/paid offer, and signal before building | Market feedback is not an AI prediction; outreach needs separate authority |
| Accountability | Daily progress toward a 90/180-day goal, three to five tasks, end-of-day reprioritization | Goal horizons and task counts are proposed patterns, not universal source requirements |

## Proposed story schema

```json
{
  "story_id": "...",
  "theme": "...",
  "trigger_event": "...",
  "analogy_or_lesson": "...",
  "key_takeaway": "...",
  "applicable_topics": ["..."]
}
```

**Preserved for comparison, not adopted as a store:** source provenance, factual status, privacy, and publication permission would also need handling. Our adaptation uses existing Markdown working-memory entries instead of creating a parallel JSON database.

## Five proposed new skills

- **`prompt-optimizer`:** clarify requests and produce structured prompts.
- **`voice-extractor`:** analyze authentic writing and persist a profile.
- **`resume-mining`:** discover capabilities and business potential from experience.
- **`story-bank-manager`:** interview, structure, retrieve, and replenish stories.
- **`day1-validator`:** design a small real demand test before building.

**Adoption decision:** do not create these five skills merely to mirror the video. Existing grooming and memory guidance cover much of the mechanism; narrowly extend scoped memory and trial benefits before expanding the catalog.

## Revisit when evidence supports it

- **Writing profiles:** when recurring writing-on-behalf tasks show measurable correction savings with facts preserved.
- **Capability interviews:** when a real positioning or business task requires missing experience evidence, not as mandatory agent onboarding.
- **Story workflows:** when actual reuse justifies a dedicated interview/retrieval workflow with appropriate permissions.
- **Automation:** only after operational capability, privacy, permissions, cost, and failure recovery are explicitly addressed.

See [video findings](source-findings.md) for independently checked attribution and [setup adaptation](../claude-personal-context.md) for the selected boundaries.
