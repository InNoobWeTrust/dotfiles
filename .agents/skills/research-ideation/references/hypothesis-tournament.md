# The Scientific Hypothesis Tournament

The Hypothesis Tournament replaces single-agent consensus with competitive idea evaluation, inspired by Google DeepMind's Co-Scientist and Stanford NLP's ideation evaluations.

## Step 1: Divergent Generation

Frame the user's research challenge into three competing directions:

Begin with the user's unresolved outcome and a few inspected source principles, each with its causal role and assumptions. For every candidate, state principle → intervention → mechanism → outcome → falsifier. Separate a source's essential mechanism from contingent implementation examples; cross-domain mappings are hypotheses, not mandates. Compete on mechanisms, not three variants of a favored tool.

| Angle | Archetype | Goal | Risk / Reward |
| :--- | :--- | :--- | :--- |
| **Angle A** | Conservative Foundation | Reproduce or incrementally adapt a known baseline using lab data | Low Risk / Moderate Reward |
| **Angle B** | Cross-Disciplinary Leap | Apply an architecture or concept from an adjacent domain (e.g. CV, NLP, Diffusion) to this biology problem | Moderate Risk / High Novelty |
| **Angle C** | Breakthrough "What-If" | Question an established dogma or invert the standard pipeline | High Risk / Transformative Reward |

## Step 2: Adversarial Critique Matrix

Score each angle from 1 (poor) to 5 (excellent) across the 4 Scientific Rigor Axes:

```markdown
### Tournament Scoring Matrix

| Angle | Modality Match (1-5) | Mechanistic Plausibility (1-5) | Falsifiability (1-5) | Feasibility (1-5) | Total | Recommendation |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Angle A** | 5 | 5 | 4 | 5 | 19 | Safe Baseline |
| **Angle B** | 4 | 4 | 4 | 3 | 15 | Incubate / Prototype |
| **Angle C** | 3 | 4 | 5 | 2 | 14 | Stretch Goal / Pre-flight |
```

## Step 3: Resolution & Winner Selection

Before scoring selects a winner, check relevance to the original outcome: does success demonstrate more than a convenient proxy? A high total cannot rescue a missing causal link or failed negative control. If a detailed tool/procedure has displaced the source principle, compare a simpler mechanism without it or park the branch; retain details shown necessary by the domain. After null results, reconsider the mechanism rather than add machinery until a narrow check passes.

- If Angle B or C has high novelty but questionable feasibility, extract its **core mechanistic insight** and graft it onto the tractable baseline of Angle A.
- Never discard a hypothesis without stating its specific failure mode (e.g., "requires $100K wet-lab CRISPR screen", "conflates scRNA with genomic coordinates").
