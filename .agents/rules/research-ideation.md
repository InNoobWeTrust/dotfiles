---
description: "Adapter rule for scientific research, paper reproduction, literature synthesis, and hypothesis generation. Routes execution to the research-ideation skill and suppresses premature software engineering bureaucracy."
globs: "*"
alwaysApply: false
trigger: model_decision
---

# Scientific Research & Ideation Rule

Use the `research-ideation` skill for scientific inquiry, paper reproduction, and research proposal workflows.

## Trajectory Suppression

When this rule is triggered:
- **Suppress premature software engineering bureaucracy:** Do NOT enforce TDD, slicing, code-craft modularity constraints, or administrative terminology freezes during the exploratory research or proposal formulation phase.
- **Enforce scientific rigor:** Shift evaluation from "unit tests" to physical/biological plausibility, cross-modality data integrity, literature citation verification, and falsifiable experiment designs with explicit negative controls.

## Activation Signals

| Signal | Route |
| --- | --- |
| Scientific paper reproduction, paper analysis | Load `research-ideation` for methodology deconstruction and dataset mapping |
| Novel hypothesis generation, "what-if" scientific questions | Load `research-ideation` for Idea Tournament and divergent exploration |
| Research proposal authoring, lab data alignment | Load `research-ideation` for proposal synthesis and negative control design |
| Exploratory notebook experiments (Jupyter/Marimo) | Load `research-ideation` for fast, iterative prototype cycles |
