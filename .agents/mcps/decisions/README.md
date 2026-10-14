---
audience: OpenCode users and MCP maintainers
purpose: Obtain structured Jev decisions through Zen System One
scope: OpenCode-only stateless decision API; not chat generation or agent delegation
---
# Decisions MCP

A decision-support MCP, currently backed by OpenCode Zen System One and enabled only in OpenCode. The service name does not depend on its backend; additional capabilities or providers are not implemented yet.

| Property | Value |
|---|---|
| **Purpose** | Structured decisions through `https://opencode.ai/zen/v1/systemone` |
| **Model** | `jev-1.13-free`, fixed; no model fallback |
| **Prerequisites** | Bun and your existing Zen account key inherited as `OPENCODE_API_KEY` |
| **Registration** | [OpenCode configuration only](../../../.config/opencode/opencode.jsonc), not the shared MCP registry |

```text
OpenCode → MCP evaluate → Zen /v1/systemone → Jev decision probabilities
```

System One answers **choice, score and boolean questions**, not chat prompts. Each call supplies its own context; it creates no OpenCode session and gives the decision model no tools.

## Use

Launch OpenCode from a shell that has loaded `~/.shrc`, with your existing `OPENCODE_API_KEY` available in its environment and the repository's dotfiles deployed. The [launcher](bin/mcp-decisions) reads no `.env` files; no new key is stored in MCP configuration or output.

This MCP exposes just **`evaluate`**; call it directly, with no status or preflight step.

Use it proactively for meaningful choices among plausible options: autonomous next steps, recommendations before asking the user, or a worker deciding between another authorized check and returning findings to the primary. Decide trivial deterministic choices directly. This is not a chat, research or tool-execution endpoint. Gather evidence first, then supply self-contained facts, unknowns, constraints, authority and neutrally worded alternatives; the model cannot see your chat or repository.

The [Decision Support skill](../../skills/decision-support/SKILL.md) provides the agent workflow and a bounded-worker example. The server also advertises this usage through MCP initialization instructions and the tool description. Consultation advises the responsible agent; it never supplies user approval, mandatory evidence, independent review or permission to bypass a hard stop. Workers in other harnesses may not have this OpenCode-local tool.

Call `evaluate` with:

```json
{
  "state": "Goal: diagnose a flag-ordering failure, not edit code. One fixture fails while the default passes. Unknown: ordering versus validation. Both options below are authorized; one targeted offline fixture takes 5 seconds. The primary can integrate partial findings. No network or new implementation is allowed.",
  "questions": {
    "next_action": {
      "type": "choice",
      "instructions": "Choose the next action balancing useful evidence, latency and assignment scope.",
      "criteria": {
        "targeted_check": "Run the one authorized ordering fixture, then report evidence and limits",
        "return_now": "Return partial findings and propose the check to the primary"
      }
    },
    "check_value": {
      "type": "score",
      "instructions": "Rate the expected diagnostic value of the targeted fixture given the supplied evidence.",
      "criteria": ["Low", "Moderate", "High"]
    },
    "ordering_cause": {
      "type": "boolean",
      "instructions": "Is flag ordering more likely than validation to explain the failure?"
    }
  },
  "timeoutMs": 20000
}
```

Successful output has `ok: true`, `model`, `responsePath`, `resultPath`, `truncated`, and — when the serialized result is at most 64 KiB — named `answers` and optional token `usage` inline. Choice answers include the selected option and probabilities; scores range from **0 to number of criteria minus 1** and may be fractional; boolean answers return `probability` in **0–1**.

When the serialized result exceeds 64 KiB, `answers` and `usage` are omitted from the inline envelope; the full normalized result is on disk at `resultPath`. Oversized is not an error: `ok` is `true` and `truncated` is `true`. `responsePath` always points to the raw HTTP response body; `resultPath` points to the normalized JSON result (null on failure). Both paths are null only if the cache directory could not be created.

| Input | Limit |
|---|---|
| `state` | Required nonblank string, at most 64000 characters; serialize structured context into this string |
| `questions` | 1–16 named questions; names/choice keys 1–100 characters |
| `instructions` | Required string, 1–8000 characters |
| Choice `criteria` | Map of 1–255 options to descriptions or `null` |
| Score `criteria` | Ordered array of 2–10 descriptions or `null` |
| Boolean `criteria` | Optional `{ "true": description, "false": description }`; values may be `null` |
| `timeoutMs` | 1000–120000; default 20000 |

## Boundaries and failures

- **Account reuse:** The inherited `OPENCODE_API_KEY` is sent only as a bearer header to the fixed Zen endpoint. No credential arguments, account-file reads, anonymous fallback or configurable destination.
- **Auth missing:** `AUTH_UNAVAILABLE` means OpenCode did not inherit the variable. Supply the existing Zen key outside chat and relaunch with it; do not paste secrets into prompts.
- **Provider rejection:** `HTTP_ERROR` includes the HTTP status, not the raw provider body. Check account access, rate limits and API compatibility.
- **Resource bounds:** One evaluation at a time (`BUSY` for concurrent calls), at most 256 KiB serialized request. The full HTTP response body is streamed to a private XDG cache before parsing; there is no response-size limit. Invalid structured answers fail explicitly. Large results that exceed the 64 KiB inline threshold are stored at `resultPath` and the envelope omits `answers`; the result is never clipped.
- **Output paths:** Every response includes `responsePath` (raw HTTP body) and `resultPath` (normalized result JSON). Both paths are absolute, private (0700/0600) and not auto-expired; do not store secrets in `state` or `questions`. Paths are null only when the cache directory could not be created (`OUTPUT_CAPTURE_FAILED`); error envelopes also include paths when capture succeeded before the failure.
- **Cost and privacy:** State and questions go to Zen. Do not send secrets; timeouts are not token/spend caps and do not guarantee upstream generation stops. No retries are attempted.
- **Interpretation:** Probabilities are model estimates, not guarantees. Validate consequential decisions independently.
- **Decision ownership:** Compare the suggestion with evidence; choose only within authority or explain a recommendation before asking the user. On failure/unavailability, report the limitation and use ordinary judgment only where the active workflow allows; never waive a hard stop or retry blindly.

## Maintenance

[server.ts](src/server.ts) registers only `evaluate` and owns concurrency; [api.ts](src/api.ts) validates inputs, streams the HTTP response body to a private XDG cache via [response.ts](src/response.ts), validates the selected model and answers, serializes the normalized result, and returns path metadata. The adapter translates boolean questions to Zen's wire type `noul` and maps `noul` back to a probability.

Runtime follows the repository's Bun/MCP SDK v1/Zod v4 conventions, with automatic package resolution and no local `node_modules`. Native `mcp.servers` registration coexists with legacy OpenCode entries; other harnesses are unchanged.

Protocol references: [Zen provider](https://github.com/anomalyco/opencode/blob/dev/packages/ai/src/providers/opencode-zen.ts), [System One wire contract](https://github.com/anomalyco/opencode/blob/dev/packages/ai/src/experimental/system-one.ts), [evaluation types](https://github.com/anomalyco/opencode/blob/dev/packages/ai/src/experimental/evaluation.ts), [MCP configuration](https://opencode.ai/v2/docs/mcp-servers).
