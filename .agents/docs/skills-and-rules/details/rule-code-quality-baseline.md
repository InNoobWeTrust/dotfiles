# Rule 1: Code Quality Baseline

**File:** `rules/code-quality.md`

**What it prevents:** AI producing working code that is unmaintainable.

**Core components:**

```
1. Pre-implementation design checkpoint (7 questions answered BEFORE writing)
2. Naming conventions (verb-phrase functions, noun-phrase variables, boolean prefixes)
3. Structure limits (max 3 levels nesting, max 50 lines per function, guard clauses)
4. Prohibited patterns (silent error swallowing, magic literals, mixed layers)
5. Tech debt marking (TODO(debt): format)
6. Refactoring signal markers (REFACTOR-SIGNAL: pattern)
7. Module README requirement (every module directory must have documentation)
8. Docstring requirement (all public APIs must have ecosystem-standard docstrings)
```

**Without this rule:** The AI will produce code that works for the current test case but collapses under real use — deeply nested, 200-line functions with no documentation, no error handling, and business logic tangled with framework code.

**Evolution:** Start with the basics (naming, nesting, function length). Add the design checkpoint once you've seen the AI produce "solution sprawl" — a new feature spread across 4 files with no clear ownership. Add module READMEs once you've spent an hour trying to understand an AI-generated module with no documentation.
