---
name: model-benchmarking
description: "Use this skill to select agent models by task fit, practitioner experience, checked outcomes, benchmarks, pricing, and provider access. Activate when optimizing model assignments, writing caller-facing agent descriptions, comparing LLM cost-performance tradeoffs, selecting delegated-worker tiers, or validating agent configs against schemas. Fleet configuration and periodic review, not a per-delegation step: agent descriptions carry the routing boundary, so dispatching a task requires no benchmark lookup. Not for general non-LLM pricing or permission changes."
---

# Agent Model Benchmarking & Optimization

Compare model routes across quality, speed, context, cost, and access evidence within the user's permitted scope. Separate execution capability from working-principle identity; a model is not a fixed specialist persona.

Inputs are the requested tasks, permitted changes, available routes and accessible evidence. Use native tools or authorized integrations; if evidence/access is unavailable, report the gap without installing, probing or reconfiguring a replacement. Output only the requested comparison, recommendation or description edit; selection guidance never grants execution or final-approval authority.

---

## Phase 1: Capture Constraints & Workflow Classification

Before analyzing models, establish the boundary constraints of the environment.

1. **Stated User Constraints**:
   - **Primary Agent Focus**: Identify which agent runs the most (usually the orchestrator) and the permitted changes. Prioritize its stability when optimization includes it; do not change built-in modes or primary model selection when the task excludes them.
   - **Quality Floors**: Identify any agent with a hard quality boundary (e.g., implementation agents must use a frontier coding model).
   - **Accessible Plans**: Direct vendor subscriptions, bundled packages (e.g., Kilo bundle), free tiers, or local offline models (Ollama).
   - **Target Mode**: Quality-first, balanced cost/quality, or cost-minimization.
2. **Agent Class Map**:
   - **Orchestrator**: High frequency, high criticality. Needs high-quality reasoning and tool calls, wide context, and high uptime.
   - **Execution/Code Maker**: Medium frequency, high criticality. Needs task-specific implementation evidence, supported by relevant SWE/coding benchmarks.
   - **Support/Utility (e.g. Ingest)**: High volume, low criticality. Can leverage fast, cost-efficient, or free tiers.

---

## Phase 2: Catalog Research & Uptime Vetting

Gather live pricing, features, and reliability metrics.

### 1. Catalog & leaderboards
- **General Reasoning**: ArtificialAnalysis.ai, LMSYS Chatbot Arena (ELO ranks).
- **Coding Specifics**: SWE-bench Verified, SWE-bench Pro, Terminal Bench, HumanEval+, MBPP+; keep distinct benchmarks separate.
- **Price/Token Comparisons**: OpenRouter model catalog, Together AI, Groq, deepinfra, fireworks.ai.
- **Post-launch Regression / Drift**: BridgeBench Nerf Bench (30 models, power % since launch day), Marginlab Degradation Tracker (daily SWE-Bench-Pro CI bands for Codex and Claude Code families), AI Stupid Level (24 models/6 providers, continuous multi-suite monitoring with Page-Hinkley change-point detection, cost-per-correct-result).
- **Subscription Limit Tracking**: BridgeBench Usage Bench (% of day-one plan allowance retained; tracks silent cuts to 5-hour and weekly windows independently).

### 2. Free Tier Vetting
- **Free tiers**: Check current price, lifecycle, data-use policy, limits, and observed reliability. Free access does not establish uptime, privacy, or suitability for unattended work; report unmeasured reliability as unknown.
- **Curated gateways**: Catalog inclusion is evidence of listing, not a measured service guarantee. Separate vendor claims from account-specific invocation evidence; do not perform stress tests or paid probes without authorization.

### 3. Model ID Verification
- Verify exact provider/model IDs and supported variants against the configured provider registry and current provider catalog. Registration does not prove authentication, quota, reachability, or current account access.
- A JSON schema, such as `https://models.dev/model-schema.json#/$defs/Model`, validates metadata shape, not membership in a provider's available model list. Keep these checks separate; do not invent versions or substitute a newer model silently.
- **Operator-curated rolling family aliases**: When the operator maintains recent family models for price/performance, use recent family-level evidence for qualitative typical-current-family task fit. A pinned checkpoint is not a prerequisite for selection. Keep individual benchmark identities in the evidence record; never present a checkpoint score as a measured alias average.

---

## Phase 3: Deep Per-Model Benchmark Research

Analyze candidates' task-relevant capabilities, not fixed personalities. Record the exact model/checkpoint, benchmark version, effort, harness, source date, and whether evidence is vendor-reported, independent, family-level, or locally measured. Do not rank unlike benchmark versions as comparable; mark missing metrics unknown rather than inventing scores, uptime, or zero cost.

### Evidence beyond leaderboards
- Supplement scores with first-person practitioner accounts and checked local outcomes. Record task, scope, harness/version, effort/settings and what was actually checked; distinguish operator experience from controlled measurement.
- Separate vendor claims, independent benchmarks, firsthand accounts and repeated summaries. Mark search snippets as snippets, not full-body review; votes and copied reports are not independent confirmation.
- Retain contradictory results and relevant failures. Explain differences in task, context, harness or effort where supported; do not invent aggregate rankings, averages or acceptance rates. Local preference is conditional evidence, not a portable named-model winner.
- Keep provenance, exact score sources and research limitations in a maintainer evidence record, not caller-facing descriptions. Store that record outside the skill, in scoped project or private storage, so the skill stays portable and self-contained; a description-only task does not require a full research report.

### Task-fit distinctions
Do not collapse these into “good coding”; compare evidence for the actual assignment:

| Task | Selection evidence and actionable boundary |
|---|---|
| Architecture | Responsibility, data ownership, consumer contracts and trade-off reasoning; not just patch success. |
| Skeptical acceptance / code-quality review | Relevant, evidenced defects and disconfirming checks; distinguish useful findings from false positives, not criticism volume. |
| Consequential implementation | Integration effects, compatibility, failure paths and checked behavior; a plausible patch alone is insufficient. |
| Documentation authorship | Audience fit, source fidelity and exclusion of internal context; coding or multimodal scores do not establish writing competence. Bound reader, outline, sources and writable scope; separate drafting from final approval. |
| Extraction / utility | Accurate bounded retrieval, comparison or transformation; success does not establish architecture, implementation or whole-document ownership. |

| Metric | Focus | Description |
| :--- | :--- | :--- |
| **SWE-Pro** | Code Agent | Evaluates performance on complex real-world GitHub issues. |
| **Terminal Bench** | CLI / Agentic | Evaluates tool calling, command line execution, and path traversal. |
| **GDPval-AA** | Orchestrator | Evaluates logical reasoning, data synthesis, and complex planning. |
| **Nerf Bench Power %** | Post-launch stability | BridgeBench: % of launch-day power retained (score × 0.6, token efficiency × 0.2, cost × 0.2). 90–110% = normal variance; <90% = lost power. Two consecutive out-of-range results = detected change. |
| **Cost/Correct Fix** | Value efficiency | AI Stupid Level: total API spend ÷ passing attempts on real repo tasks. Exposes cases where a cheaper model costs less per correct result despite lower raw quality. |
| **Usage Bench %** | Subscription value | BridgeBench: % of day-one plan allowance still provided. 5-hour and weekly windows tracked separately; a drop flags a silent limit cut. |

### Specialization Profiles
Use these as screening signals, not substitutes for checked task-specific outcomes.

- **Agentic Workflow**: Strong SWE-Pro, Terminal Bench, and tool-use recall.
- **Reasoning / Context**: Wide window (e.g., 128K+), needle-in-a-haystack recall, high GDPval-AA scores.
- **Fast Iteration**: High token-per-second (tok/s) throughput and minimal time-to-first-token (TTFT).
- **Deployment Stability**: Nerf Bench power sustained 90–110% over time; Marginlab daily CI within expected band; no open AI Stupid Level drift alerts.

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

Match the deliverable to the request; use the report below for portfolio/migration work, not as mandatory overhead for description-only edits.

### Caller-facing descriptions
- State useful task fit and actionable limits compactly: what to delegate, the necessary scope, and when to choose another route. Preserve existing permission/read-only boundaries; descriptions do not replace them.
- A caller must be able to route a task from the description alone: state the role boundary, not score dumps. Keep benchmark values, versions and provenance in the maintainer evidence catalog; dispatching a task must not require a benchmark lookup. Do not imply that model-level scores measure a configured effort variant or rolling alias.
- Exclude research caveats, provenance/history, checkpoint-verification residue, reading assignments and subscription or plan commentary. Translate uncertainty into an actionable task boundary only when it affects allocation.
- Example: “Use for bounded implementation against settled interfaces and source-faithful edits for a specified reader. Reserve architecture ownership and final document approval for separately qualified review.” Adapt to evidence, not a fixed family stereotype.

Stop before changes outside the authorized scope, paid probes, stress tests, restarts, or model/permission changes without explicit authorization. Before handoff, check task fit, description brevity, score traceability and preserved access/permission safeguards; source inspection is not proof of better routing or runtime compliance.

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

## ACI check
- **Source interface:** scoped inputs/outputs, task-fit example and stop boundaries are explicit; runtime routing improvement is unverified.
- **Risks addressed:** benchmark overreach, research leakage and alias-score confusion; retain actionable descriptions with separate evidence.
- **First use:** check the next 1–2 routing/description updates against actual outcomes before treating this guidance as validated.
