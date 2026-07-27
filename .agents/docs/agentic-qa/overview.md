# The Most Important Takeaways

If this entire guide had to collapse into 6 points:

1. **Agentic QA is not a replacement for the test pyramid, trophy, or quality gates** — it rides on top of them.
2. **Pre-agentic automation already solved the hard problems of cost, speed, flakiness, and portfolio balance.** Agents that ignore that history re-create ice-cream cones and brittle record-playback.
3. **Separate judgment from execution from mechanics.** Review decides risk; orchestration produces evidence; browser/tool control only drives the machine.
4. **Evidence beats vibes.** Every claim needs pass / fail / **unverified**, with browser, viewport, and artifact context — never map unverified to pass.
5. **Materialize only what is stable.** Exploratory agent runs are cheap; durable E2E suites are expensive. Promote deliberately.
6. **Treat any skill pack (including this repo's) as a draft implementation of the mental model** — incomplete and not battle-tested until your team measures it.

---

## The problem this solves

Part 1 taught: AI is a junior engineer; rules and skills guide behavior; quality gates are non-negotiable.

Part 2 taught: place tools by quality *layer* (format → lint → type → test → risk → governance), not by brand.

**Part 3 answers the next question:**

> When the junior can also *drive a browser*, *write scenarios*, and *file a report* — how do you keep QA honest?

Teams currently sit in one of these states:

1. **No automated QA culture** — manual click-throughs, agent "looks fine" reviews.
2. **Classic automation only** — solid pyramid, but no way to use agents for exploratory or evidence work.
3. **Agent theater** — screenshots and prose without contracts; unverified treated as green.
4. **Skill cargo-cult** — copy a repo's QA skills and treat them as industry standard.

This section builds the mental model that avoids all four.
