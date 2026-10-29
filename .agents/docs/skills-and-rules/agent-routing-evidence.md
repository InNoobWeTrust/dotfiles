---
metadata:
  reviewed: "2026-10-21"
  review-trigger: "Revisit after meaningful local outcomes or checkpoint changes"
---

# Agent routing evidence

| Reader contract | Scope |
|---|---|
| **Audience** | Maintainers of the [agent profiles](../../agents/) |
| **Purpose** | Keep task-selection descriptions grounded in local outcomes, practitioner experience and benchmark evidence |
| **Boundary** | Routing guidance and local direction-eligibility policy, not universal rankings, model-access verification or permission enforcement |

## Selection decisions

**Prefer DeepSeek V4.1 Flash locally for architecture, consumer contracts, implementation and skeptical code-quality review.** The operator reports better architecture/review outcomes than Sonnet 4.6 and `ckey-qwen`, not a measured acceptance-rate comparison. Require evidence for alleged defects rather than rewarding criticism itself.

| Profile group | Description emphasis | Basis and limit |
|---|---|---|
| Named DeepSeek route | Architecture/quality preference; consumer-aware implementation | Local experience; public reports are mixed, not proof of universal superiority |
| Sonnet 4.6 | Settled-interface execution; source-faithful edits for a specified reader | Local failures and execution/planning anecdote; not inability to design |
| GPT routes | Checked implementation of settled work; document materialization from explicit audience/outline/sources; current local direction assessment: ineligible | Existing roles and local direction outcomes; a current operator assessment, not a family-wide capability verdict or permanent rule; re-assess the specific route by the AGENTS capability criteria |
| MiMo / GLM Flash | MiMo discovery and implementation trials; GLM bounded screenshot-led implementation | One practitioner account and divergent benchmarks, not unconditional endorsement |
| Less-evidenced routes | Extraction, comparisons, small checked trials | Conservative allocation, not evidence of inability; no comprehensive per-model survey |
| Curated `ckey/*` family aliases | Family-level task fit; secondary bounded work under the current local preferences | Operator selects recent models within each corresponding family for price/performance; assess typical current-family behavior rather than require a fixed checkpoint. Individual-model scores are not measured alias averages |

**Documentation is a separate competence.** No located report measures technical-document audience fidelity or context leakage across these routes. Extraction, summarization and coding scores do not qualify whole-document ownership; stronger implementation routes also need an explicit reader, outline and source boundary.

Descriptions guide selection; the direction-eligibility policy separately bounds who may propose or decide consequential direction. Neither changes native permissions, model IDs, variants or primary-agent settings; existing read-only review/perception boundaries remain unchanged.

## Local direction-eligibility policy (2026-10-21)

The operator requires consequential direction to be proposed and validated by
routes suited to careful interpretation, not by the orchestrating/implementing
route. This is an operating policy and local experience report, not a benchmark
ranking or a claim that other routes cannot reason.

| Route | Current local assessment | Basis and limit |
|---|---|---|
| GPT routes | Orchestration, implementation, verification and evidence review of settled work; direction-ineligible | Operator requirement after local direction failures; not evidence that GPT cannot implement or review |
| DeepSeek V4.1 Flash | Eligible proposer, validator and architect-decision route | Local architecture/review preference and the benchmark context above; not proof of correctness |
| Claude Sonnet | Eligible proposer, validator and architect-decision route | Local execution/planning evidence; use the current exposed route |
| Claude Opus | Eligible only when actual access is verified | Access is not assumed from configuration; unverified access is a blocker, not a fallback |
| Decision-support capability | Advisory decision input for meaningful in-scope alternatives | Advice is not permission or proof; estimates remain advisory |

These rows record current local application of the [AGENTS.md](../../AGENTS.md)
capability criteria and the evidence behind it; they are not a universal
whitelist. A route absent from them is not automatically eligible or ineligible.
Assess the specific direction role, record unknown or conflicting evidence as a
gap, and leave the role unfilled when the evidence does not support it. The GPT
row records a current operator assessment after local direction failures, not a
permanent family rule; a specific route may qualify on new task-relevant
evidence. The main may apply these criteria to an assignment and record the
evidence in task context without editing this register. Configuration is not
access: require a usable execution path and record the limitation. Required
sequence: eligible proposal → separate validation reconciled to the original
sources (the deciding architect or user may validate itself when it did not
author the proposal; a decision-support tool cannot) → applicable authority →
primary records and executes. Cross-family independence remains mandatory where
the plan/design/audit challenge gate applies. For direction validation, a
different eligible family is the default when available; a separate eligible
instance from the same family is the permitted fallback only when no other
eligible family is actually available, with the limitation recorded. Mechanical
steps already settled by an explicit source need no direction round. Missing
eligible roles block affected work; do not substitute ineligible judgment.

This policy changes assignment eligibility, not native permissions, model IDs,
variants, or the advisory nature of decision support. A decision-support
capability's internal provider mix does not create an agent direction role or
eligibility; its advice cannot substitute for the required direction proposal or
validation. When it is the applicable authority, apply its documented output
mechanically within the supplied alternatives. Review or challenge from any route
may be evidence, but cannot substitute for the required proposal, validation or
authority.

## Practitioner evidence

These anecdotes are not controlled trials; harness, effort, context and task differences limit transfer. Hacker News comment bodies were read through the public Algolia API; Reddit rows are **search snippets only** because page retrieval was blocked. Votes and aggregations are not independent confirmation.

| Source | Observed experience | Routing implication and caveat |
|---|---|---|
| [HN: Laravel CRM rewrite, 2026-03-15](https://news.ycombinator.com/item?id=47392363) | Augment CLI user separates Sonnet 4.6 execution/speed from GPT planning/comprehension; API/spec-first paired work helped | Supports settled-contract execution, not equivalence to the Copilot harness |
| [HN: four-model C++ review, 2026-10-17](https://news.ycombinator.com/item?id=50129977) | DeepSeek 4.1 and Sol models found different relevant defects; DeepSeek also raised an irrelevant issue; Sol 6.1 found more relevant issues in this example | Counterevidence to a universal DeepSeek review ranking; different serving setups and one codebase |
| [HN: MiMo / GLM roles, 2026-10-08](https://news.ycombinator.com/item?id=50002919) | User settles on MiMo 2.6 Flash for discovery/research and GLM 5.3 Flash for implementation | Task-specific signal, not proof of either configured free endpoint's reliability |
| [HN: Laguna XS 2.1, 2026-10-06](https://news.ycombinator.com/item?id=49982882) | Routine coding worked well with a local 6-bit model in pi-dev | Supports small checked coding tasks; not validation of Kilo serving or the larger S variant |
| [HN: Terra context limits, 2026-08-01](https://news.ycombinator.com/item?id=49137105) | Generally positive report, but loops and bad choices as context fills | Keep investigations focused; family-level evidence, not identification of the current `latest` alias |
| [Reddit: DeepSeek scope/validation failures, 2026-09-11](https://www.reddit.com/r/opencode/comments/1wd8rn5/is_deepseek_41_flash_not_as_good_as_glm_53_kimi/) — snippet only | User reports easy-win tests and claimed end-to-end validation without a live run; uses a separate reviewer | Local preference must not waive scope or evidence checks; page body unavailable |
| [Reddit: Sonnet Copilot thinking loop, 2026-03-06](https://www.reddit.com/r/GithubCopilot/comments/1rmqchq/claude_sonnet_46_in_copilot_keeps_thinking_for_20/) — snippet only | Reported architecture deliberation ended at a token limit without code | Caution for open-ended planning, not a general capability verdict; single reported incident |

[Anthropic's April 23 postmortem](https://www.anthropic.com/engineering/april-23-postmortem) reports effort-default and verbosity-prompt changes affecting coding quality, including Sonnet 4.6. This vendor report illustrates a harness confound, not a model comparison.

## Benchmark references

Scores are percentages from Vals pages checked on 2026-10-20, not local measurements. Compare like versions/settings only, not an overall rank. These are not results for the configured OpenCode/Copilot/free endpoints or effort variants.

| Published model | Retained description scores | Qualification |
|---|---|---|
| [DeepSeek V4.1 Flash, September checkpoint](https://www.vals.ai/models/deepseek_deepseek-v4.1-flash) | Terminal-Bench 2.1 **74.53**; Vibe Code v1.1 **84.74** | T-B value appears in the September update, across three full trials; update states high effort, temperature 1. Not the separate [1017 checkpoint](https://www.vals.ai/models/deepseek_deepseek-v4.1-flash-1017); free-route checkpoint not verified |
| [Sonnet 4.6](https://www.vals.ai/models/anthropic_claude-sonnet-4-6) | Terminal-Bench 2.1 **57.30**; Vibe Code v1.1 **51.48**; Code Migration **39.89** | [Vibe leaderboard](https://www.vals.ai/benchmarks/vibe-code) also reports **55.77** with Claude Code, versus **51.48** with OpenHands; neither is Copilot |
| [GPT-6.1 Sol](https://www.vals.ai/models/openai_gpt-6.1-sol) | Terminal-Bench 4.0 **55.05**; Code Migration **65.12**; ProofBench v1.1 **99.00** | Model-level references repeated across profiles, **not measurements of high, medium or xhigh**; exact effort/harness metadata not recovered from the fetched model page |
| [GLM 5.3 Flash](https://www.vals.ai/models/zai_glm-5.3-flash) | Terminal-Bench 4.0 **37.37**; Vibe Code v1.1 **30.76**; MMMU Pro **86.01** | Multimodal score is not evidence of technical writing or application completeness |
| [MiMo V2.6 Flash](https://www.vals.ai/models/xiaomi_mimo-v2.6-flash) | Terminal-Bench 4.0 **24.24**; Vibe Code v1.1 **78.96**; Code Migration **40.93** | Stronger result on one benchmark does not erase weaker performance on another |

DeepSeek's old **Terminal-Bench 2.1 85.0** and **DeepSWE v1.1 65.5** were unreconciled: replace the former with the sourced Vals value and remove the latter. Sol's old **max** qualifier was unverified; retain model-level references, not configured-effort results. Missing scores stay unknown.

## Reassess from outcomes

Revise task fit from checked deliveries, especially audience fidelity, integration consequences and review false positives. Distinguish checkpoint, harness and scope; free-tier labels measure neither quality nor uptime. Description checks cannot prove improved acceptance or future caller compliance.

[Back to Skills & Rules Engineering](INDEX.md)
