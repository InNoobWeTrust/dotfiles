# Feature: Network Security

> **Status**: revised (v2)
> **Owner**: InNoobWeTrust
> **Created**: 2026-03-16

## Parent TRD

`docs/trds/ag-session-manager.md` — Network component, Security Assessment

## Description

Restrict server access to local network and Tailscale interfaces only. Enforce
mandatory bearer token auth (auto-generated on first startup) on all API
endpoints. Provide HTTPS with self-signed certificates.

## User Stories

- As a **developer**, I want the server to **only be reachable from my LAN and Tailscale**, so that **my sessions are not exposed to the internet**.
- As a **developer**, I want the server to **always require authentication**, so that **no one else on my LAN can access my sessions**.

## Scenarios

### Scenario: Server binds to detected interfaces

- **Given** the machine has LAN IP 192.168.1.5 and Tailscale IP 100.64.0.1
- **When** the server starts with `BIND_INTERFACES=auto`
- **Then** it listens on `127.0.0.1`, `192.168.1.5`, and `100.64.0.1` on the configured port
- **And** logs the bound addresses

### Scenario: Server not accessible from public internet

- **Given** the server is bound to 192.168.1.5:3000
- **When** a request comes from a non-local IP (e.g., 203.0.113.1)
- **Then** the connection is refused at the OS level (not listening on that interface)

### Scenario: Auth token always required

- **Given** the server is running (token auto-generated on first startup)
- **When** I GET `/api/sessions` without an Authorization header
- **Then** the response status is 401
- **When** I GET `/api/sessions` with `Authorization: Bearer <valid-token>`
- **Then** the response status is 200

### Scenario: Auto-generated token persisted on first startup

- **Given** no `AUTH_TOKEN` env var is set and no `~/.config/ag-session-manager/auth_token` file exists
- **When** the server starts
- **Then** a random token is generated (24 bytes, base64url)
- **And** the token is written to `~/.config/ag-session-manager/auth_token` with file permissions `0600`
- **And** the token is printed to the terminal: `🔑 Auth token: <token>`

### Scenario: Token validation endpoint

- **Given** the server is running with auth token "abc123"
- **When** I POST to `/api/auth/check` with `Authorization: Bearer abc123`
- **Then** the response is `{"valid": true}`
- **When** I POST to `/api/auth/check` with `Authorization: Bearer wrong`
- **Then** the response is `{"valid": false}`
- **Note** this endpoint is exempt from auth middleware (allows login flow)

### Scenario: Static files served without auth

- **Given** the server is running
- **When** I GET `/` (the HTML page) without an Authorization header
- **Then** the response status is 200 (login page can load)

### Scenario: HTTPS with self-signed certificate

- **Given** `./certs/server.key` and `./certs/server.cert` exist
- **When** the server starts
- **Then** it uses HTTPS
- **And** logs "HTTPS enabled"

### Scenario: HTTP fallback when no certificates

- **Given** `./certs/` directory is empty or missing
- **When** the server starts
- **Then** it uses HTTP
- **And** logs "Running in HTTP mode (no certificates found)"

### Scenario: Lockfile prevents dual instances

- **Given** a server is already running (lockfile exists with valid PID)
- **When** a second server instance starts
- **Then** it exits with error: "Server already running (PID: XXXX)"

### Scenario: Stale lockfile cleanup

- **Given** a lockfile exists but the PID is dead
- **When** the server starts
- **Then** it removes the stale lockfile and starts normally

### Scenario: Displays QR code for connection

- **Given** the server starts successfully
- **When** it's bound to 192.168.1.5:3000
- **Then** a QR code for `http://192.168.1.5:3000` is printed to the terminal

## Validation Rules

- `BIND_INTERFACES=auto` detects all non-internal non-loopback IPv4 interfaces plus Tailscale
- Tailscale interfaces detected by name pattern: `tailscale0`, `utun*` (macOS), or IP range `100.64.0.0/10`
- Loopback (127.0.0.1) is always included
- Auth token is mandatory — auto-generated if not configured via `AUTH_TOKEN` env var
- Token persisted to `~/.config/ag-session-manager/auth_token` with `0600` permissions
- Auth token compared using constant-time comparison (`crypto.timingSafeEqual`)
- `/api/auth/check` endpoint exempt from auth middleware for login flow
- Static files exempt from auth (login page must load)
- Lockfile location: `~/.config/ag-session-manager/server.pid`
- QR code only generated for non-loopback addresses

## Out of Scope

- Let's Encrypt / ACME certificate management
- Tailscale MagicDNS auto-cert integration (V2)
- Rate limiting
- IP allowlist/blocklist
- OAuth or multi-factor auth

## Dependencies

- None (foundational module — other specs depend on this)

## ⚔ Challenge Gate

> **Status**: passed
> **Challenger**: AI (self-challenge)
> **Date**: 2026-03-16

### Debate Record

| # | Vector | Challenge | Response | Verdict |
|---|--------|-----------|----------|---------|
| 1 | security | Constant-time comparison — are you using `crypto.timingSafeEqual`? | Yes, will use `crypto.timingSafeEqual` with Buffer conversion. | author-won |
| 2 | edge cases | Tailscale detection by interface name is fragile. Different OS versions use different names. | Fall back to IP range detection (`100.64.0.0/10`) when interface name doesn't match. Both methods used together. | author-won |

### Challenge Summary

- **Challenges raised**: 2
- **Author victories**: 2
- **Challenger victories**: 0
- **Escalated**: 0
- **Overall verdict**: ACCEPTED

### Revisions Made

- **Rev 1 (v2)**: Changed auth from optional to mandatory. Token auto-generated on first startup, persisted to config dir. Removed "no auth when unconfigured" scenario.
- **Rev 2 (v2)**: Added `/api/auth/check` endpoint scenario for frontend login flow.
- **Rev 3 (v2)**: Added static file and auth-check exemption from auth middleware.
