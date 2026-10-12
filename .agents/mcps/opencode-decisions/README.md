---
audience: OpenCode users and MCP maintainers
purpose: Obtain structured Jev decisions through Zen System One
scope: OpenCode-only stateless decision API; not chat generation or agent delegation
---
# OpenCode Decisions MCP

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

Launch OpenCode with your existing `OPENCODE_API_KEY` available in its environment and the repository's dotfiles deployed. The [launcher](../../../.local/bin/mcp-opencode-decisions) reads no `.env` files; no new key is stored in MCP configuration or output.

This MCP exposes just **`evaluate`**; call it directly, with no status or preflight step.

Use it for a second opinion on consequential trade-offs: selecting an approach, prioritizing alternatives or judging a proposal against criteria. Decide trivial choices directly; this is not a chat, research or tool-execution endpoint. Gather relevant evidence first, then supply self-contained context and neutrally worded alternatives; the model cannot see your chat or repository.

Call `evaluate` with:

```json
{
  "state": "We need a local decision helper. Reusing an existing API costs less maintenance than adding a new hosted service.",
  "questions": {
    "approach": {
      "type": "choice",
      "instructions": "Choose the lower-maintenance approach.",
      "criteria": {
        "reuse": "Use the existing API",
        "new_service": "Build another hosted service"
      }
    },
    "maintenance": {
      "type": "score",
      "instructions": "Rate the maintenance burden of reusing the existing API.",
      "criteria": ["Low", "Moderate", "High"]
    },
    "prefer_reuse": {
      "type": "boolean",
      "instructions": "Does the supplied context favor API reuse?"
    }
  },
  "timeoutMs": 20000
}
```

Successful output has `ok: true`, `model`, named `answers` and optional token `usage`. Choice answers include the selected option and probabilities; scores range from **0 to number of criteria minus 1** and may be fractional; boolean answers return `probability` in **0–1**.

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
- **Resource bounds:** One evaluation at a time (`BUSY` for concurrent calls), at most 256 KiB serialized request and 1 MiB response. Invalid or oversized structured answers fail explicitly; decisions are never clipped.
- **Cost and privacy:** State and questions go to Zen. Do not send secrets; timeouts are not token/spend caps and do not guarantee upstream generation stops. No retries are attempted.
- **Interpretation:** Probabilities are model estimates, not guarantees. Validate consequential decisions independently.

## Maintenance

[server.ts](src/server.ts) registers only `evaluate` and owns concurrency; [api.ts](src/api.ts) validates inputs, sends a bounded native request and validates the selected model and answers. The adapter translates boolean questions to Zen's wire type `noul` and maps `noul` back to a probability.

Runtime follows the repository's Bun/MCP SDK v1/Zod v4 conventions, with automatic package resolution and no local `node_modules`. Native `mcp.servers` registration coexists with legacy OpenCode entries; other harnesses are unchanged.

Protocol references: [Zen provider](https://github.com/anomalyco/opencode/blob/dev/packages/ai/src/providers/opencode-zen.ts), [System One wire contract](https://github.com/anomalyco/opencode/blob/dev/packages/ai/src/experimental/system-one.ts), [evaluation types](https://github.com/anomalyco/opencode/blob/dev/packages/ai/src/experimental/evaluation.ts), [MCP configuration](https://opencode.ai/v2/docs/mcp-servers).
