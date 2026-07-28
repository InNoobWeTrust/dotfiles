# Vol 34 Blip Catalog — Agent & Quality Relevant

> Research leaf. Rings are Thoughtworks positions (April 2026).  
> Parent: [thoughtworks-radar-vol34.md](../thoughtworks-radar-vol34.md)

One-line operational takeaways only. Full blip text lives in the official PDF.

---

## Techniques

### Adopt

| # | Blip | Takeaway for this stack |
|---|---|---|
| 1 | Context engineering | Design the context pipeline (index → JIT load → compress); not prompt wording alone |
| 2 | Curated shared instructions | Ship AGENTS.md / rules / skills in service templates; stop personal prompt folklore |
| 3 | DORA metrics | Delivery flow + stability (+ rework rate) over AI LOC; team learning, not vanity dashboards |
| 4 | Passkeys | Auth product concern; out of agent-harness scope unless building identity |
| 5 | Structured output from LLMs | Default for programmatic consumers; schema + validate + retry |
| 6 | Zero trust architecture | Least privilege + continuous verify for agents; identity for agent workloads |

### Trial

| # | Blip | Takeaway for this stack |
|---|---|---|
| 7 | Agent Skills | Modular JIT instructions + scripts; supply-chain review third-party skills |
| 8 | Browser-based component testing | Real browser (e.g. Playwright) often beats jsdom for components now |
| 9 | Feedback sensors for coding agents | Wire lint/type/test (and stronger gates) into the *agent session*, pre-commit |
| 10 | Mapping code smells → refactorings | Explicit smell→technique maps for agents (esp. legacy stacks) |
| 11 | Mutation testing | Honest test quality signal vs hollow coverage; Stryker / PIT / cargo-mutants |
| 12 | Progressive context disclosure | Lightweight discovery index; load detail on demand (our skills/docs pattern) |
| 13 | Sandboxed execution for coding agents | Isolate FS/network/resources; Dev Containers, Bubblewrap, Sprites, etc. |
| 14 | Semantic layer | Shared metrics for BI + agents; reduce naive text-to-SQL lies |
| 15 | Server-driven UI | Product UI pattern; peripheral to harness quality |

### Assess

| # | Blip | Takeaway for this stack |
|---|---|---|
| 16 | Agentic RL environments | Model training path; not skill-author work |
| 17 | Architecture drift reduction w/ LLMs | Fitness functions (ArchUnit/Spectral/…) + LLM fix + verify loop |
| 18 | Code intelligence as agentic tooling | LSP/AST/codemod tools for renames/refs; cut token waste |
| 19 | Context graph | Decision/precedent graph memory; beyond static GraphRAG |
| 20 | Feedback flywheel | Retro the *harness* (skills + sensors) after sessions; human still steers |
| 21 | HTML Tools | Single-file shareable utilities; inspect before run |
| 22 | LLM eval via semantic entropy | Confabulation detection by meaning variation |
| 23 | Measuring collaboration quality | First-pass acceptance, iteration cycles, rework, review burden |
| 24 | MITRE ATLAS | AI/ML adversarial tactics taxonomy for threat modeling |
| 25 | Ralph loop | Fresh-context infinite iterate-to-spec; high token cost |
| 26 | Reverse engineering design systems | Multimodal extract tokens/components from legacy UI |
| 27 | Role-based contextual isolation in RAG | Filter retrieval by role metadata (zero-trust RAG) |
| 28 | Skills as executable onboarding | Skills replace/augment README + setup scripts |
| 29 | Small language models | Cost/latency for narrow agent steps |
| 30 | Team of coding agents | Small role-specific teams ≠ large swarms |
| 31 | Temporal fakes | Stateful time-evolving simulators for complex deps |
| 32 | Toxic flow analysis for AI | Map private-data × untrusted-content × external-action paths |
| 33 | VLMs for document parsing | End-to-end doc parse; hallucination risk remains |

### Caution

| # | Blip | Takeaway for this stack |
|---|---|---|
| 34 | Agent instruction bloat | Minimal coherent AGENTS.md; progressive skills beat mega-rules |
| 35 | AI-accelerated shadow IT | Govern noncoder agent workflows; sandboxes + catalogue |
| 36 | Codebase cognitive debt | Understanding lag vs change velocity; fitness + maps + sensors |
| 37 | Coding agent swarms | Dozens–hundreds of agents; costly, immature; strong spec/tests only |
| 38 | Coding throughput as productivity | LOC/PR counts distort behavior; use acceptance + DORA |
| 39 | Ignoring durability in agent workflows | Persist state for long/HITL workflows |
| 40 | MCP by default | Prefer good CLI first; MCP when protocol benefits win |
| 41 | Pixel-streamed dev environments | VDI for coding usually hurts flow; prefer remote compute without full desktop stream |

---

## Platforms (agent ops subset)

| # | Blip | Ring | Takeaway |
|---|---|---|---|
| 44 | Amazon Bedrock AgentCore | Trial | Managed runtime (isolation/obs) ≠ own orchestration |
| 45 | Graphiti | Trial | Temporal knowledge graph memory |
| 46 | Langfuse | Trial | OTEL-native LLM obs + evals + prompts (self-host complexity up in v3) |
| 50 | Agent Trace | Assess | Vendor-neutral AI code attribution spec |
| 63 | Sprites | Assess | Stateful sandbox + checkpoint/restore for agents |

---

## Tools (quality & harness subset)

| # | Blip | Ring | Takeaway |
|---|---|---|---|
| 66 | Axe-core | Adopt | a11y automation in CI; mandatory quality attribute in many jurisdictions |
| 67–68 | Claude Code / Cursor | Adopt | Coding agent hosts; need harness + tests + HITL |
| 70 | mise | Adopt | Toolchain + env + tasks; polyglot DX + supply-chain attestations |
| 71 | cargo-mutants | Trial | Rust mutation testing; zero-config; module-scoped locally |
| 72 | Claude Code plugin marketplace | Trial | Git-distributed skills/commands; reduce instruction drift |
| 73 | Dev Containers | Trial | Reproducible env + agent sandbox boundary |
| 77 | Agent Scan | Assess | Scan MCP/skills for injection, toxic flows, secrets (Snyk API tradeoff) |
| 78 | Beads | Assess | Git-backed agent task graph / durable work ledger |
| 81 | CodeScene | Assess | Behavioral hotspots + CodeHealth for AI-safe refactor zones |
| 83 | Entire CLI | Assess | Capture agent session transcripts next to git |
| 84 | Git AI | Assess | Line-level AI vs human authorship via Git notes |
| 88 | OpenSpec | Assess | Lightweight SDD (propose → apply → archive); brownfield deltas |
| 94 | ty | Assess | Fast Rust Python type checker (Astral); agent-friendly loop |
| 96 | WuppieFuzz | Assess | OpenAPI-driven REST API fuzzer with coverage feedback |
| 97 | OpenClaw | Caution | Hyper-personal assistant; permission-hungry / lethal trifecta |

---

## Languages & frameworks (agent/eval subset)

| # | Blip | Ring | Takeaway |
|---|---|---|---|
| 103 | Typer | Adopt | Type-annotated Python CLIs — good agent-facing tools |
| 104 | ADK | Trial | Google agent framework; crowded vendor field |
| 105 | DeepEval | Trial | RAG/agent metrics: hallucination, tool correctness, multi-turn |
| 108 | LangGraph | Trial (ex-Adopt) | Powerful graphs; not always default — lean agents often better |
| 109 | LiteLLM | Trial | Multi-provider gateway + cost/guardrails |
| 111 | Agent Lightning | Assess | Train/optimize agents without rewrite |
| 112 | GitHub Spec Kit | Assess | Spec → plan → tasks; constitution; watch instruction bloat |
| 115 | Superpowers | Assess | Skill pack: brainstorm → plan → TDD → debug → review |
| 117 | TOON | Assess | Token-efficient structured input encoding (last-mile prompts) |

---

## Ring legend (Thoughtworks)

- **Adopt** — use when appropriate  
- **Trial** — worth building capability on a risk-tolerant project  
- **Assess** — explore impact  
- **Caution** — significant concerns; careful evaluation  

This repo’s “adopt” decisions remain independent and gated by promotion rules in [research/INDEX.md](../../INDEX.md).
