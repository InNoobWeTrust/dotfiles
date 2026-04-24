# Node Helpers

Use this file only when implementing node-level orchestration details.

## Single-Node Contract

`kilo-swarm` is a single-node runner.

```text
echo "input" | ~/.local/bin/kilo-swarm -m MODEL -p PERSONA [-t SECONDS] [--dry-run] [--verbose]
~/.local/bin/kilo-swarm -m MODEL -p PERSONA [-t SECONDS] < input_file
```

Exit codes:

- `0`: valid output (JSON if found, otherwise raw text)
- `2`: phantom output (empty response)

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

## `run_agent_retry(model, persona, input, max_retries=2)`

1. Run `kilo-swarm -m MODEL -p PERSONA < INPUT_FILE` (or pipe via echo).
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
