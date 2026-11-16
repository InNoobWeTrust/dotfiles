---
audience: Decisions MCP maintainers
purpose: Explain supported gateways and additional decision-model candidates
scope: Provider contracts and public catalogs; not a guarantee of account access
metadata:
  sources-checked: "2026-10-19"
  decision-catalog-checked: "2026-11-16"
---
# Decision providers and candidates

[Back to Decisions MCP](../README.md)

OpenRouter's [decision catalog](https://openrouter.ai/api/v1/models?output_modalities=decisions) is separate from its chat catalog. The MCP uses the fixed chain Zen → OpenRouter Clef → OpenRouter Gemini Decision 1 → OpenRouter GPT Luna, advancing only on HTTP 429 and skipping unconfigured/ineligible routes. The fixed chain does not track temporary free OpenRouter models; decision models are not chat subagents.

## Configured routes

These are the only routes used by the MCP, in attempt order:

| Order | Gateway | Model | Listed input price / 1M tokens |
|---|---|---|---|
| Primary | OpenCode Zen | `jev-1.13-free` | Free |
| First fallback | OpenRouter | `cloudflare/clef-flash` | $0.019 |
| Second fallback | OpenRouter | `google/gemini-decision-1` | $0.10 |
| Last fallback | OpenRouter | `openai/gpt-6-luna-decisions` | $0.10 |

The primary Jev request uses `https://opencode.ai/zen/v1/systemone` with inherited `OPENCODE_API_KEY`. It does not use OpenRouter; the paid OpenRouter Jev offerings below are separate, unconfigured alternatives.

The three OpenRouter fallbacks use inherited `OPENROUTER_API_KEY` and OpenRouter's [alpha decision API](https://openrouter.ai/docs/guides/community/jev), not chat completions; revisit the adapter if that alpha contract changes. Google and OpenAI BYOK stay inside OpenRouter; no direct Google or OpenAI key is read.

## Unconfigured alternatives

These candidates are not in the configured chain and receive no MCP requests:

| Route | Candidate | Listed input price / 1M tokens | Integration gap |
|---|---|---|---|
| OpenRouter | `typesafe/jev-1.14` / `typesafe/jev-1.13` | $0.042 | Not implemented; would require adding and validating a separate route |
| [Direct OpenAI](https://developers.openai.com/api/docs/guides/decisions) | `gpt-6-luna` via `/v1/decisions` | $0.10 | Not implemented; requires a different codec and refusal handling |

## Console BYOK access

OpenCode Console BYOK is separate from OpenRouter BYOK. The [Console Providers API](https://opencode.ai/v2/docs/console/api/providers/) documents chat, Responses, Messages and Gemini, not decision forwarding; that path remains unverified and unimplemented.

The MCP's OpenRouter fallbacks call OpenRouter directly with inherited `OPENROUTER_API_KEY`; the primary Jev route instead uses OpenCode Zen and inherited `OPENCODE_API_KEY`. Neither path extracts stored credentials.

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
