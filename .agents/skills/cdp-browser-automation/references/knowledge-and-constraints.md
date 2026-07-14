# knowledge-and-constraints

## Knowledge System

Every non-trivial discovery about a site or interaction mechanic should be
crystallized so the next run does not rediscover it. Store discoveries as
markdown files — never create separate skill files.

- **Universal mechanics** (iframe attach, shadow DOM, dialog handling): add to
  `references/` inside this skill's directory. Never site-specific.
- **Site-specific facts** (URL patterns, stable selectors, framework quirks,
  required waits, anti-bot traps): add a file under `references/domains/<site>.md`
  or `assets/` if screenshots/HAR captures are relevant.

After every non-trivial task, ask: *"What would the next agent need to know to
solve this in 1–3 calls?"* If the answer is non-trivial, write a markdown file
before you finish. Do not create new skill directories — extend existing
`references/` files or add a new one inside this skill.

See [`knowledge-system.md`](knowledge-system.md) for the
contribution protocol, three gates, domain file template, and lifecycle rules.

---

## Design Constraints (keep your implementation clean)

- **No retries framework** — wrap individual CDP calls with `try/except + sleep`;
  classify errors (transient: retry with backoff; fatal: surface to caller and stop)
- **No session manager** — reconnect is two lines: `websockets.connect` +
  `Target.attachToTarget`; if a websocket drops mid-flow, check whether the
  in-flight action committed before reconnecting
- **No config system** — hardcode what you know, parameterize only what changes
- **Minimal abstraction** — a 200-line CDP class is sufficient for 95% of tasks;
  add helpers as you discover you need them, not upfront
- **The code is the doc** — short, readable helpers over documented complex ones
- **Safe Chrome defaults** — always pass `--no-first-run --disable-infobars
  --disable-notifications --disable-translate --disable-extensions` to suppress
  overlays; set a navigation timeout; never run headless without `--headless=new`
  on Chrome 112+

> *"The less you build, the more it works."*
> Model capability scales with better models. Framework complexity doesn't shrink.
