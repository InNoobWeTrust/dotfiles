# Speaker Notes — ai-quality-tooling-vi.md

**Audience**: mixed legacy enterprise teams — developers, leads, architects, some management  
**Target duration**: 20–30 minutes  
**Presentation goal**: teach a **mental model for tooling fit** first, then give **practical baselines** people can adapt to their own repos.

---

## Delivery Strategy

This workshop should **not** sound like:
- a vendor pitch
- a random list of tools
- “this is my personal stack, everyone copy it”

It **should** sound like:
- a practical framework
- rooted in mixed enterprise reality
- respectful of legacy systems
- open-source-first, with enterprise escalation paths

Core line to repeat several times:

> “The point is not to memorize my tool list. The point is to understand which layer a tool belongs to, and whether it fits your codebase.”

---

## Slide-by-Slide Notes

## Slide 1 — Title

**What to say**
- This is part 2 of the AI development workshop.
- Part 1 was about rules, skills, and quality gates.
- Part 2 is about the tooling layer that makes those gates real.

**Transition line**
> “If rules are policy, tools are instrumentation.”

---

## Slide 2 — Recall from previous deck

**What to say**
- AI is fast, productive, useful.
- But AI is still a junior engineer in terms of judgment.
- That means we need system-level guardrails, not just better prompting.

**Point to reinforce**
- The previous deck defined why quality discipline matters.
- This deck defines how to operationalize it.

---

## Slide 3 — Goals

**What to say**
- Today’s goal is not to choose the same tools for every team.
- It is to give a framework for tool selection.
- Then we anchor that framework with real baseline suggestions.

**Optional audience calibration question**
- “How many of you are working in repos older than 3 years?”
- “How many of you have more than one language across your portfolio?”

---

## Slide 4 — Common mistake

**What to say**
- Most quality-tool talks fail by becoming a catalog.
- People leave remembering 3–4 brand names and nothing about fit.
- That doesn’t help a Java monolith team, a legacy jQuery app, or a .NET portfolio leader decide anything.

**Key phrase**
> “A tool name without a mental model is just trivia.”

---

## Slide 5 — Why AI increases tooling importance

**What to say**
- AI increases throughput.
- Throughput amplifies both good and bad practices.
- So the faster code appears, the more valuable fast machine-checkable feedback becomes.

**Emphasize**
- local feedback for developers and agents
- CI feedback for teams
- governance feedback for leadership

---

## Slide 6 — Quality layers overview

**What to say**
- This is the core slide of the whole workshop.
- Every tool we discuss later belongs to one or more of these layers.
- This is how to reason about fit, overlap, and missing coverage.

**Facilitation tip**
Pause briefly and say:
> “If you remember only one slide, remember this one.”

---

## Slide 7 — Layers 1–3: inner loop

**What to say**
- Formatting removes noise.
- Static rules catch maintainability problems.
- Type/compile checks catch “looks okay, actually wrong” code.

**AI-specific angle**
- AI often generates code that is syntactically plausible but semantically shaky.
- Type and compile checks are disproportionately valuable in AI workflows.

---

## Slide 8 — Layers 4–7: evidence and risk

**What to say**
- Tests prove behavior.
- Dependency scans prove you are not shipping known vulnerable components.
- Secret scanning protects the repo and pipeline.
- SAST catches security issues that style/type tools will never catch.

**Optional punchline**
> “No single scanner gives you all four of these.”

---

## Slide 9 — Governance layers

**What to say**
- This is where management starts caring.
- Not because management wants lint warnings.
- Because management wants to know whether risk, debt, and regressions are increasing or under control.

**Key idea**
- Metrics are not the first layer.
- Metrics become useful after the lower layers are credible.

---

## Slide 10 — Two loops

**What to say**
- This is the second core mental model.
- Fast local loop and slower governance loop have different needs.
- If you force one tool to do both perfectly, you usually get a bad compromise.

**Example lines**
- ESLint/Ruff are great local loop tools.
- Sonar is great at governance.
- That doesn’t mean one replaces the other.

---

## Slide 11 — Sonar positioning

**What to say**
- Sonar is powerful when you need quality gates, PR decoration, coverage, duplication, maintainability, and dashboards together.
- It is especially good at new-code discipline.
- That makes it attractive for legacy environments because it avoids the “fix everything first” trap.

**Caution**
- Don’t oversell Sonar as the whole answer.

---

## Slide 12 — What Sonar does not replace

**What to say**
- Teams often misunderstand governance platforms.
- A governance platform is not a substitute for native fast feedback tools.
- If the local loop is painful, the platform will only surface pain later.

**Good phrasing**
> “If the repo has no discipline, Sonar becomes an expensive mirror.”

---

## Slide 13 — Key alternatives

**What to say**
- Semgrep: strong OSS-first polyglot scanning and custom rules.
- CodeQL: deeper GitHub-native code scanning for supported languages.
- Dependency-Track: SBOM and supply-chain portfolio governance.
- scc: lightweight metrics, complexity, hotspots, cost discussion.
- Trivy: broad all-in-one scan surface.

**Important note**
- This is not a ranking.
- It is a map of roles.

---

## Slide 14 — Java baseline

**What to say**
- Java teams should not ignore mature tools just because they are older.
- Checkstyle, PMD, SpotBugs, Error Prone, and OWASP Dependency-Check still matter.
- Java quality ecosystems are some of the most battle-tested in enterprise software.

**If time is tight**
Summarize as:
- conventions
- maintainability
- bug-finding
- dependency security
- governance

---

## Slide 15 — .NET baseline

**What to say**
- In .NET, many teams underuse what the platform already gives them.
- Built-in analyzers plus SDK-style projects already provide a strong baseline.
- NDepend becomes interesting when you want deeper architecture, debt, and reporting.

**Good contrast line**
> “In Java, you compose mature point tools. In .NET, the platform itself already gives you more baseline help.”

---

## Slide 16 — Legacy JS / vanilla web baseline

**What to say**
- This slide is important because many people assume old frontend stacks are not worth improving.
- That’s false.
- You can get meaningful gains with Prettier/Biome, ESLint, Stylelint, dependency scanning, and Retire.js.

**Audience empathy line**
> “You do not need a React migration to have a quality baseline.”

---

## Slide 17 — Python baseline

**What to say**
- Python gets big wins from speed.
- Ruff is often the easiest fast win.
- Then type checking becomes critical because dynamic code plus AI assistance can hide subtle correctness issues.
- pip-audit is a low-friction CI improvement.

**Optional nuance**
- Mention `ty` as a fast emerging option, while still acknowledging pyright/mypy maturity.

---

## Slide 18 — OSS-first maturity path

**What to say**
- This is the rollout recommendation.
- Start with repo-level baseline.
- Then standardize CI.
- Then add governance platforms.
- Not the other way around.

**Phrase to reinforce**
> “Adoption before purity.”

---

## Slide 19 — Legacy rollout advice

**What to say**
- If you turn on full strictness in an old repo, people will reject the process, not the findings.
- New-code gating is usually the right compromise.
- Baselines, ignores, and gradual severity increases are not cheating; they are rollout mechanics.

---

## Slide 20 — Management metrics

**What to say**
- Management should see system indicators, not raw tool noise.
- The right metrics help prioritize decisions.
- The wrong metrics create defensive behavior.

**Emphasize**
- new code gate pass rate
- critical/high vulns
- secrets incidents
- coverage on new code
- complexity/duplication trend

**Warn against**
- LOC as performance metric
- raw issue counts across unrelated teams

---

## Slide 21 — Closing

**What to say**
- The most important thing is not the tool brand.
- The most important thing is understanding which quality layer you are trying to satisfy.
- Once that is clear, choosing or replacing tools becomes far easier.

**Closing line**
> “Don’t ask for the best tool. Ask for the best fit for your layer, your stack, your loop, and your governance need.”

---

## Suggested Timing

| Section | Approx time |
|---|---:|
| Context + recall | 3 min |
| Mental model + two loops | 7 min |
| Sonar + alternatives | 4 min |
| Stack baselines | 8 min |
| Rollout + management metrics + close | 5 min |
| Buffer / audience questions | 3 min |

Total: ~30 min

For a 20-minute version:
- reduce Java/.NET/Python/JS baselines to 1 minute each
- spend most time on mental model + Sonar positioning

---

## Optional Demo Ideas

### Demo path A — local loop
- show formatter
- show linter
- show type/build check
- explain why AI should see these before PR

### Demo path B — risk layer
- show secret scan catching fake token
- show dependency scanner finding known vuln
- show one SAST issue example

### Demo path C — governance
- show a Sonar/Dependency-Track/scc style report screenshot
- explain what management can learn from it

### Demo rule
Do **not** demo too many tools live. One narrow story is better than six shaky demos.

---

## Q&A Prompts If Audience Is Quiet

- “Which layer is missing most often in your repos today?”
- “Who here has a governance platform but still weak local loop?”
- “Which stack in your org would be hardest to standardize first?”
- “Would your team benefit more from better local tooling or better portfolio visibility?”

---

## Related Material

- Main guide: `../quality-tooling-for-ai-projects.md`
- Stack baselines: `../quality-tooling-stack-baselines.md`
- Comparison matrix: `../quality-tooling-comparison-matrix.md`
- Slide deck: `./ai-quality-tooling-vi.md`
- Foundation deck: `./ai-agents-intro-vi.md`
