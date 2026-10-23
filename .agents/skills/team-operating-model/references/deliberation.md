# Multi-Perspective Deliberation

Challenge a decision, design, plan, or draft with complementary perspectives;
the host owns synthesis. Deliberation does not itself authorize implementation.

## Execution mode

- **Delegated only:** use separately scoped real workers when the runtime
  supports and permits them. Launch every worker under the host skill's bounded
  handoff contract (or an available dispatch capability),
  with allowed actions, output contract, bounds, and stop behavior. Exchange
  concise positions so workers can challenge each other's claims. Follow its
  provider-diversity and independent-challenge requirements.
- **Blocked:** unavailable/denied delegation or missing required worker evidence
  stops this path. There is no simulated or solo fallback. A persona is a lens,
  not an additional worker instance; substantive contribution must be observed.

## Select the smallest useful cast

A real team always includes the primary and at least one separate worker. A
typical panel uses 2–4 relevant lenses, not a quota above that minimum. Select
only perspectives whose answer can affect the decision; another actor doing the
same search adds little. One worker instance supplies one perspective.

### Engineering/product lenses

| Lens | Question |
|---|---|
| Product Owner | Does this solve the user's problem, and is its value worth the complexity? |
| Architect | Are boundaries, contracts, recovery, and maintenance sound? |
| Developer | Can we build and verify this simply; what debt is hidden? |
| Security Auditor | Which trust boundaries, inputs, and permissions are exposed? |
| Devil's Advocate | What could invalidate the approach or make it fail? |

### Finance/investment lenses

Author allocation/opportunity memos with an available investment-analysis capability first (asset, portfolio, risk and evidence scope); this path
challenges a draft. If no investment capability is available, mark suitability
UNVERIFIED and return the investment decision to its owner. Select lenses for the actual asset, cycle, or position decision:

| Persona | Lens |
|---|---|
| Financial Investment Analyst | Thesis, alternatives, risk/return |
| Portfolio Manager | Weights, correlation, risk budget |
| Macroeconomic Analyst | Regime, CPI, FX, rates, cycle |
| Microeconomic Analyst | Issuer/business quality |
| Money Flow Analyst | Liquidity, funding, flows |
| Sentiment Analyst | Crowding/narrative extremes |
| Investment Quality Reviewer | Suitability gate |
| Financial Reviewer | Assumptions/disclosure integrity |
| Devil's Advocate (always for investment panels) | Left tails, co-failure, role mismatch |

Default memo cast: Investment Analyst + Portfolio Manager + Financial Reviewer
or Investment Quality Reviewer + Devil's Advocate; add Macro when regime matters,
Money Flow for credit refinancing, Sentiment for crowded crypto/thematics. Adapt
to uncertainty rather than expanding the panel indiscriminately.

## Persona discovery

Use any available authorized search/query capability against this loaded skill's `assets/personas.csv`. Prefer BM25 row retrieval for natural-language needs, or efficient CSV queries through SQLite (`sqlite3`, importing into a temporary database), DuckDB, Nushell, a BM25 CLI, or a configured MCP capability. These are alternatives, not required dependencies; inspect the actual interface and CSV header. Search positive fields `id`, `name`, `group`, `domain`, `use_when`, returning at most five candidates with source locators. Exact `group`/`id` filters can narrow selection (use the catalog's spelling); inspect applicability and reference fields before selecting. Do not read the whole CSV into context. No memory-root creation or MCP is required; do not install tools or upload catalogs without authorization, and keep any database/index temporary.

Commands below are relative to the **team-operating-model skill root**, not this
reference directory or an arbitrary working directory. Execute through the
required sandbox. After selecting a candidate, the existing Bash loader can load
its prompt by name without a search dependency:

```sh
bash references/discover-personas.sh prompt "Financial Investment Analyst"
```

`assets/personas.csv` supplies IDs, names, groups, applicability, and portable reference
paths. Resolve returned paths against the skill root; load only selected prompts.
The Bash loader resolves prompts by YAML `name:`. If discovery is unavailable,
use relevant default lenses without claiming to have loaded a library prompt;
missing mandatory expertise/evidence remains a blocker.

## Dialogue and synthesis

1. **Setup:** state the topic, source/decision contract, allowed actions, and relevant lenses.
2. **Opening positions:** each perspective gives a concise stance with evidence/uncertainty.
3. **Discussion:** relay material concerns; perspectives respond to each other, test assumptions, and revise. Keep user interjections and overall dialogue with the host.
4. **Convergence:** identify final adjusted positions, agreement, contested points, and needed evidence. Do not force early unanimity.
5. **Synthesis:** host produces consensus, strongest dissent, pre-mortem risks/mitigations, and verdict/actions. Use the skill root's `references/branch-graft-synthesis.md` when viable branches conflict; never average contradictions away.

For persistent work, a synthesized plan is only a candidate until the primary
versions and approves it. Execute only the current approved revision/unit.

## Output shape

Chat summaries need no file. Saved human-facing reports follow the receiving
environment's applicable document-format guidance or an explicitly selected format
contract; if none is available, state the chosen format and its constraints. Execution
consensus/checkpoints use the selected scoped-memory capability, not consumer documentation.

```markdown
# Deliberation: [Topic]
- Mode: Real delegated team | Blocked (no solo/simulated fallback)
- Perspectives and evidence scope:
## Consensus
## Divergence / strongest dissent
## Pre-mortem: failure scenarios and mitigations
## Verdict and actions
PROCEED | REVISE | RETHINK
```

Never forward raw worker prose as the host's decision, expose internal reasoning,
or treat agreement/TASK_COMPLETE as proof or user acceptance.
