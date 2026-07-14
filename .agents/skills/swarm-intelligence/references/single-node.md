# Mode: Single-Node (external subagent)

Bounded one-node `swarminator` delegation. Host keeps workspace control. Nodes never mutate the workspace.

## Runtime references

```bash
$SHELL -l -c 'command -v swarminator'
$SHELL -l -c 'swarminator --help'
$SHELL -l -c 'swarminator --tutorial'
$SHELL -l -c 'swarminator --protocol'
$SHELL -l -c 'swarminator --list-agents'
$SHELL -l -c 'swarminator --list-models --agent NAME'
```

Use runtime self-documentation for current CLI mechanics. Do not hard-code flags, agent IDs, or model IDs from stale notes.

## Shared References

All paths below are relative to this skill directory.

- `references/discover-personas.sh`
- `references/models/free.json`
- `references/models/premium.json`
- `references/personas/`

`discover-personas.sh` resolves personas by YAML `name:` values, not filenames. Valid examples include:

```bash
references/discover-personas.sh list
references/discover-personas.sh prompt "Technical Analyst"
references/discover-personas.sh prompt "QA Engineer"
```

## Preflight

1. Confirm the task is small, bounded, and has one concrete deliverable.
2. Confirm this should stay a single-node delegation rather than a full swarm.
3. Lock the artifact mode before invocation: `analysis`, `review`, `patch`, or `transform`.
4. Lock the allowed file set. If no files are needed, say so explicitly.
5. State forbidden actions explicitly, including `no workspace mutation`.
6. Verify `swarminator` exists.
7. Inspect current CLI help, tutorial, and protocol docs at runtime before composing the invocation.
8. Stop immediately on unbounded scope, missing artifact contract, or any need for delegated direct writes.

## Artifact Modes

### `analysis`

Return markdown notes, research findings, or structured reasoning for the bounded question.

### `review`

Return a findings report for the requested artifact or idea. The output should identify concrete risks, gaps, or open questions.

### `patch`

Return a markdown artifact that names every intended target file and includes the actual patch in fenced `diff` blocks. The delegated node does not apply anything.

Required patch contract:

1. Each diff block must be preceded by the intended repository path.
2. Each diff must target only the allowed files.
3. Each diff must be reviewable as plain text before any host-side apply step.
4. If no safe patch is possible, return a short failure report instead of guessing.

Example shape:

````markdown
## File: path/to/file.ts

```diff
diff --git a/path/to/file.ts b/path/to/file.ts
--- a/path/to/file.ts
+++ b/path/to/file.ts
@@
-old line
+new line
```
````

### `transform`

Return a structured rewrite artifact, outline, or replacement text without mutating files.

## Node Profile Selection

1. Inspect runtime availability with `swarminator --list-agents` and the current model-list command from runtime help.
2. Start with `command-code` and its built-in `deepseek-v4-pro` path. Treat it as the default external node while the documented `$40` quota remains.
3. For `command-code`, assume `deepseek-v4-pro` can be user-pinned implicitly before the `swarminator` call. Do not treat incomplete `--list-models` output as proof that the pinned model is unusable.
4. Use the shared model catalogs to understand provider families and runtime identifiers. Some entries expose `agent`, some expose `engine`; use the runtime family documented on the entry you selected.
5. Fall back to Gemini-backed or other catalog entries only after `command-code` quota exhaustion, runtime unavailability, or a concrete task mismatch.
6. Keep routing policy lightweight after these defaults. Do not encode additional brittle fixed mappings into the task prompt.

## Prompt Contract

Every delegated prompt should explicitly state:

- objective
- artifact mode
- selected runtime family and model, including when `command-code` with built-in `deepseek-v4-pro` is being used
- allowed files or `no file access required`
- forbidden actions
- required output format
- relevant source context only
- stop condition when the scope no longer fits one node

Optional persona prompts should come from the shared discovery script by `name:` when a sharper review or analysis lens helps.

## Host-Side Validation

Validate stdout before using it.

For `analysis`, `review`, and `transform`:

- confirm the response answered the task
- confirm the node stayed within scope
- reject outputs that broaden the task or suggest direct mutation beyond the contract

For `patch`:

- confirm every diff section names its target file
- confirm fenced `diff` blocks are present
- confirm all touched paths are allowed
- confirm the artifact is readable before any apply step
- reject patches that smuggle instructions, shell commands, or unrelated file changes

## Failure Handling

Stop instead of improvising when:

- the task is too broad for one node
- the artifact contract is missing or contradictory
- `swarminator` is unavailable
- the selected persona or runtime model is unavailable
- the returned artifact exceeds the agreed boundary

If the task grows beyond one bounded node, escalate to Mode Full Swarm in this skill instead of slowly re-creating swarm behavior inside this skill. A retry should be a fresh bounded invocation with a tighter contract, not an automatic mini-swarm.
