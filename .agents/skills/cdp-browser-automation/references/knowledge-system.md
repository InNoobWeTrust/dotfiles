# Knowledge System for CDP Browser Automation

Every time you figure out something non-obvious about a site or a UI mechanic,
crystallize it. The next run should not rediscover what was already found.

---

## Two-Tier Taxonomy

### Tier 1 — Universal Interaction Knowledge (cross-site)

Mechanics that work identically across every website. Add to or extend existing
files under `references/` inside this skill. Do not create a new skill directory.

Belongs here if it answers: *"How do I do X in the browser regardless of which
site I'm on?"*

Examples:
- Traversing a cross-origin iframe via CDP Target attach
- Piercing shadow DOM with JS evaluation
- Intercepting file download events before they trigger the OS dialog
- Handling `alert` / `confirm` / `beforeunload` dialogs
- Scrolling inside an overflow container vs scrolling the page itself
- Drag-and-drop via `Input.dispatchMouseEvent` event sequence
- Reading/writing cookies via `Network.getAllCookies` / `Network.setCookies`

**Rule**: never contains site-specific selectors, URLs, or domain names.

### Tier 2 — Domain Knowledge (site-specific)

What the next agent needs to know to complete a task on a **specific site** in
1–3 calls rather than exploratory attempts. Store as a markdown file at
`references/domains/<site>.md` inside this skill. Do not create a new skill
directory or subdirectory outside `references/`.

Belongs here if it answers: *"What do I need to know before touching this site?"*

| Worth capturing | Example |
|----------------|---------|
| URL patterns and required query params | `?lang=en` required — UI glitches without it |
| Private API endpoints | `POST /api/v2/search` with exact payload shape and auth header |
| Stable selectors | `[data-testid="submit"]`, `[aria-label="Send"]` |
| Framework quirks | "React combobox — type to filter, then ArrowDown+Enter to select" |
| Required waits beyond `readyState` | "Wait for `[data-loaded]` — spinner dismisses before data renders" |
| Anti-bot / consent traps | "Consent overlay on cold sessions — dismiss before any form interaction" |
| URL shortcuts | Direct deep-link that skips 3 intermediate redirect pages |
| HTTP API shortcuts | Endpoint that replaces entire UI flow when called directly |

---

## Contribution Protocol

After every non-trivial task, ask:

> **"What would the next agent need to know to solve this in 1–3 calls?"**

If the answer is non-trivial, write it before you finish. Default to contributing.
If figuring it out cost you steps, the next run should not pay the same tax.

Write to an existing `references/` file when the content fits. Create a new file
only when no existing file is the right home. Never create new directories outside
of `references/` or `assets/`.

### The Three Gates — never write these

1. **No raw pixel coordinates** — `click(342, 891)` breaks on every viewport
   and zoom change. Describe *how to locate* the target (selector, visible text,
   aria-label, scroll-into-view strategy) — never where it happened to be.

2. **No run narration** — not "I clicked the button and then waited 2 seconds".
   Write declarative, conditional knowledge only:
   *"When modal is open, click `[role=dialog] button[aria-label=Close]`"*

3. **No secrets or PII** — no emails, session tokens, auth cookies, bearer
   tokens, or user-specific identifiers. These files are shared, persistent
   knowledge — not session logs.

---

## Domain File Template

Use this shape when filing a new `references/domains/<site>.md`:

```markdown
# <site> — <topic>

## URL Patterns
- Entry: `https://site.com/path?required=param`
  (note: param is required — omitting it causes X)
- API: `POST https://site.com/api/v2/resource`
  Body: `{"key": "value", "cursor": null}`
  Auth: `Authorization: Bearer <value of cookie 'session'>`

## Stable Selectors
- Search input:   `[data-testid="search-input"]`
- Result list:    `[role="list"] > [role="listitem"]`
- Submit button:  `button[type="submit"]`
  (avoid `.btn-primary-abc123` — auto-generated, changes each deploy)

## Framework Quirks
- Dropdown is a React combobox: click input → type to filter →
  ArrowDown to highlight → Enter to commit.
  Clicking the option div directly does NOT commit the selection.
- Form uses a custom submit event, not native — do not wait for
  page reload; instead wait for `[data-status="success"]`.

## Required Waits
- After search submit: `wait_for_selector("[data-testid='results-loaded']")`
  `readyState == complete` fires before the async data fetch completes.

## Traps
- Consent overlay present on cold sessions: `[id="gdpr-overlay"]`
  must be dismissed before any form interaction is possible.
- Pagination cursor expires after 5 min — re-fetch from page 1
  if there is a gap between page loads.
- Legacy IDs (numeric) in URLs were deprecated; use slugs now.
```

---

## File Lifecycle

- **Versioning**: update the file when behavior changes; note the change in a
  `## Changelog` section at the bottom.
- **Marking stale**: if content is wrong or incomplete, note the reason —
  *"Step 3 fails because the overlay was removed after 2026-01 redesign"*.
  A reason is what makes a correction useful; a bare "broken" is not.
- **Retirement**: if a file is consistently wrong across multiple attempts,
  archive it or delete it rather than letting it mislead future runs.
- **Merging**: when two domain files for the same site overlap, merge them — one
  source of truth per domain/topic.
