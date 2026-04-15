# Data Storytelling References

This directory contains documentation, prompt contracts, lens definitions, questionnaires, and usage guides for the data-storytelling skill.

## Contents

- **README.md**: Comprehensive usage documentation, workflow examples, invocation commands, and implementation notes.
- **questionnaire/goal-framing.md**: Fallback questionnaire for gathering goal, audience, threshold, and other context when `strategic-problem-solving` is unavailable.
- **prompts/**: Component-level prompt contracts for the core engine:
  - `goal-interpreter.md`: Goal normalization and context import.
  - `data-profiler.md`: Data structure, quality, and constraint identification.
  - `lens-planner.md`: Analytical lens selection and orchestration.
  - `signal-miner.md`: Lens-specific reasoning and evidence capture.
  - `insight-scorer.md`: Signal ranking by goal alignment, confidence, and novelty.
  - `narrative-planner.md`: Answer-first story structure conversion.
  - `skeptic-qa.md`: Claim validation and downgrade logic.
  - `output-engine.md`: Template selection and rendering.
  - `audience-adapter.md`: Tone, density, and framing adaptation.
- **lenses/**: Built-in analytical lens definitions covering trend, comparison, distribution, driver, anomaly, and root cause analysis.