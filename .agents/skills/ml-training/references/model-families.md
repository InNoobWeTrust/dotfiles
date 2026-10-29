---
metadata:
  sources-read: "2026-10-15"
---

# Model Families and Modality Contracts

Choose this branch before applying neural-specific training checks. A model family,
data modality, adaptation method and execution backend are separate decisions.
This is task-sensitive guidance, not a universal winning model or mandatory package list.

## Family selection

| Task/data | Credible starting candidates | Critical contract |
|---|---|---|
| Tabular classification/regression | scikit-learn linear/logistic models, forests, gradient boosting; XGBoost where appropriate | Fold-local transforms, categorical/missing handling, group/time-safe selection |
| Clustering/dimensionality reduction | Existing scikit-learn/domain estimators | Meaningful stability/reconstruction/domain evaluation; no invented supervised labels or gradient steps |
| Images | Established torchvision, timm/HF or Keras vision models/recipes | Pretrained transform, channels/resolution, label or geometric-target alignment |
| Audio | Established audio/domain stack or supported HF model/processor | Sample rate, channel policy, duration/padding, transcript/event alignment, speaker/recording splits |
| Forecasting/time series | Seasonal/naive and established statistical/domain models; justified neural models | Rolling-origin evaluation, forecast horizon, truly available future covariates |
| Paired multimodal/scientific data | Unimodal baselines, simple late fusion, compatible paired encoders/domain models | Pair/group identity, objective, missingness and each modality's contribution |
| Language/other token sequences | Supported Transformers or domain architecture matching the objective | Vocabulary/feature semantics and masking; TRL only for matching LM post-training |

HF preference applies where its components fit, including timm/vision and supported
audio/multimodal processors. Classical/statistical choices are first-class paths, not
HF violations. Keep proven domain frameworks; do not densify sparse omics data or
turn every paired dataset into image-to-text SFT to satisfy a library preference.

## Classical/tabular path

1. **Specify the fit and convergence units.** A fit-level estimator API is not a neural
   trainer. Some solvers have internal iterations/convergence limits; trees/boosting
   have their own units. Record actual settings and warnings instead of requiring
   an exposed optimizer, backpropagation, epochs or intermediate-checkpoint callbacks.
2. **Keep learned transformations inside the training boundary.** Use a fitted
   `Pipeline` and appropriate column transformations when supported. Imputation,
   scaling, PCA, feature selection, resampling and learned encodings must be learned
   separately within each training fold, not on all rows before cross-validation.
   Label-derived features need a leakage-safe construction protocol.
3. **Select folds for the claim.** Use appropriate stratification for independent
   classification units, group-aware splits for subjects/sites and time-aware splits
   for temporal claims. Stratification alone does not protect groups or chronology.
   Audit group IDs and actual fold overlap; not all splitters handle all constraints.
4. **Separate selection from assessment.** Search within training/validation folds
   under a bounded trial×fold×fit budget. Use an untouched final test, or nested CV
   when estimating the entire selection procedure without that separate assessment.
   Inner folds choose hyperparameters; outer folds assess selection. Don't report the
   winning inner score as an unbiased final score. Choose a declared refit protocol.
5. **Match baselines and metrics.** Compare credible linear/simple and tree candidates
   when appropriate with the same folds, transformations and tuning budget. Check
   class imbalance, probability calibration or error scale where the claim needs them.
   Thresholds/calibration are tuned on validation or training-fold data, never final test.
6. **Prove fit/scoring/export.** On bounded representative data, check transformation
   schema/order, labels, finite predictions/metrics and expected estimator behavior.
   Save the fitted estimator **and all fitted preprocessing**, column/category schema,
   split IDs, seeds, hyperparameters and dependency versions. Reload through the real
   scoring path and compare predictions/metrics within justified tolerance.
7. **Be honest about continuation.** A saved fitted pipeline enables scoring, not
   necessarily incremental fit or interrupted-training resume. `warm_start` or
   `partial_fit` support must be checked for the actual estimator and state contract.
   Unsupported resumption is N/A; it is not a reason to invent neural checkpoint tests.

For persistence, use trusted artifacts and established APIs. Pickle/joblib/cloudpickle
can execute arbitrary code; do not load untrusted files. scikit-learn cross-version
loading is unsupported: preserve versions and rebuilding provenance, not a portability
promise. skops/ONNX are possible fit-dependent alternatives, not automatic conversions
or full-training-state formats; check model coverage and actual exported predictions.

### Boosting and early stopping

- Boosting is iterative: use rounds/trees, validation metrics and its own stop/save
  APIs. Do not transplant neural optimizer-step formulas or patience defaults.
- The checked XGBoost sklearn interface requires an explicit `eval_set` for early
  stopping; the library doesn't make the validation split for you. Its tutorial's
  variable named `X_test` is a tuning holdout here, not the protected final test.
- Record the monitored dataset/metric, direction, patience and best iteration.
  Verify defaults and multiple-metric/dataset selection in the installed release.
  The checked sklearn interface's predictions use `best_iteration` automatically;
  native Booster paths and sliced saved models need their own verification.
- If using early stopping during CV, document which data controls stopping and how
  the final tree count/refit is selected. Fold models can have different tree counts.
  A preprocessing pipeline alone doesn't prove that an external `eval_set` underwent
  the identical **training-fitted** transforms; inspect its actual data path.
- Reload the saved model and verify best-iteration prediction behavior, feature schema
  and metrics. The fetched docs did not prove every save format preserves that metadata;
  don't assume perfect resume or best/final equivalence from an in-memory attribute.

## Vision, audio and temporal checks

- Images: inspect decoded channels, color/range, resize/crop/interpolation and pretrained
  normalization. Detection/segmentation transforms must jointly preserve boxes/masks.
  Split related crops, frames, patients and source images together where required.
- Audio: verify sample rate and actual resampling, channels, padding lengths/masks,
  transcript or event timestamps. Overlapping clips from one recording/speaker/session
  can leak across splits. Task metrics might be recognition error or event accuracy,
  not language-model perplexity.
- Time series: train using only information available at each forecast origin. Audit
  overlapping windows, label horizons, feature lags, imputation and future covariate
  availability. Use rolling-origin splits and a task-appropriate gap/history policy;
  random shuffling or a positional split alone cannot resolve every window leak.
  Evaluate the actual multi-step horizon against naive/seasonal baselines, not just
  in-sample residuals. Final assessment must remain outside horizon/model tuning.

## Multimodal is a data/objective contract, not an LLM synonym

Examples include image+tabular prediction, audio+video, text+image retrieval, paired
omics, and multimodal reconstruction. Choose classification/regression, contrastive,
reconstruction, generative or another actual objective before choosing a trainer.

1. **Audit paired identity.** Confirm correspondence after filters, shuffling and batching;
   preserve donor/subject/site/time groups across modalities and splits. An image from
   one donor and omics from another is not a valid positive pair. Contrastive negatives
   need a policy for duplicate/related examples that are not truly negative.
2. **Process each modality correctly.** Record processor/backbone versions, normalization,
   resolution/rate, geometry/timestamp alignment, padding, truncation and special tokens.
   Joint augmentation must preserve the task's correspondence; independent augmentation
   is appropriate only where that objective justifies it.
3. **Define missingness.** State whether every modality is available at train/eval/use
   time. Mask missing inputs explicitly; zero values aren't automatically missing.
   Test promised missing/noisy-modality behavior and subgroup coverage. Dropout/imputation
   of modalities is a method choice, not evidence that a model is robust to every outage.
4. **Verify objective contributions.** Inspect per-modality losses, valid-example counts,
   weights and applicable encoder gradients. For fusion/contrastive models with one
   shared loss, inspect appropriate component behavior rather than inventing separate
   losses. Correctly reduce variable token/frame lengths and distributed negatives.
5. **Compare simple alternatives.** Budget unimodal and simple-fusion baselines plus
   justified modality ablations. Compare on the same eligible cohort and resource
   protocol; one branch can dominate while the aggregate loss improves. Ablation-induced
   distribution changes limit causal interpretation; don't diagnose a mechanism from
   one chart or require a novel gradient-conflict optimizer without evidence.
6. **Persist the complete pipeline.** Include all needed encoders, fusion/head/adapters,
   processors, feature ordering, pairing/missingness policy and promised resume state.
   Reload with valid examples and supported missing-modality cases. One saved encoder
   isn't the entire model.

Apply [Transfer and attention](transfer-and-attention.md) to applicable components;
a multimodal model can need different precision/backends for different encoders.

## Sources and applicability

- scikit-learn: [pitfalls](https://scikit-learn.org/stable/common_pitfalls.html),
  [cross-validation](https://scikit-learn.org/stable/modules/cross_validation.html),
  [persistence](https://scikit-learn.org/stable/model_persistence.html): fold-local
  learning, group/time-aware evaluation and serialization safety/version limits.
- XGBoost: [sklearn estimator](https://xgboost.readthedocs.io/en/latest/python/sklearn_estimator.html)
  and [Python API](https://xgboost.readthedocs.io/en/stable/python/python_api.html):
  explicit early-stopping eval data, best iteration and fold/refit considerations.
  Installed-version verification and actual save/reload remain required.
- Léo Grinsztajn, Edouard Oyallon and Gaël Varoquaux,
  [Why do tree-based models still outperform deep learning on typical tabular data?](https://arxiv.org/abs/2207.08815)
  (2022): fetched abstract reports tree strength on medium-sized tabular benchmarks.
  Supports credible tree baselines, not a universal trees-win claim or today's ranking.
- [Forecasting: Principles and Practice — time-series cross-validation](https://otexts.com/fpp3/tscv.html):
  prior-only rolling origins, horizon-specific evaluation and forecast versus residual
  accuracy. Its CV “test” folds are not this skill's protected final test.
- [timm quickstart](https://huggingface.co/docs/timm/en/quickstart) and transfer sources
  in [Transfer/attention](transfer-and-attention.md): pretrained vision transforms/heads.
- Adrián Javaloy, Maryam Meghdadi and Isabel Valera,
  [Mitigating Modality Collapse in Multimodal VAEs via Impartial Optimization](https://proceedings.mlr.press/v162/javaloy22a.html)
  (ICML 2022): abstract read only; describes modality neglect/gradient conflict in studied
  VAEs, not a universal diagnosis or proof for other fusion objectives.

Modality checks and routing above are the skill author's operational synthesis, not
quotations establishing universal best practices. No model was trained in this research.
