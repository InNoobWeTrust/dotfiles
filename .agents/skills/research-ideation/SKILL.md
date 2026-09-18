---
name: research-ideation
description: "Use this skill for scientific research synthesis, literature grounding, hypothesis generation, and research proposals. Disentangles physical/biological modalities, conducts multi-hypothesis tournaments (conservative, analogical leap, high-risk), and designs falsifiable experiments with negative controls. Bypasses software engineering TDD and slicing bureaucracy."
---

# Research Ideation

Scientific discovery, literature synthesis, hypothesis generation, and research proposals.

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

Before proposing any model or hypothesis, explicitly inventory the physical/biological objects:
1. **Physical Entity & Assay Coordinates:** What is being measured? (e.g. 1D genomic DNA sequence, RNA transcript structure, chromatin accessibility fragments, single-cell count matrix, CyTOF protein intensities). **Never conflate modalities.**
2. **Data Lineage & Resolution:** 1-bp continuous tracks (BigWig), interval classification (BED), sparse cell-by-gene counts, or tabular features.
3. **Available Baseline Assets:** Lab repositories, published datasets, public GEO/BioRxiv/PubMed baselines.

---

## Phase 2: Divergent Hypothesis Generation (Idea Tournament)

Generate at least **3 competing hypothesis angles** rather than a single consensus compromise:
* **Angle A (Conservative / Foundational):** Direct extension of published methods with verified datasets. High feasibility, moderate novelty.
* **Angle B (Cross-Disciplinary / Analogical Leap):** Transferring a mechanism from an adjacent domain (e.g. borrowing computer vision / diffusion / NLP attention architectures for regulatory genomics). High novelty, moderate feasibility.
* **Angle C (High-Risk / High-Reward / Status-Quo Breaking):** First-principles "what-if" hypothesis that challenges an accepted dogma or standard pipeline. High reward, requires explicit kill-criteria.

*Reference: `references/hypothesis-tournament.md`*

---

## Phase 3: Adversarial Falsification & Literature Grounding

Test all 3 hypotheses against the **4 Scientific Rigor Axes** (acting as your own DeepMind Co-Scientist debate arena):
1. **Modality Integrity:** Does the mathematics/architecture match the physical input? (e.g., An MLM needs sequence; does it have sequence or just gene counts?).
2. **Mechanistic Plausibility:** Is there a plausible biochemical, biophysical, or causal mechanism supporting the claim? Verify citations against real literature.
3. **Falsifiability & Negative Controls:** What observation would definitively **disprove** the hypothesis? A hypothesis without a disconfirming test is unscientific.
4. **Feasibility & Compute:** Can this be executed on available hardware (e.g. Marimo MoLab B200, Colab, local GPUs) within a sensible timeframe?

---

## Phase 4: Falsifiable Proposal & Experiment Blueprint

Synthesize the winning hypothesis into an actionable scientific proposal:
1. **Executive Research Brief:** Core question and specific gap in current literature.
2. **Causal Hypothesis:** Precise mechanistic claim.
3. **In Silico / In Vitro Protocol:** Notebook-ready implementation plan (data prep, model adaptation, loss formulation).
4. **Statistical Confidence & Interpretability:** Saliency mapping, in-silico mutagenesis, perturbation assays, or p-value / FDR bounds.
5. **Negative Controls & Kill Criteria:** Conditions under which the project is abandoned or pivoted.

*Reference: `references/proposal-template.md`*

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Correct Path |
| :--- | :--- | :--- |
| **Bureaucracy Trap** | Spending phases defining glossaries and gating roadmaps without generating hypotheses | Focus immediately on physical entities, hypotheses, and experimental value. |
| **Buzzword Mashup** | Concatenating model names + lab buzzwords without mechanistic coupling | Demand a step-by-step physical/biological pathway for how data flows through the model. |
| **Modality Blindness** | Treating single-cell expression matrices as DNA strings or vice-versa | Explicitly state the tensor shape, biological unit, and coordinate system in Phase 1. |
| **Unfalsifiable Claims** | "The model will learn holistic multi-omic patterns" | Define exact positive signals and exact negative control baselines. |
