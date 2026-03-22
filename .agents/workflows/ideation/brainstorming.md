---
description: >
  Facilitated brainstorming and ideation session. Use when brainstorming
  product ideas, exploring solutions, breaking through creative blocks,
  or generating concepts for any domain. AI acts as facilitator and coach,
  not generator — your ideas, structured exploration.
---

# Brainstorming Workflow

AI-facilitated creative session using proven ideation techniques.
Every idea comes from you — the AI creates conditions for insight.

## Inputs

- **Topic**: What are we brainstorming about?
- **Goals** (optional): What outcome do you want? (ideas, solutions, directions)
- **Constraints** (optional): Budget, timeline, technical limits, team size

---

## Phase 1: Frame the Problem

Before generating ideas, ensure the problem is well-defined.

1. **State the problem** in one sentence
2. **Ask "Why?"** 3 times to find the root problem (not the surface symptom)
3. **Define success** — what does a good answer look like?
4. **Identify assumptions** — what are we taking for granted that could be wrong?

> **If the problem involves a tricky bug, complex debugging, or root cause analysis**, consider using the `strategic-problem-solving` skill for structured frameworks (5 Whys, Ishikawa, First Principles) before brainstorming solutions.

> **If the problem requires understanding unfamiliar code or architecture**, consider using the `strategic-codebase-navigation` skill to map the relevant codebase before brainstorming solutions.

Output: A clear problem statement and success criteria.

---

## Phase 2: Choose Technique

Pick one or more ideation techniques. The AI should recommend based on the
problem type, or the user can choose directly.

### Divergent Techniques (Generate Volume)

| Technique | When to Use | How It Works |
|-----------|-------------|--------------|
| **Classic Brainstorm** | General ideation | No judgment, quantity over quality, build on others' ideas |
| **SCAMPER** | Improving existing things | Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse |
| **Worst Possible Idea** | Breaking creative blocks | Generate terrible ideas, then invert them to find good ones |
| **Random Entry** | Stuck in a rut | Pick a random word/image, force connections to the problem |
| **Reverse Brainstorm** | Finding hidden risks | "How could we make this WORSE?" Then invert |
| **Analogy/Metaphor** | New perspectives | "How does nature/another industry solve this?" |
| **What If...** | Exploring extremes | Remove constraints: "What if budget was unlimited? What if we had 1 day?" |

### Convergent Techniques (Focus and Refine)

| Technique | When to Use | How It Works |
|-----------|-------------|--------------|
| **Affinity Mapping** | Too many ideas | Group ideas into themes, name the themes |
| **Dot Voting** | Prioritizing | Rate each idea on impact vs. effort |
| **Six Thinking Hats** | Evaluating depth | Look at each idea from 6 perspectives (facts, emotions, risks, benefits, creativity, process) |
| **Feasibility Matrix** | Decision-making | Score ideas on desirability, feasibility, viability |

---

## Phase 3: Facilitate

The AI facilitates using the chosen technique:

### Facilitator Rules

- **Ask probing questions** — "What if...?", "Why not...?", "What would happen if...?"
- **Never judge during divergent phase** — no "that won't work" until convergent phase
- **Build on ideas** — "Building on that, what about...?"
- **Push past the obvious** — first ideas are usually conventional. Keep going.
- **Challenge assumptions** — "You said X isn't possible. Why not?"
- **Change perspectives** — "How would a child see this? A competitor? A user who hates your product?"

### Session Flow

1. Set a target: aim for 10-20 raw ideas before filtering
2. Go fast — capture everything, no editing
3. When energy drops, switch technique or take a different angle
4. Mark ideas that spark energy — those are worth exploring

### Exit & Resume

Sessions can be interrupted. Handle gracefully:

- **Early exit**: User says "let's stop here" → save current state, skip to Output
- **Pause**: User gets called away → save all ideas so far with a "Session paused" note
- **Pivot**: User realizes problem is wrong → **save current ideas first** (some may transfer to the reframed problem), then go back to Phase 1
- **Resume**: When returning, summarize where you left off and offer to continue or restart

---

## Phase 4: Organize and Prioritize

1. **Group** ideas into themes (affinity mapping)
2. **Eliminate** obvious duplicates
3. **Score** remaining ideas:
   - **Impact**: How much does this move the needle?
   - **Effort**: How hard is this to do?
   - **Risk**: What could go wrong?
4. **Pick top 3-5** ideas for deeper exploration

---

## Phase 5: Action Plan

For each top idea, define:

```markdown
## Idea: [Name]

**One-line summary**: [what it is]
**Why it matters**: [what problem it solves]
**First step**: [the smallest thing you could do to test this]
**Success metric**: [how you'd know it's working]
**Risks**: [what could go wrong]
**Open questions**: [what you'd need to figure out]
```

---

## Multi-Perspective Mode

For complex problems, apply multiple perspectives to the top ideas:

- **Product Owner**: Does this solve a real user problem?
- **Architect**: Is this technically feasible? What are the constraints?
- **Security**: What could go wrong from a security standpoint? (Apply `security-reviewer` lens if available)
- **Devil's Advocate**: Why will this fail? (Apply `adversarial-reviewer` lens)
- **User**: Would I actually use this? Is it intuitive?

> **Tip**: For deeper multi-persona deliberation with sustained back-and-forth,
> use the `party-mode` workflow instead of this lightweight pass.

> **Tip**: In project-specific copies, replace generic roles with team-specific ones
> and reference relevant project skills where applicable.

---

## Output

Save the session as a markdown document:

```markdown
# Brainstorming Session: [Topic]
**Date**: [date]
**Technique(s) used**: [list]

## Problem Statement
[refined problem]

## All Ideas
[grouped by theme]

## Top Ideas
[scored and prioritized]

## Action Plan
[next steps for top ideas]
```

This document can feed directly into the **Research** phase or **PRD**
of the requirements-driven-dev lifecycle.
