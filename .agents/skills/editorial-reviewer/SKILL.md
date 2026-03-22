---
name: editorial-reviewer
description: >
  Editorial review for communication clarity and document structure. Use this
  skill whenever polishing prose, improving document organization, reviewing
  specs/PRDs for readability, or preparing documents for stakeholders. Also
  activate when the user says "make this clearer", "tighten this up",
  "editorial review", "copy edit", "restructure this doc", "too long",
  "hard to follow", or "polish this". Has two modes: prose (fix communication
  issues) and structure (propose cuts, merges, moves). Use prose mode for
  sentence-level clarity. Use structure mode for document-level organization.
---

# Editorial Reviewer

Two-mode review skill for communication quality — a different axis from
adversarial review (which targets reasoning/logic/design quality).

## When to use this skill

- Polishing PRDs, TRDs, specs, or any stakeholder-facing document
- Fixing unclear writing without changing the author's voice
- Reducing document length while preserving information
- Reorganizing a document that grew organically and lost coherence

---

## Choosing a Mode

| Situation | Mode |
| --- | --- |
| "This doc is too long / hard to navigate" | Structure |
| "The writing is unclear / hard to follow" | Prose |
| "This needs a full editorial pass" | Structure first, then Prose |
| "Quick polish before sharing" | Prose only |

---

## Mode 1: Prose Review

Clinical copy-editing focused on **communication clarity**. Fixes issues that
impede comprehension. Preserves author voice — this is not about style preferences.

### What to Fix

| Issue Type | Example |
|---|---|
| **Ambiguity** | "The system handles this" — which system? handles how? |
| **Vague quantifiers** | "Many users" → "~60% of active users" |
| **Passive voice hiding actors** | "The config was changed" → "The deploy script changes the config" |
| **Jargon without context** | "Uses CQRS" → "Uses CQRS (separate read/write models)" |
| **Run-on sentences** | Break into shorter, scannable units |
| **Dangling references** | "As mentioned above" — link or restate |
| **Inconsistent terminology** | "user/customer/account" used interchangeably |

### What NOT to Fix

- Style preferences (Oxford comma, em-dash usage)
- Tone (formal vs casual) unless it impedes clarity
- Content accuracy — that's adversarial review's job

### Output Format

```markdown
## Prose Review: [Document]

| Original Text | Revised Text | Change |
|---|---|---|
| "The system handles this appropriately" | "The auth service returns a 401 and logs the attempt" | Removed ambiguity: specified which system and what action |
| ... | ... | ... |

**Issues found**: [N]
```

### Rules

- Skip code blocks and frontmatter
- Deduplicate: if the same issue appears in multiple places, report it once with "applies to N instances"
- Reader type matters: for human-facing docs, optimize for clarity and flow; for LLM-facing docs (prompts, skill files), optimize for precision and consistency

---

## Mode 2: Structure Review

Structural editing — proposes document-level reorganizations. Run this *before*
prose review (structure first, then polish).

### Analysis Process

1. **Identify document type** — match against these models:
   - **Tutorial**: Sequential steps toward a goal
   - **Reference**: Lookup-optimized, alphabetical or categorical
   - **Explanation**: Concept → why → how → implications
   - **Prompt/Skill**: Instruction-optimized for AI consumption
   - **Strategic**: Problem → analysis → recommendation

2. **Scan for structural issues**:
   - **Redundancy**: Same concept stated in multiple sections
   - **Buried information**: Critical details hidden in paragraphs instead of headers
   - **Scope violations**: Sections that don't belong in this document
   - **Ordering issues**: Dependencies explained after they're needed
   - **Imbalanced depth**: Some sections 3 paragraphs, others 3 pages

3. **Produce recommendations** using these action types:

| Action | Meaning |
|---|---|
| **CUT** | Remove entirely — adds no value |
| **MERGE** | Combine with another section — they're saying the same thing |
| **MOVE** | Relocate — currently in the wrong position |
| **CONDENSE** | Keep the information, reduce the words |
| **QUESTION** | This seems wrong/out of scope — verify with author |
| **PRESERVE** | Explicitly protect — might look redundant but serves a distinct purpose |

### Output Format

```markdown
## Structure Review: [Document]

**Document type**: [Tutorial / Reference / Explanation / Prompt / Strategic]
**Current length**: [N words]
**Estimated reduction**: [M words (~X%)]

### Recommendations (priority order)

1. **MERGE** §3 "Setup" + §7 "Installation" → Both describe environment setup
2. **MOVE** §5 "Error Codes" → After §2 "API Reference" (currently buried)
3. **CUT** §9 "Historical Context" → Interesting but irrelevant to the reader's goal
4. **CONDENSE** §4 "Architecture Overview" → 800 words → ~300 words (remove implementation detail)
5. **QUESTION** §6 "Marketing Copy" → Does this belong in a technical spec?

### Preserved Sections
- §1 "Problem Statement" — foundational, no changes needed
- §8 "Verification" — distinct from §4 despite surface similarity
```

## Related Skills

- **`adversarial-reviewer`** — Challenges reasoning and logic quality. Editorial-reviewer addresses communication clarity — different axis.
