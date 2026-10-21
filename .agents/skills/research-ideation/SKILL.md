---
name: research-ideation
description: "Use this skill for scientific research synthesis, literature grounding, hypothesis generation, and research proposals. Disentangles physical/biological modalities, conducts multi-hypothesis tournaments (conservative, analogical leap, high-risk), and designs falsifiable experiments with negative controls. Bypasses software engineering TDD and slicing bureaucracy."
---

# Research Ideation

Scientific discovery, literature synthesis, hypothesis generation, and research proposals. Start from the user's unresolved outcome and the source's causal principles, not its most detailed implementation example.

**Inputs:** research question, source material, observed entities/data, constraints and available baselines. **Output:** competing source-grounded hypotheses and a discriminating experiment, with uncertainties and negative controls. Use the actual domain's units; biological assays are examples, not prerequisites. Missing sources or execution capabilities limit the claims/protocol, not permission to invent evidence or install tools.

> **Mindset: First-Principles & "What-If" Exploration**
> Do not let software engineering bureaucracy (TDD, slicing, code-craft, premature glossary freezing) paralyze research ideation. In the proposal and hypothesis phase, explore boldly, challenge assumptions, and break conventional silos. Anchor ideas in mechanistic reality, not administrative red tape.

## The 4-Phase Scientific Discovery Pipeline

```
[ Domain Problem / Lab Data ]
       │
       ▼
1. Modality & Physical Entity Mapping
       │
       ▼
2. Divergent Hypothesis Generation (Idea Tournament)
       │
       ▼
3. Adversarial Falsification & Literature Grounding
       │
       ▼
4. Falsifiable Proposal & Experiment Blueprint
```

---

## Phase 1: Modality & Physical Entity Mapping

First state the outcome to improve and the failure that matters. Extract a few source-backed causal principles: what must hold, why it matters, and which assumptions make it apply. Separate these from contingent examples, tools, file formats and administrative machinery; label a cross-domain transfer as a hypothesis, not a source requirement. Challenge an assumed "core" principle when evidence contradicts it.

Before proposing any model or hypothesis, explicitly inventory the measured entities (physical/biological objects for scientific assays; task attempts, actions and outcomes for process research):
1. **Physical Entity & Assay Coordinates:** What is being measured? (e.g. 1D genomic DNA sequence, RNA transcript structure, chromatin accessibility fragments, single-cell count matrix, CyTOF protein intensities). **Never conflate modalities.**
2. **Data Lineage & Resolution:** 1-bp continuous tracks (BigWig), interval classification (BED), sparse cell-by-gene counts, or tabular features.
3. **Available Baseline Assets:** Lab repositories, published datasets, public GEO/BioRxiv/PubMed baselines.

---

## Phase 2: Divergent Hypothesis Generation (Idea Tournament)

Generate at least **3 competing hypothesis angles** rather than a single consensus compromise:
* **Angle A (Conservative / Foundational):** Direct extension of published methods with verified datasets. High feasibility, moderate novelty.
* **Angle B (Cross-Disciplinary / Analogical Leap):** Transferring a mechanism from an adjacent domain (e.g. borrowing computer vision / diffusion / NLP attention architectures for regulatory genomics). High novelty, moderate feasibility.
* **Angle C (High-Risk / High-Reward / Status-Quo Breaking):** First-principles "what-if" hypothesis that challenges an accepted dogma or standard pipeline. High reward, requires explicit kill-criteria.

For each angle, make the causal link explicit: **source principle → proposed intervention → mechanism → user-relevant outcome → observation that would refute it**. Start with a mechanism and its competing explanations, not a preferred tool. A different implementation detail is not a genuinely different hypothesis.

*Reference: `references/hypothesis-tournament.md`*

---

## Phase 3: Adversarial Falsification & Literature Grounding

Test all 3 hypotheses against the **4 Scientific Rigor Axes** (acting as your own DeepMind Co-Scientist debate arena):
1. **Modality Integrity:** Does the mathematics/architecture match the physical input? (e.g., An MLM needs sequence; does it have sequence or just gene counts?).
2. **Mechanistic Plausibility:** Is there a plausible biochemical, biophysical, or causal mechanism supporting the claim? Verify citations against real literature.
3. **Falsifiability & Negative Controls:** What observation would definitively **disprove** the hypothesis? A hypothesis without a disconfirming test is unscientific.
4. **Feasibility & Compute:** Can this be executed on available hardware (e.g. Marimo MoLab B200, Colab, local GPUs) within a sensible timeframe?

**Drift check, before selecting or continuing an experiment:** Does it still test the original outcome and a source-backed principle? If a leaf detail dominates, explain why it is causally necessary and compare a simpler mechanism without it; otherwise drop or park that detail. A convenient measurable proxy is not success unless its link to the desired outcome is tested. After null results, revisit the causal hypothesis rather than escalating bookkeeping, prompts or infrastructure until something passes. Preserve negative results and keep scientifically necessary resolution/modality details.

*Reference: `references/scientific-anti-sycophancy.md` for methodology on preventing sycophantic validation and doubt collapse during adversarial critique.*

---

## Phase 4: Falsifiable Proposal & Experiment Blueprint

Synthesize the winning hypothesis into an actionable scientific proposal:
1. **Executive Research Brief:** Core question and specific gap in current literature.
2. **Causal Hypothesis:** Precise mechanistic claim and its source-principle-to-outcome link; distinguish source facts, transfer assumptions and untested predictions.
3. **In Silico / In Vitro Protocol:** Notebook-ready implementation plan (data prep, model adaptation, loss formulation).
4. **Statistical Confidence & Interpretability:** Saliency mapping, in-silico mutagenesis, perturbation assays, or p-value / FDR bounds.
5. **Negative Controls & Kill Criteria:** Conditions under which the project is abandoned or pivoted.

*Reference: `references/proposal-template.md`*

## Stops and completion

- **Unsupported core:** If the claimed principle has no inspected source or conflicts with observed entities, return the gap or a clearly labeled conjecture; do not present it as grounded.
- **Lost relevance:** If a proposed experiment only improves a proxy or leaf mechanism with no supported path to the user's outcome, reframe before continuing that branch.
- **Evidence and authority:** Missing required data/capability or execution authority blocks the affected experiment, not honest ideation. Do not guarantee improvement because a first-principles story sounds persuasive.
- **Deliverable:** Keep three competing angles, their causal links, four-axis critique, negative controls, feasibility and explicit kill criteria. A concise explanation is enough; no new tracking artifact is required.

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Correct Path |
| :--- | :--- | :--- |
| **Bureaucracy Trap** | Spending phases defining glossaries and gating roadmaps without generating hypotheses | Focus immediately on physical entities, hypotheses, and experimental value. |
| **Leaf-detail drift** | A source's tool or bookkeeping example becomes the goal | Return to the causal principle and user outcome; retain the detail only if it is necessary to test that link. |
| **First-principles dogma** | An elegant story is treated as proof or used to discard inconvenient measurements | Treat the causal story as falsifiable; keep relevant detail and contrary evidence. |
| **Buzzword Mashup** | Concatenating model names + lab buzzwords without mechanistic coupling | Demand a step-by-step physical/biological pathway for how data flows through the model. |
| **Modality Blindness** | Treating single-cell expression matrices as DNA strings or vice-versa | Explicitly state the tensor shape, biological unit, and coordinate system in Phase 1. |
| **Unfalsifiable Claims** | "The model will learn holistic multi-omic patterns" | Define exact positive signals and exact negative control baselines. |
| **Sycophantic Validation** | Uncritically validating flawed ideas or caving on negative controls under user doubt | Enforce epistemic rigor, zero-fawn gating, and disconfirming tests (`references/scientific-anti-sycophancy.md`). |
