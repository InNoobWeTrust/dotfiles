# Feature: Session Management

> **Status**: revised (v2)
> **Owner**: InNoobWeTrust
> **Created**: 2026-03-16

## Parent TRD

`docs/trds/ag-session-manager.md` — Session Manager component, API contracts for session CRUD

## Description

Manage the lifecycle of Antigravity sessions: create new sessions by launching
Antigravity with a selected working directory or in a temporary playground
directory, list all sessions with their status, and stop running sessions.
Sessions persist across server restarts.

## User Stories

- As a **developer**, I want to **create a new session by selecting a directory**, so that **I can start AI work on any project from my phone**.
- As a **developer**, I want to **start a quick playground session** without picking a directory, so that **I can chat with the AI immediately**.
- As a **developer**, I want to **see all my sessions with their status**, so that **I know which ones are running**.
- As a **developer**, I want to **stop a session**, so that **I can free up resources**.

## Scenarios

### Scenario: Create a new session with a directory

- **Given** the server is running and port 9000 is available
- **When** I POST to `/api/sessions` with `{"dir": "/Users/me/projects/myapp"}`
- **Then** the response status is 201
- **And** the response body contains `{id, status: "starting", dir: "/Users/me/projects/myapp", port: 9000}`
- **And** an Antigravity process is spawned with `--remote-debugging-port=9000`
- **And** the session state is persisted to `sessions.json`

### Scenario: Create a playground session without a directory

- **Given** the server is running and port 9001 is available
- **When** I POST to `/api/sessions` with `{}` (no dir field)
- **Then** the response status is 201
- **And** a temp directory is created at `/tmp/ag-playground-<id>`
- **And** the response body contains `{id, status: "starting", dir: "/tmp/ag-playground-<id>", port: 9001}`
- **And** an Antigravity process is spawned in the temp directory

### Scenario: Session transitions to running after CDP connects

- **Given** a session exists with status "starting"
- **When** the CDP connection to the Antigravity instance succeeds
- **Then** the session status changes to "running"
- **And** connected clients receive a WebSocket status update

### Scenario: List all sessions

- **Given** there are 2 sessions (one "running", one "stopped")
- **When** I GET `/api/sessions`
- **Then** the response contains both sessions with their status, dir, and uptime

### Scenario: Stop a running session

- **Given** a session with id "abc-123" is running
- **When** I DELETE `/api/sessions/abc-123`
- **Then** the Antigravity process is terminated (SIGTERM)
- **And** the session status changes to "stopped"
- **And** the response body contains `{id: "abc-123", status: "stopped"}`

### Scenario: Create session with invalid directory

- **Given** the server is running
- **When** I POST to `/api/sessions` with `{"dir": "/nonexistent/path"}`
- **Then** the response status is 400
- **And** the response body contains an error message: "Directory does not exist"
- **Note** this only applies when `dir` is explicitly provided; omitting `dir` creates a playground

### Scenario: Create session for directory already in use

- **Given** a running session exists for `/Users/me/projects/myapp`
- **When** I POST to `/api/sessions` with `{"dir": "/Users/me/projects/myapp"}`
- **Then** the response status is 409
- **And** the response body contains: "Directory already has an active session"

### Scenario: No available debug ports

- **Given** all ports in range 9000-9099 are in use
- **When** I POST to `/api/sessions` with any valid directory
- **Then** the response status is 503
- **And** the response body contains: "No available debug ports"

### Scenario: Get non-existent session

- **Given** no session with id "nonexistent" exists
- **When** I GET `/api/sessions/nonexistent`
- **Then** the response status is 404

### Scenario: Server restart recovers sessions

- **Given** there are 2 sessions persisted in `sessions.json`
- **When** the server starts
- **Then** it loads sessions from `sessions.json`
- **And** attempts CDP reconnection for sessions with running PIDs
- **And** marks sessions with dead PIDs as "stopped"

## Validation Rules

- Directory path must be absolute and exist on disk (when explicitly provided)
- When `dir` is omitted, a temp directory is created under `os.tmpdir()` + `ag-playground-<id>`
- Directory path must be within configured `BROWSE_ROOTS` (when explicitly provided)
- Debug ports are assigned from 9000 upward, max 9099
- Session IDs are UUIDv4
- Only one active (non-stopped) session per directory (does not apply to playground sessions)
- SIGTERM is sent first; SIGKILL after 5s timeout if process doesn't exit

## Out of Scope

- Session rename or metadata editing
- Auto-restart of crashed sessions
- Session sharing or transfer

## Dependencies

- `docs/specs/network-security.md` — Server must be running and bound
- `docs/specs/directory-browser.md` — Directory validation shares browse-roots logic

## ⚔ Challenge Gate

> **Status**: passed
> **Challenger**: AI (self-challenge)
> **Date**: 2026-03-16

### Debate Record

| # | Vector | Challenge | Response | Verdict |
|---|--------|-----------|----------|---------|
| 1 | edge cases | What if Antigravity crashes silently (no exit event)? | Process `exit` event handles normal exits. For zombie processes, startup cleanup checks if PID is alive. Health-check polling (every 30s) catches mid-run crashes. | author-won |
| 2 | assumptions | Assumes `BROWSE_ROOTS` always set. What if unset? | Default to `$HOME` if not configured. Document this behavior. | challenger-won |

### Challenge Summary

- **Challenges raised**: 2
- **Author victories**: 1
- **Challenger victories**: 1
- **Escalated**: 0
- **Overall verdict**: ACCEPTED (with revision: default BROWSE_ROOTS to $HOME)

### Revisions Made

- **Rev 1**: Default `BROWSE_ROOTS` to `$HOME` when not configured.
- **Rev 2 (v2)**: Added playground mode — `dir` is now optional in `POST /api/sessions`; omitting it creates a temp directory.
