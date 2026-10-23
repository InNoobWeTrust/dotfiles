---
audience: Agent-setup maintainers
purpose: Preserve source findings and explain the scoped memory adaptation for later improvement
scope: Gemini proposal, edited video evidence, adaptation boundaries, and evaluation criteria
status: research-prototype
---

# Personal Context for Agent Improvement

| Question | Answer |
|---|---|
| Objective | Improve relevant recall using authentic preferences, examples, and experience |
| Source | [Vietnamese edited video about Alicia Lyttle and Claude](https://www.youtube.com/watch?v=Vo8DCzi6n2E), roughly 40 minutes |
| Evidence | English and Vietnamese original auto-captions retrieved with `yt-dlp`; not manually edited subtitles |
| Boundaries | No new skill catalog, automatic profiles, scheduler, provider changes, or income guarantees |
| Status | Scoped memory guidance implemented as a prototype; effectiveness requires real use |

**Reader path:** start here for the adaptation; open [video source findings](details/source-findings.md) to check attribution and timestamps, or [original Gemini proposal](details/gemini-proposal.md) to revisit the initial ideas. This Markdown archive serves the repository's agent-searchable wiki and is not an execution plan.

## What transfers to this setup

The useful mechanism is **authentic input → targeted questions → small real test → evidence-based update**. A profile improves an agent only when relevant context reaches the right task without distorting facts, invading privacy, or increasing friction.

| Source idea | Setup adaptation | Existing home |
|---|---|---|
| Voice profile from authentic examples | Distinguish collaboration preferences from writing-on-behalf profiles; retain scope and source | [Memory Techniques scoped context](../../../skills/memory-techniques/references/scoped-context.md) |
| Experience over job titles | Separate demonstrated accomplishments, inferred capabilities, and hypotheses | Existing working memory captures |
| Real story repository | Situation, constraints, action, result, source, applicability limits | Existing memory backend; no parallel story bank |
| Improve an unclear prompt | Demonstrate outcome, supplied constraints, and consequential unknowns without expanding intent | [Discovery and planning principles](../../../skills/working-principles/references/planning.md) |
| Test demand before building | Trial a proposed context/workflow before making it permanent | Prototype evaluation below |
| Daily progress and adjustment | Optional outcome/evidence/changed-assumption fields in checkpoints | Existing checkpoint protocol |

## How the adaptation works

```text
Explicit remember/use request
        → existing Capture or Recall mode
        → source + task relevance + privacy/use checks
        → smallest useful context
        → observed outcome, if a trial is performed
```

**Capture** appends sourced working observations; it does not silently extract a permanent profile from every conversation. **Recall** selects context by task and authorized scope; a Makefile edit should not receive public-writing phrases merely because a profile exists.

**Approval remains separate:** confirming a preference does not authorize long-term promotion, publication, or unrestricted forwarding to workers/providers. Long-term writes still require approved consolidation; local storage does not mean model processing is local.

## Decisions and exclusions

- **Extend, do not duplicate:** [memory-techniques](../../../skills/memory-techniques/SKILL.md) already owns storage and recall; its similar-trace procedure already checks differences and reuse recommendations.
- **Keep guidance on demand:** the new reference is routed from memory; no always-on profile injection or new AGENTS requirements.
- **Keep research separate:** this archive is background, not authoritative agent instructions; research promotion follows the [research index](../INDEX.md).
- **Keep facts intact:** an edited narrative must not invent achievements, customer permission, or commitments; three samples support a provisional profile, not guaranteed mimicry.
- **Defer automation:** a monthly calendar habit in the video does not specify cron, autonomous interviewing, or messaging authority.
- **Avoid prompt ceremony:** a “super prompt” is not a guaranteed standard, and extra rewriting calls need observable benefit.

## Evaluation and future improvement

| Trial | Desired observation | Disconfirming observation |
|---|---|---|
| Planning with a scoped preference | Less correction without missing essential explanation | Concision hides a material risk or decision |
| Config edit with writing profile available | Irrelevant personal style excluded | Personal context influences technical output unnecessarily |
| Similar failure with changed constraints | Prior lesson adapted or rejected with reasons | Old workaround copied despite incompatible environment |
| Email with authentic style | Fewer stylistic edits, facts preserved | Polished wording changes promises or invents experience |

**Measure real work:** use comparable tasks with and without minimal context; record editing/correction effort, unsupported claims, clarification friction, and irrelevant context. Record actual observations, not invented scores or claims that longer prompts are better.

**Review timing:** after 1–2 real uses or the next quarterly skill audit. Guided scenarios and static checks are useful prototype evidence, but do not establish runtime routing, automatic recall, privacy enforcement, or general effectiveness.

## Sources and limitations

- **Video evidence:** [timestamped findings](details/source-findings.md) distinguishes narrator advice from English interview excerpts; names and punctuation are unreliable in auto-captions.
- **Initial proposal:** [Gemini suggestions](details/gemini-proposal.md) is a faithful reconstructed summary of the user-supplied proposal, not a verbatim transcript or independently verified video analysis.
- **External specifications:** [Agent Skills specification](https://agentskills.io/specification) and [AGENTS.md](https://agents.md) informed compatible authoring; no new file schema or skill was added.
- **Unverified claims:** earnings, training reach, business success, and current provider privacy settings were not independently established.
