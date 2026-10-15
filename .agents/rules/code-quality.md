---
description: "Readable implementation, capability reuse, meaningful verification and test persistence."
globs: "*"
alwaysApply: true
trigger: always_on
---

# Implementation Baseline

- Before custom logic, check repository capabilities, platform/standard libraries
  and established tools; for CLI/TUI discovery consult directories such as
  [Terminal Trove](https://terminaltrove.com/list/). Reuse suitable capabilities;
  justify custom replacements by an evidenced unmet requirement. Selection does
  not authorize installation or network effects.
- Favor clear responsibilities, small useful interfaces, visible effects and
  idiomatic code. Settle affected consumer behavior/contracts before independent
  implementation; formal signatures/files only where coordination needs them.
  Numeric style thresholds, one-export files, module headers and README creation
  are contextual techniques, not universal gates. Do not overengineer utilities.
- Honor an existing glossary and resolve conflicting critical business meanings;
  routine names need no user approval or unsolicited glossary bootstrap.
- Select meaningful verification and persistence before writing checks. Without
  extra approval retain only end-to-end behavior tests and important unit tests
  for critical authorization, financial, integrity or state-transition logic.
  Other checks stay in approved external scratch and are cleaned up before
  handoff. Build/commit approval is not permission to retain extra tests.
- Honor existing suites and quality gates: never delete, weaken or bypass them
  without explicit user approval. TDD and clean-room testing are optional methods,
  not exemptions from outcome verification or test-retention boundaries.
- Scientific ideation is exempt from production roadmaps, TDD, modularity and
  terminology bureaucracy, not data integrity, safety or resource bounds.

Methods: [Code quality](../skills/code-craft/references/code-quality-guidance.md),
[Testing](../skills/code-craft/references/testing.md).
