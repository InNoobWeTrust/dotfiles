# TRD: Antigravity Session Manager Server

> **Status**: revised (v4)
> **Owner**: InNoobWeTrust
> **Created**: 2026-03-16

## Parent PRD

`docs/prds/ag-session-manager.md` — Addresses goals: G1 (launch sessions), G2 (dashboard), G3 (interact), G4 (network security), G5 (mobile UX), G6 (native chat rendering)

## Technical Overview

A Node.js Express server that manages multiple Antigravity processes, provides
CDP-based UI mirroring, and serves a mobile-optimized SPA. The server binds only
to local network and Tailscale interfaces, with mandatory bearer token auth
(auto-generated on first startup), optional HTTPS, and support for both
project-specific and playground (temp directory) sessions. Sessions are tracked
in a JSON state file, with each Antigravity instance running on a unique debug port.

The architecture follows a modular design: four library modules (network, session
manager, CDP bridge, directory browser) are composed by the main server. The
frontend is a vanilla HTML/CSS/JS SPA using hash-based routing.

## Architecture Decisions

### ADR-1: Vanilla Node.js + Express (No Framework)

- **Context**: Need a lightweight server for a personal toolw
- **Decision**: Plain Express with no build system, no TypeScript, no framework
- **Rationale**: Minimal dependencies, zero build step, easy to maintain. This is a personal tool, not a team project.
- **Alternatives Considered**:
  - Next.js — Overkill for a tool with 4 views and 15 API endpoints
  - Fastify — Marginal performance gain not worth the API difference

### ADR-2: CDP Over Extension API

- **Context**: Need to control Antigravity from an external process
- **Decision**: Use Chrome DevTools Protocol (CDP) via WebSocket
- **Rationale**: CDP allows external process control without running inside Antigravity. Proven by the reference project. Standard Chromium protocol.
- **Alternatives Considered**:
  - Antigravity Extension API — Requires running inside Antigravity, not suitable for external mobile web server

### ADR-3: JSON State File Over Database

- **Context**: Need to persist session state across server restarts
- **Decision**: Use a JSON file at `~/.config/ag-session-manager/sessions.json`
- **Rationale**: Session state is small (PIDs, ports, paths) and transient. SQLite or a DB would be overkill. JSON is human-readable and debuggable.
- **Alternatives Considered**:
  - SQLite — Unnecessary complexity for <100 records
  - In-memory only — Loses state on restart, can't recover sessions

### ADR-4: Authentication-First Security

- **Context**: Need to secure the server from unauthorized access, even on shared LANs
- **Decision**: Mandatory bearer token auth on all API endpoints. Token auto-generated on first startup, persisted to `~/.config/ag-session-manager/auth_token`. Network binding (LAN + Tailscale only) as additional defense layer.
- **Rationale**: Shared LANs (home, office, co-working) expose the server to other devices. Network-level restriction is necessary but not sufficient. Mandatory auth ensures only the owner can access sessions, with zero-config setup via auto-generated tokens.
- **Alternatives Considered**:
  - Network-only (V1 approach) — Insufficient for shared LANs. Other devices on the same WiFi could access the server.
  - Password auth (like reference project) — Requires user to set up credentials. Auto-generated token is simpler.
  - mTLS — Too complex for a personal tool

## System Components

- **`server.js`**: Express HTTP/HTTPS server, WebSocket upgrade, API routes, auth middleware, startup orchestration
- **`lib/network.js`**: Interface detection (LAN, Tailscale), bind address calculation, port checking
- **`lib/session-manager.js`**: Antigravity process lifecycle (spawn, track, stop, health-check), state persistence
- **`lib/cdp-bridge.js`**: CDP WebSocket connection per session, DOM snapshot capture (clone + sanitize + extract CSS), **structured message extraction** (`extractMessages()` — runs in-browser JS to identify user/assistant turns, extract typed content blocks, convert images to base64), scroll sync, screencast streaming, remote interactions
- **`lib/dir-browser.js`**: Filesystem browsing constrained to configured roots, git repo detection

## API Contracts / Interfaces

### Session Management

```
POST /api/sessions — Create new session
  Input:
    - dir: string (optional) — absolute path to working directory.
      If omitted, a temp playground directory is created at /tmp/ag-playground-<id>
  Output:
    - id: string — session UUID
    - status: string — "starting"
    - dir: string — working directory (assigned or auto-generated)
    - port: number — CDP debug port
  Errors:
    - 400: invalid directory path (if dir provided)
    - 409: directory already has an active session
    - 503: no available debug ports

GET /api/sessions — List all sessions
  Output:
    - sessions: Array<{id, status, dir, port, uptime, lastActivity}>

GET /api/sessions/:id — Get session details
  Output:
    - id, status, dir, port, uptime, lastActivity, cdpConnected
  Errors:
    - 404: session not found

DELETE /api/sessions/:id — Stop session
  Output:
    - id: string
    - status: "stopped"
  Errors:
    - 404: session not found
```

### Chat Interaction

```
GET /api/sessions/:id/snapshot — Get DOM snapshot (V1 legacy, retained as fallback)
  Output:
    - html: string — sanitized DOM content (interaction areas stripped, inline divs fixed, images base64'd)
    - css: string — extracted stylesheets
    - scrollInfo: {scrollTop, scrollHeight, clientHeight, scrollPercent}
    - hash: string — content hash for change detection
  Errors:
    - 404: session not found
    - 503: CDP not connected

GET /api/sessions/:id/messages — Get structured chat messages (V2 primary)
  Output:
    - messages: Array<{role: "user"|"assistant", blocks: Array<Block>}>
      Block types:
        - {type: "text", html: string} — cleaned HTML content
        - {type: "code", language: string, content: string} — code block
        - {type: "image", src: string, alt: string} — base64 data URI
    - isGenerating: boolean — whether AI is currently generating
    - hash: string — MD5 content hash for change detection
  Errors:
    - 404: session not found
    - 503: CDP not connected

POST /api/sessions/:id/send — Send message
  Input:
    - message: string — the text to send
  Output:
    - status: "sent"
  Errors:
    - 404: session not found
    - 503: CDP not connected

POST /api/sessions/:id/scroll — Sync scroll position
  Input:
    - scrollPercent: number (0-1) — normalized scroll position
  Output:
    - ok: true
  Errors:
    - 503: CDP not connected

POST /api/sessions/:id/stop-gen — Stop generation
GET /api/sessions/:id/state — Get mode/model state
POST /api/sessions/:id/set-mode — Set mode (body: {mode: "fast"|"planning"})
POST /api/sessions/:id/set-model — Set model (body: {model: string})
POST /api/sessions/:id/new-chat — Start new chat in session
GET /api/sessions/:id/chats — List chats in session
POST /api/sessions/:id/select-chat — Switch chat (body: {title: string})
```

### Directory Browsing

```
GET /api/dirs?path=<path> — List directory contents
  Output:
    - path: string — current absolute path
    - parent: string|null — parent path (null if at root)
    - entries: Array<{name, type: "dir"|"file", size?, isGitRepo?, gitBranch?, gitDirty?}>
  Errors:
    - 400: path outside allowed roots
    - 404: path does not exist

GET /api/dirs/favorites — List saved favorites
POST /api/dirs/favorites — Add favorite (body: {path: string, label?: string})
DELETE /api/dirs/favorites/:index — Remove favorite
```

### System

```
GET /health — Server health
  Output:
    - status: "ok"
    - uptime: number (seconds)
    - sessions: number (count)
    - network: {lan: string[], tailscale: string[]}

GET /api/network — Network info
  Output:
    - interfaces: Array<{name, ip, type: "lan"|"tailscale"|"loopback"}>
    - bound: string[] — addresses the server is listening on

POST /api/auth/check — Validate bearer token
  Input:
    - Authorization header: Bearer <token>
  Output:
    - valid: boolean
  Notes:
    - Exempt from auth middleware (allows login flow)
```

## Data Models

### Session

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string (UUID) | unique, required | Session identifier |
| dir | string | absolute path, required | Working directory |
| port | number | 9000-9099, unique | CDP debug port |
| pid | number | nullable | Antigravity process PID |
| status | enum | starting/running/stopping/stopped/error | Lifecycle state |
| createdAt | ISO 8601 | required | Creation timestamp |
| lastActivity | ISO 8601 | required | Last interaction timestamp |

### Favorite

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| path | string | absolute, required | Directory path |
| label | string | optional, max 50 chars | Human-readable label |

## Security Assessment

### Authentication & Authorization

- **Auth model**: Mandatory bearer token. Token auto-generated on first startup (24 bytes, base64url-encoded), persisted to `~/.config/ag-session-manager/auth_token` (file permissions `0600`). Can be overridden via `AUTH_TOKEN` env var. All API requests must include `Authorization: Bearer <token>` header.
- **Access control**: Single-user, no roles. All authenticated requests have full access.
- **Session management**: No user sessions — auth is stateless via bearer token per request. Frontend stores token in `localStorage`.
- **Privilege boundaries**: Server runs as the current OS user. Antigravity processes inherit the same user.

### Data Protection

- **Data classification**: No PII stored. Session state (PIDs, ports, paths) is non-sensitive. Chat content transits via CDP but is not stored on the server.
- **Encryption in transit**: HTTPS with self-signed certs or Tailscale MagicDNS auto-certs. HTTP fallback allowed on localhost only.
- **Secrets management**: Auth token auto-generated and persisted to `~/.config/ag-session-manager/auth_token` with `0600` permissions. Can be overridden via `AUTH_TOKEN` in `.env` (gitignored).

### Input Validation & Injection Prevention

- **Input boundaries**: Directory paths validated against `BROWSE_ROOTS` allowlist. Message content is passed through CDP without server-side rendering. Mode/model values validated against known enums.
- **Injection vectors**:
  - Path traversal: Resolved to absolute path, checked against allowlist, reject `..` outside roots
  - Command injection: Directory paths are passed to `child_process.spawn` as arguments (not shell), preventing injection
  - XSS: DOM snapshots are rendered in a sandboxed `<div>` in the client with styles scoped

### Infrastructure & Configuration

- **Network boundaries**: Server binds to `0.0.0.0` (required for multi-interface listening), but only LAN and Tailscale IPs are advertised. Network-level restriction is secondary defense to mandatory auth.
- **Default credentials**: Auth token auto-generated on first startup — no default passwords, no empty-token fallback.
- **Process isolation**: Antigravity spawned via `child_process.spawn`, not shell exec

### Supply Chain & Dependencies

- **Dependency policy**: Minimal deps: `express`, `ws`, `dotenv`, `qrcode-terminal`. All pinned in `package-lock.json`.
- **Third-party integrations**: None. No external APIs, no cloud services.

### Failure Modes

- **Fail-closed**: Auth is always enforced; requests without valid token → 401 (not fail-open). Only static files and `/api/auth/check` are exempt.
- **CDP failure**: If CDP connection drops, session status changes to "error", snapshot returns 503
- **Process crash**: If Antigravity process exits, session status updated to "stopped" via exit handler
- **Audit logging**: All API requests logged to stdout with timestamp, method, path, status code

## Non-Functional Requirements

- **Performance**: Snapshot response < 500ms. Dashboard load < 2s.
- **Scalability**: Support up to 10 concurrent sessions (limited by CDP ports 9000-9099).
- **Observability**: Console logging with timestamp. `/health` endpoint.
- **Reliability**: Graceful shutdown on SIGINT/SIGTERM. Stale session cleanup on startup.

## Child BDD Specs

- `docs/specs/session-management.md` — Session lifecycle (create, list, stop, status transitions)
- `docs/specs/directory-browser.md` — Directory listing, path validation, favorites
- `docs/specs/chat-interaction.md` — CDP snapshot, send message, mode/model control
- `docs/specs/network-security.md` — Interface binding, auth token, HTTPS

## ⚔ Challenge Gate

> **Status**: passed
> **Challenger**: AI (self-challenge, including security-reviewer pass)
> **Date**: 2026-03-16

### Debate Record

| # | Vector | Challenge | Response | Verdict |
|---|--------|-----------|----------|---------|
| 1 | security | `child_process.spawn` with user-supplied directory path — could an attacker craft a path that exploits spawn behavior? | `spawn` takes the command and args as separate values, not a shell string. The dir is validated against allowlist before being passed. Even a malicious path like `; rm -rf /` would just fail as an invalid directory. | author-won |
| 2 | security | DOM snapshot rendered as `innerHTML` on the client — XSS risk from malicious content in Antigravity chat? | The snapshot comes from the user's own Antigravity session, so the content is self-generated. Additionally, the snapshot is rendered in a scoped `<div>` with no script execution. But we should add `<script>` tag stripping as defense-in-depth. | challenger-won |
| 3 | alternatives | JSON state file — what happens if two server instances start simultaneously and corrupt the file? | Personal tool, single instance use. But should add a lockfile or PID check on startup to prevent dual-instance. | challenger-won |
| 4 | longevity | 10 concurrent sessions — what if the user runs out of ports? | Very unlikely for personal use, but the error message should be clear. Added 503 error for "no available debug ports". | author-won |
| 5 | edge cases | What if the directory is deleted while a session is running? | Antigravity will handle this — it's the working directory of the editor. Server just tracks the session. If CDP drops, status goes to "error". | author-won |

### Challenge Summary

- **Challenges raised**: 5
- **Author victories**: 3
- **Challenger victories**: 2 (must revise before advancing)
- **Escalated**: 0
- **Overall verdict**: ACCEPTED (with revisions)

### Revisions Made

- **Rev 1**: Added `<script>` tag stripping to snapshot capture in CDP bridge (defense-in-depth for XSS)
- **Rev 2**: Added PID-based lockfile check on server startup to prevent dual instances
- **Rev 3 (v2)**: Changed auth from optional to mandatory. Auto-generated token persisted to `~/.config/ag-session-manager/auth_token`. Added `/api/auth/check` endpoint for login flow.
- **Rev 4 (v2)**: Made `dir` optional in `POST /api/sessions` — omitting it creates a temp playground directory.
- **Rev 5 (v3)**: Added scroll sync API (`POST /api/sessions/:id/scroll`) and `scrollInfo` in snapshot response.
- **Rev 6 (v3)**: Added screencast streaming infrastructure (`Page.startScreencast`/`Page.stopScreencast`) via WebSocket subscriptions.
- **Rev 7 (v3)**: Directory browser: cross-volume symlink support (logical OR real path check), `$HOME`/`~` expansion in `BROWSE_ROOTS`.
- **Rev 8 (v4)**: Added structured message extraction (`extractMessages()`) to CDP bridge: runs in-browser JS to discover message turns, extract typed content blocks (text/code/image), convert images to base64 data URIs. New `GET /api/sessions/:id/messages` endpoint. Client switches from snapshot polling to message polling with native rendering.

## Notes

- CDP snapshot capture logic adapted from reference project's `captureSnapshot()` function
- Reference: [antigravity_phone_chat CODE_DOCUMENTATION.md](https://github.com/krishnakanthb13/antigravity_phone_chat/blob/master/CODE_DOCUMENTATION.md)
