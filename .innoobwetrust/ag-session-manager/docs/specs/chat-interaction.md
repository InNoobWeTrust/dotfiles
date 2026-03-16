# Feature: Chat Interaction

> **Status**: revised (v3)
> **Owner**: InNoobWeTrust
> **Created**: 2026-03-16
> **Revised**: 2026-03-16 — DOM snapshot rendering, scroll sync, screencast, **native chat renderer (V2)**

## Parent TRD

`docs/trds/ag-session-manager.md` — CDP Bridge component, Chat Interaction API

## Description

Render Antigravity chat content natively on mobile. The server extracts structured
message data from the Antigravity DOM via CDP (`extractMessages()`), returning
typed message blocks (text, code, image) with user/assistant role classification.
The client renders these blocks using the app's own design system — no foreign CSS
enters the page. Images are converted to base64 data URIs in-browser before sending.

The V1 DOM snapshot approach (`captureSnapshot()`) is retained as a fallback for
non-chat views but is no longer the primary chat rendering mechanism.

Screencast streaming (`Page.startScreencast`) remains available as an alternative
transport.

## User Stories

- As a **developer**, I want to **see the current conversation on my phone**, so that **I can monitor AI progress**.
- As a **developer**, I want to **send messages from my phone**, so that **I can steer the AI remotely**.
- As a **developer**, I want to **switch modes and models from my phone**, so that **I can adjust AI behavior**.

## Scenarios

### Scenario: Get structured chat messages

- **Given** session "abc-123" is running and CDP is connected
- **When** I GET `/api/sessions/abc-123/messages`
- **Then** the response contains `{messages, isGenerating, hash}`
- **And** each message has `role` ("user" or "assistant") and `blocks` array
- **And** text blocks contain cleaned HTML (scripts stripped, interaction areas removed)
- **And** code blocks contain `language` and `content` fields
- **And** image blocks contain base64 data URI `src` (converted from local file paths in-browser)
- **And** `hash` is an MD5 of message content for change detection

### Scenario: Messages when CDP is disconnected

- **Given** session "abc-123" exists but CDP is not connected
- **When** I GET `/api/sessions/abc-123/messages`
- **Then** the response status is 503
- **And** the body contains: "CDP not connected"

### Scenario: Generating indicator

- **Given** session "abc-123" is running and AI is generating a response
- **When** I GET `/api/sessions/abc-123/messages`
- **Then** `isGenerating` is `true`
- **And** the client renders a pulsing dot animation with "Thinking..." text

### Scenario: Client renders user messages as right-aligned bubbles

- **Given** the `/messages` response contains a message with `role: "user"`
- **When** the client renders the messages
- **Then** the message appears as a right-aligned indigo gradient bubble
- **And** a "You" label is shown above the bubble

### Scenario: Client renders assistant messages as left-aligned cards

- **Given** the `/messages` response contains a message with `role: "assistant"`
- **When** the client renders the messages
- **Then** the message appears as a left-aligned glass card with border
- **And** an "Assistant" label is shown above the card

### Scenario: Code blocks render with copy button

- **Given** a message contains a block with `type: "code"`
- **When** the client renders the message
- **Then** the code block has a dark background header showing the language
- **And** a "Copy" button is present in the header
- **And** tapping "Copy" copies the code content to clipboard
- **And** the button text changes to "Copied" for 2 seconds

### Scenario: Images render inline with lightbox

- **Given** a message contains a block with `type: "image"`
- **When** the client renders the message
- **Then** the image is displayed inline with border radius
- **And** tapping the image opens a full-screen lightbox overlay
- **And** tapping the lightbox overlay closes it

### Scenario: Get snapshot of active session (V1 fallback)

- **Given** session "abc-123" is running and CDP is connected
- **When** I GET `/api/sessions/abc-123/snapshot`
- **Then** the response contains `{html, css, scrollInfo, hash}` with sanitized DOM content

### Scenario: Snapshot when CDP is disconnected

- **Given** session "abc-123" exists but CDP is not connected
- **When** I GET `/api/sessions/abc-123/snapshot`
- **Then** the response status is 503
- **And** the body contains: "CDP not connected"

### Scenario: Send message to session

- **Given** session "abc-123" is running and CDP is connected
- **When** I POST `/api/sessions/abc-123/send` with `{"message": "explain this code"}`
- **Then** the response status is 200
- **And** the message is injected into the Antigravity input field via CDP

### Scenario: Stop generation

- **Given** session "abc-123" is running and AI is generating
- **When** I POST `/api/sessions/abc-123/stop-gen`
- **Then** the stop button is clicked via CDP

### Scenario: Get current mode and model

- **Given** session "abc-123" is running in "Fast" mode with "Gemini" model
- **When** I GET `/api/sessions/abc-123/state`
- **Then** the response contains `{mode: "Fast", model: "Gemini"}`

### Scenario: Switch mode

- **Given** session "abc-123" is running in "Fast" mode
- **When** I POST `/api/sessions/abc-123/set-mode` with `{"mode": "planning"}`
- **Then** the mode selector is toggled to "Planning" via CDP

### Scenario: Start new chat in session

- **Given** session "abc-123" is running with an active chat
- **When** I POST `/api/sessions/abc-123/new-chat`
- **Then** a new chat is started in Antigravity via CDP

### Scenario: Scroll sync from phone to desktop

- **Given** session "abc-123" chat is displayed on the phone
- **When** I scroll to 50% of the chat on the phone
- **And** I POST `/api/sessions/abc-123/scroll` with `{"scrollPercent": 0.5}`
- **Then** the desktop Antigravity window scrolls to 50% of the chat

### Scenario: Screencast streaming (alternative transport)

- **Given** session "abc-123" is running and CDP is connected
- **When** a WebSocket client sends `{"type": "subscribe", "sessionId": "abc-123"}`
- **Then** the server starts `Page.startScreencast` on the CDP bridge
- **And** forwards JPEG frames to subscribed WebSocket clients
- **When** the client sends `{"type": "unsubscribe"}`
- **Then** the server stops the screencast when no clients remain subscribed

## Validation Rules

### Server-side (CDP extraction)

- `extractMessages()` identifies chat container (`#conversation`, `#chat`, `#cascade`)
- Messages classified by role via data attributes, class names, or alternating heuristic
- Code blocks extracted from `<pre>` elements with language detected from `class="language-*"`
- Images converted to base64 data URIs in-browser via `fetch()` + `FileReader.readAsDataURL()`
- **Image size cap**: images exceeding 500KB return `{type: "image", src: null, alt: "Image too large", originalSrc: "..."}` placeholder
- Scripts stripped from text content
- Content hash (MD5) computed server-side for change detection
- **Extraction failure**: if extraction returns 0 messages but chat container has content, response includes `extractionFailed: true`
- Snapshot (V1) retains: interaction area stripping, inline div fixing, base64 image conversion

### Client-side (native rendering)

- Client polls `/api/sessions/:id/messages` at 1-second interval
- Hash-based change detection avoids unnecessary re-renders
- User messages: right-aligned, indigo gradient bubble, "You" label
- Assistant messages: left-aligned, glass card with border, "Assistant" label
- Code blocks: dark bg, language label, copy button with clipboard API
- Images: inline, tap-to-zoom lightbox; oversized images show "Image too large" placeholder
- Generating indicator: pulsing dots animation when `isGenerating` is true
- **Extraction failure**: if `extractionFailed` is true, show "Unable to parse chat" message
- Smart scroll: auto-scroll to bottom when user is near bottom, preserve position when scrolled up
- Scroll lock: 3-second lock after manual scroll to prevent auto-scroll fighting
- No foreign CSS: all styling uses app's design system tokens

## Out of Scope

- ~~Structured text extraction from DOM~~ → moved to active scenarios in v3
- Task boundary / subagent step extraction (V3)
- Artifact and file change cards (V3)
- Typing indicator with token-level streaming
- Code execution or terminal access

## Dependencies

- `docs/specs/session-management.md` — Session must exist and be running

## ⚔ Challenge Gate

> **Status**: passed (with revisions)
> **Challenger**: AI (self-challenge, v3 round)
> **Date**: 2026-03-16

### Debate Record

| # | Vector | Challenge | Response | Verdict |
|---|--------|-----------|----------|---------|
| 1 | edge cases | 1-second polling is aggressive. What if the server has 10 sessions? | Only the active session (currently viewed) is polled. Dashboard doesn't poll snapshots. | author-won |
| 2 | assumptions | DOM selectors for mode/model switching depend on Antigravity's UI structure. If it changes, everything breaks. | Accepted risk — same as reference project. Selectors can be updated. For a personal tool, this is manageable. | author-won |
| 3 | alternatives | Why DOM snapshots instead of pixel-level screenshots? Screenshots are simpler. | Screenshots are static images — no scrolling, no text selection, no copy. DOM snapshots render as native HTML on the phone, enabling scrolling, text selection, and copy buttons on code blocks. | author-won |
| 4 | assumptions | `extractMessages()` relies on heuristic DOM discovery (class names, data attributes, alternating pattern). If Antigravity updates its DOM structure, extraction breaks silently — returning empty or incorrectly classified messages with no error. | Valid concern. Add fallback: if `extractMessages()` returns 0 messages but the page has content (non-empty chat container), return an error flag `extractionFailed: true` so the client can show a meaningful "Unable to parse chat" message instead of blank screen. Also add debug logging toggle for DOM discovery. | challenger-won |
| 5 | edge cases | Base64 encoding every image in-browser can produce massive response payloads. A chat with 10 screenshots could be 50+ MB per poll cycle, causing timeouts and memory pressure on mobile. | Valid. Add `maxImageSize` threshold (default 500KB per image). Images exceeding the threshold return `{type: "image", src: null, alt: "Image too large", originalSrc: "..."}` as a placeholder with a link. Also: only re-encode images that changed (hash-check per image). | challenger-won |
| 6 | longevity | Retaining the V1 snapshot code path alongside V2 messages adds maintenance burden. Two rendering paths means two sets of bugs. Under what conditions does the client actually use the V1 path? | V1 snapshot endpoint is retained as API but the client no longer calls it — the SPA uses only `/messages`. The snapshot endpoint stays for potential future non-chat-view use or debugging. No dual rendering in the client. | author-won |
| 7 | scope | The spec mixes server API concerns (scenarios 1-3) with client UI rendering concerns (scenarios 4-7). These are different layers — should they be in one spec? | For a small personal project with 4 source files, splitting into separate specs adds overhead without value. The spec covers one feature end-to-end: extracting and rendering chat messages. If the project grows, splitting would be warranted. | author-won |

### Challenge Summary

- **Challenges raised**: 7 (3 from v2, 4 new in v3)
- **Author victories**: 5
- **Challenger victories**: 2 (revisions applied)
- **Escalated**: 0
- **Overall verdict**: ACCEPTED (with revisions)

### Revisions Made

- **Rev 1 (v2)**: Added scroll sync API (`POST /api/sessions/:id/scroll`) — phone scroll position synced to desktop Antigravity
- **Rev 2 (v2)**: Added screencast streaming infrastructure (`Page.startScreencast`) as alternative transport via WebSocket
- **Rev 3 (v2)**: Snapshot now returns `scrollInfo` object alongside `html`, `css`, `hash`
- **Rev 4 (v2)**: Dark mode CSS overrides and mobile copy buttons added to client-side rendering
- **Rev 5 (v3)**: Replaced DOM snapshot as primary chat rendering with structured message extraction (`extractMessages()`) + native rendering. New `GET /api/sessions/:id/messages` endpoint. Client renders typed message blocks (text, code, image) using app's design system. DOM snapshot retained as V1 fallback.
- **Rev 6 (v3, challenge)**: Added `extractionFailed` flag to `/messages` response when extraction returns 0 messages but page has content. Client shows "Unable to parse chat" message instead of blank screen.
- **Rev 7 (v3, challenge)**: Added `maxImageSize` threshold (500KB). Images exceeding it return placeholder with original URL instead of base64. Prevents response bloat on image-heavy chats.
