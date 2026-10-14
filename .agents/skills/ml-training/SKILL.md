---
name: ml-training
description: "Choose libraries and plan, debug, preflight, monitor and recover classical/tabular ML, vision, audio, time-series and multimodal training/fine-tuning, including training for edge or hardware-specific deployment. Prefer Hugging Face for compatible neural workflows; verify learning, evaluation, durable metrics and recoverable artifacts. Use for 'train a model', 'fine-tune', 'cross-validation', 'multimodal', 'FlashAttention', 'train for edge', 'ONNX/TFLite target', 'validation curve' or 'recover a run'. Excludes hypothesis-only research, inference-only packaging and LLM agent model benchmarking."
metadata:
  lifecycle: prototype
  created: "2026-10-15"
  updated: "2026-10-15"
  review-after: "1–2 real uses or 2027-01-15"
---

# ML Training

Protect expensive experiments from avoidable evidence loss. A configured evaluation
or checkpoint is an intention; a persisted, attributable, reloadable artifact is evidence.
Prefer Hugging Face for compatible new neural workflows, not incompatible rewrites.

## Contract and mode

- **Reader:** an agent supporting ML experiments; no particular framework, tracker,
  accelerator, scheduler, repository layout, or harness is required.
- **Inputs:** intended scientific claim; dataset/split provenance; effective run
   configuration/framework version, applicable target, budgets and allowed actions. For an
  existing run, request its identity, logs, configuration and artifact locations.
- **Outputs:** a proportionate run plan/preflight receipt, traceable metric and
  checkpoint inventory, and a claim-limited assessment or recovery decision.
- Discover native tools or authorized integrations for inspection and execution.
  Missing access means **UNVERIFIED**, not permission to install, upload data,
  launch training, raise budgets or change infrastructure.
- Select **new/changed run**, **analysis-only**, or **recovery**. Analysis-only checks
  steps 1 and 5 without training. Recovery loads
  [Recovery](references/recovery.md) first and bypasses the new-run launch path.
- This skill grants no compute/spending or destructive-action authority. Honor
  the user's approval gates; inspect existing artifacts before any overwrite.

## 1. Establish the claim and split contract — mandatory

1. Define the prediction unit, population and question: final-model score,
   learning trajectory, checkpoint selection, adaptation gain, or another claim.
2. Trace actual loaders to train, validation and test identities/counts—not
   filenames alone. Training fits parameters; validation informs tuning
   and selection; test assesses the frozen choice, not iterative decisions.
3. Match independence to the claim: split by subject/donor/patient, experiment,
   site or time where required. Random rows/cells from one subject can leak across
   splits. Fit preprocessing on training only, except explicitly justified
   transductive protocols; audit duplicates and pretrained-data overlap where known.
4. State whether validation is full, fixed-subset or rotating. A subset is not
   silently the full held-out split. Keep test inaccessible to tuning logic.

## 2. Choose the stack, schedule and recovery — mandatory for new/changed runs

Load [Model families](references/model-families.md), [Library selection](references/library-selection.md)
and [Preflight](references/preflight.md). Verify task/API/version fit; HF preference
is for compatible neural work. For target-specific training also apply
[Deployment targets](references/deployment-targets.md); record decisions in the existing run record.

1. Declare applicable units: fits/folds/trials, boosting rounds, or neural optimizer
   updates/microbatches/epochs. Derive from actual data and stop rules; recompute
   evaluation, saving and applicable optimizer schedules after relevant changes.
2. Enumerate expected validation events, units and first/last boundaries. Choose
   coverage sufficient for the claim within measured evaluation cost. Baseline/final
   snapshots alone cannot support a learning-trajectory claim.
3. Separate evaluation, logging and save schedules. For best-model selection,
   lock metric/direction, comparable protocol, tie policy and installed-version
   compatibility. Verify patience units; no fictional epochs for non-iterative fits.
4. Budget durable metrics and artifacts for **best**, **latest resumable**,
   **final**, and justified **trajectory snapshots**. Purposes may share artifacts;
   retention preserves promised purposes after cleanup; unsupported resume is N/A.
5. Explain coverage, cost and recoverability before launch. If budget cannot
   support the claim, narrow the claim or seek changed authorization.

## 3. Prove the pipeline before expensive execution — mandatory

Apply [Training practice](references/training-practice.md) and the family's learning checks;
load [Transfer/attention](references/transfer-and-attention.md) for applicable changes.
Within authorized small-run limits, exercise real data, scoring and serialization.
Iterative runs prove intermediate held-out eval/log/save; non-iterative fits prove
fit → held-out scoring → fitted-pipeline export. All require durable run/split/unit
attribution and reload/evaluation. Verify resume state only where supported/promised;
do not demand gradients or intermediate events from estimators without those concepts.

Compare smoke and production configurations: the smoke proves plumbing, not the
production event count. Do not overwrite baseline weights or existing runs.
No authorized execution/access → state the missing proof and block expensive launch.

## 4. Execute and observe within bounds

Preserve effective configuration, source/environment versions, seeds, split identity,
initialization and run ID. Observe the first production validation/save boundary;
compare durable events/artifacts with the plan, not console text alone. Check finite
metrics, applicable loss/LR/progress, disk space and artifact health.

Missing scheduled events, non-finite values, retention violations or exhausted
budgets block dependent claims and further authorized launch/continuation. Preserve
evidence; pause an owned run only via its agreed safe mechanism. Do not kill or
restart user jobs. Do not claim monitoring without a real owner/wake-up path.

## 5. Assess evidence; recover before rerunning

- Join raw events to run, split, artifact, fit/fold/round/update, metric definition and
  aggregation. Confirm notebook code uses intended fields and artifacts.
- Training loss and held-out validation loss are different series. Before/after
  validation bars are valid snapshots, not a trajectory. Chart geometry does not
  establish which data was evaluated. Label subsets, sparse points and gaps.
- Separate final checkpoint from validation-selected best checkpoint. Freeze
  selection before test scoring; disclose prior test use and limitations.
- Missing plots, logs and model states are distinct failures. Follow
  [Recovery](references/recovery.md) before recommending a rerun. Never interpolate
  missing validation as measured evidence or declare a run worthless solely because
  its curve is missing.

## Stop conditions

- Unresolved leakage, units, claim or effective configuration → block launch.
- Required preflight proof absent, unsafe outputs or unavailable capacity → block
   expensive launch and state missing evidence; required target proof cannot be replaced by export success.
- Unexpected execution/recording/retention → preserve and investigate; configuration
  alone never establishes that an event occurred.
- Recovery needs compute, disclosure, deletion or rerun outside authority → return
  options and limits; do not silently execute.

## Deliverable check

- [ ] Claim, split provenance, leakage limits and test policy explicit.
- [ ] Library/API/version choices and exceptions; learning/baseline proof recorded.
- [ ] Expected versus observed events and checkpoint purposes attributable.
- [ ] Applicable learning/export/target proof and compute/storage bounds recorded.
- [ ] Charts identify data, metrics, checkpoints and missing coverage correctly.
- [ ] Final/best selection and reproducibility limits disclosed.
- [ ] Recoverable/unavailable evidence and next safe action clear.

## Anti-patterns

| Temptation | Why wrong | Correct path |
|---|---|---|
| Rewrite the loop or install the entire HF stack | Adds unverified complexity | Choose fitting public APIs; justify exceptions |
| Reuse a large-run interval | Batching changes coverage | Recompute updates/event list |
| Configuration says eval, so it ran | Callbacks/writers can fail | Inspect durable events |
| Any saved model is resumable | Weights may omit optimizer/RNG state | Verify promised restore state |
| Keep only best/latest for all claims | Rotation erases trajectory states | Budget claim-specific snapshots |
| Plot `loss` as validation | Names need provenance | Trace loader and event origin |
| Missing curve means rerun everything | Existing scores/states may suffice | Inventory and recover first |

## Prototype validation

After 1–2 authorized uses check task/API fit, tiny-set learning, cadence after batching,
classical fit/reload, modality/attention/target semantics, missing events and retention.
Source walkthroughs do not prove live training safeguards work.
