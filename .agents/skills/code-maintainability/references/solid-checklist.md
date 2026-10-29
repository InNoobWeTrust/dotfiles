# Responsibility, Interfaces and Dependencies

Use as an optional assessment lens on verified working code, not a SOLID
compliance gate. Inspect the changed surface and relevant consumers; report only
concrete costs. [The assessment/refinement contract](../SKILL.md) controls actions
and approval. No code changes or new tool runs are authorized by this reference.

| Lens | Evidence worth investigating | Smallest useful recommendation |
|---|---|---|
| Responsibility | One change repeatedly requires editing unrelated rules or effects in the same component | Separate the responsibility causing that observed coupling; do not extract every step |
| Extension | A current additional case requires copying or modifying a stable rule in several places | Localize the varying rule when that case exists; no strategies for imagined consumers |
| Substitution | An implementation violates a caller's accepted inputs, outputs, errors or state guarantees | Report a required-compatibility defect separately, not optional style debt |
| Interface size | A real consumer must depend on unrelated capabilities or awkward no-op methods | Reduce that consumer's required surface without breaking other callers |
| Dependency direction | Domain decisions depend on transport/storage details, producing a traced change ripple | Adjust the affected dependency or pass the needed capability explicitly; no framework by default |
| Abstraction depth | Wrappers or indirection add navigation without hiding a meaningful rule or boundary | Remove or consolidate only where the simpler path demonstrably reduces reader effort |

A short helper, missing phase document or unchecked lens is not a finding by
itself. Do not require an N/A ritual or an upfront design document. Configured
gates and the governing structure standard define the numeric and boundary limits.

For each finding, record location, violated rule or actual change/reader cost,
smallest behavior-preserving adjustment, and risk/effort. Classify it under the
root skill: **structural** (standard violation inside the footprint; mandatory
cleanup after lock), **optional** (needs explicit approval) or **defect** (blocker).
**Nothing to clean** is valid when the footprint already meets the standard.
