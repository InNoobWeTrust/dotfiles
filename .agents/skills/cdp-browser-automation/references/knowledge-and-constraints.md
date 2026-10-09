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

- **Reuse the CLI** — [terminal-browser](terminal-browser.md) is the default; do not build a CDP class, session manager, or browser MCP for ordinary interaction.
- **Explicit targets** — pin the browser and tab from current inventory; let terminal-browser manage its connection and agent-browser session.
- **Bounded recovery** — classify transient vs fatal failures; check whether an in-flight action committed before retrying. Do not build a retries framework.
- **No config system** — parameterize only what changes; do not turn one task into a browser framework.
- **Capability-specific exceptions** — use raw CDP only under the [Chrome exception gate](chrome-connect.md), and reuse an approved tool before adding helpers.
- **The code is the doc** — short, readable helpers over documented complex ones
- **Safe Chrome exceptions** — isolated task-owned profile, loopback-only debugging, bounded readiness/navigation timeouts, and no personal-session reuse. Chrome launch flags are not default prerequisites.

> *"The less you build, the more it works."*
> Model capability scales with better models. Framework complexity doesn't shrink.
