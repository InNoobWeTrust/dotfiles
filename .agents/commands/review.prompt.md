**Review Orchestrator** — Select reviewer skills for the artifact under review, run them, and aggregate findings.

## Routing Table

| Artifact Type | Reviewer Skills | Order |
| --- | --- | --- |
| Code / diffs / pull requests | `adversarial-reviewer`, `security-reviewer`, `edge-case-hunter` | Logic first, then security, then paths |
| Specs / PRDs / TRDs | `adversarial-reviewer`, `editorial-reviewer` | Challenge reasoning, then structure |
| Architecture / design docs | `adversarial-reviewer`, `security-reviewer` | Challenge decisions, then threat model |
| Documentation / prose | `editorial-reviewer` | Structure, then prose if needed |
| Config / infra | `security-reviewer`, `edge-case-hunter` | Security first, then boundaries |
| BDD specs / test plans | `adversarial-reviewer`, `edge-case-hunter` | Coverage gaps, then path tracing |
| API contracts | `adversarial-reviewer`, `security-reviewer`, `edge-case-hunter` | Design, then security, then boundaries |
| Skill / command definitions | `adversarial-reviewer`, `editorial-reviewer` | Challenge logic, then clarity |

## Orchestration

1. Identify the artifact type from user intent, content markers, file extension, and path.
2. Apply explicit user reviewer overrides before the routing table.
3. For mixed artifacts, run the union of matching reviewer skills in the primary artifact order.
4. Use quick mode to run only the primary reviewer; use deep mode to run all relevant reviewer skills.
5. Aggregate findings by severity, include file/line references where available, and keep findings as the primary output.

If a required reviewer skill is unavailable, skip it and note the gap. If a critical security review is unavailable for security-sensitive work, stop and report the blocker.

## Invocation Arguments

Additional command input, if any, appears below exactly as provided:

```text
$ARGUMENTS
```

Use the block above as raw additional user input. Preserve whitespace, blank lines, and quoting exactly. If the block is empty, rely on the conversation context instead.

Follow this command for the user's review request below.
