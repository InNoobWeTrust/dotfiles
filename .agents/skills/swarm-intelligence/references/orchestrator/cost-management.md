# Cost Management

Use this file only when budget or API call volume matters.

## Default Policy

- In `minimal mode`, use the deterministic defaults from `minimal-flow.md`.
- In `full quorum mode`, prefer `free_model_pool` for extra redundancy when possible.

## Budget Heuristics

- Phase 1 with 2 personas and 2 models each: about 4 node runs (up to 12 with retries)
- Phase 2 with 3 review cycles: up to 7 node runs (forward + initial review + 2 revise+review pairs)
- Phase 3: 1 decompose run plus maker, breaker, and optional maker-fix runs per task (up to 3 runs per task)

If task count grows large, split the work into multiple swarms.

## Google Free Tier Note

Google free-tier models still have rate limits. If limits are hit, switch to the
proxy fallback models documented in `references/models/premium.json`:
- `kilo/google/gemini-3-flash-preview`
- `kilo/google/gemini-3.1-pro-preview`
