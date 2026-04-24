# Minimal Orchestrator Flow

This is the canonical execution path for weaker orchestrators.

If this file conflicts with another swarm doc, this file wins.

## Required Reads

Read these before running a swarm:

1. One domain config from `references/domains/.../config.json`
2. `references/models/free.json`
3. `references/models/premium.json`
4. `references/orchestrator/domain-config.md` if you need phase output contracts

## Default Mode

Use `minimal mode` unless a human explicitly asks for `full quorum mode`.

- `minimal mode`: Phase 1 uses 2-model quorum. Phase 2 and Phase 3 use one model
  per node plus the documented review and fix loops.
- `full quorum mode`: keep Phase 1 the same, and also run 2-3 models for selected
  Phase 2 or Phase 3 nodes before merging.

## Intermediate Output Format

Intermediate node outputs may be prose, bullets, lightly structured text, or JSON. Example:

- Finding: The merge rule has no tie-break example.
- Evidence: Two models can disagree on the same field.
- Recommendation: Show one deterministic merge example.

The synthesizer extracts the configured `phase*_field` values from these responses; they do not need to be JSON.

## Required Normalized Outputs

Some phases can accept prose, but the orchestrator must normalize the following fields before moving on:

- Phase 2 review: `approved` (boolean), `critical_vulnerabilities` (array), `qa_flags` (array)
- Phase 2 revise: same top-level artifact shape as Phase 2 forward output, plus `revisions` (array)
- Phase 3 decompose: `tasks` (non-empty array)
- Phase 3 breaker: `passed` (boolean), `critical_failures` (array), `qa_notes` (array)
- Final failure output: error envelope with `status`, `code`, `message`, `details`, `retryable`

## Steps

0. Verify `kilo-swarm` is available via a login shell.
1. Validate input: ensure the input document is non-empty, well-formed, and relevant to the task. If not, fail immediately.
2. Load one domain config.
3. Confirm the config has all required `phase1_*`, `phase2_*`, and `phase3_*` keys.
4. Resolve `model_pool_refs` into `free_model_pool` and `premium_model_pool` using
   the pool JSON order.
5. Phase 1-A: start with the first 2 models in `free_model_pool`. Run
   `phase1_a_persona` on both.
6. Retry the same model up to 2 times on exit `2`, timeout, quota, or network
   errors. If a node still fails, replace it with the next untried free model.
7. Stop Phase 1-A only when you have 2 valid outputs or the free pool is exhausted.
8. Merge Phase 1-A outputs using `phase1_a_field`.
9. Repeat the same process for Phase 1-B and merge with `phase1_b_field`.
10. If either Phase 1 branch cannot reach 2 valid outputs, fail the swarm.
11. Phase 2 in `minimal mode`: run `phase2_forward_persona` on
    `quality_tiers.mid_tier[0]` (must exist).
12. Run `phase2_review_persona` on `quality_tiers.mid_tier[1]` if present and valid,
    otherwise `quality_tiers.high_stakes[0]` (must exist).
13. Normalize the review output into `approved`, `critical_vulnerabilities`, and `qa_flags`.
14. If review returns `approved: false`, run `phase2_revise_persona` on the same
    forward model, then review again. Maximum 3 total reviews (initial + up to 2 revise+review pairs).
15. If Phase 2 is still unapproved after 3 total reviews, fail the swarm.
16. Run `phase3_decompose_persona` once.
17. Normalize the decompose output into a non-empty `tasks` array. If decomposition fails or tasks are empty, fail the swarm.
18. For each task, run `phase3_maker_persona` on `quality_tiers.mid_tier[0]`.
19. Run `phase3_breaker_persona` on `quality_tiers.mid_tier[1]` if present,
    otherwise `quality_tiers.high_stakes[0]`.
20. Normalize the breaker output into `passed`, `critical_failures`, and `qa_notes`.
21. If a breaker returns `passed: false`, run `phase3_maker_fix_persona` with the
    breaker's `critical_failures`. Retry each task at most 2 times.
22. If a task still fails after 2 maker-fix attempts, fail the swarm.
23. Return one structured artifact with a `files` array.
24. Hand the artifact to a separate premium `code` agent for file writes.

## Stop Conditions

Stop the swarm and surface the failure when any of these happen:

- a required config key is missing
- Phase 1 cannot reach 2 valid outputs for either persona
- Phase 2 is still unapproved after 3 review cycles
- a Phase 3 task still fails after 2 maker-fix attempts
- the final artifact is missing or invalid
