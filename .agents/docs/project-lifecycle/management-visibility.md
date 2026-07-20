# Management Visibility & Governance

### What Management Needs to See

The engineering process should be visible to non-technical leadership without requiring deep technical dives. Expose these dimensions:

### Quality Metrics Dashboard

Track quantifiable metrics that management can understand:

| Metric | What It Measures | Target |
|---|---|---|
| Complexity score | How hard is the code to maintain? | Below defined threshold |
| Function length | Are functions getting too large? | Max 50 statements |
| Dependency vulnerabilities | Are we shipping known-vulnerable packages? | Zero critical/high |
| Test coverage | Are we testing what we build? | Target 80%+ (adjust per project) |
| Build time | How long from commit to deployable artifact? | Under target threshold |

### Delivery Velocity

Track per sprint or month:

- Number of changes merged
- Average time from change submission to merge
- Number of quality gate failures caught pre-merge (leading indicator — catching issues early)
- Number of production incidents (lagging indicator — issues that slipped through)

### AI Usage Transparency

If management asks "what is the AI actually doing?" — have data:

| Metric | How to Track |
|---|---|
| Tasks completed with AI assistance | Count of short-term memory entries in `.agents/memory/short-term/` |
| AI-generated vs human-written code | Git author analysis |
| Quality of AI output | Review findings per AI-assisted change |
| AI cost | Token usage across providers, cost per task or sprint |
| Velocity impact | Compare sprint velocity before and after AI adoption |

### Process Documentation for Auditors

The `.agents/` directory IS your engineering process documentation. Point auditors to:

1. **`.agents/rules/`** — What rules govern code quality, testing, and AI behavior
2. **`docs/engineering/quality-gates.md`** — How quality is measured and enforced
3. **`AGENTS.md`** — How AI agents are constrained and governed
4. **`GLOSSARY.md`** — How domain terminology is controlled across the codebase
5. **`docs/delivery/verification/`** — Audit trails of verification runs

### Cost Tracking

Track these costs and report them to management:

- **AI provider costs:** Token usage per task, per sprint, per month
- **Infrastructure costs:** Cloud resources, databases, networking
- **Developer tooling costs:** CI/CD, code quality tools, security scanners

Management doesn't need per-token granularity. They need: "AI-assisted development costs approximately X per sprint and has reduced feature delivery time by Y%."

---
