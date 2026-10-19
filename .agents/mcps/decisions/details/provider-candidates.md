---
audience: Decisions MCP maintainers
purpose: Explain supported gateways and additional decision-model candidates
scope: Provider contracts and public catalogs; not a guarantee of account access
---
# Decision providers and candidates

[Back to Decisions MCP](../README.md)

**Checked: 2026-10-19.** OpenRouter's [decision catalog](https://openrouter.ai/api/v1/models?output_modalities=decisions) is separate from its chat catalog. The MCP supports Zen → OpenRouter Clef → OpenRouter Mercury free → OpenRouter GPT Luna, advancing only on HTTP 429 and skipping unconfigured/ineligible routes. Decision models are not chat subagents.

| Route | Candidate | Listed input price / 1M tokens | Integration gap |
|---|---|---|---|
| OpenRouter | `inception/mercury-decide:free` | $0 | Implemented second fallback; requires inherited `OPENROUTER_API_KEY` |
| OpenRouter | `typesafe/jev-1.14` / `typesafe/jev-1.13` | $0.042 | Similar System One contract; safely validate versioned response model IDs |
| OpenRouter | `cloudflare/clef-flash` | $0.038 | Implemented first fallback; same OpenRouter key, replaces direct Workers AI |
| OpenRouter | `openai/gpt-6-luna-decisions` | $0.10 | Implemented third fallback; same OpenRouter key, paid route |
| Direct OpenAI | `gpt-6-luna` via `/v1/decisions` | $0.10 | New request/response adapter and refusal handling |

The MCP uses OpenRouter's [alpha decision API](https://openrouter.ai/docs/guides/community/jev), not chat completions; revisit the adapter if that alpha contract changes. OpenAI BYOK stays inside OpenRouter; no direct OpenAI key is read. [Direct OpenAI Decisions](https://developers.openai.com/api/docs/guides/decisions) has a different codec and is not implemented.

## Console BYOK access

OpenCode Console BYOK is separate from OpenRouter BYOK. The [Console Providers API](https://opencode.ai/v2/docs/console/api/providers/) documents chat, Responses, Messages and Gemini, not decision forwarding; that path remains unverified and unimplemented. The MCP uses OpenRouter directly with its inherited key and never extracts stored credentials.

Before enabling another fallback, verify authentication and choice/score/boolean responses against the actual connection, approve its cost and data destination, and extend model validation, discovery, timeout/cancellation and fallback-policy tests. Catalog membership and published pricing do not prove account access, quota or reliability. Different models require independent validation of consequential probability thresholds.

## Hugging Face findings

Public Hub metadata exposes decision-model weights, but no compatible, working hosted decision route was verified. The following API queries explicitly requested `inferenceProviderMapping`, `cardData` and `gated`; all four models were ungated.

| Model card | Declared license | Public inference-provider mapping |
|---|---|---|
| [Cloudflare/clef-flash](https://huggingface.co/Cloudflare/clef-flash) | Apache-2.0 | Empty |
| [LiquidAI/d1-3B](https://huggingface.co/LiquidAI/d1-3B) | `other`, named `lfm1.0` | Empty |
| [vllm-sr/d3-flash](https://huggingface.co/vllm-sr/d3-flash) | Apache-2.0 | Empty |
| [convaiinnovations/laya](https://huggingface.co/convaiinnovations/laya) | Apache-2.0 | `hf-inference`, status `error`, task `text-classification` |

**Access boundary:** Empty mappings do not rule out private deployments or future providers. Weights and generic classification pipelines do not establish support for this MCP's choice/score/boolean wire contract. No Hugging Face fallback, model download or self-hosting was enabled.
