---
audience: OpenCode users and MCP maintainers
purpose: Obtain structured decisions through Zen with a Cloudflare rate-limit fallback
scope: OpenCode-only stateless decision API; not chat generation or agent delegation
---
# Decisions MCP

A decision-support MCP backed by OpenCode Zen System One, with an optional Cloudflare Workers AI fallback on rate limits. Enabled only in OpenCode.

| Property | Value |
|---|---|
| **Purpose** | Structured decisions through `https://opencode.ai/zen/v1/systemone` |
| **Models** | Primary `jev-1.13-free`; optional fallback `clef-flash` (`@cf/cloudflare/clef-flash`) |
| **Prerequisites** | Bun and your existing Zen account key inherited as `OPENCODE_API_KEY`; optional Cloudflare variables below |
| **Tools** | `discover`; `evaluate` only after startup/discovery verifies a usable route |
| **Registration** | [OpenCode configuration only](../../../.config/opencode/opencode.jsonc), not the shared MCP registry |

```text
OpenCode → MCP evaluate → Zen /v1/systemone → Jev decision probabilities
                         └─ HTTP 429 → Cloudflare Workers AI → Clef-flash
```

System One answers **choice, score and boolean questions**, not chat prompts. Each call supplies its own context; it creates no OpenCode session and gives the decision model no tools.

## Use

Launch OpenCode from a shell that has loaded `~/.shrc`, with your existing `OPENCODE_API_KEY` available in its environment and the repository's dotfiles deployed. The [launcher](bin/mcp-decisions) reads no `.env` files; no new key is stored in MCP configuration or output.

To enable the fallback, also inherit `CLOUDFLARE_ACCOUNT_ID` (32 hexadecimal characters) and `CLOUDFLARE_API_TOKEN` with Workers AI access. Keep values outside chat and MCP configuration. The MCP does not read `~/.vars.user` or OpenCode's stored provider credentials: the service must inherit the variables. Reconnect the MCP or relaunch OpenCode after changing its environment or this code.

Only a Zen **HTTP 429** triggers a single fallback attempt. Missing/invalid Cloudflare credentials, an active Cloudflare cooldown, a single-option choice question (Clef requires at least two options), or a Cloudflare request over **20,000 UTF-8 bytes** skips fallback and returns the original 429. This conservative byte limit includes the state and questions and avoids silently truncating long context. Both attempts share the original timeout and cancellation signal. Other Zen errors do not trigger fallback; Cloudflare errors are reported explicitly without another attempt. Cloudflare 429s apply an account-scoped, process-local cooldown using `Retry-After` (60 seconds when absent or invalid).

Cloudflare provides a shared **10,000-neuron daily allowance**, not unlimited free inference. Use **Workers Free** for a hard stop at the allowance; a Workers Paid account can incur overage. No automatic paid model substitution occurs. Changing models can change probability estimates; validate consequential thresholds independently. See [Cloudflare pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).

### Startup availability and discovery

Following the LSP MCP's capability-gating pattern, startup checks inherited credentials and sends one tiny, public-data decision request to each configured model. The probes run in parallel, each with a **4-second** timeout and a **16 KiB** response limit. They verify authentication, endpoint reachability, model identity and a valid answer—not merely the presence of an environment variable. No credentials means no request to that provider. Probes consume quota and may incur the account's normal inference charges; no automatic retries or periodic polling run.

`discover` is always available. `evaluate` appears only if Zen passes, or if Zen returns HTTP 429 **and Clef-flash passes**. Cloudflare credentials alone do not expose `evaluate`: it remains a Zen-429 fallback, not an auth/network fallback. Missing/invalid configuration, expired credentials, quota limits and unreachable or malformed model replies are reported as sanitized provider statuses without secrets or raw error bodies.

If `evaluate` is absent, call `discover` to check again and refresh registration, then relist tools. Concurrent discovery calls share one probe batch; discovery is refused while an evaluation runs. Existing Cloudflare cooldowns are respected. Failed provider invocations remove `evaluate` until discovery succeeds; caller cancellation and input-size errors do not. Availability is a point-in-time check, not an uptime or remaining-quota guarantee—do not run discovery before every evaluation.

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

- **Account reuse:** `OPENCODE_API_KEY` goes only to the fixed Zen endpoint. `CLOUDFLARE_API_TOKEN` goes only to the fixed Cloudflare Workers AI endpoint for the validated account. No credential arguments, account-file reads, anonymous fallback or configurable destination.
- **Auth missing:** `AUTH_UNAVAILABLE` means OpenCode did not inherit the variable. Supply the existing Zen key outside chat and relaunch with it; do not paste secrets into prompts.
- **Provider rejection:** `HTTP_ERROR` includes the HTTP status, not the raw provider body. Check account access, rate limits and API compatibility.
- **Resource bounds:** One evaluation at a time (`BUSY` for concurrent calls), at most 256 KiB serialized request. The full HTTP response body is streamed to a private XDG cache before parsing; there is no response-size limit. Invalid structured answers fail explicitly. Large results that exceed the 64 KiB inline threshold are stored at `resultPath` and the envelope omits `answers`; the result is never clipped.
- **Output paths:** Every response includes `responsePath` (raw HTTP body) and `resultPath` (normalized result JSON). Both paths are absolute, private (0700/0600) and not auto-expired; do not store secrets in `state` or `questions`. Paths are null only when the cache directory could not be created (`OUTPUT_CAPTURE_FAILED`); error envelopes also include paths when capture succeeded before the failure.
- **Cost and privacy:** State and questions go to Zen and, when fallback runs, Cloudflare. Do not send secrets; timeouts are not token/spend caps and do not guarantee upstream generation stops. No same-provider retries are attempted. Each attempted provider has its own private raw response cache; the Zen 429 capture is retained when Cloudflare is attempted. Returned paths then identify the Cloudflare attempt. Caches are not auto-expired.
- **Interpretation:** Probabilities are model estimates, not guarantees. Validate consequential decisions independently.
- **Decision ownership:** Compare the suggestion with evidence; choose only within authority or explain a recommendation before asking the user. On failure/unavailability, report the limitation and use ordinary judgment only where the active workflow allows; never waive a hard stop or retry blindly.

## Maintenance

[server.ts](src/server.ts) owns concurrency and catalog transitions: startup/discovery → bounded [availability probes](src/availability.ts) → add/remove the `evaluate` registration handle. [providers.ts](src/providers.ts) owns fixed model IDs, destinations and Cloudflare configuration validation, shared by probes and evaluations. [api.ts](src/api.ts) owns the bounded provider attempts and cooldown, streams each raw evaluation response through [response.ts](src/response.ts), validates selected models and answers, and persists normalized results. [schema.ts](src/schema.ts) validates per-provider model identity and unwraps Cloudflare's `success`/`result` envelope. Both adapters translate boolean questions to `noul` and back to a probability. Cloudflare question IDs are remapped to safe generated IDs and restored before returning answers; caller evaluation input/output schemas remain unchanged. Probe replies are bounded, discarded, and never stored in the evaluation cache.

Runtime follows the repository's Bun/MCP SDK v1/Zod v4 conventions, with automatic package resolution and no local `node_modules`. Native `mcp.servers` registration coexists with legacy OpenCode entries; other harnesses are unchanged.

Protocol references: [Zen provider](https://github.com/anomalyco/opencode/blob/dev/packages/ai/src/providers/opencode-zen.ts), [System One wire contract](https://github.com/anomalyco/opencode/blob/dev/packages/ai/src/experimental/system-one.ts), [evaluation types](https://github.com/anomalyco/opencode/blob/dev/packages/ai/src/experimental/evaluation.ts), [MCP configuration](https://opencode.ai/v2/docs/mcp-servers).
