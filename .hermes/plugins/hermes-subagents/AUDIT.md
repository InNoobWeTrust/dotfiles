# hermes-subagents Audit Notes

## Scope

This plugin adds typed Hermes delegation tools that mirror the role-to-model routing from `.config/kilo/kilo.jsonc`.

It is intentionally focused on:
- fixed provider:model selection per role
- predictable delegation entry points for the main harness
- minimal implementation surface built on Hermes' native child-agent machinery

It is intentionally **not** a full recreation of Kilo's per-agent permission matrix.

## Exact role mapping

| Hermes tool | Kilo role | Provider | Model |
|---|---|---|---|
| `delegate_ask` | `ask` | `copilot` | `claude-haiku-4.5` |
| `delegate_general` | `general` | `custom:ink-gw` | `deepseek/deepseek-v4-pro` |
| `delegate_explore` | `explore` | `copilot` | `claude-haiku-4.5` |
| `delegate_plan` | `plan` | `custom:llm-agg` | `forbiddengun/grok` |
| `delegate_code` | `code` | `custom:llm-agg` | `forbiddengun/gpt` |
| `delegate_debug` | `debug` | `custom:llm-agg` | `forbiddengun/minimax` |
| `delegate_code_reviewer` | `code-reviewer` | `custom:llm-agg` | `forbiddengun/gpt` |
| `delegate_tester` | `tester` | `custom:ink-gw` | `deepseek/deepseek-v4-pro` |
| `delegate_docs_writer` | `docs-writer` | `copilot` | `claude-haiku-4.5` |
| `delegate_security_auditor` | `security-auditor` | `custom:llm-agg` | `forbiddengun/claude` |

## Trust boundary

### Hard guarantees

The plugin hard-pins:
- the tool name the parent calls
- the provider:model pair used for the child agent
- the default Hermes toolsets enabled for the child
- the use of Hermes' native `_build_child_agent` and `_run_single_child` flow

The plugin does **not** mutate global delegation config to do this.

### Soft guarantees

Hermes general plugins do not currently offer Kilo-style per-role command allowlists or path-restricted edit permissions.

That means these behaviors are guided by prompt contract and toolset selection rather than hard policy enforcement:
- read-only investigator roles not editing files
- docs/test roles keeping edits in their intended scope
- review/security roles avoiding shell usage beyond what the prompt allows

## Why this implementation is low-risk

- It reuses Hermes' existing delegation internals instead of inventing a second execution path.
- It resolves provider credentials through `resolve_runtime_provider`, the same runtime provider resolver used elsewhere in Hermes.
- It keeps the public interface narrow: only `goal` and optional `context`.
- It does not add new secret storage. Credentials still come from existing Hermes auth/env configuration.

## Operational notes

- Use `hermes chat --yolo` when you want Kilo-like autonomous main-agent behavior.
- The plugin itself does not force YOLO or disable approvals.
- Subagent approval behavior still follows `delegation.subagent_auto_approve`.
- Child depth and concurrency still follow Hermes delegation config.

## Review checklist

Before trusting the plugin in daily use, confirm:

- `plugins.enabled` includes `hermes-subagents`
- each mapped provider has valid credentials in `~/.hermes/.env` or Hermes auth state
- the plugin loads without import errors
- a smoke test succeeds for at least one `copilot`, one `custom:ink-gw`, and one `custom:llm-agg` role
- returned JSON includes the expected `delegate_role`, `delegate_provider`, and `delegate_model`

## Known limitations

- No per-role hard allowlist equivalent to Kilo's `permission` map
- No per-role path-restricted edit enforcement
- No batch mode wrapper; these are single-role, single-child entry points
- No direct user slash commands; they are agent-facing tools
- No built-in automatic fallback from one role model to another
