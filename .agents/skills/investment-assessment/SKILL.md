---
name: investment-assessment
description: "Use this skill for personal or portfolio investment decisions across asset classes — equities, funds/ETFs, deposits/cash, government and corporate bonds, gold/commodities, crypto, private credit, and multi-asset allocation. Activate for assess this investment, how should I allocate, portfolio review, risk/gain of an opportunity, size a position, compare assets, market cycle fit, macro/micro overlay, inflation/FX/gold, prospectus or product diligence, or what fits my risk budget. Do not use for software security review, pure OSINT positioning with no capital decision, day-trading signal spam, or packaging licensed financial advice."
---

# Investment Assessment

Decision-grade evaluation of **what to own, how much, and why now** for an investor with explicit rails (goals, max pain, horizon, liquidity, tax). Works at three levels:

1. **Single opportunity** (one bond, stock, fund, gold lot, crypto position)  
2. **Sleeve / asset-class choice** (credit vs equity vs gold vs cash)  
3. **Whole portfolio** (allocation, cycle fit, rebalance)

Separates **Observed / Inferred / Recommended**. Not a licensed advisor.

Deep playbooks: `references/phases.md`, `references/regime-and-cycle.md`, `references/portfolio-construction.md`, `references/asset-classes/` (lazy-load by class), `references/anti-patterns.md`.

## Activation (generic — not bond-only)

| User intent examples | Load this skill |
|---|---|
| Assess / diligence any product or ticker | Yes |
| How much can I put in X? | Yes |
| Allocate 1B across gold / funds / stocks / crypto / bonds | Yes |
| Does this fit the cycle / my macro view? | Yes |
| Compare A vs B (deposit vs fund vs gold vs credit) | Yes |
| Review my portfolio risk | Yes |
| Pure company PR OSINT, no money decision | No → `strategic-osint` |
| Code / security review | No → `reviewer` software lenses |

Credit/bond diligence is one **asset-class module** under `references/asset-classes/`, not a separate skill.

## When this skill owns the thread

| Use | Skip |
|---|---|
| Multi-asset allocation & position sizing | Software engineering tasks |
| Opportunity diligence (any liquid/illiquid class) | Candidate hiring OSINT |
| Macro/micro + market-cycle fit of a sleeve | Guaranteed-return / “can’t lose” framing without challenge |
| Tax-net and role-correct comparisons | Formal RIA engagement letters |

## Compose (do not reinvent)

| Need | Load / hand off |
|---|---|
| Open option space before numbers | `brainstorming` |
| Issuer / company / country public signals | `strategic-osint` |
| Challenge a draft memo | `multi-perspective-deliberation` + finance cast |
| Independent review of memo | `reviewer` → `investment-memo` lens |
| High-stakes multi-model | `swarm-intelligence` domain **finance** |
| Delegation contracts | `subagent-dispatch` |

### Finance cast (`discover-personas.sh prompt "Name"`)

| Persona | When |
|---|---|
| Financial Investment Analyst | Thesis, risk/return, alternatives |
| Portfolio Manager | Weights, correlation, risk budget |
| Macroeconomic Analyst | Regime, CPI, FX, rates, cycle |
| Microeconomic Analyst | Issuer/business unit economics |
| Money Flow Analyst | Liquidity, funding, flows |
| Sentiment Analyst | Crowding, narrative extremes |
| Trading Strategist | Timing / expression (not core IPS) |
| Investment Quality Reviewer | Suitability gate |
| Financial Reviewer | Assumption & disclosure audit |

**Default light cast:** Investment Analyst + Portfolio Manager + Macro (if cycle/macro in scope) + Financial Reviewer or IQ Reviewer.  
**Credit-heavy add:** Money Flow. **Crowded trade add:** Sentiment.

## Phase map (mandatory order)

1. **Investor rails** — goals, max pain, horizon, liquidity, tax, constraints, existing book.  
2. **Decision type** — single name / sleeve / full portfolio.  
3. **Regime & cycle** — growth, inflation, rates, FX, risk appetite; what the regime **favors / hurts**.  
4. **Opportunity or book map** — facts from primary sources; cash-flow rights; costs; liquidity.  
5. **Asset-class module(s)** — lazy-load only matching files under `references/asset-classes/`.  
6. **Cross-asset comparison** — roles first, then net expected outcomes; no fake IRR equivalence across unlike jobs.  
7. **Sizing & portfolio fit** — risk budget, concentration, correlation in stress, rebalance rules.  
8. **Decision card** — GO / HOLD / TRIM / SKIP + triggers.  
9. **Optional challenge** — deliberation or `investment-memo` review lens.

Detail: `references/phases.md`.

## Asset-class modules (load on demand)

| Class | Reference |
|---|---|
| Cash / deposits / T-bills | `references/asset-classes/cash-liquidity.md` |
| Bonds / credit / private credit | `references/asset-classes/credit-fixed-income.md` |
| VN (or similar) public bond packs | `references/asset-classes/vn-public-bond-pack.md` |
| Public equities / single stocks | `references/asset-classes/public-equity.md` |
| Funds / ETFs | `references/asset-classes/funds-etfs.md` |
| Gold / commodities | `references/asset-classes/gold-commodities.md` |
| Crypto | `references/asset-classes/crypto.md` |
| Multi-asset / allocation | `references/portfolio-construction.md` |

## Hard rules

1. **Disclaimer** on every decision artifact.  
2. **Rails before tickers** — no size without max pain / horizon / job of the money.  
3. **Observed ≠ Inferred ≠ Recommended.**  
4. **Role discipline** — each sleeve has a job (liquidity, ballast, growth, hedge, speculation); do not relabel speculation as cash.  
5. **Regime honesty** — state which cycle regime you assume; stress the opposite.  
6. **Primary sources** for product terms; OCR scanned docs; never invent covenants/fees.  
7. **Tax-net and fee-net** before “beats X.”  
8. **Size to loss budget** in a plausible left tail for *that* asset (not only average path).  
9. **Correlation in crisis** — gold/credit/equity/crypto often couple badly when it matters.  
10. **Liquidity is a feature** — illiquid sleeves need HTM planning.  
11. No fabricated prices, ratings, or legal opinions.  
12. Not licensed advice; no market manipulation or unauthorized access help.

## Default deliverable

1. Rails table  
2. Decision type + scope  
3. Regime/cycle snapshot (base + alt)  
4. Opportunity or portfolio map (sources)  
5. Class-specific diligence (modules used)  
6. Cross-asset role & net comparison  
7. Scenarios (base / soft stress / hard stress)  
8. Sizing / target weights + ceilings  
9. GO/HOLD/TRIM/SKIP + checklist + watch triggers  
10. Open items, confidence, one-page card  

## Stop conditions

- Rails incomplete for sizing → ask.  
- Binding product terms missing → no GO on that product.  
- User demands guaranteed return / denies left tail → reframe or refuse GO.  
- Fraud, unauthorized access, manipulation → stop.  

## Deliverable checklist

- [ ] Disclaimer  
- [ ] Rails complete enough for the decision type  
- [ ] Regime assumption stated  
- [ ] Observed / inferred / recommended labeled  
- [ ] Correct asset-class module(s) applied  
- [ ] Fees/tax netted or marked unknown  
- [ ] Left-tail size ≤ risk budget / max pain  
- [ ] Stress correlation considered  
- [ ] Triggers for review/exit  
- [ ] Sources listed  

## Anti-patterns (summary)

Full table: `references/anti-patterns.md`.

| Temptation | Correct path |
|---|---|
| Yield/return shopping without role | Assign job of money first |
| One macro headline → all-in one asset | Barbell roles; size tails |
| Treat unlike assets as same IRR race | Compare jobs, then net outcomes |
| Ignore cycle | Explicit regime + opposite stress |
| Bond-only checklist on equities/crypto | Load the right class module |

## References

- `references/phases.md`  
- `references/regime-and-cycle.md`  
- `references/portfolio-construction.md`  
- `references/asset-classes/*`  
- `references/anti-patterns.md`  
- Related: `strategic-osint`, `brainstorming`, `reviewer` (`investment-memo`), `swarm-intelligence` finance personas, `multi-perspective-deliberation`
