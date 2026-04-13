# Agent Process Management Rules

## Background Process Handling

**NEVER kill, restart, or modify background processes running in zellij/tmux/screen sessions.**

- All long-running services (backend servers, frontend dev servers, etc.) must be managed by the user in their own terminal session (zellij)
- Do NOT use `pkill`, `kill`, or any command that terminates existing processes
- Do NOT restart uvicorn, vite, or any development server
- Do NOT start new background processes with `&`, `nohup`, or similar

## When Server Issues Occur

1. **DO NOT** restart the server
2. **DO** identify the issue and report it to the user
3. **DO** suggest commands the user can run to investigate
4. **DO** suggest commands the user can run to restart IF they explicitly ask

## Session Management

- Keep all background processes in a single tmux/zellij session that the user controls
- Never start processes in the background from the agent
- If a process must be started for verification, start it in the foreground and let the user decide how to manage it