# Multiplexer Process Management (tmux & GNU screen)

> Reference guide for managing background tasks, daemons, watchers, and long-running commands using terminal multiplexers instead of harness-specific background task runners or ad-hoc subshell backgrounding.

---

## Why Multiplexers Over Harness Background Managers

Agent harness background process managers (e.g. async task tools, `IsDaemon`, background shell runners) and ad-hoc backgrounding (`&`, `nohup`) frequently suffer from:
- **Lost I/O streams**: Stdout/stderr buffers get truncated, dropped, or swallowed when the subshell disconnects.
- **Orphaned zombies**: Processes keep running in the background with no way for the agent or user to reconnect, inspect, or cleanly terminate them.
- **Harness fragility**: If the agent harness restarts, times out, or closes the subshell, child processes are often abruptly killed or left dangling.
- **Zero human inspectability**: The user cannot see what is happening in their own terminal without hunting down PIDs.

Terminal multiplexers solve all four problems:
- **OS-level session persistence**: Sessions survive subshell exits and harness disconnects.
- **Complete output inspection**: Buffer capture and log piping capture full stdout/stderr.
- **Shared visibility**: The human user can attach (`tmux attach -t ...` or `screen -r ...`) to inspect or interact anytime.
- **Reliable lifecycle control**: Clean signals (SIGINT, SIGTERM) and deterministic teardown.

---

## Hierarchy of Tools

Always check available multiplexers in this order:

1. **`tmux` (Primary / Gold Standard)**: Modern, highly scriptable, supports robust buffer capture (`capture-pane`), window/pane targeting, and clean status checks.
2. **GNU `screen` (Fallback / Universal Unix Standard)**: Ubiquitous across almost all Unix/Linux/macOS systems when `tmux` is absent.
3. **Synchronous execution / Escalate (If neither is available)**: If neither `tmux` nor `screen` is installed, do not silently spawn detached `&` or `nohup` processes. For bounded tasks, run synchronously with an explicit timeout. For persistent background services (e.g. dev servers), ask the user to install `tmux` or launch the process manually.

---

## Operational Safety Rules

1. **Mandatory `agent-` Prefix**: Every session created by an agent MUST be named with the `agent-` prefix (e.g., `agent-devserver`, `agent-vite`, `agent-tests`).
2. **Never Touch User Sessions**: Never attach to, kill, send keys to, or alter any session that does not start with `agent-`, nor any pre-existing user sessions in `zellij`, `tmux`, or `screen`.
3. **Always Tee to Log File**: When spawning a command, always pipe stdout and stderr to a dedicated log in `/tmp/` (e.g., `2>&1 | tee /tmp/agent-<name>.log`) so output can be queried quickly via `tail` or `grep` without attaching.
4. **Graceful Shutdown Before Force Kill**: Always attempt a graceful interrupt (SIGINT via `C-c`) and wait 3–5 seconds before terminating the session.
5. **Clean Up Log Files**: Delete temporary log files in `/tmp/` when tearing down completed sessions.

---

## Operational Command Reference

### 1. Detection

Check which multiplexer is installed:

```bash
# Check for tmux first
command -v tmux >/dev/null 2>&1 && echo "tmux" || (command -v screen >/dev/null 2>&1 && echo "screen" || echo "none")
```

---

### 2. Spawning a Long-Running Process

Always launch in detached mode with an explicit working directory and piped logging.

#### With `tmux` (Preferred)
```bash
# Syntax: tmux new-session -d -s agent-<name> -c "<working_directory>" "<command> 2>&1 | tee /tmp/agent-<name>.log"
tmux new-session -d -s agent-devserver -c "/path/to/project" "npm run dev 2>&1 | tee /tmp/agent-devserver.log"
```

#### With GNU `screen` (Fallback)
```bash
# Syntax: screen -dmS agent-<name> bash -c "cd '<working_directory>' && <command> 2>&1 | tee /tmp/agent-<name>.log"
screen -dmS agent-devserver bash -c "cd '/path/to/project' && npm run dev 2>&1 | tee /tmp/agent-devserver.log"
```

---

### 3. Checking Session Liveness

Verify whether the session is still active:

#### With `tmux`
```bash
# Returns exit code 0 if running, non-zero if not found
tmux has-session -t agent-devserver 2>/dev/null && echo "RUNNING" || echo "STOPPED"
```

#### With GNU `screen`
```bash
# Checks matching session in screen list
screen -ls | grep -q "agent-devserver" && echo "RUNNING" || echo "STOPPED"
```

---

### 4. Reading Output & Logs

Inspect recent output from the running process:

#### Via Log File (Fastest & recommended for both)
```bash
tail -n 50 /tmp/agent-devserver.log
```

#### Via Direct Pane / Buffer Capture
When real-time terminal buffer inspection is needed:

- **`tmux`**:
  ```bash
  # Capture last 100 lines of scrollback buffer
  tmux capture-pane -pt agent-devserver -S -100
  ```

- **GNU `screen`**:
  ```bash
  # Dump current window buffer to a temporary file and print
  screen -S agent-devserver -X hardcopy /tmp/screen-buffer.log && tail -n 100 /tmp/screen-buffer.log
  ```

---

### 5. Sending Input / Keystrokes

When an interactive prompt or control command needs to be sent to the process:

#### With `tmux`
```bash
# Send text followed by Enter (C-m)
tmux send-keys -t agent-devserver "npm test" C-m

# Send Ctrl+C (Interrupt)
tmux send-keys -t agent-devserver C-c

# Send Ctrl+D (EOF)
tmux send-keys -t agent-devserver C-d
```

#### With GNU `screen`
```bash
# Send text followed by Enter (^M)
screen -S agent-devserver -X stuff "npm test^M"

# Send Ctrl+C (Interrupt)
screen -S agent-devserver -X stuff "^C"

# Send Ctrl+D (EOF)
screen -S agent-devserver -X stuff "^D"
```

---

### 6. Graceful Termination & Teardown

Stop the running process cleanly and remove the session:

#### With `tmux`
```bash
# 1. Send SIGINT (Ctrl+C)
tmux send-keys -t agent-devserver C-c

# 2. Wait briefly for process to exit cleanly
sleep 2

# 3. Kill session if still alive
tmux kill-session -t agent-devserver 2>/dev/null || true

# 4. Clean up log file
rm -f /tmp/agent-devserver.log
```

#### With GNU `screen`
```bash
# 1. Send SIGINT (Ctrl+C)
screen -S agent-devserver -X stuff "^C"

# 2. Wait briefly for process to exit cleanly
sleep 2

# 3. Kill screen session if still alive
screen -S agent-devserver -X quit 2>/dev/null || true

# 4. Clean up log file
rm -f /tmp/agent-devserver.log
```

---

## Summary Checklist for Agents

- [ ] Checked for `tmux` first, then GNU `screen`.
- [ ] Session name starts with `agent-` (e.g. `agent-build-watcher`).
- [ ] Log output redirected to `/tmp/agent-<name>.log`.
- [ ] Confirmed session is running via `has-session` or `screen -ls`.
- [ ] No user sessions (`zellij`, `tmux`, `screen` without `agent-` prefix) were modified or terminated.
- [ ] Cleaned up session and logs upon completion or when user requests shutdown.
