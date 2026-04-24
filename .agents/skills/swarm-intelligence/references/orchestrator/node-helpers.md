# Node Helpers

Use this file only when implementing node-level orchestration details.

## Single-Node Contract

`kilo-swarm` is a single-node runner.

```text
$SHELL -l -c 'echo "input" | kilo-swarm -m MODEL -p "PERSONA"'
$SHELL -l -c 'cat input_file | kilo-swarm -m MODEL -p "PERSONA"'
timeout 90 $SHELL -l -c 'cat input_file | kilo-swarm -m MODEL -p "PERSONA"'
```

Always use a login shell. Do not hardcode `~/.local/bin/kilo-swarm`; rely on the user's PATH after login-shell initialization.

Exit codes:

- `0`: valid output (JSON if found, otherwise raw text)
- `2`: phantom output (empty response)
- any other non-zero code: invocation failure

## Engine Routing

| Model ID pattern | Engine |
|---|---|
| `google/*` | `gemini-cli` |
| `gemini/*` | `gemini-cli` |
| `kilo/google/*` | `gemini-cli` |
| anything else | `kilo run` |

Prefixes stripped before `gemini -m`:

- `kilo/google/`
- `google/`
- `gemini/`

## `extract_output(response)`

1. Look for a fenced ```json block first.
2. If none exists, look for any `{` or `[` to find JSON.
3. If JSON is found and valid, return it.
4. If no valid JSON found, return the raw text as-is.
5. The synthesizer handles parsing and consensus from natural language outputs.
6. Exit `2` only if the response is truly empty/phantom.

## `is_valid_output(phase, response, field_name)`

Treat an output as valid only if all phase-specific requirements are met:

1. Response is non-empty after trimming.
2. If JSON is required by the persona contract, the response parses as JSON.
3. Phase 1: the synthesizer can extract the configured `field_name`, or the prose is substantive enough to synthesize that field.
4. Phase 2 review: normalized output includes boolean `approved` and array `critical_vulnerabilities`.
5. Phase 3 decompose: normalized output includes a non-empty `tasks` array.
6. Phase 3 breaker: normalized output includes boolean `passed` and array `critical_failures`.

## `run_agent_retry(model, persona, input, max_retries=2)`

1. Run `kilo-swarm` through a login shell and provide input via file or pipe.
2. If exit code is `0`, return the output (JSON or text).
3. If exit code is `2`, or the invocation fails with a known transient error
   such as timeout, quota, or network, increment retry counter.
4. Retry the same model first.
5. After retries are exhausted, switch to the next untried model in active pool order.
6. If all retries are exhausted, return failure.

## `merge_outputs(model_outputs, field_name)`

Merge outputs from multiple nodes. The synthesizer extracts key information from natural language outputs.

Rules:

1. The synthesizer reads all node outputs and identifies the key `field_name` content from each.
2. Boolean fields: majority vote.
3. Scalar string/number fields: keep the value if at least 2 models agree.
4. Arrays of primitives: union unique values in first-seen order.
5. Arrays of objects: merge by the first stable key found in this order:
   `id`, `task_id`, `section_id`, `slide_id`, `name`, `title`, `file_path`.
6. Text outputs: synthesizer extracts and synthesizes key points.
7. Final tie-break: if no majority exists, use lexicographical comparison of model names
   (alphabetical order) to deterministically select which model's value to keep.

The same merge rules apply in `full quorum mode` when the orchestrator chooses to run 2-3 models for selected Phase 2 or Phase 3 nodes.
