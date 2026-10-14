# Training Preflight

Use before a new/changed run. Resolve paths against the experiment root at runtime;
use its existing configuration/run record, not a parallel documentation tree.
First apply [Model families](model-families.md), [Library selection](library-selection.md) and
[Training practice](training-practice.md); launch plumbing alone doesn't prove learning.

Apply only the units and checks the chosen family exposes. Fit-level estimators need
bounded fit/scoring/fitted-pipeline reload, not invented gradients or intermediate
epochs. Boosting needs round-specific checks; neural update arithmetic below is conditional.
For transfer or attention changes also apply [Transfer/attention](transfer-and-attention.md).
For training to a named runtime/device apply [Deployment targets](deployment-targets.md)
before expensive target-dependent work: distinguish training hardware, inference target
and actual on-device adaptation; require representative early export and target proof.

## Update and event arithmetic

- For classical searches, count trials × folds × fits, refits and resource concurrency;
  for boosting, derive rounds and its own validation/stopping semantics. Bound time,
  RAM, threads and search cost. Group/time-aware folds are actual execution inputs.
- Distinguish samples/tokens, forward-backward microbatches, optimizer updates,
  epochs and wall time. Verify each setting's actual unit in the installed version.
- Effective sample batch commonly equals per-device batch × data-parallel replicas
  × accumulation. Tensor/pipeline parallel ranks are not additional data replicas.
  Packed sequences/variable-length batches need actual loader/token accounting.
- Derive microbatches from the real loader/sampler; derive updates using its partial
  accumulation, `drop_last`, distributed sharding and maximum-update behavior.
  Cross-check trainer-reported totals. For streams/unknown horizons, bound an initial
  segment with an early evaluation and revise from observed throughput.
- For verified integer update interval `I` and length `T`, periodic events commonly
  occur at `I, 2I, …, floor(T/I)I`. Confirm delays, resume offsets, fractional
  intervals and final-evaluation semantics. Baseline/final events are separate
  and may duplicate a periodic boundary.
- Example: **T = 11,304**, **I = 10,000** gives **one scheduled evaluation** at
  10,000, not useful trajectory coverage by itself. If roughly ten observations
  are needed, **I = 1,000** gives eleven, plus an explicit final evaluation if
  needed. This is arithmetic, not a universal default; account for learning
  dynamics and measured evaluation cost.
- Recalculate after batch/accumulation, dataset, epoch/max-update, world-size and
  resume changes; reassess learning rate/warmup, cadence and stopping patience
  together. Do not automatically scale learning rate without justification.

## Evaluation and comparison contract

- Fix primary metric, direction, aggregation denominator, padding/masking and
  objective weighting. Averaging batch means can bias uneven batches; use the
  intended sample/token weighting and distributed reduction.
- Use evaluation mode and disable gradients where appropriate. Verify dropout,
  batch-normalization, stateful layers, stochastic masking/augmentation and RNG;
  record unavoidable stochastic evaluation.
- Before/after and checkpoint comparisons need the same split/preprocessing,
  objective and protocol. Training loss with regularization/augmentation or
  different masking is not automatically comparable to evaluation loss.
- For costly validation, a fixed diagnostic subset plus less frequent full
  evaluation may be justified. Label both; select best using the declared protocol.
  Do not change subsets adaptively while claiming a comparable series.
- Verify installed-version constraints for best-model loading, save/eval strategies,
  interval alignment, metric names and early-stopping callbacks.

## Artifacts and retention

| Purpose | Necessary evidence/state |
|---|---|
| Final scoring | Complete fitted model/pipeline or neural weights/architecture/processors, config and provenance |
| Best selection | Comparable metric linked to saved candidate; direction/ties explicit |
| Resumption, if supported/promised | Required estimator state or neural model/optimizer/scheduler/scaler/progress/RNG/loader state |
| Retrospective trajectory, if required | Saved candidate states at known rounds/updates plus evaluation protocol |
| Metric recovery | Structured events preserved independently of rotating checkpoints |
| Named deployment target | Source checkpoint/pipeline plus attributable export/toolchain, preprocessing, calibration and actual profile-specific quality/resource/dispatch evidence |

Adapters require the exact base revision/configuration; sharded checkpoints require
all necessary shards/metadata. Fitted preprocessing state must survive. A checkpoint
directory name is not completeness evidence.

Budget artifact size/count, free space/growth, evaluation duration/overhead, job
runtime/cost, persistent destinations and cleanup. Do not save everything by default
or mistake ephemeral job storage for durable storage. Protect promised purposes
from rotation; do not prune existing artifacts without authorization.

Serialization must capture a snapshot, not a mutable reference to the ongoing model.
Use established save/restore APIs and verify completion. Optimizer state alone does
not guarantee exact continuation: disclose nondeterministic ops/hardware and loader
restoration limits.

## Executable smoke evidence

1. Use distinct small-run outputs and bounded authorized compute. Establish data/loss,
   applicable gradient/update or estimator-fit and learning evidence before scaling; record
   objective-specific expectations or justified exceptions, not a universal zero loss.
2. Exercise real train/validation data paths. Iterative runs cross an intermediate
   eval/save boundary; fit-level models complete a representative fit and held-out score.
   Leave test untouched; verify fold-local transformations and any external eval data.
3. Inspect durable run/split/fit/fold/round/update/metric records as applicable;
   intermediate held-out evaluation is required only for the declared iterative path.
4. Reload through the production restore path and evaluate using the same protocol;
   compare within declared numeric/stochastic tolerance.
5. If supporting/promising resume, restore the family's required state in isolated
   outputs, including RNG/loader or incremental-estimator state where promised.
6. Verify retention on owned disposable artifacts without deleting prior runs.
    Separately check production schedule/count and storage budget.
7. For a deployment target, prove representative source/export/quantized reload and
   required device/backend behavior before expensive target-dependent training. Recheck
   final trained exports; host correctness is not target performance. Record missing
   device evidence as UNVERIFIED/BLOCKED, not READY or an installation authorization.

Copy into the existing run record:

```text
Run/claim and authorized budget:
Framework version / effective config / source revision:
Model family / selected libraries and public APIs / applicable HF preference or exception:
Train/validation/test identities and independence unit:
Input/label/objective sanity / applicable gradient or estimator-fit proof / baselines:
Applicable optimizer/LR/precision or fit/search settings / throughput and peak memory:
Fits/folds/trials or rounds/updates / data-path evidence / stop rule:
Expected eval/log/save events; baseline/final policy:
Selection metric / direction / stopping policy:
Artifact purposes, destination, retention and storage estimate:
Smoke: applicable intermediate eval or fit/score / durable log / save / reload / resume or N/A:
Production-config differences and verification:
Applicable deployment profile / early export, calibration and device proof / final recheck:
Status: READY | BLOCKED; missing proof and next safe action:
```

**READY** requires applicable proof, not completed training. Without execution,
record **BLOCKED**, separating source checks from unexecuted smoke checks.

## Framework sources

- [Transformers Trainer/TrainingArguments](https://huggingface.co/docs/transformers/main_classes/trainer)
  — consult the installed release for interval, rotation and best-model constraints.
- [PyTorch saving/loading](https://pytorch.org/tutorials/beginner/saving_loading_models.html)
  — weights-only/general checkpoints, evaluation mode and mutable state references.

These illustrate established APIs. Apply the HF-first selection policy where
compatible; neither framework is an unconditional prerequisite for every ML task.
