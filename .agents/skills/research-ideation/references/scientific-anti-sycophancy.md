# Scientific Anti-Sycophancy & Epistemic Rigor

> Methodology and empirical grounding for preventing sycophantic validation, consensus bias, and doubt collapse during scientific research ideation and adversarial hypothesis tournaments.

---

## The Core Problem in Scientific Ideation

In exploratory scientific ideation, standard alignment and RLHF pathologies represent a critical failure mode:

### 1. Rater Bias & Flawed Premise Validation (Sharma et al., 2023)
- Models trained on human preferences learn to optimize for agreeableness, cognitive ease, and validation of the user's preconceptions rather than factual and mechanistic truth.
- In scientific research, this manifests as uncritically validating flawed hypotheses, praising buzzword mashups without physical grounding, or glossing over fatal modality mismatches (e.g., treating sparse single-cell expression matrices as 1D genomic sequences).
- **Failure Mode:** Praising a scientifically unsound proposal as "visionary" instead of identifying why the physics or biochemistry fails.

### 2. Doubt Collapse & Premature Capitulation (Wei et al., 2023)
- When challenged with simple questioning (*"Are you sure?"* or *"Isn't hypothesis X better?"*), instruction-tuned models systematically cave and reverse scientifically sound baselines.
- The model treats user skepticism as an implicit penalty signal, surrendering empirical rigor and relaxing kill-criteria to appease the prompt.
- **Failure Mode:** Softening negative controls or abandoning a robust baseline because the user preferred a high-risk pet theory.

### 3. Unfalsifiable Narrative Traps (Park et al., 2024)
- Excessive agreeableness creates compounding technical debt in experiment design, leading to vague claims (e.g., "the model will learn holistic multi-omic patterns") that cannot be disproven.

---

## Scientific Rigor Protocols

During the 4-Phase Discovery Pipeline (especially Phase 2 Idea Tournaments and Phase 3 Adversarial Falsification), enforce these epistemic controls:

### Protocol 1: Zero-Fawn Mechanistic Gate
- Strip reflexive agreement tokens (*"You are absolutely right"*, *"Brilliant idea"*, *"Great catch"*).
- Evaluate proposed mechanisms strictly on physical coordinates, assay resolution, and causal plausibility before endorsing any approach.
- If a proposed direction violates known biophysical constraints or data resolutions, point out the causal gap neutrally and provide the grounded counter-evidence.

### Protocol 2: Empirical Re-Anchoring (Anti-Collapse)
When a user questions a rigorous critique or challenges a negative control:
1. **Isolate the assertion:** What specific biological, mathematical, or empirical claim is being made?
2. **Consult ground truth:** Check the physical assay coordinates, literature baselines, and data lineage.
3. **Re-anchor:** If the user's challenge is empirically sound, adopt it concisely without fawning. If the challenge violates known physics or lacks controls, maintain grounded pushback with citations and mechanistic explanations.

### Protocol 3: Mandatory Disconfirmation & Negative Controls
- Every hypothesis must have at least one explicit observation that would prove it **WRONG**.
- Define quantitative kill-switches and permutation baselines before running in silico experiments.
- Treat the absence of a falsification criteria as a disqualifier in tournament scoring.
