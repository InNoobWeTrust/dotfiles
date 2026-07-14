## Phase 1: Frame the Problem

Before generating ideas, ensure the opportunity or challenge is well-defined.

1. **State the problem** in one clear sentence.
2. **Ask "Why?" 3 times** to uncover the core motivation or value (avoid surface symptoms).
3. **Define success** — what does an outstanding concept look like?
4. **Identify assumptions** — what are we taking for granted that could be wrong?

> [!TIP]
> - If the problem involves a tricky bug, complex debugging, or deep root-cause analysis, load the `systematic-investigation` skill instead to apply analytical diagnostic frameworks.
> - If the problem requires understanding unfamiliar code or architecture, use the `codebase-exploration` skill first.

---

## Phase 2: Divergent Techniques (Generate Volume)

Choose one or more techniques based on the ideation context:

| Technique | When to Use | How It Works |
| :--- | :--- | :--- |
| **Classic Brainstorm** | General ideation | Quantity over quality. Suspend judgment completely. Build on others' ideas. |
| **SCAMPER** | Improving existing things | **S**ubstitute, **C**ombine, **A**dapt, **M**odify, **P**ut to other use, **E**liminate, **R**everse. |
| **Worst Possible Idea** | Breaking creative blocks | Generate intentionally terrible ideas, then invert them to discover strong ones. |
| **Random Entry** | Stuck in a rut | Pick a random word or image, and force semantic connections to the problem. |
| **Analogy/Metaphor** | Gaining new perspectives | Ask: "How does nature or another industry/domain solve a similar problem?" |
| **What If...** | Exploring extremes | Remove constraints: "What if budget was unlimited? What if we had only 1 day?" |

---

## Phase 3: Facilitation & Flow

When acting as a facilitator (either in an interactive command session or guiding a design task):

### Facilitator Rules
- **Ask probing questions**: "What if...?", "Why not...?", "What would happen if...?"
- **Defer judgment**: Never say "that won't work" during the divergent phase.
- **Build on ideas**: Use "Yes, and..." to expand concepts ("Building on that, what about...").
- **Push past the obvious**: The first 5-10 ideas are usually conventional. Keep going to reach the creative frontier.
- **Shift perspectives**: Ask: "How would a competitor see this? A user who hates our product? A developer starting from scratch?"

### Session Flow Control
- **Target Quantity**: Aim for 10-20 raw ideas before filtering.
- **Fast Capturing**: Document everything quickly; do not edit or refine mid-flow.
- **Energy Check**: If ideation stalls, pivot to a new technique or introduce a wild constraint.
- **Early Exit / Pause**: Gracefully save current state if interrupted, capturing all raw ideas.

---

## Phase 4: Convergent Techniques (Focus & Refine)

Once a volume of ideas is generated, organize and prioritize them:

1. **Affinity Mapping**: Group related ideas into cohesive themes and name the themes.
2. **Elimination**: Remove duplicates or ideas that clearly violate hard constraints.
3. **Scoring (Impact vs. Effort)**:
   - **Impact**: How much does this move the needle on our success criteria?
   - **Effort**: How difficult, costly, or time-consuming is it to build?
   - **Risk**: What technical, operational, or security risks does this introduce?
4. **Selection**: Choose the top 3-5 ideas for deeper exploration.

---

## Phase 5: Multi-Perspective Evaluation

Subject the top ideas to diverse role-based lenses:

- **Product Owner**: Does this solve a real user problem? Is the value proposition clear?
- **Architect / Developer**: Is this technically feasible? Does it align with code-craft standards?
- **Security**: What are the attack vectors, input vulnerabilities, or privacy concerns?
- **Devil's Advocate**: Why will this fail? What are the blind spots?

---

## Phase 6: Action Plan & Output

Save the brainstorming session as a structured markdown document:

```markdown
# Brainstorming Session: [Topic]

- **Date**: [date]
- **Techniques Used**: [list]

## 1. Problem Statement
[A clear one-sentence description of the problem and success criteria]

## 2. All Raw Ideas
[List of all generated ideas, organized by affinity mapping themes]

## 3. Prioritized Ideas (Top 3-5)

### Idea A: [Name]
- **One-line summary**: [What it is]
- **Value Proposition**: [Why it matters / what problem it solves]
- **First Step**: [The smallest experiment or prototype you can build to test this]
- **Success Metric**: [How you will measure if it works]
- **Risks & Open Questions**: [Known unknowns and hazards]
```
