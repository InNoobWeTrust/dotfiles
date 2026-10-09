# Browser Operational Loop

Default mechanics and exact command examples live in [terminal-browser](terminal-browser.md). This loop applies to both that default and authorized Chrome exceptions.

## Observe → act → verify → recover

Every meaningful action follows this pattern — never skip verification:

1. **Orient:** confirm the pinned browser/tab and URL; inspect a compact snapshot. Inspect a fresh screenshot when layout, overlays, canvas, or visual correctness matters.
2. **Act:** use the CLI's normal click/fill/keyboard/navigation operation on the intended control. Keep action authority separate from tool availability.
3. **Verify:** wait for the expected visible state, then inspect it. A command exit code alone does not prove a form submitted, a menu opened, or an error appeared.
4. **Recover:** if the expected state is absent, re-observe and classify the failure. Retry only an understood transient failure within a bound; first check whether a non-idempotent action already committed.

## Decision table

| Situation | Default approach |
|---|---|
| Unknown page state | Pinned `snapshot -i`; screenshot + image inspection for appearance |
| Standard HTML controls | CLI `click`/`fill` with current refs, then verify |
| Canvas or otherwise unreachable target | Fresh screenshot; supported coordinate input only when necessary, then verify |
| Read page content | Targeted `eval` or CLI read command; no full DOM dump |
| Static page or known API, no interaction to prove | Existing HTTP/fetch tool; no browser needed |
| Auth wall | Stop unless sanctioned test auth/bootstrap is available; never harvest user sessions |
| Missing CLI command or capability | Check installed help; report the exact gap, not a new default CDP class |
| Chrome performance/CWV/leak diagnosis | Capability-specific exception; [performance diagnostics](performance-diagnostics.md) |

## Tabs and concurrent agents

- Inventory the current terminal with `terminal-browser ls --json`; pin `--browser` and `--tab` on each action. Do not follow whichever tab is active.
- Create a separate task tab when needed; re-inventory after creating, closing, or navigating a tab and refresh element refs. `action -- open URL` creates a tab in v0.13.4: do not assume it navigates the pinned tab in place.
- Do not overwrite or close user tabs. Release only your browser's ownership indicator; never stop the shared daemon as task cleanup.
- For an authorized raw-CDP exception, use explicit page targets and agent-owned tabs; [CDP snippets](cdp-snippets.md) cover target attachment.

## DOM complexity

- **Iframes:** the main document cannot directly read a cross-origin frame. Check the CLI's supported frame targeting before resorting to coordinates; do not claim coordinates are the only way. If a required operation is unsupported, report that capability gap.
- **Shadow DOM:** use supported semantic targeting or a scoped read of an open shadow root. Do not bypass a tested interaction with a programmatic DOM click without documenting the deviation.
- **Dialogs:** inspect and use the CLI's supported dialog commands; do not blindly accept destructive confirmations. Document automatic dialog handling when the scenario depends on it.
- Chrome-specific frame/dialog handling stays in [CDP snippets](cdp-snippets.md) and is not a routine prerequisite.

## Waits

Prefer a bounded wait for an expected visible selector, text, URL, or application state. `document.readyState` and network-idle heuristics alone do not establish SPA readiness. Do not use a fixed sleep as proof of completion. Consult the installed CLI for timeout options instead of guessing flags.

## Failure modes and stops

| Failure | Response |
|---|---|
| Click succeeded but outcome is absent | Inspect state and expected UI; do not continue on command success alone |
| Stale ref or changed selector | Take a fresh snapshot; use semantic attributes or stable test IDs |
| Layout moved | Re-screenshot and re-derive coordinates; never persist them as durable selectors |
| Wrong browser/tab or missing terminal context | Stop ambiguous actions; obtain the intended selectors/context |
| Sandbox, pane, or socket denial | Report the boundary; do not bypass it or enable Chrome silently |
| Required viewport/engine/artifact unavailable | Mark affected claims blocked/unverified; authorize a specialist path if needed |
| CAPTCHA/anti-bot wall | Stop and report; no solving, bypassing, or challenge-retry tactics |
| Secrets in capture/logs | Restrict/redact before sharing; remove agent-created ephemeral captures after use |
| Approved Chrome exception loses connection | Confirm the endpoint/profile, reconnect and reattach; check whether the in-flight action committed before retrying |

Keep page state concise. Saved screenshots can be read with image-capable tools; a path alone is not visual evidence. Prefer approved `$TMPDIR` scratch for internal captures, and the declared access-controlled artifact root for requested QA evidence. Store only non-sensitive reusable facts under the [knowledge gates](knowledge-system.md).

## HTTP without a browser

Use an existing HTTP/fetch capability for static content and known APIs when rendered interaction is unnecessary. Respect rate limits and target authorization. Do not substitute API checks for a user journey that specifically requires browser evidence. Any temporary scripts stay outside the repo and run through the sandbox; there is no default custom browser/HTTP framework to build.
