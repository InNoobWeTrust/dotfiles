---
metadata:
  official-sources-read: "2026-10-15"
---

# Deployment-Target-Aware Training

Use when the experiment must produce a model for a named edge device, runtime or
hardware profile. Apply alongside [Model families](model-families.md), not as a
requirement to deploy every scientific experiment. Inference-only packaging is outside
this skill; deployment requirements that change training, selection or proof are not.
This is a conditional workflow synthesized from the official sources below.

## 1. Pin the target contract before choosing the model

Separate **where training runs**, **where inference runs**, and **whether the device
must update the model**. A GPU-trained model can serve on a CPU; an inference runtime
or exported graph does not automatically support gradients, optimizer state or updates.

Record in the existing experiment configuration:

- Device/SoC or board, CPU/GPU/NPU, OS/ABI, runtime/API, execution provider/delegate,
  compiler/converter, drivers and compatible versions. Multiple targets need explicit
  profiles; one successful target does not validate the others.
- Supported operator versions and parameters, static/dynamic shape ranges, batch size,
  layout, dtype, quantization scheme and I/O signatures. Declare permitted CPU fallback,
  custom operators and extra runtime dependencies, not just a filename extension.
- Application preprocessing/postprocessing: feature order, normalization, color/crop,
  audio rates, tokenizer, padding/masks, missing-modality rules, output labels and
  thresholds. Specify which steps live in the graph versus the surrounding application.
- Quality floor/allowed degradation and representative validation slices; cold-start
  and sustained latency/throughput, peak RAM/activation/scratch memory, artifact plus
  runtime/firmware size, power/energy and thermal limits where relevant. Use the real
  batch/stream/concurrency regime, not a server-throughput proxy.
- Available target access and approved export/benchmark compute. Without access,
  record target proof **UNVERIFIED**; documentation is not physical-device evidence.

For example, "ONNX on an ARM CPU at batch 1" is different from "ONNX on a named NPU
with fixed input sizes and integer-only operators." Both require an actual backend
contract; neither is solved by choosing `opset` or training precision alone.

## 2. Prove a representative export early

Before expensive target-dependent training, within authorized small-run limits:

1. Choose an existing target-compatible baseline/architecture. Inspect converter and
   backend support for the *actual* estimator/graph, not merely its model family.
   Classical pipelines include fitted preprocessing; a neural-only exporter is not a
   general converter for every tree, sparse transform or custom feature function.
2. Export a representative fitted/small-trained candidate using production I/O paths.
   Declare shape constraints and test boundary shapes, batch 1, masks, variable lengths,
   missing modalities and relevant stateful/streaming behavior. An example traced with
   one input shape is not proof of all declared inputs or data-dependent branches.
3. Reload and compare source-framework versus exported outputs and task scores using
   fixed validation inputs. Predeclare appropriate numeric and quality tolerances;
   quantized outputs need not be bitwise equal or meet the floating-point tolerance.
4. Test required optimized/quantized representation and inspect actual backend node
   placement, unsupported operators, fallback and transfer boundaries. Conversion
   success is not proof of full acceleration or fit within resource limits.
5. Obtain the required target resource/quality evidence before marking that preflight
   ready. Host execution or emulation can establish limited semantics, not device
   latency, memory, power or thermal behavior. Missing mandatory target proof blocks
   expensive target-dependent launch; separately authorized bounded exploration retains
   its narrower claims and is not relabeled as a passed preflight.

Training-only optimizations are not deployment promises: fused attention, custom CUDA
kernels and activation checkpointing may require a different supported inference graph.
Verify lowering with reference semantics rather than assuming the training kernel ships
to the target. Recheck conversion after architectural, shape, processor or operator changes.

## 3. Choose precision and compression against the backend

- Start with a faithful floating-point reference and the simplest supported
  **post-training quantization (PTQ)** candidate. Weight-only, dynamic activation
  quantization and calibrated static quantization have different costs and backend
  requirements. A small file is not proof of integer-only execution or lower latency.
- Static calibration uses representative deployment inputs processed exactly as in
  production, with justified range/length/group/modality coverage. Record provenance,
  selection and calibration configuration. Do not fit ranges, thresholds or compression
  choices on the protected test; calibration data is part of the fitting protocol.
- Verify weight/activation precision, signedness, per-tensor/per-channel granularity,
  scales/zero points, operator representation and I/O dtype against the target release.
  Padding zero representation and input quantize/output dequantize semantics matter.
  Check float islands and casts when integer-only hardware is a requirement.
- Use **quantization-aware training (QAT)** when the chosen backend supports the
  resulting representation and PTQ does not meet the declared quality requirement,
  or a justified recipe requires QAT from the start. QAT simulates inference
  quantization during training; its source model still needs conversion and validation.
  Training in FP16/BF16 or loading 4-bit adapter weights is not automatically QAT.
- Match fake-quant/observer rules to the runtime rather than inventing a bit width
  unsupported by its kernels. Inspect model/layer and framework-version support;
  older QAT documentation can have stale support matrices. QAT is a new training stage:
  preserve the source checkpoint, bound its budget and repeat learning/evaluation checks.
- If still outside budget, consider a smaller architecture, input resolution/window,
  supported structured sparsity or distillation with a stated quality/resource rationale.
  Unstructured zeros do not guarantee sparse-kernel acceleration. Distillation still
  needs a separate deployable student and protected-test discipline. Do not apply every
  compression technique or silently change the task to obtain a speedup.

Quantization may reduce quality or run slower through conversion/fallback overhead.
Compare the actual candidate on the actual target; do not copy published speedup ratios.
Select among candidates using validation and the agreed resource constraints, not the
protected test. Generic scientific accuracy and deployment-ready quality are distinct claims.

## 4. Runtime-specific checks

| Route | What must be verified |
|---|---|
| ONNX + chosen runtime/provider | Converter coverage, graph/opset and input constraints, preprocessing completeness, provider support/placement and permitted CPU fallback; ONNX is not a hardware accelerator |
| ONNX Runtime quantization | QDQ versus QOperator and precise backend/operator support; dynamic versus static/calibrated paths; compare source/export/quantized metrics and inspect quantization error, not just graph validity |
| ExecuTorch | Supported `torch.export.export` graph/shape bounds → backend partitioner via `to_edge_transform_and_lower` → `to_executorch`; retain `.pte` and any external `.ptd` data together, verify runtime backend registration and delegated versus portable-fallback nodes |
| LiteRT / TensorFlow Lite `.tflite` | Exact API/delegate/device profile and supported operators/types; built-ins are the simpler deployment path; Select TF Ops/custom ops require compatible runtime packaging and can enlarge binaries or restrict deployment options |
| LiteRT for Microcontrollers | Board-specific supported operator subset and manual/static memory plan; flash model plus runtime, activation/scratch arena and application RAM must fit; documented runtime does not support on-device training |
| Other selected runtime/SDK | Verify its own pinned exporter, shape/operator/precision and device rules; do not infer support from ONNX or TFLite compatibility in another runtime |

Current LiteRT documentation includes a framework-agnostic LiteRT Quantizer and
CompiledModel as well as Interpreter APIs. Legacy converter PTQ recipes are not the
only route; pin the project's selected toolchain and consult its matching docs.
The 2026 documentation's general dynamic/static recommendations are not universal
CPU/GPU/NPU recipes. A selected accelerator's documented representation wins.

ORT providers claim supported subgraphs in priority order; listing a provider is not
proof that all nodes run there. ExecuTorch similarly partitions supported subgraphs
and can execute others through portable fallback. Inspect actual placement and
deployment dependencies rather than assuming selecting an accelerator guarantees use.
ExecuTorch programs can be backend-specialized; dynamic shape bounds affect memory,
and state mutation/control-flow support is backend/release-sensitive. Verify recurrent
or multimethod applications explicitly, not only a stateless example invocation.
For a Core ML, TensorRT, OpenVINO or vendor NPU target, consult that selected SDK's
own pinned support contract; none inherits another runtime's compatibility guarantee.

Microcontrollers are not Linux/mobile devices with a smaller model file. Prove
allocation/arena requirements in the board application and measure complete firmware
and sensor/preprocessing buffers. Do not extrapolate a published minimal-runtime
size to total application memory, or import Select TF Ops as a universal MCU workaround.

## 5. Validate the final trained artifact in the application path

- Repeat source → export → optimized/quantized → target checks after training. An early
  architecture export cannot establish final-model quality or calibrated ranges.
- Preserve output schema, decision thresholds and task metrics. Check difficult slices,
  sensor/domain variation, supported shape extremes, recurrent/stream state, and
  cumulative behavior where applicable; a few matching logits are not task validation.
- Profile preprocessing, loading/compilation, transfers, kernels and postprocessing;
  measure cold, warm and sustained behavior, relevant latency percentiles and peak
  memory. Include scratch/activation buffers and competing app resource use, not just
  parameter bytes. State power/thermal measurement method or mark it unmeasured.
- Inspect actual device dispatch and graph partitioning. CPU fallback can preserve
  correctness while violating latency/power budgets; crossing devices adds overhead.
  Benchmark tools are useful, but validate the intended application context: LiteRT
  docs warn Android shell binaries and foreground apps can receive different scheduling.
- Record artifact hashes, source checkpoint, exporter/calibration versions/configuration,
  hardware/runtime/build, input profile and measured evidence. Freeze the selected
  configuration before final protected-test assessment. Do not repeatedly optimize on test.
- Keep resumable training checkpoints and fitted preprocessing separate from deployment
  exports/compiled caches. A `.onnx`, `.tflite` or backend program is not by itself
  optimizer/RNG/loader state or an exact-resumption guarantee.

Actual on-device adaptation is a separate contract: prove supported train/infer/save/
restore paths, update-resource limits, durable state/restart recovery, local-data consent
and privacy, retention/regression checks and an authorized rollback mechanism. LiteRT's
Android example uses additional signatures/resource variables and Select TF Ops; it
does not prove every delegate or microcontroller supports training. Its saved weights
are not proof of complete optimizer-state continuation.

## Target receipt — append to the existing preflight record

```text
Training hardware / inference target(s) / on-device updates or inference-only:
Device, OS/ABI, runtime/API/provider/delegate/compiler and versions:
Operators/opset, shapes/layout, I/O/pre/postprocessing and supported precision:
Quality tolerance / cold and sustained performance / memory, package, power budgets:
Early source/export/optimized reload evidence / placement and fallback:
Calibration provenance and method / PTQ or QAT fit / protected-test policy:
Final artifact hash, source checkpoint and toolchain / application measurements:
Status: VERIFIED-for-profile | UNVERIFIED | BLOCKED; missing proof/next safe action:
```

No export, compilation, package/kernel download, device access, firmware/application
deployment or training is authorized by this reference. Discover authorized tools;
missing capabilities are limits, not permission to install or change infrastructure.

## Official sources

- [ONNX Runtime quantization](https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html):
  QDQ/QOperator, static/dynamic calibration, error debugging, backend limits and
  QAT in the source framework; speedups depend on hardware/operator support.
- [ORT execution providers](https://onnxruntime.ai/docs/execution-providers/):
  capability-based node/subgraph assignment and priority; no universal fallback-setting
  default or measured acceleration inferred from the provider list.
- [ExecuTorch export](https://docs.pytorch.org/executorch/stable/using-executorch-export.html)
  and [delegation](https://docs.pytorch.org/executorch/stable/compiler-delegate-and-partitioner.html):
  export/lower/program pipeline, backend partitioning, external data and mutable-state
  constraints. Observed stable-channel pages, not a verified installed release.
- [LiteRT for Microcontrollers](https://ai.google.dev/edge/litert/microcontrollers/overview),
  updated 2026-05-28: restricted operators/devices, manual memory management and
  unsupported on-device training; published core size is not the total memory budget.
- [LiteRT overview](https://developers.google.com/edge/litert),
  [operator compatibility](https://developers.google.com/edge/litert/conversion/tensorflow/ops_compatibility),
  [Select TF Ops](https://developers.google.com/edge/litert/conversion/tensorflow/ops_select):
  limited operators and extra runtime dependencies; compatibility pages updated 2026-05-28.
- [LiteRT model optimization](https://developers.google.com/edge/litert/quantization/model_optimization)
  updated 2026-10-13: current Quantizer, hardware-specific recipes and quality trade-offs.
- [TensorFlow Model Optimization QAT](https://www.tensorflow.org/model_optimization/guide/quantization/training)
  updated 2024-02-03: simulated quantization versus final conversion; release-sensitive
  support matrix and experimental-configuration limits, not a current universal backend table.
- [LiteRT on-device training](https://developers.google.com/edge/litert/conversion/tensorflow/build/ondevice_training)
  and [benchmarking](https://developers.google.com/edge/litert/next/benchmark), updated
  2026-05-28: additional signatures/weight restore and initialization/warm/steady memory
  measurements; example TensorFlow 2.8 code is not a prescribed installed version.

Live sources document possibilities, not validation of a particular model, board or build.
