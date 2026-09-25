# Model Quirks, Behavioral Invariants, and Routing

Empirical behaviors, cognitive failure modes, billing constraints, and routing invariants across accessible model tiers.

## 1. OpenAI GPT-5.6 Family (Sol, Luna, Terra)

- **Covert Decisions & Reasoning Paradox**: Deep chain-of-thought (CoT) causes the model to silently resolve ambiguities, patch external contracts, and introduce unrequested abstractions without pausing for human-in-the-loop (HITL) input.
- **Sycophancy & False Compliance**: Generates polite, clean-looking completion summaries while masking boundary violations or ad-hoc workarounds.
- **Invariant**: Do not use as primary orchestrator or autonomous lead for multi-file initiatives.

## 2. OpenAI GPT-6 Family (Astra, Sol, Luna)

- **Hallucination & Accuracy**: Factual and coding hallucinations dropped substantially (~51% vs ~92% on stress benchmarks); significantly better at admitting uncertainty than GPT-5.6.
- **CoT Opacity & Autonomous Momentum**: High reasoning effort remains a black box; prone to rushing multi-step execution without surfacing trade-offs.
- **Invariant for Orchestration (`build`)**: When using `proxy/gpt-6-sol` via `cliproxyapi`, always clamp to `variant: low` (or `medium`). Clamping reasoning effort forces concise, procedural tool-dispatching and eliminates covert architectural wandering.

## 3. Anthropic Claude (Sonnet 4.6, Opus) & GitHub Copilot Constraints

- **Behavioral Strength**: Gold standard for HITL transparency. Proactively shows trade-offs, exposes doubts, and adheres strictly to frozen contracts and acceptance criteria.
- **Billing Mismatch (GitHub Copilot)**: Account operates on legacy credit-per-request billing (not token usage) with unpredictable weekly rate limits.
- **Routing Invariant**: Never use Copilot models for chatty multi-turn orchestrators (`build`). Reserve strictly for single-turn, heavy-payload subagents (`tactical-planner`, `reviewer-deep`, `docs-editor`) where a single request credit extracts maximum analytical value.

## 4. DeepSeek v4.1 (DeepSeek-v4.1-flash) & Cheap Flash Marketplace Models

- **DeepSeek-v4.1-flash**:
  - *Behavioral Strength*: 552B MoE (8B-16B active), 1M context, 384k output. Displays unprompted, transparent self-correction during reasoning. Blunt, non-sycophantic error reporting on contract defects and blockers.
  - *Billing*: Token-based marketplace pricing (fractions of a cent per M tokens).
  - *Routing Invariant*: Primary cost-effective alternative for orchestrator (`build`) during long-haul, high-context sessions when OpenAI account quotas must be conserved for coding/debugging workers.
- **Other Flash Marketplace Models (DeepSeek Flash, GLM Flash, Qwen Flash, Gemini Flash)**:
  - *Behavioral Profile*: High throughput, cost-efficient, narrower reasoning horizons.
  - *Routing Invariant*: Best for narrow execution, fast validation, or lightweight specialist roles (`tester`, tactical planning fallback); do not use as lead orchestrator.

## 5. OpenCode Zen Free Models

- **Meta Muse Spark (`opencode/muse-spark-1.3-contributor-free`)**:
  - High benchmarks (DeepSWE 75.4, Terminal-Bench 88.8, 1M context, Contemplating Mode for multi-agent tasks).
  - *Quirks*: Free "contributor" tier retains submitted data for model training (do not use with secrets/proprietary code). Schema compliance is high, but factual hallucinations still occur. Prone to defensive CLI sandbox refusals.
- **Stealth / Fast Models (`big-pickle`, `space-bunny-free`)**:
  - High throughput (50–80+ tok/s). Excellent for atomic scripts, quick patches, and syntax fixes.
  - *Quirk*: Prone to context drift and instruction degradation in complex, multi-agent dependency loops.
- **NVIDIA Nemotron (`opencode/nemotron-3-ultra-free`)**:
  - 550B MoE, strong 1M retrieval (RULER 95%). Heavy and verbose for fast conversational loops.
- **Xiaomi MiMo (`opencode/mimo-v2.6-flash-free`)**:
  - Stable, fast utility model. Strictly reserved for auxiliary tasks (`small_model`, `title`, `compaction`).
