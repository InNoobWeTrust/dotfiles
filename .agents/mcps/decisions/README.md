---
audience: OpenCode users and MCP maintainers
purpose: Obtain structured decisions through Zen with ordered rate-limit fallbacks
scope: OpenCode-only stateless decision API; not chat generation or agent delegation
---
# Decisions MCP

A decision-support MCP backed by OpenCode Zen, with optional OpenRouter rate-limit fallbacks. Enabled only in OpenCode.

| Property | Value |
|---|---|
| **Purpose** | Structured decisions through `https://opencode.ai/zen/v1/systemone` |
| **Models, in order** | `jev-1.13-free` → `cloudflare/clef-flash` → `inception/mercury-decide:free` → `openai/gpt-6-luna-decisions` |
| **Prerequisites** | Bun, inherited `OPENCODE_API_KEY`; optional `OPENROUTER_API_KEY` for all fallbacks |
| **Tools** | `discover`; `evaluate` only after startup/discovery verifies a usable route |
| **Registration** | [OpenCode configuration only](../../../.config/opencode/opencode.jsonc), not the shared MCP registry |

```text
OpenCode → MCP evaluate → Zen Jev
                         └─ 429 → OpenRouter Clef
                                   └─ 429 → OpenRouter Mercury free
                                             └─ 429 → OpenRouter GPT Luna
```

System One answers **choice, score and boolean questions**, not chat prompts. Each call supplies its own context; it creates no OpenCode session and gives the decision model no tools.

## Use

Launch OpenCode from a shell that has loaded `~/.shrc`, with your existing `OPENCODE_API_KEY` available in its environment and the repository's dotfiles deployed. The [launcher](bin/mcp-decisions) reads no `.env` files; no new key is stored in MCP configuration or output.

For all three fallbacks, inherit `OPENROUTER_API_KEY`; configure Cloudflare/OpenAI BYOK inside OpenRouter, not in this MCP. No direct Cloudflare account ID or token is needed or read. Keep values outside chat and MCP configuration; the MCP reads neither account files nor stored OpenCode credentials. Reconnect the MCP after changing its environment or this code.

Only **HTTP 429** advances the ordered chain; other HTTP errors, network failures and invalid answers stop it. All fallbacks require the OpenRouter key and a request within 256 KiB; Clef additionally requires two or more choice options and at most **12,000 serialized UTF-8 request bytes**, conservatively leaving headroom for its smallest listed 16K-token backend (not an exact token count). Ineligible routes are skipped, never truncated; all attempts share the original timeout and cancellation signal. There is no direct Workers AI transport or account cooldown.

**Costs:** Mercury's `:free` route is listed free; Clef and GPT Luna are paid OpenRouter routes (listed **$0.038** and **$0.10 / million input tokens**, respectively). OpenRouter controls BYOK routing and billing; this MCP does not enforce BYOK-only service or a spend cap, and the direct Workers AI allowance does not apply as an MCP guarantee. Changing models changes estimates; validate consequential thresholds independently.

### Startup availability and discovery

Following the LSP MCP's capability-gating pattern, startup checks inherited credentials and sends one tiny, public-data decision request to each configured model. The probes run in parallel, each with a **4-second** timeout and a **16 KiB** response limit. They verify authentication, endpoint reachability, model identity and a valid answer—not merely the presence of an environment variable. No credentials means no request to that provider. Probes consume quota and may incur the account's normal inference charges; no automatic retries or periodic polling run.

`discover` is always available. `evaluate` appears if Zen passes, or Zen returns 429 and the ordered fallback checks reach an available route. Unconfigured and rate-limited routes are skipped; authentication, network, malformed-response and other HTTP failures stop traversal. Fallback keys alone cannot enable evaluation without Zen's credential context. With both keys configured, discovery makes **four parallel probes, including paid Clef and GPT Luna**, even when Zen is healthy.

If `evaluate` is absent, call `discover` to check again and refresh registration, then relist tools. Concurrent discovery calls share one probe batch; discovery is refused while an evaluation runs. Failed provider invocations remove `evaluate` until discovery succeeds; caller cancellation and input-size errors do not. Availability is a point-in-time check, not an uptime or remaining-quota guarantee—do not run discovery before every evaluation.

### Evaluate

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

Successful output has `ok: true`, `model`, `responsePath`, `resultPath`, `truncated`, and — for results at most 64 KiB — named `answers` and optional token `usage`. Choice answers include the selected option; OpenRouter may omit choice/score probabilities. Scores range from **0 to number of criteria minus 1**, possibly fractional; booleans return `probability` in **0–1**. OpenRouter's allowlisted versioned model IDs normalize to the requested route; the raw response retains upstream identity.

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

- **Account reuse:** The Zen key goes only to its fixed endpoint; `OPENROUTER_API_KEY` goes only to `https://openrouter.ai/api/alpha/decisions`. No credential arguments, account-file reads, anonymous fallback or configurable destination.
- **Auth missing:** `AUTH_UNAVAILABLE` means OpenCode did not inherit the variable. Supply the existing Zen key outside chat and relaunch with it; do not paste secrets into prompts.
- **Provider rejection:** `HTTP_ERROR` includes the HTTP status, not the raw provider body. Check account access, rate limits and API compatibility.
- **Resource bounds:** One evaluation at a time (`BUSY` for concurrent calls), at most 256 KiB serialized request. The full HTTP response body is streamed to a private XDG cache before parsing; there is no response-size limit. Invalid structured answers fail explicitly. Large results that exceed the 64 KiB inline threshold are stored at `resultPath` and the envelope omits `answers`; the result is never clipped.
- **Output paths:** Every response includes `responsePath` (raw HTTP body) and `resultPath` (normalized result JSON). Both paths are absolute, private (0700/0600) and not auto-expired; do not store secrets in `state` or `questions`. Paths are null only when the cache directory could not be created (`OUTPUT_CAPTURE_FAILED`); error envelopes also include paths when capture succeeded before the failure.
- **Cost and privacy:** State and questions go to each attempted provider, potentially including OpenRouter and its upstream OpenAI service. Timeouts are not spend caps and do not guarantee upstream cancellation. Each route is attempted at most once, with its own private raw response cache; returned paths identify the last attempt. Earlier captures remain on disk and are not auto-expired.
- **Interpretation:** Probabilities are model estimates, not guarantees. Validate consequential decisions independently.
- **Decision ownership:** Compare the suggestion with evidence; choose only within authority or explain a recommendation before asking the user. On failure/unavailability, report the limitation and use ordinary judgment only where the active workflow allows; never waive a hard stop or retry blindly.

## Other providers

See [provider support and Hugging Face findings](details/provider-candidates.md) for candidates and access limits.

## Maintenance

[server.ts](src/server.ts) owns composition/startup; [protocol/tools.ts](src/protocol/tools.ts) owns registration. [evaluation/providers/availability.ts](src/evaluation/providers/availability.ts) probes routes before exposing evaluation. [evaluation/providers/config.ts](src/evaluation/providers/config.ts) fixes destinations and model aliases; [evaluation/api.ts](src/evaluation/api.ts) owns ordered attempts and wire adaptation; [evaluation/capture/response.ts](src/evaluation/capture/response.ts) owns private captures. [evaluation/schema.ts](src/evaluation/schema.ts) validates flat Zen/OpenRouter replies. Boolean questions map to `noul`; OpenRouter preserves question IDs, fills missing boolean descriptions with `true`/`false`, and null score descriptions with their zero-based index. Discovery retains `providers.cloudflare` for Clef's upstream-vendor status, now through OpenRouter. Probe replies are bounded, discarded and never cached.

Runtime follows the repository's Bun/MCP SDK v1/Zod v4 conventions, with automatic package resolution and no local `node_modules`. Native `mcp.servers` registration coexists with legacy OpenCode entries; other harnesses are unchanged.

Protocol references: [OpenCode provider](https://github.com/anomalyco/opencode/blob/dev/packages/ai/src/providers/opencode.ts), [System One wire contract](https://github.com/anomalyco/opencode/blob/dev/packages/ai/src/experimental/system-one.ts), [evaluation types](https://github.com/anomalyco/opencode/blob/dev/packages/ai/src/experimental/evaluation.ts), [MCP configuration](https://opencode.ai/v2/docs/mcp-servers).
