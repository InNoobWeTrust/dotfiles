---
metadata:
  sources-read: "2026-10-15"
---

# Transfer Learning and Attention Backends

Use for pretrained feature extraction, fine-tuning or changing attention execution.
These are separate choices: fine-tuning does not require adapters or FlashAttention.
Read [Model families](model-families.md) for the task and modality contract first.
Only execute probes within authorized compute, dependency and network boundaries.

## Transfer choices — not only language models

| Choice | What changes | Evidence before scaling |
|---|---|---|
| Frozen feature extractor + fitted classical model | Task estimator; backbone fixed | Feature/preprocessing revision, no validation-fitted transforms, credible baseline |
| Frozen backbone + neural head | Head only | Actual optimizer groups/updates; frozen weights and chosen running-statistic policy |
| Partial fine-tuning | Selected backbone blocks plus head | Named layer policy, optimizer groups, mode/state checks and comparable validation |
| Full fine-tuning | Intended full model | Capacity/data fit, memory budget, LR/regularization and retained capabilities |
| Adapters/LoRA | Architecture-supported adapters and designated task modules | Supported targets, active adapter/head, base revision and complete save/reload |

- Establish unchanged-pretrained and simple task baselines. Select transfer strategy
  using data, objective, domain shift, resources and validation—not a universal LoRA rule.
  A small-data vision head-first recipe is a candidate, not a requirement for all tasks.
- Inspect pretrained input size, channels, normalization, sample rate, vocabulary and
  feature/head shape. Replacing a head does not automatically reconcile input semantics.
  For timm, use `pretrained_cfg` with its supported data-config/transform helpers;
  `forward_features` may return a feature map, not a pooled feature vector.
- Feature caches can accelerate a fixed-backbone experiment but must record source,
  transform and backbone revisions. Caching fixes that transformation: it is not
  equivalent to fresh stochastic augmentation through the backbone every epoch.
- Fit feature scaling, dimensionality reduction, selection and the downstream estimator
  on training folds only. Learned unsupervised transforms can leak validation data too.
- Separate **gradient eligibility**, **optimizer membership** and **forward mode**.
  In PyTorch, `requires_grad=False` does not itself freeze BatchNorm running statistics
  or disable dropout. Choose and verify modes for each component; framework semantics differ.
  In Keras, recompile after changing `trainable`; its BatchNorm behavior is special.
- When unfreezing or changing stages, verify newly trainable parameters actually enter
  optimizer groups. Decide which optimizer/scheduler state continues versus resets;
  use a justified stage-specific LR rather than blindly inheriting head training's LR.
  Recalculate stage boundaries, validation/save coverage and remaining budget.
- Save the stage, freeze policy, model/head/adapters, preprocessing and promised resume
  state. Reload the same configuration and check predictions plus trainability/modes.
  Adapter-only weights need the exact base; weights-only exports are not full resumption.
- Quantized inference support is not proof that full fine-tuning works. Check supported
  backward path, trainable parameter dtype and base/adapter serialization for the actual
  quantized-training method. Compare held-out quality and measured memory/time cost.
- Monitor task gain and relevant retained capabilities. Negative transfer is possible;
  don't label every regression “catastrophic forgetting” without investigating protocol,
  data and optimization. Freeze selection before protected test assessment.

Chollet's Keras guide and Chilamkurthy's PyTorch tutorial demonstrate vision transfer
with frozen/head and fine-tuning paths. Their example LRs, epochs and temporary weight
files are not a production run plan or durable recovery policy.

## Attention selection — correctness before acceleration

FlashAttention is an IO-efficient implementation of dense softmax attention, not a
new training objective, sparse approximation or universal replacement for all layers.
It matters for compatible attention workloads, not trees, ordinary convolutions or
every multimodal component. Native PyTorch SDPA can already choose fused kernels;
the external `flash-attn` package is not automatically necessary.

1. **Identify the bottleneck.** Measure representative lengths, batch/head dimensions,
   valid-token throughput, peak memory and full update cost including data/eval/save.
   Short inputs, loading or another backbone may dominate. Published speedups aren't
   predictions for this hardware or objective.
2. **Prefer the supported native path.** Use the model's public attention configuration
   or PyTorch SDPA when compatible. Record the selected implementation and actual
   dispatch/fallback evidence; a requested name does not prove a fused kernel ran.
   Use release-supported diagnostic controls, not private patching.
3. **Verify compatibility for this release.** Record device architecture, CUDA/ROCm,
   PyTorch/backend versions, dtype, head size, layout, causal/variable-length/cross-
   attention needs, and forward **and backward** support. FlashAttention generations
   and NVIDIA/AMD implementations have different restrictions. An inference KV-cache
   API without backward cannot be the training path.
4. **Test real masks and alignment.** Include padded/packed data, unequal query/key
   lengths, bidirectional/causal/cross-attention as applicable and modality boundaries.
   Packed independent examples must not silently attend across sample boundaries.
   Variable-length unpadding/repacking must preserve example and target alignment.
5. **Compare against a reference.** With controlled randomness and dropout disabled
   for the initial comparison, check outputs, loss, gradients and one real update
   against a supported math/reference path with justified tolerances. Then verify
   training dropout and production masks. Fused floating-point math needn't be bitwise
   identical; unexplained quality differences or NaNs block scaling.
6. **Benchmark the validated path.** Warm up and account for synchronization/compilation;
   compare identical shapes, precision, objective and effective batch. Recheck evaluation,
   saving/reload and remaining schedule if throughput or feasible batch changes.

### Concrete traps from the checked documentation

- PyTorch SDPA applies supplied `dropout_p` regardless of module mode: pass zero for
  evaluation. `model.eval()` alone does not change a handwritten SDPA call's argument.
- SDPA Boolean-mask **True permits participation**; `MultiheadAttention` key-padding
  **True excludes**. Additive masks use appropriate zero/negative-infinity semantics,
  not an assumed interchangeable Boolean convention.
- In the observed PyTorch 2.14 API, explicit `attn_mask` plus `is_causal=True` raises
  an error; SDPA's non-square causal alignment differs from FlashAttention 2.1's
  bottom-right alignment. Verify the installed path's intended semantics, not just shapes.
- In observed Transformers 5.19.0, supported multimodal sub-configurations can choose
  different backends. Do not force a float32 vision component onto a backend requiring
  other dtypes just because another component supports it.
- A custom Transformers attention backend needs compatible mask registration; its guide
  warns that missing registration can skip mask creation and pass `attention_mask=None`.
  Prefer established supported integrations over a bespoke kernel registry.
- Some current Transformers kernel paths can fetch and load compiled Hub kernels.
  Verify caches, provenance and download/remote-code policy before selection; no implicit
  installation, compilation, kernel download or research-data disclosure is authorized.

## Receipt — append to the existing run record

```text
Transfer strategy / stages / pretrained input contract / actual trainable groups:
Forward modes and normalization policy / optimizer-state transitions:
Attention path or not applicable / release-hardware-dtype compatibility:
Mask/dropout/alignment and backward reference evidence:
Measured throughput/memory / dispatched kernel or fallback / justified choice:
Artifacts and restore evidence / blocked capabilities / next safe action:
```

## Sources and limits

- François Chollet, [Transfer learning & fine-tuning](https://keras.io/guides/transfer_learning/)
  (created 2020-04-15; modified 2023-06-25): head/fine-tuning, feature caching, trainability,
  recompilation and BatchNorm distinctions; illustrated Keras/vision context.
- Sasank Chilamkurthy, [Transfer Learning for Computer Vision Tutorial](https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html)
  (created 2017; updated 2025-01-27): fixed-backbone versus full fine-tuning. Its temporary
  best-weight export is not a retained optimizer-state checkpoint.
- [timm quickstart](https://huggingface.co/docs/timm/en/quickstart): observed v1.0.30;
  pretrained configuration, transforms and feature extraction.
- Tri Dao and collaborators, [FlashAttention repository README](https://github.com/Dao-AILab/flash-attention)
  (README read from its raw main branch): generation/hardware/dtype differences,
  causal alignment, evaluation dropout and inference-only KV-cache restrictions.
- [PyTorch SDPA 2.14](https://docs.pytorch.org/docs/2.14/generated/torch.nn.functional.scaled_dot_product_attention.html)
  and [Transformers AttentionInterface](https://huggingface.co/docs/transformers/en/attention_interface)
  (observed v5.19.0): automatic kernel selection, masks, dropout, fallback, registration
  and multimodal backend configuration. API pages alone do not prove a training run.

Version observations are not required versions. Recheck installed APIs and hardware;
no backend was installed or benchmarked in this skill's source research.
