# Recover Evidence Before Rerunning

Recovery does not authorize retraining, overwrites, private-storage access, uploads
or additional compute. Inventory using existing authorized read capabilities;
missing access is unknown, not proof of deletion.

## 1. Preserve and inventory

Identify run IDs, actual executed/frozen source/configuration/environment, split
manifest and initialization. Separate these from notebook and current configuration.
Do not edit original logs, delete checkpoints, trigger retention cleanup or load
untrusted pickle artifacts indiscriminately.

Within authorized paths locate structured history, trainer state, event files,
tracker records, job/stdout logs, final exports, best/latest checkpoints, snapshots
and configured durable copies. Record checkpoint updates, completeness, base/adapter
dependencies and loadability. Missing at one path does not mean missing everywhere;
report searched and inaccessible locations.

## 2. Trace evidence loss

Follow **effective schedule → evaluation call → callback/event → writer → persisted
record → notebook field/filter → chart**. Record where evidence ends.

- Metric exists, chart omits it → presentation repair, not training repair.
- Metric in console/tracker but absent locally → recording/export gap.
- Call absent/unproven → missing execution evidence; cadence alone cannot resolve it.
- Expected step-10,000 event absent, final event present → investigate callbacks,
  resume offsets, version semantics, rank-specific writes and flushes. Do not assert
  execution or its failure cause from the interval alone.

Keep training `loss`, held-out `eval_loss`, full/subset validation and test identities
distinct. Trace origin, not key name. Before/after bars are valid snapshots; geometry
proves nothing about dataset origin. Label sparse measured points and missing coverage.

## 3. Determine recoverability

| Available evidence | Conclusion/action within authority |
|---|---|
| Intermediate held-out metrics | Restore measured points with provenance; no training needed |
| Complete intermediate weights, absent metrics | Re-evaluate unchanged validation protocol within approved compute bounds |
| Weights-only snapshots | Evaluation possible if complete; no promise of resumption |
| Full resumable state | May continue in new outputs if authorized; does not recreate deleted historical states |
| Final weights/scores only | Assess final model with verified split/protocol; trajectory/earlier selection unavailable |
| No accessible usable artifacts | Report search scope/unknowns; propose bounded rerun only for claims requiring lost evidence |

Retrospective evaluation is a **recomputed checkpoint score**, not an original
in-training observation. Record evaluation time, checkpoint update, protocol and
stochastic differences. Exact random masking may require saved RNG/protocol state.
Never present interpolation as measured validation.

Check completeness and safely reload before claiming recoverability. Do not score
every checkpoint on test to select best; select with validation then freeze for test.
Disclose previous test-driven decisions.

## 4. Return a claim-limited decision

```text
Observed identities; searched locations and inaccessible areas:
Expected versus found validation events:
Checkpoint updates, completeness and restore evidence:
Evidence-loss layer: plotting | recording | execution | retention | unknown:
Recoverable claims and evaluation cost:
Unavailable claims and why:
Recommendation: repair presentation/export | evaluate checkpoints |
                accept final-only scope | propose bounded rerun | blocked:
Authority needed and next safe action:
```

Missing history alone does not invalidate a final held-out score; validity still
depends on split independence, metric correctness and selection/test discipline.
A good final score does not prove absence of overfitting or best-checkpoint selection.
Rerun only when required claims cannot be supported otherwise, corrected preflight
is ready, and launch/cost authorization exists. Never promise exact recreation of
deleted model states.
