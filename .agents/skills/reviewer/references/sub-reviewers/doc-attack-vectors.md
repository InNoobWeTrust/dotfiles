# Documentation-Specific Attack Vectors

Use these when reviewing **document-type artifacts** — design docs, specs,
runbooks, guidelines, instructional content, and any artifact meant to be
followed by humans or AI agents.

#### Attack Vector: Single Source of Truth

- Is the same concept, rule, or convention stated in multiple documents?
- If duplicated, which is the authoritative source? Do others reference it or restate it?
- When the source changes, will the copies drift and become contradictory?
- Could duplicated content be replaced with a cross-reference?

#### Attack Vector: Context Fitness

- Was this content adapted for its target context, or blindly copied from another source?
- Are examples, terminology, and references relevant to this project's domain?
- Does a question or guideline make sense for this product type?
  (e.g., "mobile support?" for an internal desktop tool, "scale to millions?" for a 10-user system)
- Does this document reference skills, files, commands, or APIs that don't actually exist in this repository?

#### Attack Vector: Codebase Consistency

- Do code examples match the actual project conventions? (sync vs. async, naming, import styles)
- Are file paths, command invocations, and tooling references accurate and current?
- Would someone following these examples produce code that passes the project's linter and tests?

#### Attack Vector: Magic Numbers in Generated Artifacts

- Do prompts, templates, config files, or generated content contain hardcoded
  values that are configurable elsewhere? (thresholds, limits, ranges, timeouts)
- If the source-of-truth value changes (in config, env vars, or code), will
  the artifact silently become inconsistent?
- Should the value be a template variable, referencing the single source?
- Watch especially for: tier/threshold boundaries, retry counts, buffer sizes,
  token limits, and any numeric literal that appears in prose or instructions.

#### Attack Vector: Delegation vs. Restatement

- Does this document restate content that already lives in an authoritative source?
- Would a change to the source be automatically picked up, or would this document also need updating?
- Can inline instructions be replaced with a reference to the source?

#### Attack Vector: Staleness Risk

- Does this document reference specific file paths, version numbers, URLs, or configurations?
- How likely are those references to become outdated? Is there a mechanism to detect drift?
- Are there TODO/placeholder sections that will be forgotten?
