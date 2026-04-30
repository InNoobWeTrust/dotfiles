---
description: >
  Analyze agent model assignments using live benchmark, availability, and
  pricing data from the providers relevant to the current decision. Fetches
  benchmark and pricing data, compares against current agent configs, and
  recommends changes while respecting user constraints such as primary-agent
  usage, quality floor, subscriptions, and budget. Use when you want to
  benchmark, optimize, or re-evaluate agent models before making changes.
  Triggered by: "benchmark", "update agents", "check model rankings",
  "optimize agents", "model comparison", "provider comparison", "pricing".
---

## Inputs

- **Focus areas** (optional): Specific benchmark categories or agents to prioritize
- **Auto-apply** (optional): Automatically apply approved changes (default: false)
- **Model subscriptions** (optional): Any providers or plans the user has access to
- **Primary agent** (optional): Which agent is used the most in practice
- **Quality floor** (optional): Lowest acceptable quality/model for critical tasks
- **Cost target** (optional): Budget ceiling or cost sensitivity guidance

## Process

### Step 0: Capture User Constraints First

Before looking at benchmarks, determine the decision rules:

1. Which agent is used most heavily in real work.
2. Whether the user starts fresh sessions often or keeps long-running sessions.
3. Whether any agent has a hard quality floor.
4. Which subscriptions/plans are in scope, for example:
   - provider bundle plans
   - free model tiers
   - pay-as-you-go access
   - direct vendor subscriptions
   - locally hosted models
5. Whether the optimization target is:
   - quality first
   - balanced quality/cost
   - lowest cost within an acceptable floor

Do not assume the orchestrator is low-frequency or disposable. If the user says
the orchestrator is the main daily driver, weight that more heavily than raw
benchmark popularity or per-request cost.

### Step 1: Fetch Live Rankings and Availability

Identify which benchmark and catalog sources are relevant to the providers under
consideration. Use the minimum set of sources needed to compare the real options
the user can actually choose from.

**Standard benchmark/ranking sources** (mostly cover frontier/costly models):
1. Aggregator benchmark/ranking sites (e.g. ArtificialAnalysis.ai)
2. Provider-specific leaderboards or model catalogs
3. Public pricing and plan pages
4. Public documentation listing model availability and limits

**Additional sources required when evaluating cheap/small models** — standard
benchmarks under-represent this space. Always include at least 3 of these:

| Source | What it covers |
|--------|---------------|
| Hugging Face Open LLM Leaderboard (v2) — `huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard` | Open-weight models of all sizes; filterable by parameter count; includes 1B–13B range |
| LMSYS Chatbot Arena — `lmarena.ai` | Human preference ELO across all tiers including free/cheap; best proxy for real-world quality |
| BigCode Leaderboard — `huggingface.co/spaces/bigcode/bigcode-models-leaderboard` | Coding-specific; covers small open-weight code models |
| EvalPlus Leaderboard — `evalplus.github.io/leaderboard.html` | HumanEval+ and MBPP+ scores; includes open and small models |
| OpenRouter model catalog — `openrouter.ai/models` | Lists all available models with pricing, context, and provider; filter by price to find cheap options |
| OpenRouter free tier — `openrouter.ai/models?max_price=0` | Models available at $0/token; quality varies widely |
| Together AI model catalog — `together.ai/models` | Many open-weight small models with pay-per-token pricing |
| Groq model catalog — `console.groq.com/docs/models` or `groq.com/pricing` | Speed-optimized inference; often cheapest for latency-sensitive nodes |
| Fireworks AI model catalog — `fireworks.ai/models` | Competitive pricing on open-weight models; good for batch/parallel workloads |
| Ollama model library — `ollama.com/library` | Locally hosted models; zero marginal cost; quality depends on hardware |
| LLM Pricing comparison — `llmpricecheck.com` or `deepinfra.com` | Cross-provider price comparison for the same model |

If a source is dynamically rendered, use Chrome with remote debugging and wait
for the full page render before extracting data.

When using a benchmark/ranking source, extract ALL relevant categories that are
available, such as:
1. **LLM Leaderboard** — overall usage rankings (tokens, % share, WoW change)
2. **Market Share** — by model author
3. **Benchmarks (AAII)** — artificial analysis intelligence index scores
4. **Fastest Models** — throughput rankings (tok/s) and cost
5. **Categories** — Programming, Roleplay, Marketing, etc.
6. **Languages** — English, multilingual rankings
7. **Programming Languages** — Python, JavaScript, TypeScript, etc.
8. **Context Length** — request distribution by token bucket
9. **Tool Calls** — tool usage across models
10. **Images** — total images processed

When using a provider-specific leaderboard or catalog, capture:
1. Top models overall
2. Top models by relevant mode or task category
3. Per-model metadata such as context, benchmark snippets, and published pricing

**When the task explicitly involves cheap/small model selection** (e.g. swarm
node selection, background agents, high-volume parallel tasks):

- Filter all sources to models ≤ $0.50/M input tokens OR free
- Include open-weight models runnable locally if the user has hardware
- Note throughput (tok/s) — cheap models must be fast enough for parallel use
- Note context window — swarm nodes often receive merged JSON; 32K minimum
- Flag models with no public benchmark data as **unvalidated**

Treat mode shares or usage shares as **real-world popularity data**, not as a
direct substitute for quality benchmarks or user preference.

Then fetch plan/model availability from any bundled provider plans the user is
considering. Capture:
1. Which models are available on the user's expected plan tier
2. Which models are unlimited vs usage-metered
3. Overage pricing or premium-request pricing if shown

Then fetch provider pricing pages for any providers under consideration.
Always use the pricing page that matches the user's actual region, plan type,
and billing model. If a provider offers multiple regions or product lines,
verify which one applies before using any numbers.

If a provider offers both subscription bundles and pay-as-you-go, capture both:
1. subscription price and request/usage caps
2. pay-as-you-go token or request pricing

### Step 1.5: Deep Per-Model Benchmark Research

For each candidate model under consideration, fetch its individual model page on
provider aggregators (e.g., OpenRouter model pages) to extract model-specific
benchmark data that reveals strengths and weaknesses. This goes beyond aggregated
rankings to give granular capability evidence.

**What to extract per model:**

1. **Provider-published benchmark claims** — Look for specific benchmark scores
   explicitly listed on the model page, such as:
   - SWE-Pro (software engineering benchmark)
   - Terminal Bench (CLI/shell operation benchmark)
   - GDPval-AA (general reasoning/analysis benchmark)
   - MMLU, HumanEval, MATH, GSM8K, or other standard benchmarks
   - Any proprietary or custom benchmarks the provider publishes

2. **Benchmark evidence format** — Capture the exact metric and value:
   - Percentage scores (e.g., "56.2% on SWE-Pro")
   - ELO/ranking scores (e.g., "1495 ELO on GDPval-AA")
   - Latency or throughput numbers (e.g., "tok/s" rankings)

3. **Capability specialization** — Identify what the model is specifically
   optimized for based on its benchmark profile:
   - **Agentic workflow** — models strong on SWE-Pro, Terminal Bench, tool-use
   - **Long-context reasoning** — models with high context limits and strong recall
   - **Fast iteration** — models with high throughput and low latency
   - **Multilingual** — models with strong non-English benchmarks
   - **Cost-efficiency** — models with acceptable benchmarks at lower price points

4. **Context and limitations** — Note any benchmark disclaimers:
   - Whether benchmarks are evaluated on specific dataset versions
   - Whether scores are from provider's own evaluation or third-party
   - Any known limitations or evaluation methodology differences

**Example benchmark profiles:**

| Model | SWE-Pro | Terminal Bench | GDPval-AA | Context | Specialization |
|-------|---------|----------------|-----------|---------|----------------|
| MiniMax M2.6 | 56.2% | 57.0% | 1495 ELO | 196K | Agentic workflow, production tasks |
| Model B | 48.1% | 41.3% | 1380 ELO | 128K | Balanced general purpose |
| Model C | 62.1% | 52.0% | 1520 ELO | 32K | Coding-focused, premium tier |

**Cross-reference with agent needs:**

Match model benchmark profiles to agent requirements:
- **code agent** → prioritize SWE-Pro, HumanEval, Terminal Bench scores
- **orchestrator** → prioritize agentic benchmarks (SWE-Pro, tool-use), context length, throughput
- **cheap agent** → prioritize cost-efficiency with acceptable benchmark floor
- **research/explore** → prioritize reasoning benchmarks (MMLU, GSM8K, GDPval-AA)

### Step 2: Load Current Agent Configuration

If the active agent config root contains agent profile files, read those files and extract current model assignments from each YAML frontmatter. If no profiles exist, report that model-assignment benchmarking cannot compare against a local current state.

Build a current-state matrix:
| Agent | Current Model | Provider | Subscription |
|-------|--------------|----------|--------------|
| architect-detail.md | provider/model-name | provider | plan or access path |
| senior-architect.md | provider/model-name | provider | plan or access path |
| ... | ... | ... | ... |

Also classify each agent by its practical role:

| Agent | Task Type | Criticality | Frequency | Notes |
|-------|-----------|-------------|-----------|-------|
| orchestrator | main driver | critical | very high | may dominate total user experience |
| code | implementation | critical | medium | quality-sensitive |
| cheap | low-stakes | low | medium | can optimize for cost |

### Step 3: Multi-Source Analysis

For each agent, cross-reference its current model against ALL benchmark
dimensions. Produce a scoring matrix:

| Agent | Task Type | Current Model | Quality Evidence | Tool Use | Context | Speed | Cost | Fit |
|-------|-----------|--------------|------------------|----------|---------|-------|------|-----|
| code | serious coding | provider/model-a | benchmark leader | strong | large | good | premium | HIGH |
| cheap | cost-sensitive | provider/model-b | acceptable baseline | unknown | - | strong | free | MED |

Quality Evidence may include:
1. Aggregator reasoning benchmark rank
2. Aggregator programming benchmark rank
3. Aggregator tool-use benchmark rank
4. Provider-published coding index or equivalent
5. Provider mode-share evidence for relevant task categories
6. Provider-published benchmark claims if clearly labeled as such
7. Per-model specific benchmarks (SWE-Pro, Terminal Bench, GDPval-AA, etc.) from provider model pages

### Step 4: Apply Constraint Filters

Before recommending changes, filter out options that violate user constraints:

1. **Quality floor violation** — never recommend a model below the user's stated floor for critical agents.
2. **Availability violation** — model not accessible through the subscriptions/plans under consideration.
3. **Workflow mismatch** — model may benchmark well but is a poor fit for the user's heavy orchestrator or long-session workflow.
4. **Region/pricing mismatch** — wrong pricing source used for the user's actual region/plan.

### Step 5: Identify Issues

Flag problems:
1. **Unranked models** — model not appearing in any benchmark category
2. **Mismatched tier** — using顶级 model for simple task OR using weak model for critical task
3. **Better alternative** — same benchmark position but lower cost available
4. **Deprecated/renamed** — model ID has changed on OpenRouter
5. **Subscription gap** — model not accessible with user's subscriptions
6. **Wrong optimization target** — recommendation optimizes for cost while ignoring stated quality requirements
7. **Popularity trap** — a model is common or heavily used, but that does not make it the best fit for this user

### Step 6: Produce Comparison Matrix

Generate a comparison matrix for the model families and providers relevant to
the current decision. Do not assume a fixed set of vendors.

| Dimension | Model A | Model B | Model C | Model D | Model E |
|-----------|---------|---------|---------|---------|---------|
| Reasoning Benchmark | value | value | value | value | value |
| Coding Benchmark | value | value | value | value | value |
| SWE-Pro | value | value | value | value | value |
| Terminal Bench | value | value | value | value | value |
| Tool Calls | value | value | value | value | value |
| Speed | value | value | value | value | value |
| Context | value | value | value | value | value |
| Cost | value | value | value | value | value |

If the user is comparing access paths rather than just models, also produce a
provider/access matrix:

| Option | Models Available | Best Use | Hard Limits | Marginal Cost |
|--------|------------------|----------|-------------|---------------|
| Bundle plan A | listed models | best-fit tasks | caps/limits | usage beyond bundle |
| Free tier B | listed models | low-cost support roles | variable availability | free |
| Direct subscription C | listed models | heavy daily usage | request cap or rate limits | fixed subscription |
| Pay-as-you-go D | listed models | flexible usage | no bundle protection | token- or request-based |

### Step 7: Scenario Analysis

For each realistic setup the user mentions, evaluate the complete package rather
than isolated model swaps. Typical scenarios:

1. **Bundle provider only**
2. **Bundle provider + free models**
3. **Bundle provider + direct vendor subscription**
4. **Bundle provider + pay-as-you-go**
5. **Single-provider only**

For each scenario, answer:
1. Can it preserve the user's quality floor for the primary agent?
2. Which agents should stay on the premium/high-quality path?
3. Which agents can move to free or cheaper models safely?
4. What is the expected failure mode: rate cap, degraded quality, or premium-request overage?

When comparing subscription bundles vs pay-as-you-go, account for the user's
workflow. If the user does agentic coding every day for long hours, compare
likely request volume against any rolling-window caps. If orchestration
delegates heavily and waits on subagents, note that the main model's effective
request rate may be lower than a naive continuous-typing estimate.

### Step 8: Generate Recommendations

For each agent, produce actionable recommendations:

```markdown
## Recommendations by Agent

### code.md
- **Current**: provider/model-a
- **Issue**: None — current model remains highly competitive on the benchmark dimensions relevant to this task
- **Recommendation**: Keep current assignment
- **Alternative**: provider/model-b if cost or latency becomes a larger constraint

### cheap.md
- **Current**: provider/model-c
- **Issue**: None — current model meets the acceptable baseline for low-stakes tasks
- **Recommendation**: Keep current assignment
- **Note**: Good cost-efficiency for its task class

### orchestrator.md
- **Current**: provider/model-d
- **Issue**: None if this remains the user's preferred quality floor for primary workflow orchestration
- **Recommendation**: Preserve the current tier unless a proposed replacement is clearly equal or better on the user's priority dimensions
- **Reason**: Primary workflow agents should not be downgraded solely on cost or popularity
```

### Step 9: Prioritized Change List

Summarize all changes needed:

| Priority | File | Current | Recommended | Reason | Effort |
|----------|------|---------|-------------|--------|--------|
| HIGH | agent-a.md | provider/model-a | provider/model-b | current option is unavailable, outdated, or clearly inferior | Low |
| MEDIUM | agent-b.md | provider/model-c | Keep or provider/model-d | possible speed/cost optimization | Low |
| REASSESS | agent-c.md | provider/model-e | **Keep** | still strong on the user's priority dimensions | - |

If the user's constraints block any cheaper alternative, say so explicitly.
Example: "The cheaper option is popular and widely available, but not recommended
because the user stated a higher minimum acceptable quality for this critical agent."

### Step 10: User Approval

Present the full analysis and ask:
1. Which recommendations to apply?
2. Any model preferences to override?
3. Auto-apply or manual review?

## Output

Save the complete analysis to `~/.agents/benchmark-report-<YYYYMMDD>.md` with:
1. Date and data source
2. User constraints and assumptions
3. Current agent configuration matrix
4. Full benchmark comparison matrix (all models × all dimensions)
5. Provider availability and pricing matrix
6. Scenario analysis for the setups actually under consideration
7. Per-agent analysis
8. Prioritized change recommendations
9. Diff-ready changes if approved

## Notes

- Data freshness: Rankings change weekly — re-run periodically
- Chrome-devtools required for dynamic sections
- Some models may not appear in public rankings but can still be valid choices if they are accessible, performant, and aligned with the user's needs
- AAII benchmarks reflect reasoning/analysis capability, not coding-specific performance
- Provider-specific usage shares are useful evidence, but they reflect usage and defaults as much as quality
- Always verify the user's actual pricing region and plan before using provider pricing data
- For heavy orchestrator workflows, optimize for the main daily experience first; do not let low-stakes agents drive the whole recommendation

---

Follow the instructions above to work on the user's benchmarking request right below.

---
