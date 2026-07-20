# Rule 4: Ubiquitous Language (Domain Glossary)

**File:** `rules/ubiquitous-language.md`

**What it prevents:** AI introducing naming drift that makes the codebase harder to understand over time.

**Core components:**

```
1. Locate the glossary file (GLOSSARY.md) before coding
2. Extract existing domain definitions
3. Align new code with glossary terms exactly
4. Propose new terms before implementing them
5. Bootstrap protocol: offer to generate GLOSSARY.md if missing
```

**Without this rule:** Over 10 AI-assisted tasks, the same domain concept will appear as `Supplier`, `Provider`, `Vendor`, `Client`, and `Seller` in different parts of the code. A human developer reading the codebase will waste time figuring out whether these are five different concepts or one concept with five names.

**Bootstrap checklist for new projects:**
1. Scan main entity files, class declarations, database schemas
2. Extract top 10-15 recurrent nouns and domain concepts
3. Verify synonyms: check if identical concepts have different names
4. Draft GLOSSARY.md with: term, domain definition, code reference, prohibited aliases
