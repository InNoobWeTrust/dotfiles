---
name: skill-extractor
description: Detect when a conversation has produced valuable, hard-won knowledge worth capturing as a reusable skill. Use this skill at the END of every substantial conversation — especially after long debugging sessions, complex multi-step workflows, non-obvious discoveries, novel integrations, or any task where multiple attempts were needed before success. Also trigger when the user says things like "that was tricky", "let's remember this", "we should save this approach", or when you notice you've solved a similar problem before. This is a background awareness skill — always be watching for extraction opportunities so valuable patterns are never lost.
---

# Skill Extractor

Recognize when conversations produce reusable knowledge and suggest extracting it into a skill. The goal is to build up a library of skills over time by never letting valuable hard-won patterns slip away.

## Core Principle

From Anthropic's skill-building guidance:

> *"Iterate on a single challenging task until Claude succeeds, then extract the winning approach into a skill. This leverages Claude's in-context learning and provides faster signal than broad testing."*

Your job is to be the agent's "skill radar" — always watching for moments where this principle applies.

---

## When to Suggest Extraction

Evaluate every substantial conversation against these three signal categories. If a conversation scores high on **two or more categories**, suggest extraction.

### 1. Conversation Complexity Signals

The conversation involved significant effort to reach a solution:

- Multiple failed attempts or wrong turns before finding the right approach
- Backtracking, pivoting strategies, or abandoning initial approaches
- Extended research or experimentation to find a working solution
- Lengthy back-and-forth between agent and user to refine the approach
- The agent had to combine information from multiple sources or tools

### 2. Knowledge Novelty Signals

The solution contains knowledge that isn't obvious or widely documented:

- Workarounds for undocumented behavior, bugs, or quirks
- Non-obvious configuration, setup, or integration steps
- Domain-specific patterns discovered through trial and error
- Surprising interactions between tools, libraries, or systems
- Creative approaches that deviate from standard documentation
- Insights about *why* something works (not just *what* works)

### 3. Reusability Signals

The approach is generalizable and likely to help in the future:

- The solution follows a repeatable workflow or pattern
- Similar problems are likely to recur (for this user or others)
- The approach applies across multiple projects, not just the current one
- The knowledge would save significant time if encountered again
- The pattern involves a common task done in a non-obvious way

---

## When NOT to Suggest Extraction

Do not suggest extraction when:

- The fix was simple and well-known (missing import, typo, standard config)
- The task was a one-off unlikely to recur (unique data migration, one-time script)
- An existing skill already covers the pattern — check the skill library first
- The user is clearly in a rush or has expressed urgency
- The conversation was mostly the agent following standard procedures
- The knowledge is already well-documented in official docs

---

## How to Suggest Extraction

When you detect an extraction opportunity, present it naturally at the end of the conversation. Frame it as a suggestion, never an obligation.

### Step 1: Summarize the Winning Approach

Briefly describe what was learned — the key insight or workflow that made the task succeed. Focus on the generalizable pattern, not the specific instance.

**Example:**
> "We discovered that when integrating X with Y, you need to configure Z in a specific order, and the standard docs don't mention the required middleware step. This took several attempts to figure out."

### Step 2: Explain Why It's Worth Capturing

Connect it to future value. Why would this save time later?

**Example:**
> "This integration pattern is likely to come up again in your other projects. Having a skill for it would save the debugging time we just spent."

### Step 3: Propose a Skill Name and Scope

Suggest a concrete, descriptive skill name and briefly scope what the skill would cover.

**Example:**
> "I'd suggest a skill called `x-y-integration` covering the setup workflow, the middleware requirement, and the gotchas we hit."

### Step 4: Ask for Permission

Always ask — never assume the user wants to extract.

**Example:**
> "Would you like me to extract this into a reusable skill? I can draft it now using the skill-creator, or you can do it later."

### Suggestion Template

Use this structure (adapt the tone to the conversation):

```
---

💡 **Skill Extraction Opportunity**

During this session, we worked through [brief description of challenge].
The key insight was [the winning approach / non-obvious discovery].

This seems worth capturing as a skill because [reusability reason].

**Proposed skill:** `[skill-name]` — [one-line scope description]

Want me to extract this into a reusable skill now?
```

---

## Extraction Workflow

If the user agrees to extract, follow these steps:

### 1. Distill the Conversation

Review the conversation and identify:

- **The core workflow** — the repeatable steps that solve this class of problem
- **The key insights** — the non-obvious knowledge that makes the workflow succeed
- **The gotchas** — what went wrong and why, so future runs avoid those pitfalls
- **The "why"** — the reasoning behind each decision, not just the steps

### 2. Generalize the Pattern

Transform the specific solution into a general skill:

- Replace project-specific details with parameterized placeholders
- Identify which parts are universal vs. which vary by context
- Add decision points where the approach might differ based on circumstances
- Include examples from the conversation but frame them as illustrations, not templates

### 3. Delegate to Skill-Creator

Hand off to the `skill-creator` skill for the full creation workflow:

- Pass along the distilled knowledge as the skill's content
- The skill-creator handles structure, testing, description optimization
- Stay involved to ensure the extracted knowledge is accurately represented

---

## Background Awareness Checklist

At natural conversation boundaries (task completion, end of session), quickly assess:

- [ ] Was this conversation substantially challenging?
- [ ] Did we discover something non-obvious?
- [ ] Would this approach help in future similar tasks?
- [ ] Does an existing skill already cover this?
- [ ] Is the user in a state to consider extraction?

If the first three are yes and the last two are no → suggest extraction.

---

## Skill Library Growth Mindset

Think of skill extraction as compound interest — each captured skill makes future work faster, which frees up time to capture more skills. Over time, the user builds a personalized toolkit that reflects their specific domain, tools, and working style.

Categories of skills that are especially valuable to capture:

- **Integration patterns** — connecting tools/services that don't have obvious docs
- **Debugging playbooks** — systematic approaches to recurring failure modes  
- **Setup workflows** — complex multi-step environment or project configuration
- **Domain-specific patterns** — approaches unique to the user's field or stack
- **Workaround recipes** — solutions for known bugs or limitations in tools
