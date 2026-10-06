---
description: "Load before the first shell command in every session. Requires sandbox routing for every command, including read-only checks and fast-path scripts; enforces secret isolation, ephemeral runners, script hygiene, and terminal multiplexer priority."
globs: "*"
alwaysApply: true
trigger: always_on
---

# Execution Safety

This rule applies whenever you execute shell commands, run scripts, or access configuration. It covers **OS sandbox routing**, **secret isolation**, **script execution hygiene**, and **long-running process management**.

## Pre-Execution Gate (every session, every command)

Load this rule before the first shell command, not only after a denial or when editing `.agents/`. Before each command:

1. Prefer native read/search/edit tools when they can perform the operation without shell execution.
2. For shell execution, select an available sandbox tool or a verified platform sandbox using [Shell Sandbox Routing](#shell-sandbox-routing-linux-and-macos). Classify actual writes and network needs; use the least permissions required, an explicit workdir, and non-login execution unless startup configuration is needed.
3. If no usable sandbox exists, report the limitation and obtain explicit approval **before** unrestricted execution. A task request, fast-path exemption, prior successful command, or tool availability is not approval to bypass isolation.

This gate applies to `pwd`, `ls`, `rg`, Git inspection, syntax checks, package metadata queries, tests, temporary verification scripts, and cleanup as well as mutating commands. Apply it to shell execution through wrappers, code-mode tools, and delegated agents too. Do not escalate permissions or retry unrestricted after a denial without investigating it.

`uv`, `bun`, `npx`, virtual environments, and mocked commands do **not** provide OS isolation. Dependency resolution and OS sandboxing are separate controls; use the appropriate runner **inside** the selected sandbox.

---

## Secret Isolation

Secrets in environment variables and `.env` files are transmitted to the AI provider when you read or output them. Treat all environment state as potentially secret.

### Prohibited actions

| Action | Why prohibited |
|---|---|
| `cat .env`, `cat *.env`, or reading any `*.env` file | Leaks secrets into AI context → provider training data |
| `echo $VAR`, `printenv`, `env` (standalone dump), `set`, `export` | Same — env vars often contain API keys, tokens, passwords |
| `$ENV_VAR` expansion in command output you will read | The expanded value enters your context |
| Logging, printing, or displaying env var **values** in script output | Values become part of the conversation |
| Accessing `os.environ`, `process.env`, `System.getenv()` in scripts whose output you will read | Same — runtime env access that surfaces values to you |

### Permitted actions

| Action | Why permitted |
|---|---|
| **Referencing** env var **names** (e.g., "set `DATABASE_URL` to ...") | Names are not secrets |
| Reading `.env.example` or `.env.template` (no real values) | Templates contain placeholder names, not secrets |
| Writing code that **uses** env vars at runtime (the app reads them, not you) | The values never enter AI context |
| Checking if a var **exists** without reading its value (e.g., `test -n "$VAR"`) | Existence checks are safe |
| Listing env var **names** without values (e.g., `compgen -v` or `python -c "import os; print(*os.environ.keys(), sep='\n')"`)| Extracting keys only avoids multiline value leaks |
| Using `env` in shebangs (`#!/usr/bin/env python3`) or command overrides (`env VAR=val cmd`) | Contextual execution, not a secret dump |

### When you need a secret value

Stop and ask the user. Do not attempt to discover it yourself. If a script needs a secret, document the required variable name and let the user supply the value outside your context.

---

## Script Execution Hygiene

System-wide package installs pollute the user's environment. Inline scripts are fragile and hard to audit. Prefer file-based scripts with ephemeral dependency resolution.

### Default runner hierarchy

For every script or command, choose the **first** option that is feasible:

1. **File-based script with ephemeral dependency resolution** — required when file-write tools are available.
2. **Inline one-liner inside the selected OS sandbox** — only when file-write tools are **not** available.
3. **Published CLI tool** — use `uvx`, `npx`, or `bunx` only for packages installed from a registry.

**The system `python`, `python3`, `node`, `npm`, `pip`, or direct package-manager installs are not the default path.** They may only be used when the project already has a managed environment (e.g., a `pyproject.toml` or `package.json` workspace) and the user explicitly asked you to run inside that environment.

### Runner matrix

| Scenario | Python | JS/TS |
|---|---|---|
| Custom script with dependencies | Write to temp dir → `uv run --with <dep> python /tmp/script.py` | Write to temp dir → `bun run /tmp/script.ts` |
| Published CLI tool | `uvx <tool>` | `npx <tool>` / `bunx <tool>` |
| Inline one-liner (no write tools available) | `uv run --with <dep> python -c '...'` | `bun -e '...'` |
| Project-managed environment (user explicitly asked) | `python` / `python3` / `uv run` inside the project | `node`, `npm`, `bun` inside the project |
| System-wide install | **PROHIBITED** | **PROHIBITED** |

### Prohibited actions

| Action | Why prohibited |
|---|---|
| `pip install`, `pip install --user` | Pollutes system or user Python environment |
| `npm install -g`, `yarn global add` | Pollutes global Node environment |
| `sudo apt install` / `brew install` for script dependencies | System-level side effects without user consent (permitted only when user explicitly asks for system tools) |
| Long inline scripts passed as string arguments | Hard to audit, fragile quoting, no reuse |
| Running `python script.py` or `python3 script.py` directly when the script imports an external package | Assumes the package is already installed; fails silently or pollutes the environment |
| Running `python -c "..."` or `python3 -c "..."` with external imports | Same dependency-leak problem; inline scripts are not reusable or auditable |

## Process and Resource Safety Gate (Mandatory)

Before running or delegating any process-spawning, recursive-agent, parallel-loop, fan-out, or stress-test workload, complete a preflight assessment and record hard upper bounds for concurrency/process count, CPU, RAM+swap, PIDs, writable storage, network, timeout, and cleanup. Require positive proof that every bound and isolation control is active before starting.

Host execution of recursive/process-tree/botnet-like tests is prohibited. Use an explicitly constrained container or VM with CPU, RAM+swap, PID, writable-storage, network, timeout, and no-host-PID/no-host-socket limits. Do not run such workloads unattended/AFK without this isolation. Stop immediately on resource exhaustion, unexpected process proliferation, or any bound/containment violation.

### Required: write scripts to temp directory

When you have write tools available:

1. Write the script to a **temp directory** — either `/tmp/` (global) or the repo's dedicated scratch/temp directory.
2. Execute inside the selected OS sandbox with the appropriate dependency runner (`uv run --with <dep> python` for Python, `bun run` for JS/TS).
3. Dependencies resolve automatically on demand without modifying global packages or creating local lockfiles.

```bash
# Python example — write script, run with uv
uv run --with websockets --with httpx python /tmp/cdp_automation.py

# JS/TS example — write script, run with bun
bun run /tmp/scraper.ts
```

### Required: name and declare dependencies

Every script that imports an external package must declare it **in the command** or **in a `pyproject.toml` / `package.json`**. Do not rely on a package being pre-installed on the system.

```bash
# Correct: dependency is declared and resolved on demand
uv run --with requests python /tmp/fetcher.py

# Wrong: will fail if requests is not installed
python /tmp/fetcher.py
```

### Exception: inline execution without write tools

If the agent environment does **not** provide file-write tools, inline execution is permitted **only** through dependency runners inside the selected OS sandbox:

```bash
# Python — uv resolves deps, runs inline via python -c
uv run --with requests python -c 'import requests; print(requests.get("https://example.com").status_code)'

# JS/TS — bun/deno runs inline
bun -e 'console.log("hello")'
```

### npx / bunx are for published CLI tools only

`npx` and `bunx` execute **published packages** from the npm registry. They do **not** resolve dependencies for custom scripts. Use them only to run CLI tools:

```bash
# Correct: published CLI tool
npx eslint .
bunx @ast-grep/cli scan src/

# Wrong: trying to run a custom script with npx
# npx does NOT resolve deps for your custom code
```

### What to do if `uv` or `bun` is unavailable

Stop and ask the user before installing system-wide tools. If the project has a managed environment, use it. Do not silently fall back to `pip install` or `npm install -g`.

---

## Shell Sandbox Routing (Linux and macOS)

For **every shell command**, require sandboxed execution unless an unrestricted fallback has explicit approval under the gate above. Read-only intentions (file inspection, `git status`/`git log`/`git diff`, analysis, log viewing, dry-runs, system queries, `rg`/`grep`) are not exemptions. Native read/search/edit tools need no shell wrapper. A test or dry-run label does not guarantee a command is non-mutating; choose permissions based on actual writes.

### Defaults and Fallback Order

1. **Available sandbox tool:** Use a native agent tool or MCP tool that provides the required isolation. Inspect its documented capabilities and arguments; do not assume a particular tool name, schema, or permission model.
2. **Platform command:** If no suitable sandbox tool is exposed, check for `bwrap` on Linux or `sandbox-exec` on macOS. Use documented flags or a verified policy that enforces the intended restrictions; binary presence alone does not prove the sandbox works. `bwrap` depends on usable Linux namespaces; `sandbox-exec` is deprecated and policy-based, not Linux-style namespace isolation. Do not assume shell aliases are loaded.
3. **No usable sandbox:** Report the limitation and use native read/search tools where possible. Ask for approval before an unrestricted shell fallback. No platform is an automatic exemption; do not install packages or restart services without consent.

Select the least-permissive policy matching the authorized intent:

| Intent | Desired boundary |
|---|---|
| Read-only commands (default) | Deny host/workspace writes; allow only designated scratch writes; permit network only when needed |
| Offline read-only checks | Same write restrictions, with network denied |
| Intentional, authorized writes, including tests that create artifacts | Allow writes only in the required workspace/scratch scope; retain restrictions elsewhere |

Map these policies to the available tool or command's documented controls, not fixed mode names. For example, run `git status --short` in the target repository with workspace writes denied and network disabled if supported.

Set the target working directory explicitly. Avoid login-shell startup unless needed; do not assume skipping profiles strips the inherited environment. Use the sandbox's designated scratch/cache path (such as `$TMPDIR` when provided), not hard-coded `/tmp`. Verify actual boundaries: private scratch directories, isolated mounts, host-file readability, and environment filtering vary by implementation. Sandboxing does not by itself protect readable secrets or establish hostile-code isolation.

### Denials

- A denial is a signal to investigate, **not proof of a filesystem write**: `Operation not permitted` can also mean another restricted operation, including network access or nested sandbox setup.
- Inspect the specific error. Fix unintended writes using genuine read-only flags or designated scratch/cache paths, then re-run sandboxed.
- Do not disable the sandbox, retry unsandboxed, or grant workspace writes merely to make a read-only check pass. Use a fallback only after establishing that the current mechanism is unusable for the intended operation; preserve the same restrictions or obtain approval for reduced isolation.

### ACI Pass

- Result: PASS
- Main risks: fixed-tool assumptions, unrestricted-shell bypass, unjustified permission escalation, overstating isolation.
- Interface upgrades applied: capability-based routing, platform fallbacks, intent-based permissions, denial investigation, approved fallback only.

---

## Long-Running Processes: Multiplexer Priority

Harness-level background process management (async task tools, background flags, subshell daemons) and ad-hoc backgrounding (`&`, `nohup`) are error-prone and brittle across agent harnesses: stdout/stderr buffers are easily lost, processes can become orphaned zombies, and the user has no direct visibility into running jobs.

For any long-running command, dev server, watcher, test runner, or daemon:
**Prioritize a terminal multiplexer** to ensure OS-level session persistence, inspectable logs, and clean lifecycle management:

1. **`tmux` (Primary)**: Standard modern multiplexer with robust pane/buffer capture and session scripting.
2. **GNU `screen` (Fallback)**: Universal Unix fallback when `tmux` is absent.
3. **Neither available**: Run bounded tasks synchronously with an explicit timeout, or ask the user to install `tmux` / start the service manually. **Never silently spawn unmonitored background tasks via `&` or `nohup`.**

### Mandatory Multiplexer Constraints

- **Prefix session names with `agent-`** (e.g. `agent-devserver`, `agent-tests`).
- **Never touch user sessions**: Do not attach to, kill, or send keys to any session lacking the `agent-` prefix, nor any existing user sessions in `zellij`, `tmux`, or `screen`.
- **Piped logging**: Always redirect stdout/stderr to `/tmp/agent-<name>.log` (using `2>&1 | tee /tmp/agent-<name>.log`) for inspectability without attaching.
- **Graceful termination**: Send `SIGINT` (Ctrl+C) first, wait 2–3 seconds for graceful shutdown, and only then terminate the session. Clean up temporary log files upon exit.

### Multiplexer Operational Matrix

| Action | `tmux` (preferred) | GNU `screen` (fallback) |
|---|---|---|
| **Check tool** | `command -v tmux` | `command -v screen` |
| **Spawn detached** | `tmux new-session -d -s agent-<name> -c "<cwd>" "<cmd> 2>&1 \| tee /tmp/agent-<name>.log"` | `screen -dmS agent-<name> bash -c "cd '<cwd>' && <cmd> 2>&1 \| tee /tmp/agent-<name>.log"` |
| **Check status** | `tmux has-session -t agent-<name> 2>/dev/null && echo RUNNING` | `screen -ls \| grep -q "agent-<name>" && echo RUNNING` |
| **Inspect logs** | `tail -n 50 /tmp/agent-<name>.log` or `tmux capture-pane -pt agent-<name> -S -100` | `tail -n 50 /tmp/agent-<name>.log` |
| **Send input / signal** | `tmux send-keys -t agent-<name> "<input>" C-m` (interrupt: `C-c`) | `screen -S agent-<name> -X stuff "<input>^M"` (interrupt: `^C`) |
| **Graceful stop** | `tmux send-keys -t agent-<name> C-c` → wait → `tmux kill-session -t agent-<name>` | `screen -S agent-<name> -X stuff "^C"` → wait → `screen -S agent-<name> -X quit` |

---

## Just-in-Time References

| Read when | Reference |
| --- | --- |
| Deep multiplexer command patterns, terminal escape sequences, buffer captures, or troubleshooting | [Multiplexer Process Management](references/multiplexer-management.md) |

---

## Self-Check

- [ ] No env var values were read or output during this session
- [ ] No `*.env` file contents were displayed
- [ ] No system-wide package installs were performed (`pip install`, `npm install -g`)
- [ ] Scripts with dependencies were written to temp dir and run via `uv`/`bun`
- [ ] Inline `python -c` or `python3 -c` was used only with `uv run --with` and only when file write was unavailable
- [ ] `python script.py` / `python3 script.py` was not used for scripts that import external packages
- [ ] `npx`/`bunx` used only for published CLI tools, not custom scripts
- [ ] Dependency fallback was not silently replaced by a global install
- [ ] Long-running processes prioritized `tmux` (or `screen` fallback) over harness background tasks or `&`/`nohup`
- [ ] Multiplexer sessions used `agent-` namespace and did not touch user sessions
- [ ] This rule was loaded before the first shell command; fast-path tasks did not waive it
- [ ] Every shell command used an available sandbox tool or verified platform sandbox, including inspection, tests, scratch scripts, and cleanup; dependency runners were not mistaken for OS isolation
- [ ] Denials were investigated without silent bypass or unjustified permission escalation; any unrestricted fallback had explicit approval before execution
