# Rapid-Demo Profile

Use this guide only after A1 explicitly selects `rapid-demo` for a hackathon, prototype, rapid demo, or funding demo. It is a bounded local-first, synthetic-data MVP profile—not production architecture or deployment guidance.

## Eligibility and stop boundary

Activate only when all of these are explicit: the archetype/capability need, a fixed delivery window, confirmation that synthetic data suffices, and whether remote sharing is needed.

Do **not** activate for real customer or production data, production intent, or non-deferrable security, compliance, recovery, or public-compatibility needs. If any input is ambiguous, unsafe, or conflicts with these boundaries, **stop** rapid-demo routing and use the canonical phased-delivery guidance instead.

## Immutable demo invariants

- Start local-first; hosted sharing is explicit opt-in, never the baseline.
- Use synthetic data only; never use production credentials or PII.
- No named tool is a universal default; select only the profile that fits the stated capability need.
- Label every produced artifact: **`DEMO ONLY — NOT PRODUCTION READY`**.
- Do not create external side effects, including deployment, without an explicit request and boundary review.

## Conditional profile matrix

| Profile / capability need | Local-first path | Optional hosted demo path | Avoid when | Key graduation concern |
|---|---|---|---|---|
| **Relational Web SaaS** — relational app flows need realistic local schema behavior | Supabase local stack with migrations and seed data | Vercel preview only when a shareable link is explicitly needed | Real customer data, production auth, or a durable public API contract is needed | Revisit data ownership, auth, migration, backup/recovery, and public compatibility |
| **AWS-owned full stack** — AWS service integration must be demonstrated | SST with an isolated personal AWS stage and synthetic data; `sst dev` is cloud-assisted local development, **not** an offline default | Explicit isolated demo stage only | Offline-only operation is required, an isolated personal stage is unavailable, or production AWS access is implied | Reassess account/IAM boundaries, spend, observability, recovery, and deployment controls |
| **AI web demo** — UI must demonstrate AI-assisted interaction | Local UI with a synthetic corpus | External-model calls only when explicitly enabled and budgeted | A model secret would be exposed or private data uploaded | Reassess data handling, model/vendor terms, evaluation, spend, abuse controls, and secret management |
| **Edge AI demo** — edge execution or bindings must be demonstrated | Cloudflare local simulation | Remote bindings only through an explicit, isolated opt-in; never point them to production data | Production bindings/data, regulated inputs, or unrecoverable edge actions are required | Reassess binding isolation, data locality, observability, rollback, and public behavior |
| **Mobile-first demo** — mobile interaction is the primary proof | Expo local workflow | Hosted/internal distribution is optional | Native credentials, store requirements, or production device capabilities must be relied on now | Surface native credential and store constraints before graduation |

## Demo Receipt

Attach this compact receipt to the existing Active Milestone Packet / architecture note. It supplements, and must not duplicate, the canonical Delivery Contract, compromise register, or feedback protocol.

```markdown
### Demo Receipt — DEMO ONLY — NOT PRODUCTION READY
- Status: [planned | active | completed | stopped]
- Selected profile / rationale: [matrix profile and capability need]
- Data posture: [synthetic-only source, no PII, no production credentials]
- Local / hosted boundary: [local baseline; explicit hosted opt-in or none]
- Intentional omissions: [bounded deferrals that preserve invariants]
- Tool-specific assumptions / limits: [selected-tool constraints and avoid-when check]
- Production checkpoint trigger: [first applicable graduation trigger, owner, and decision point]
- Trajectory: [select exactly one: KEEP | ADJUST | ADVANCE | STOP | REDIRECT] — per the canonical phased-delivery rule
```

## Graduation checkpoint

Before continuing beyond the demo, make a fresh architecture, security, and data decision when any of these occur: real users, credentials, or customer data; payments; regulated data; contractual uptime; irreversible or important background work; or material spend. Do not carry demo assumptions forward by default.

## Anti-patterns

- Treating SST as a generic local default.
- Treating a hosted preview as production.
- Leaking data or secrets into a demo or external-model call.
- Deploying automatically.
- Creating the Concierge CLI before repeated manual profile use demonstrates need.
- Duplicating canonical governance rather than linking to the phased-delivery contract and registers.

## First-party sources

- SST live development: <https://sst.dev/docs/live>
- Supabase local development: <https://supabase.com/docs/guides/local-development/cli/getting-started>
- Vercel deployments: <https://vercel.com/docs/deployments>
- Cloudflare Workers local development: <https://developers.cloudflare.com/workers/local-development/>
- Expo environment setup: <https://docs.expo.dev/get-started/set-up-your-environment/>

## ACI Pass

- Result: **PASS**
- Risks: unsafe activation; stale tool guidance.
- Upgrades: explicit inputs/output receipt/ineligibility/hard stop; profile-specific avoid-when fields; progressive disclosure.
