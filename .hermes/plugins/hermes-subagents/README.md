# hermes-subagents Plugin

Typed delegation tools that mirror the role routing in `.config/kilo/kilo.jsonc`.

This plugin gives Hermes a fixed set of role-specific subagent tools so the main harness can choose a model that fits the job instead of reusing the parent model for every delegated task.

## What it adds

The plugin registers these Hermes tools:

| Tool | Mirrors Kilo role | Provider | Model | Default toolsets | Best for |
|---|---|---|---|---|---|
| `delegate_ask` | `ask` | `copilot` | `claude-haiku-4.5` | `file`, `web` | Read-only technical Q&A |
| `delegate_general` | `general` | `custom:ink-gw` | `deepseek/deepseek-v4-pro` | `file`, `web` | General research and investigation |
| `delegate_explore` | `explore` | `copilot` | `claude-haiku-4.5` | `file`, `web` | Codebase navigation with no side effects |
| `delegate_plan` | `plan` | `custom:llm-agg` | `forbiddengun/grok` | `file`, `web` | Architecture, design, trade-offs, rollout plans |
| `delegate_code` | `code` | `custom:llm-agg` | `forbiddengun/gpt` | `terminal`, `file`, `web` | Implementation, refactors, bug fixes |
| `delegate_debug` | `debug` | `custom:llm-agg` | `forbiddengun/minimax` | `terminal`, `file`, `web` | Debugging and root-cause analysis |
| `delegate_code_reviewer` | `code-reviewer` | `custom:llm-agg` | `forbiddengun/gpt` | `file`, `web` | Read-only code review |
| `delegate_tester` | `tester` | `custom:ink-gw` | `deepseek/deepseek-v4-pro` | `terminal`, `file`, `web` | Tests and test repair |
| `delegate_docs_writer` | `docs-writer` | `copilot` | `claude-haiku-4.5` | `file`, `web` | README and docs drafting |
| `delegate_security_auditor` | `security-auditor` | `custom:llm-agg` | `forbiddengun/claude` | `file`, `web` | Security review and risk analysis |

## Install and enable

This repo stores the plugin in `.hermes/plugins/hermes-subagents/` so it can be stowed into `~/.hermes/plugins/hermes-subagents/`.

Enable it in Hermes config:

```yaml
plugins:
  enabled:
    - hermes-subagents
```

Then restart Hermes or open a new session.

## Quick use

These are agent-facing tools, not user slash commands. The fast path is to tell Hermes which specialist to use.

Examples:

- "Use `delegate_plan` to design a migration plan for moving custom Kilo agents to Hermes plugins."
- "Use `delegate_code` to implement the plugin and keep changes scoped to `.hermes/plugins/hermes-subagents/`."
- "Use `delegate_debug` to investigate why a config change is not being picked up."
- "Use `delegate_code_reviewer` to review the plugin for maintainability and edge cases."
- "Use `delegate_security_auditor` to audit the plugin for credential-handling risks."

If you want unattended execution for the main session, start Hermes with `--yolo`.

## What the tools return

Each tool returns the same basic shape as `delegate_task`:

```json
{
  "results": [
    {
      "status": "completed",
      "summary": "...",
      "delegate_role": "code",
      "delegate_tool": "delegate_code",
      "delegate_provider": "custom:llm-agg",
      "delegate_model": "forbiddengun/gpt"
    }
  ]
}
```

## Trust boundary and limitations

This plugin mirrors Kilo's **model routing** closely, but Hermes general plugins do **not** expose Kilo-style per-role allowlists such as "only `git diff` and `rg`".

What the plugin enforces well:
- fixed provider:model per role
- fixed default toolsets per role
- role-specific prompt contract per role
- Hermes' normal delegation controls (`delegation.max_iterations`, `subagent_auto_approve`, `max_spawn_depth`, approval model, hardline blocklist)

What is still prompt/policy based rather than hard-enforced:
- read-only behavior for roles like `delegate_explore`, `delegate_code_reviewer`, and `delegate_security_auditor`
- narrow edit scope for roles like `delegate_docs_writer` and `delegate_tester`

For audit details, see [AUDIT.md](./AUDIT.md).

## File layout

| File | Purpose |
|---|---|
| `plugin.yaml` | Hermes plugin manifest |
| `__init__.py` | Tool registration and pinned role routing |
| `README.md` | Quick-start and operator-facing usage |
| `AUDIT.md` | Trust boundaries, model map, and limitations |
