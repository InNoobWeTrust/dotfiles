---
name: model-benchmarking
description: "Use this skill to analyze and optimize agent model configurations — benchmark comparisons, pricing analysis, ELO rankings, and provider selection. Activate when optimizing model assignments, comparing LLM cost-performance tradeoffs, selecting model tiers for swarms, or validating agent configs against schemas."
---

# Agent Model Benchmarking & Optimization

Compare model routes across quality, speed, context, cost, and access evidence within the user's permitted scope. Separate execution capability from working-principle identity; a model is not a fixed specialist persona.

---

## Phase 1: Capture Constraints & Workflow Classification

Before analyzing models, establish the boundary constraints of the environment.

1. **Stated User Constraints**:
   - **Primary Agent Focus**: Identify which agent runs the most (usually the orchestrator) and the permitted changes. Prioritize its stability when optimization includes it; do not change built-in modes or primary model selection when the task excludes them.
   - **Quality Floors**: Identify any agent with a hard quality boundary (e.g., code-craft must use a frontier coding model).
   - **Accessible Plans**: Direct vendor subscriptions, bundled packages (e.g., Kilo bundle), free tiers, or local offline models (Ollama).
   - **Target Mode**: Quality-first, balanced cost/quality, or cost-minimization.
2. **Agent Class Map**:
   - **Orchestrator**: High frequency, high criticality. Needs high-quality reasoning and tool calls, wide context, and high uptime.
   - **Execution/Code Maker**: Medium frequency, high criticality. Needs specialized SWE/coding benchmark strength.
   - **Support/Utility (e.g. Ingest)**: High volume, low criticality. Can leverage fast, cost-efficient, or free tiers.

---

## Phase 2: Catalog Research & Uptime Vetting

Gather live pricing, features, and reliability metrics.

### 1. Catalog & leaderboards
- **General Reasoning**: ArtificialAnalysis.ai, LMSYS Chatbot Arena (ELO ranks).
- **Coding Specifics**: SWE-Bench Verified (SWE-Pro), Terminal Bench, HumanEval+, MBPP+.
- **Price/Token Comparisons**: OpenRouter model catalog, Together AI, Groq, deepinfra, fireworks.ai.

### 2. Free Tier Vetting
- **Free tiers**: Check current price, lifecycle, data-use policy, limits, and observed reliability. Free access does not establish uptime, privacy, or suitability for unattended work; report unmeasured reliability as unknown.
- **Curated gateways**: Catalog inclusion is evidence of listing, not a measured service guarantee. Separate vendor claims from account-specific invocation evidence; do not perform stress tests or paid probes without authorization.

### 3. Model ID Verification
- Verify exact provider/model IDs and supported variants against the configured provider registry and current provider catalog. Registration does not prove authentication, quota, reachability, or current account access.
- A JSON schema, such as `https://models.dev/model-schema.json#/$defs/Model`, validates metadata shape, not membership in a provider's available model list. Keep these checks separate; do not invent versions or substitute a newer model silently.

---

## Phase 3: Deep Per-Model Benchmark Research

Analyze candidates' task-relevant capabilities, not fixed personalities. Record the exact model/checkpoint, benchmark version, effort, harness, source date, and whether evidence is vendor-reported, independent, family-level, or locally measured. Do not rank unlike benchmark versions as comparable; mark missing metrics unknown rather than inventing scores, uptime, or zero cost.

| Metric | Focus | Description |
| :--- | :--- | :--- |
| **SWE-Pro** | Code Agent | Evaluates performance on complex real-world GitHub issues. |
| **Terminal Bench** | CLI / Agentic | Evaluates tool calling, command line execution, and path traversal. |
| **GDPval-AA** | Orchestrator | Evaluates logical reasoning, data synthesis, and complex planning. |

### Specialization Profiles
- **Agentic Workflow**: Strong SWE-Pro, Terminal Bench, and tool-use recall.
- **Reasoning / Context**: Wide window (e.g., 128K+), needle-in-a-haystack recall, high GDPval-AA scores.
- **Fast Iteration**: High token-per-second (tok/s) throughput and minimal time-to-first-token (TTFT).

---

## Phase 4: Scenario Analysis & Bundled Economics

Evaluate complete agent portfolios rather than isolated individual model swaps.

1. **Access Options**:
   - **Bundled Plans**: High fixed value, request caps, rolling token windows.
   - **Direct Subscriptions**: Premium single-vendor access, fixed cost, strict rate-limits.
   - **Pay-as-you-go**: High elasticity, pay-per-token, zero overhead, variable pricing.
   - **Local Host (Ollama)**: High latency/hardware sensitive, zero token marginal cost, private.
2. **Portfolio Scenarios**:
   - **Bundle Only**: Confines all active profiles to a single subscription bundle.
   - **Hybrid (Bundle + Pay-per-token)**: Keeps primary orchestrator on bundle/subscription, delegates sub-tasks or background loops to cheap external endpoints.
   - **Large delegated workloads**: Consider free routes only within authorized resource limits and supported quality/reliability evidence. Free and paid labels do not establish fitness; do not expand concurrency merely to exploit a tier.

---

## Phase 5: Recommendation & Report Format

Produce a comparison report mapping the migration path:

```markdown
# Agent Model Benchmarking Report

- **Date**: [date]
- **Target Optimization**: [Quality-first / Balanced / Cost-first]

## 1. Current Agent Configuration
| Agent | Role | Current Model | Provider | ID Valid? |
| :--- | :--- | :--- | :--- | :--- |
| [e.g. code.md] | Implementation | provider/model-name | [provider] | Yes / No |

## 2. Model Benchmarking Comparison Matrix
| Model ID | Reasoning (ELO) | SWE-Pro | Tool Call | Uptime | Input Cost/M | Output Cost/M |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `provider/model-a` | [Score] | [Score] | [Score] | [Uptime %] | $X.XX | $Y.YY |

## 3. Prioritized Recommendations
### [Agent Profile Name] (e.g., `orchestrator.md`)
- **Current**: `provider/model-current`
- **Recommended**: `provider/model-recommended`
- **Cost Impact**: [e.g. Save $0.40/M tokens or fixed cost reduction]
- **Performance Rationale**: [Citations of benchmark improvements (SWE-Pro / ELO)]
- **Action**: Keep / Migrate / Reassess

## 4. Execution Plan (Diffs)
```
