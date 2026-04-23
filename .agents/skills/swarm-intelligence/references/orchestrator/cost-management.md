# Cost Management

Use this file only when budget or API call volume matters.

## Default Policy

- In `minimal mode`, use the deterministic defaults from `minimal-flow.md`.
- In `full quorum mode`, prefer `free_model_pool` for extra redundancy when possible.

## Budget Heuristics

- Phase 1 with 2 personas and 2 models each: about 4 node runs
- Phase 2 with 3 review cycles: about 2-6 node runs depending on rejection
- Phase 3: 1 decompose run plus maker, breaker, and optional maker-fix runs per task

If task count grows large, split the work into multiple swarms.

## Google Free Tier Note

Google free-tier models still have rate limits. If limits are hit, switch to the
documented proxy fallback from the model pools.
