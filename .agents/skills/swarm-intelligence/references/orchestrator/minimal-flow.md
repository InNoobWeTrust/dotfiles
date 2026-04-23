# Minimal Orchestrator Flow

This is the canonical execution path for weaker orchestrators.

If this file conflicts with another swarm doc, this file wins.

## Required Reads

Read these before running a swarm:

1. One domain config from `references/domains/.../config.json`
2. `references/models/free.json`
3. `references/models/premium.json`

## Default Mode

Use `minimal mode` unless a human explicitly asks for `full quorum mode`.

- `minimal mode`: Phase 1 uses 2-model quorum. Phase 2 and Phase 3 use one model
  per node plus the documented review and fix loops.
- `full quorum mode`: keep Phase 1 the same, and also run 2-3 models for selected
  Phase 2 or Phase 3 nodes before merging.

## Steps

0. Validate input: ensure the input document is non-empty, well-formed, and relevant to the task. If not, fail immediately.
1. Load one domain config.
2. Confirm the config has all required `phase1_*`, `phase2_*`, and `phase3_*` keys.
3. Resolve `model_pool_refs` into `free_model_pool` and `premium_model_pool` using
   the pool JSON order.
4. Phase 1-A: start with the first 2 models in `free_model_pool`. Run
   `phase1_a_persona` on both.
5. Retry the same model up to 2 times on exit `2`, timeout, quota, or network
   errors. If a node still fails, replace it with the next untried free model.
6. Stop Phase 1-A only when you have 2 valid JSON outputs or the free pool is exhausted.
7. Merge Phase 1-A outputs using `phase1_a_field`.
8. Repeat the same process for Phase 1-B and merge with `phase1_b_field`.
9. If either Phase 1 branch cannot reach 2 valid JSON outputs, fail the swarm.
10. Phase 2 in `minimal mode`: run `phase2_forward_persona` on
    `quality_tiers.mid_tier[0]` (must exist).
11. Run `phase2_review_persona` on `quality_tiers.mid_tier[1]` if present and valid,
    otherwise `quality_tiers.high_stakes[0]` (must exist).
12. If review returns `approved: false`, run `phase2_revise_persona` on the same
    forward model, then review again. Maximum 3 total reviews (initial + up to 2 revise+review pairs).
13. If Phase 2 is still unapproved after 3 total reviews, fail the swarm.
14. Run `phase3_decompose_persona` once. If the decomposition fails or produces an empty task list, fail the swarm.
15. For each task, run `phase3_maker_persona` on `quality_tiers.mid_tier[0]`.
16. Run `phase3_breaker_persona` on `quality_tiers.mid_tier[1]` if present,
    otherwise `quality_tiers.high_stakes[0]`.
17. If a breaker returns `passed: false`, run `phase3_maker_fix_persona` with the
    breaker's `critical_failures`. Retry each task at most 2 times.
18. If a task still fails after 2 maker-fix attempts, fail the swarm.
19. Return one JSON artifact with a `files` array.
20. Hand the artifact to a separate premium `code` agent for file writes.

## Stop Conditions

Stop the swarm and surface the failure when any of these happen:

- a required config key is missing
- Phase 1 cannot reach 2 valid outputs for either persona
- Phase 2 is still unapproved after 3 review cycles
- a Phase 3 task still fails after 2 maker-fix attempts
- the final artifact is missing or invalid JSON
