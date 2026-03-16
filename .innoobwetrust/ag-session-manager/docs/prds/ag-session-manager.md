# PRD: Antigravity Mobile Session Manager

> **Status**: revised (v4)
> **Owner**: InNoobWeTrust
> **Created**: 2026-03-16

## Problem Statement

Antigravity AI coding sessions are locked to the desktop. The only mobile access
tool (antigravity_phone_chat) mirrors a single active chat via CDP DOM scraping,
requiring the user to manually launch Antigravity and open a chat first. There is
no way to start a new session, choose a working directory, or manage multiple
sessions from a mobile device. This forces the user back to the desk for any
session management task, defeating the purpose of mobile monitoring.

## Goals & Non-Goals

### Goals

- **G1**: Launch new Antigravity sessions from mobile — either as a quick playground (no directory needed) or with a selected working directory
- **G2**: View and manage all active sessions from a single dashboard
- **G3**: Interact with any session (send messages, view output, switch mode/model)
- **G4**: Restrict access to local network and Tailscale only — no public internet exposure
- **G5**: Deliver a premium mobile UX (dark mode, responsive, touch-optimized)
- **G6**: Render chat content natively — structured message extraction from Antigravity DOM, rendered with app's own design system (user/AI bubbles, code blocks with copy, inline images, generating indicator)

### Non-Goals

- ~~Text-only / structured chat view~~ → moved to Goals (G6) in v4
- Remote SSH-based directory browsing (V1 supports local filesystem only)
- Multi-user support or user accounts
- Mobile app (PWA or native) — V1 is a plain web app
- Full desktop parity — this is a command center, not a replacement

## User Personas

- **Solo Developer**: Works on multiple codebases from a home office, uses
  Tailscale to reach the dev machine from anywhere on the local network or
  when on-the-go. Wants to kick off AI coding sessions from the couch/phone,
  monitor progress, and steer the AI without returning to the desk.

## User Stories (High-Level)

- As a **developer**, I want to **see all active Antigravity sessions** on my phone, so that **I can check their status at a glance**.
- As a **developer**, I want to **start a quick playground session** without picking a directory, so that **I can chat with the AI immediately from my phone**.
- As a **developer**, I want to **start a new Antigravity session** in any project directory from my phone, so that **I don't have to walk to my desk**.
- As a **developer**, I want to **browse my project directories** on my phone, so that **I can pick the right working directory for a new session**.
- As a **developer**, I want to **send messages and control AI behavior** in any session from my phone, so that **I can steer the AI remotely**.
- As a **developer**, I want the server to **require authentication**, so that **no one else on my LAN can access my sessions**.

## Success Metrics

- **SM1**: Can launch a new session from phone in under 30 seconds
- **SM2**: Dashboard loads and displays all sessions in under 2 seconds
- **SM3**: Server is unreachable from the public internet (verified via port scan)
- **SM4**: Can switch between 3+ active sessions without data loss or confusion
- **SM5**: UI scores "good" on mobile usability (Lighthouse ≥ 80 performance)

## Scope

- Multi-session management (launch, stop, switch, monitor)
- Directory browser constrained to configurable root paths (with cross-volume symlink support)
- CDP-based chat mirroring — **V2: structured message extraction with native rendering** (replaces V1 raw DOM snapshot approach)
- Phone-to-desktop scroll synchronization
- Screencast streaming (`Page.startScreencast`) as alternative transport
- Remote interaction (send message, stop generation, switch mode/model)
- Network-restricted server binding (LAN + Tailscale)
- Mandatory bearer token auth (auto-generated)
- HTTPS support (self-signed or Tailscale MagicDNS)
- Terminal QR code for quick connection
- Dark-mode mobile-optimized UI

## Out of Scope

- ~~Structured/text-only chat parser~~ → moved to Scope in v4
- Remote machine SSH integration (V2)
- PWA / service worker / offline mode
- User authentication system (multi-user)
- Desktop Antigravity UI modifications
- Automated testing framework
- i18n / accessibility (beyond basic touch targets)

## Dependencies

- **Antigravity CLI**: Must support `antigravity <dir> --remote-debugging-port=<port>`
- **Node.js ≥ 18**: Server runtime
- **CDP (Chrome DevTools Protocol)**: For UI mirroring and control
- **Local network or Tailscale**: For access

## Child TRDs

- `docs/trds/ag-session-manager.md` — Full system architecture

## ⚔ Challenge Gate

> **Status**: passed
> **Challenger**: AI (self-challenge)
> **Date**: 2026-03-16

### Debate Record

| # | Vector | Challenge | Response | Verdict |
|---|--------|-----------|----------|---------|
| 1 | assumptions | Assumes CDP is stable across Antigravity versions. CDP is an internal protocol — could break silently. | CDP is the same mechanism the reference project uses successfully. Antigravity is Electron-based, so CDP is a standard Chromium feature, not a custom API. Risk is low and acceptable for a personal tool. | author-won |
| 2 | alternatives | Why not use Antigravity's extension API (`antigravity.sendTextToChat`) instead of CDP? | Extension API requires running inside Antigravity. CDP allows external control from a separate process. For a mobile web interface, CDP is the only viable path. | author-won |
| 3 | evidence | "30 seconds to launch" — is this based on measurement or hope? | Breakdown: 3s to browse dirs + 2s to tap launch + 10-15s for Antigravity to start + 5s for CDP connect ≈ 25s. The 30s target is realistic. | author-won |
| 4 | scope | "No automated testing" in out-of-scope — risky for a personal tool with process management. | Valid concern, but for a personal tool with manual verification, the risk is acceptable. Process management edge cases will be caught through regular use. Adding testing infra later is straightforward. | author-won |
| 5 | security | LAN-only binding is not sufficient if the LAN is untrusted (e.g., coffee shop WiFi). | V1 had optional token relying on network security, but this is insufficient — shared LANs (home, office) expose sessions to other devices. Mandatory auth token required for all access. | challenger-won |
| 6 | longevity | Single-session JSON state file could lose data on crashes. | For a personal tool managing a handful of sessions, JSON is adequate. Session state is transient (it's process PIDs + ports), so loss on crash means stale entries, not data loss. Stale entries are cleaned on startup. | author-won |

### Challenge Summary

- **Challenges raised**: 6
- **Author victories**: 5
- **Challenger victories**: 1 (revision applied)
- **Escalated**: 0
- **Overall verdict**: ACCEPTED (with revision)

### Revisions Made

- **Rev 1 (v2)**: Changed auth from optional to mandatory. Token is auto-generated on first startup, persisted to `~/.config/ag-session-manager/auth_token`. Auth always enforced on all API endpoints.
- **Rev 2 (v2)**: Added Quick Playground mode — sessions can be created without a directory; server creates a temp directory in `/tmp/ag-playground-<id>`.
- **Rev 3 (v3)**: Chat rendering changed from pixel screenshots to scrollable DOM snapshots with dark mode CSS and phone-to-desktop scroll sync.
- **Rev 4 (v3)**: Added screencast streaming infrastructure (`Page.startScreencast`) as alternative transport.
- **Rev 5 (v3)**: Directory browser enhanced: cross-volume symlink support, `$HOME`/`~` expansion in `BROWSE_ROOTS`.
- **Rev 6 (v4)**: Chat rendering upgraded from raw DOM snapshot to structured message extraction + native rendering (G6). Replaces CSS override "whack-a-mole" with typed message blocks rendered by app's own design system. Fixes broken images, subagent rendering, and non-functional artifact/file links.

## Notes

- Brainstorming session: `brainstorming_session.md` (30 raw ideas, top 5 scored, SCAMPER analysis)
- Reference project: [antigravity_phone_chat](https://github.com/krishnakanthb13/antigravity_phone_chat)
- Core CDP functions adapted from reference project's `server.js`
