# Changelog: AG Session Manager v1.1.0

> **Date**: 2026-03-16
> **Type**: feature, security
> **Spec**: docs/specs/session-management.md (v2), docs/specs/network-security.md (v2)

## Summary

Two major enhancements: Quick Playground mode (one-tap session launch without
directory selection) and mandatory authentication (auto-generated token on first
startup). All requirement documents (PRD, TRD, 2 BDD specs) revised to v2.

## Changes

### Modified Files

- **`server.js`**
  - `POST /api/sessions`: `dir` now optional — omitting creates temp `ag-playground-*` dir
  - Auth now mandatory: token auto-generated on first startup, persisted to `~/.config/ag-session-manager/auth_token` (0600)
  - New endpoint: `POST /api/auth/check` for frontend login validation
  - Token printed in startup banner: `🔑 Auth token: <token>`

- **`public/index.html`**
  - Added login overlay (🔐 card with token input + Unlock button)
  - Added ⚡ Quick Playground button to dashboard empty state
  - Relabeled existing button to "Choose Directory..."

- **`public/css/style.css`**
  - Login overlay styles (glassmorphism, centered card)
  - `.btn-primary.playground` with pulse-glow animation
  - `.btn-secondary` for Choose Directory button

- **`public/js/app.js`**
  - Auth check on init — shows login overlay if no valid token
  - `handleLogin()` — validates token via `/api/auth/check`, stores in localStorage
  - `launchSession(null)` — calls API without dir for playground mode
  - Wired up `#btn-playground` click handler

- **`USER-MANUAL.md`**
  - Added 🔐 First-Time Login section
  - Rewrote Quick Playground as primary (one-tap) workflow
  - Added 📂 Project-Specific Sessions as secondary workflow
  - Rewrote 🔒 Security section for mandatory auth
  - Updated 🛠️ Configuration (AUTH_TOKEN optional override)

### Revised Documents

- **`docs/prds/ag-session-manager.md`** → v2: G1 playground, mandatory auth scope, challenge #5 flipped
- **`docs/trds/ag-session-manager.md`** → v2: ADR-4 auth-first, API dir optional, security rewrite, Rev 3-4
- **`docs/specs/session-management.md`** → v2: playground scenario, relaxed dir validation
- **`docs/specs/network-security.md`** → v2: mandatory auth, auto-token, auth/check, static exemptions

## Verification

- Server starts with auto-generated auth token printed to terminal
- Token persisted to `~/.config/ag-session-manager/auth_token` with correct perms
- Auth enforced on all API endpoints (401 without token)
- `/api/auth/check` validates tokens correctly
- Static files served without auth (login page loads)
