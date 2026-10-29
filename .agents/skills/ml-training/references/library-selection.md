---
metadata:
  official-sources-read: "2026-10-15"
---

# Library Selection — Hugging Face First, Fit Before Adoption

Use before writing or materially changing a training pipeline. This is the skill's
selection policy, informed by the sources below—not a claim that every practitioner
endorses one ecosystem. Prefer established APIs over homegrown training machinery.

## Selection order

First choose the [model-family contract](model-families.md). Classical/statistical
estimators are first-class candidates; HF-first is a compatible neural preference.
If training must satisfy a named runtime/device, resolve [Deployment targets](deployment-targets.md)
first: the selected exporter/backend/operator/precision contract constrains architecture
and training/QAT choices. Ecosystem preference does not override deployment fit.

1. Inspect the existing environment, working pipeline and closest credible task/model
   recipe. Preserve compatible proven choices; preference does not authorize migration.
2. For **new compatible neural workflows**, prefer PyTorch plus Hugging Face components.
   Check model/objective, batch schema, metrics, save/resume and hardware fit first.
3. Use the highest-level supported training API that preserves the scientific protocol.
   Configure it before extending it; extend public interfaces before replacing the loop.
4. If fit fails, record the concrete mismatch and choose the simplest established
    alternative. JAX/TensorFlow projects, domain frameworks,
   unusual online objectives or sparse scientific data need not be forced into Trainer.
   Domain libraries and HF components can coexist; don't densify sparse data just to fit.
5. A custom loop requires a reason existing APIs cannot serve, plus explicit ownership
   of evaluation, accumulation, scheduler, distributed reduction, persistence and resume.
   Missing packages/access means a blocked capability, not permission to install.

## Components and extension points

| Need | Preferred candidate when compatible | Verify before choosing |
|---|---|---|
| Classical/tabular/statistical fit | Existing task stack; scikit-learn Pipeline/estimators; compatible boosting/domain library | Fold-local transformations, group/time-aware selection, fit/convergence units and fitted-pipeline reload |
| Vision | Compatible timm/HF, torchvision or established Keras/domain recipe | Pretrained transforms, feature/head shape, geometric labels and transfer stage |
| Supported pretrained architecture/processors | Transformers Auto classes / model's supported API | Exact revision, license, vocabulary/preprocessing, architecture and head |
| Audio/multimodal | Supported model/processor and established task/domain trainer | Pairing, rates/geometry, missingness, loss and all component states; not automatically SFT |
| Conventional neural training/evaluation | `Trainer` + `TrainingArguments`; task-specific trainer where needed | Forward/input/label/loss contract, real validation loader, update/event units |
| Nonstandard batch assembly | Supported data collator | Padding, masking, label alignment, stochastic behavior and retained columns |
| Custom loss/data loading | Narrow public `Trainer` subclass, e.g. `compute_loss` or `get_train_dataloader` | Installed signature, reduction/`num_items_in_batch`, column filtering, accumulation |
| Logging/eval/save timing | `TrainerCallback` / supported built-ins | Effective control flags, `DefaultFlowCallback`, persistence and state restoration |
| Justified custom PyTorch loop/distribution | Accelerate `Accelerator.prepare`, `backward`, `accumulate` | One owner for device placement, synchronization, optimizer/scheduler and scaling |
| Adapter fine-tuning | PEFT configuration + `get_peft_model` | Architecture-specific targets, active adapter, trainable heads/modules, full restore |
| Language-model SFT/preference/RL post-training | TRL's matching trainer, e.g. `SFTTrainer` or `DPOTrainer` | Exact algorithm, dataset/template/masking, reward/reference semantics and versions |
| Compatible large dataset preprocessing | Datasets `Dataset.map` / Arrow-backed storage | Split IDs, cache/fingerprint, schema, memory/stream semantics; not group-safe splitting automatically |
| Evaluation metrics | Existing task implementation; Evaluate if maintained and suitable | Definition, aggregation, version, local code/download policy; LightEval for compatible LLM benchmarks |
| Tensor weight serialization | Framework save APIs with safetensors where supported | Weights are not optimizer/RNG/loader state; format does not prove complete checkpoint |
| Tracking | Existing durable local events or approved tracker | Attribution/export survives job cleanup; explicitly control external reporting |
| Transfer or attention optimization | Supported full/head/partial/adapter paths; native SDPA before unnecessary external kernels | Apply [Transfer/attention](transfer-and-attention.md): modes, trainability, backward/masks and actual measured dispatch |
| Training for a named deployment target | Existing compatible runtime/exporter and target-supported architecture/precision recipe | Early conversion/reload, actual backend dispatch and profile-specific quality/resource proof; exports are not resumable state |

TRL is not the default for every sequence model: a gene-token sequence is not
automatically a causal language-model SFT task. LoRA is a method choice, not a universal
replacement for full fine-tuning. Adapter rank, targets and frozen/trainable components
need a scientific and resource rationale. Do not promise equal quality from PEFT.
Raschka's [LoRA experiments](https://magazine.sebastianraschka.com/p/practical-tips-for-finetuning-llms)
(2023) compared target-layer coverage, rank/alpha and QLoRA memory/time trade-offs;
they support testing the relevant choices, not copying a universal rank, all-layer
policy or expected speedup. Confirm actual trainable parameters, not config intent.

## Mandatory version and operational checks

- Record installed compatible versions of selected packages, PyTorch/device backend,
  source/config and exact base/tokenizer/adapter revisions. Use the environment's
  existing lock mechanism; don't upgrade to match the newest tutorial implicitly.
- Resolve docs for the **installed release**. Research observed Trainer
  v5.19.0, Accelerate v1.15.0 and PEFT v0.21.0 references; these are observations,
  not required versions. Parameter names, callbacks and defaults change.
- Configure evaluation, logging, saving, selection metric/direction and destinations
  explicitly. In observed Trainer v5.19.0, step-based best-model loading requires
  matching save/eval strategies (except `save_strategy="best"`) and `save_steps`
  a multiple of `eval_steps`; verify applicable release constraints before execution.
  A valid configuration still does not prove callbacks fired or logs survived.
- Best-model loading changes the live model. An export after that load is the selected
  best, not necessarily the last-update model; retain and label last-update evidence
  separately if the claim requires both.
- For promised Trainer resumption, inspect `save_only_model`,
  `restore_callback_states_from_checkpoint` and data-skip behavior. In observed v5.19.0,
  `save_only_model=True` omits optimizer/scheduler/RNG and prevents full resume.
  `save_model`/`save_pretrained` exports are not by themselves a resume proof.
- For Accelerate, use `save_state`/`load_state` and register custom stateful objects
  with `register_for_checkpointing` where necessary. Verify sampler/progress recovery;
  the checkpoint guide expects the same training script, not arbitrary portability.
- Never double-apply accumulation scaling, gradient clipping, scheduling or device
  wrapping across Trainer, Accelerate and handwritten code. Compare a bounded reference
  update when extending reduction or accumulation; non-padding token denominators matter.
- Avoid private method overrides unless an unavoidable, pinned compatibility contract
  is tested. Callbacks govern timing/control, not arbitrary forward/loss computation.
- Explicitly disable unapproved external reporting/Hub uploads (`report_to`,
  `push_to_hub`, tracker deployment settings as applicable). HF preference is **local
  library reuse**, not consent to send research data, models or logs to a service.
- Hub examples' `train_test_split`/`eval_dataset=dataset["test"]` often create a tuning
  holdout, not a protected final test. Preserve this skill's train/validation/test
  roles and donor/group boundaries regardless of example field names.

## Selection receipt — add to the existing run record

```text
Requirement / selected library and exact public API / version:
Why this preserves model, objective, data and evaluation semantics:
Existing stack retained / applicable HF preference or neural exception and reason:
Extension points / custom-loop obligations / compatibility evidence:
Model, processor and adapter revisions / state save and restore APIs:
Reporting and remote-code/download policy / authorized destinations:
Missing capability or verification; next safe action:
```

Before loading repository/model code from elsewhere, inspect provenance and local
policy; do not enable `trust_remote_code` or load unsafe pickle silently. Tensor-safe
weights do not make arbitrary model/metric code trustworthy. Selection isn't installation.

## Official sources

- [Trainer](https://huggingface.co/docs/transformers/en/trainer),
  [API / TrainingArguments v5.19.0](https://huggingface.co/docs/transformers/v5.19.0/en/main_classes/trainer),
  [subclassing](https://huggingface.co/docs/transformers/en/trainer_customize),
  [callbacks](https://huggingface.co/docs/transformers/en/trainer_callbacks).
- [Accelerate](https://huggingface.co/docs/accelerate/en/index),
  [accumulation](https://huggingface.co/docs/accelerate/en/usage_guides/gradient_accumulation),
  [checkpointing](https://huggingface.co/docs/accelerate/en/usage_guides/checkpoint).
- [PEFT quicktour](https://huggingface.co/docs/peft/en/quicktour),
  [TRL trainers](https://huggingface.co/docs/trl/en/index).
- Classical, temporal and multimodal sources: [Model families](model-families.md).
  Vision transfer and SDPA/FlashAttention sources: [Transfer/attention](transfer-and-attention.md).
  Runtime, conversion and quantization sources: [Deployment targets](deployment-targets.md).
- [Datasets and Arrow](https://huggingface.co/docs/datasets/en/about_arrow),
  [Evaluate and LightEval guidance](https://huggingface.co/docs/evaluate/en/index),
  [safetensors](https://huggingface.co/docs/safetensors/en/index).

These document capabilities. They do not replace task-fit evidence, execution proof
or authorized budgets. Live pages can move or change; recheck the selected release.
