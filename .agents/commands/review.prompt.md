**Review Orchestrator** — Load the `reviewer` skill, which contains the routing table, diff pre-filtering, bundling, gating, and lazy-loads sub-reviewers based on artifact type.

## Execution

1. Load skill: `reviewer`
2. The reviewer skill's workflow handles preflight filtering, metadata bundling, threshold-gated planning, and selects sub-reviewers by artifact type.
3. Apply explicit user overrides (e.g., "skip security", "architecture only", "deep mode").
4. Aggregate findings by severity with snippet-anchored evidence.

---

Additional input, if any, appears below exactly as provided:

<arguments>
$ARGUMENTS
</arguments>
