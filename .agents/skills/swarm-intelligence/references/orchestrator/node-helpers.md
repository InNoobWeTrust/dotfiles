# Node Helpers

Use this file only when implementing node-level orchestration details.

## Single-Node Contract

`kilo-swarm` is a single-node runner.

```text
~/.local/bin/kilo-swarm -m MODEL -p PERSONA [-i FILE] [-t SECONDS] [--dry-run] [--verbose]
```

Exit codes:

- `0`: valid JSON extracted
- `2`: no valid JSON extracted

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

## `extract_json(response)`

1. Look for a fenced ```json block first.
2. If none exists, slice from the first `{` or `[` to the last `}` or `]`.
3. Validate with `jq .` or `python3 -c "import json; json.loads(...)"`.
4. If validation fails, treat it as exit `2`.
5. If the response contains multiple JSON objects, try each one separately.
   Keep the first one that validates. If none validate, treat as exit `2`.
6. If the response appears truncated (unclosed brackets, cut-off strings),
   treat as exit `2` and retry the node.

## `run_agent_retry(model, persona, input, max_retries=2)`

1. Run `kilo-swarm -m MODEL -p PERSONA -i INPUT`.
2. If exit code is `0`, return the extracted JSON.
3. If exit code is `2`, or the invocation fails with a known transient error
   such as timeout, quota, or network, increment retry counter.
4. Retry the same model first.
5. After retries are exhausted, switch to the next untried model in active pool order.
6. If all retries are exhausted, return failure.

## `merge_outputs(model_outputs, field_name)`

Merge only the top-level field named by `field_name`.

Rules:

1. Boolean fields: majority vote.
2. Scalar string/number fields: keep the value if at least 2 models agree.
3. Arrays of primitives: union unique values in first-seen order.
4. Arrays of objects: merge by the first stable key found in this order:
   `id`, `task_id`, `section_id`, `slide_id`, `name`, `title`, `file_path`.
5. Nested objects: recursively apply the same rules.
6. Final tie-break: if no majority exists, use the value from the model with the
   longest response. Only use this when 3 or more models disagree; with 2 models
   and no agreement, keep the value from whichever model produced the more detailed
   output (prefer the one with more non-empty fields).
