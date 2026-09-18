# The Scientific Hypothesis Tournament

The Hypothesis Tournament replaces single-agent consensus with competitive idea evaluation, inspired by Google DeepMind's Co-Scientist and Stanford NLP's ideation evaluations.

## Step 1: Divergent Generation

Frame the user's research challenge into three competing directions:

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

- If Angle B or C has high novelty but questionable feasibility, extract its **core mechanistic insight** and graft it onto the tractable baseline of Angle A.
- Never discard a hypothesis without stating its specific failure mode (e.g., "requires $100K wet-lab CRISPR screen", "conflates scRNA with genomic coordinates").
