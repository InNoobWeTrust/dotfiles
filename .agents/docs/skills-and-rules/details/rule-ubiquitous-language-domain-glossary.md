# Rule 4: Ubiquitous Language (Domain Glossary)

**Current policy:** `rules/code-quality.md` §6 — Ubiquitous Language & Domain Consistency.

*Archived leaf: the standalone `rules/ubiquitous-language.md` file was consolidated into `rules/code-quality.md`. The rationale below is unchanged.*

**What it prevents:** AI introducing naming drift that makes the codebase harder to understand over time.

**Core components:**

```
1. Locate the glossary file (GLOSSARY.md) when one exists
2. Extract existing domain definitions
3. Align new code with glossary terms exactly
4. Surface and resolve conflicts in critical business meaning before implementing
5. Routine helper, variable, or method names need no glossary entry or approval
6. Bootstrap protocol: offer to generate GLOSSARY.md if missing (existing critical concepts, not a fixed quota)
```

**Without this rule:** Over 10 AI-assisted tasks, the same domain concept will appear as `Supplier`, `Provider`, `Vendor`, `Client`, and `Seller` in different parts of the code. A human developer reading the codebase will waste time figuring out whether these are five different concepts or one concept with five names.

**Bootstrap checklist for new projects:**
1. Scan main entity files, class declarations, database schemas
2. Collect the domain concepts that already recur across those sources
3. Verify synonyms: check if identical concepts have different names
4. Draft GLOSSARY.md with: term, domain definition, code reference, prohibited aliases

The entry count is the domain's, not a quota. Add terms as conflicting names surface rather than pre-filling a target number.
