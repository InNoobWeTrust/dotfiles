# Training Practice — Earn Trust Before Scaling

Use for a new objective/pipeline or a material training change. For a previously
verified unchanged path, reuse attributable evidence and check the changed boundary;
don't repeat expensive experiments ritualistically. All diagnostic runs need explicit
small-run bounds and isolated outputs. Leave the protected test set untouched.

The checks below are this skill's operational synthesis. Practitioner experience
motivates them; it is not a universal theorem or a license to run experiments.

First choose [Model families](model-families.md). Gradient/LR/accumulation checks below
apply to gradient-based training; fit-level estimators instead follow fold-local
fit/convergence, scoring and fitted-pipeline reload checks. A constrained estimator
need not overfit a tiny set to zero. Use [Transfer/attention](transfer-and-attention.md)
for stage, frozen-mode and kernel changes; “fine-tuning” is not synonymous with LoRA.

## 1. Understand the data that actually reaches the model

- Inspect representative, extreme, failed and duplicate examples **after** processing
  and collation. Examine shapes/dtypes/ranges, missingness, labels, masks, lengths,
  truncation, class/donor/site balance and transformation provenance—not just raw rows.
- Verify feature/label pairing survives filtering, shuffling, packing and augmentation.
  For sequences, check vocabulary/feature ordering, special tokens, padding exclusion,
  target shifts and attention/causal masks for the actual objective. Do not prescribe
  causal masks for bidirectional or non-language objectives.
- For scientific data, check units, normalization/count transforms, batch effects and
  sampling weights with domain knowledge. A syntactically valid tensor can be wrong.
- Use realistic representative lengths/sparsity in resource probes; a tiny short-input
  batch does not establish that long-tail production inputs fit.
- Audit relevance and label quality before adding volume. Raschka's LoRA study found
  a curated smaller dataset competitive with a larger synthetic one; this does not
  establish a universal size rule. Keep data provenance and rejected-data reasons.

## 2. Verify the objective and the update, not just a decreasing log

- State loss definition, reduction denominator and expected initial scale. Uniform
  predictions under an unweighted K-class cross-entropy give `log(K)`; pretrained
  models, class weighting, label smoothing and other objectives need different
  expectations. Don't assert that every initialized model must match that number.
- Inspect individual losses/predictions and a hand-checkable example where practical.
  Confirm labels/masks contribute, non-finite values are absent, and intended inputs
  matter. Unexpected excellent scores can indicate leakage or target-shift bugs.
- For gradient-based training, verify intended trainable parameters are in optimizer groups, receive finite
  gradients and change after a real optimizer update; intended frozen parameters
  remain frozen. PEFT requires checking active adapters and task heads explicitly.
- Reduce to a tiny fixed training set/batch. Disable *optional* augmentation and
  regularization for diagnosis; retain objective-defining masks/constraints with
  controlled randomness. With adequate capacity and suitable optimization, establish
  that the model can fit it substantially better than its starting baseline.
- Choose an objective-specific attainable target/tolerance and bounded stopping rule.
  Zero loss is not universal: noisy/conflicting labels, frozen adapters, constrained
  models, stochastic or irreducible objectives can preclude it. Unexpected failure
  blocks scaling while investigated; document a justified inapplicability instead
  of quietly waiving the learning check or launching endless diagnostic training.
- For custom vectorization, causality or accumulation, compare a simple reference
  case. Inspect dependencies through gradients where applicable. For variable-length
  token losses, total valid-token weighting across the accumulation window is not
  generally the average of per-microbatch means. Avoid double scaling/clipping.

## 3. Establish baselines before adding sophistication

- Measure the unchanged pretrained checkpoint for fine-tuning, or a simple credible
  task baseline for from-scratch work, using the declared validation protocol.
  Include a constant/majority/input-independent baseline when meaningful.
- Compare task-relevant metrics as well as optimization loss. Check representative
  predictions and errors; a lower surrogate loss needn't improve the scientific goal.
- For adaptation, include validation measures of capabilities that must be retained,
  not just the new task. Raschka observed benchmark regressions with unresolved causes;
  don't diagnose every regression as catastrophic forgetting without evidence.
- Start with the closest credible simple architecture/recipe; don't invent a large
  custom stack before demonstrating need. Add one major complexity at a time.
- Diagnose data/objective/update failures before architecture search. A model that
  runs and saves successfully has not yet shown it learns or generalizes.

## 4. Tune applicable optimization/search in bounded experiments

- Start from a relevant validated recipe, not a copied tutorial's arbitrary optimizer,
  learning rate, warmup, weight decay, clipping, epochs or adapter rank. Explain which
  components train and why their learning rates/regularization differ if applicable.
- For classical estimators, tune relevant capacity/regularization/solver or boosting
  settings inside the family-specific CV protocol, not an invented neural LR schedule.
  Budget fit count, convergence, memory and CPU thread oversubscription as well as time.
- Probe a small justified learning-rate range, often logarithmically spaced, within
  the approved search budget. Compare enough updates to interpret the curves; record
  failed/divergent trials. No universal `3e-4`, `2e-5`, batch size or epoch count.
- Validate scheduler total updates/warmup against actual loader/accumulation semantics;
  inspect observed LR early and near boundaries. Recompute after batching changes.
- Distinguish inability to fit from overfitting: fix objective/data/optimization or
  capacity for the former; consider appropriate data, regularization or validation-
  selected stopping for the latter. Don't reflexively respond to both with more epochs.
- Start with single-factor comparisons for diagnosis. Once trustworthy, use a bounded
  random or existing adaptive search when multiple hyperparameters warrant it; every
  trial needs the same declared evaluation and artifact policy. Search itself consumes
  validation information; freeze selection before final test assessment.
- Treat fast.ai's high-LR/one-cycle-style training and progressive resizing as
  task-specific candidates, not universal schedules. Howard reported multi-GPU
  instability. Changed input resolution/length also requires new cost/cadence probes.
- Record hypothesis, changed settings, baseline/control, outcome and next decision
  in the existing experiment record. Treat performance differences smaller than
  evaluation/training variability cautiously; don't present one lucky seed as robust.

## 5. Optimize throughput only after correctness

- Measure warm-start steady-state samples/valid tokens per second, peak accelerator
  memory, CPU/RAM/I/O, padding fraction, eval time and save time. Estimate full-run
  runtime, storage and evaluation overhead including production input extremes.
- Choose microbatch and accumulation jointly; prefer measured throughput, not simply
  the largest batch. Effective batch changes optimization, event count and LR schedules.
- Use hardware-supported mixed precision after a reference comparison. Check finite
  losses/gradients and numeric tolerance; FP16 may need scaling, BF16 support varies.
- Distinguish **activation/gradient checkpointing** (recompute to save memory) from
  durable **training checkpoints** (save to recover). The former cannot restore a run.
- Add length-aware batching, loader tuning, activation checkpointing, compilation,
  attention kernels, quantization or sharding only for an observed bottleneck and
  supported task/hardware. Change one at a time and recheck learning/eval/save/restore.
  Inference-only memory tricks aren't automatically valid training configurations.
  Apply the transfer/attention reference's mask, dropout, backward and dispatch checks
  before treating SDPA/FlashAttention as a measured optimization.
- Stop escalating complexity if a simpler model, input bound or protocol satisfies
  the claim; new infrastructure, dependency installation and larger compute need authority.

## 6. Reproducibility and credible comparison

- Record data/split/preprocessing fingerprints, source and environment versions,
  hardware/backend, base revision, effective configuration, seeds and run identity.
- Seed relevant Python, NumPy generators, framework and sampler/loader workers;
  initialization must occur under the intended seed. Save RNG/state if resume needs it.
- Use controlled randomness for debugging. Deterministic modes have performance costs
  and unsupported-op limits; disclose them. A seed alone never promises bitwise replay
  across hardware, releases, kernels, workers or CPU/GPU.
- Keep stochastic validation/masking comparable via a fixed diagnostic protocol or
  stated repeated-measurement scheme. Fixed-subset diagnostics don't replace full
  validation or independently held-out final assessment.
- For consequential comparisons, budget repeated seeds and uncertainty assessment
  appropriate to the claim. If cells share donors, uncertainty/group resampling must
  respect the independent donor unit; millions of cells aren't millions of subjects.
  If budget only supports one run, label that limitation rather than invent confidence.
- Examine failure slices and worst-performing groups; report sensitivity to choices
  and limits instead of just a favorable aggregate score. Test data cannot tune them.
- Following Zinkevich's infrastructure/ML distinction, compare a fixed model's scores
  through training-time evaluation and the actual downstream scoring/notebook path.
  Shared preprocessing reduces skew; observed agreement is stronger than shared names.

## Diagnostic triage

| Observation | Check before scaling or changing architecture |
|---|---|
| Tiny fixed set does not improve | Pairing/masks/objective, trainable optimizer groups, gradients, LR and attainable capacity |
| Training improves, comparable validation worsens | Leakage/protocol first; then overfitting, regularization, selection and data coverage |
| Both remain poor/flat | Baselines, loss scale, actual parameter updates, LR schedule, objective fit and capacity |
| NaNs/Inf or sudden divergence | Input extremes, reduction, precision/scaler, LR, gradient norm and optimizer-step timing |
| New-task gain, retained-task regression | Comparable protocols, dataset coverage and trade-off; investigate cause before claiming forgetting |
| GPU busy but runs slower than expected | Valid-token throughput, padding, synchronization, eval/save overhead and loader bottleneck |

These are candidate checks, not diagnoses from chart shape alone. Unexpected failure
uses the investigation workflow; preserve logs and checkpoint evidence first.

## Sources and applicability — read 2026-10-15

- **Andrej Karpathy, [A Recipe for Training Neural Networks](https://karpathy.github.io/2019/04/25/recipe/)
  (2019-04-25):** inspect data at the model boundary, simple skeleton/baselines, initial
  loss checks, overfit one batch, diagnose gradients, build complexity incrementally,
  avoid inherited LR-decay defaults and prefer random over grid search. Historical
  CV-specific claims and fixed LR suggestions are not universal policy. Its occasional
  use of “test” for iterative diagnostics is not adopted here; use validation.
- **Martin Zinkevich, [Rules of Machine Learning](https://developers.google.com/machine-learning/guides/rules-of-ml)
  (page footer updated 2025-08-25):** simple first model and infrastructure before
  sophisticated modeling (rules 4–5), held-out export checks and silent data failures
  (9–10), training/scoring skew and shared feature code/time-aware evaluation
  (29, 32–33). Production ranking context; its infrastructure and business objectives
  aren't mandatory in scientific experiments.
- **Jeremy Howard, [Training Imagenet in 3 hours for USD 25; and CIFAR10 for USD 0.26](https://www.fast.ai/posts/2018-04-30-dawnbench-fastai.html)
  (2018-04-30):** measured high-LR/momentum schedules and progressive resizing can
  improve experiment efficiency; reports distributed instability. CNN-specific,
  historical hardware/cost figures—not portable prices or a transformer recipe.
- **Sebastian Raschka, [Practical Tips for Finetuning LLMs Using LoRA](https://magazine.sebastianraschka.com/p/practical-tips-for-finetuning-llms)
  (2023-11-19):** data-quality comparisons, extra epochs sometimes degrading results,
  target-layer/rank/alpha experiments and quantization's memory/time trade-off.
  Llama/LoRA experiments, not single-cell or all-model laws. Overfitting and retained-
  task regression causes are hypotheses where the author leaves them unresolved.
- **Hugging Face, [fine-tuning](https://huggingface.co/docs/transformers/en/training)
  and [Accelerate accumulation](https://huggingface.co/docs/accelerate/en/usage_guides/gradient_accumulation):**
  hardware/precision and recomputation trade-offs; accumulation with variable-size
  samples needs the correct valid-token denominator. Consult the installed release;
  tutorial default budgets, random row splits and uploads are not research policy.
- **PyTorch contributors, [Reproducibility](https://docs.pytorch.org/docs/2.14/notes/randomness.html)
  (page updated 2026-05-14):** multiple RNG/worker sources, deterministic performance
  trade-offs, and no guarantee across releases/platforms or CPU/GPU even with seeds.

The selected sources support staged verification and empirical tuning, not one
universal training recipe. Repeated-seed/independent-unit uncertainty requirements
above are this skill's claim-sensitive policy, not quotations from these practitioners.

Apply [Preflight](preflight.md) for actual schedule, persistence and reload proof;
these methodological checks do not substitute for that executable evidence.
