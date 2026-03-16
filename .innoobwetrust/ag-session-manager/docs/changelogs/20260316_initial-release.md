# Changelog: AG Session Manager v1.0.0

> **Date**: 2026-03-16
> **Type**: feature
> **Spec**: docs/specs/session-management.md, directory-browser.md, chat-interaction.md, network-security.md

## Summary

Initial implementation of the Antigravity Mobile Session Manager — a mobile
command center for managing multiple Antigravity AI coding sessions from a phone.

## Changes

### New Files

- **`package.json`** — Project configuration (express, ws, dotenv, qrcode-terminal)
- **`.env.example`** — Configuration template
- **`.gitignore`** — Excludes node_modules, .env, certs
- **`start.sh`** — Launcher script with dep checking
- **`server.js`** — Express + WebSocket server with all API routes
- **`lib/network.js`** — LAN/Tailscale interface detection
- **`lib/session-manager.js`** — Antigravity process lifecycle management
- **`lib/cdp-bridge.js`** — CDP WebSocket bridge for chat mirroring
- **`lib/dir-browser.js`** — Filesystem browser with root constraints
- **`public/index.html`** — SPA shell (4 views)
- **`public/css/style.css`** — Dark glassmorphism theme
- **`public/js/app.js`** — Client router, API calls, WebSocket

### Documentation

- **`docs/prds/ag-session-manager.md`** — Product Requirements Document
- **`docs/trds/ag-session-manager.md`** — Technical Requirements Document
- **`docs/specs/session-management.md`** — BDD spec: sessions
- **`docs/specs/directory-browser.md`** — BDD spec: directory browser
- **`docs/specs/chat-interaction.md`** — BDD spec: CDP chat mirroring
- **`docs/specs/network-security.md`** — BDD spec: network security

## Verification

- Server starts and binds correctly
- Health endpoint returns correct JSON with LAN + Tailscale IPs
- Directory browser defaults to $HOME, lists entries correctly
- All 3 UI views (dashboard, new session, settings) render properly
- QR code generated for mobile access
- Graceful shutdown works (lockfile cleaned)
