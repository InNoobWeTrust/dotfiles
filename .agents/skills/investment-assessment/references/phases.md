# Phases — Investment Assessment (multi-asset)

## Phase 1 — Investor rails (mandatory)

| Field | Why |
|---|---|
| Goals (growth / income / preserve / hedge) | Selects favored sleeves |
| Investable capital & total NW | Concentration math |
| Max pain (absolute + optional % NW) | Hard loss ceiling |
| Horizon & cash-need probability | Illiquidity tolerance |
| Liquidity needs (emergency separate?) | Cash sleeve floor |
| Tax residency / account type | Net returns |
| Constraints (ESG, banned names, home bias OK?) | Feasible set |
| Existing book (by sleeve) | Marginal risk, not standalone |
| Behavioral limits (sleep-at-night) | Soft max pain |

**Stop** if decision requires size and max pain + horizon missing.

---

## Phase 2 — Decision type

| Type | Output emphasis |
|---|---|
| **A. Single opportunity** | Diligence + size ceiling + GO/SKIP |
| **B. Sleeve choice** | Role competition (e.g. gold vs credit vs cash) |
| **C. Full portfolio** | Target weights, bands, rebalance, budget |

State type explicitly in the memo.

---

## Phase 3 — Regime & cycle

See `regime-and-cycle.md`.

Minimum:

- Growth: expansion / slowdown / recession risk  
- Inflation: low / stable / rising / sticky  
- Policy rates & liquidity: easing / tight / pivot risk  
- FX (if relevant): crawl / gap risk  
- Risk appetite: risk-on / mixed / risk-off  
- **Base regime** + **1 opposite stress regime**  
- Which sleeves historically helped / hurt in each  

Do not require a precise forecast — require an **explicit assumption**.

---

## Phase 4 — Opportunity or book map

### Single name / product

From **primary** sources where possible:

- Legal/economic claim (equity residual, debt coupon, fund NAV, bullion, token)  
- Cash-flow / return engine  
- Fees, tax, frictions  
- Liquidity & exit  
- Key risks (credit, market, custody, policy, smart-contract, etc.)  
- Valuation or spread context (as applicable)  

### Full book

- Current weights by sleeve  
- Overlaps (same factor/sector/issuer)  
- Dry powder and liabilities  

---

## Phase 5 — Asset-class module(s)

Lazy-load **only** matching files:

| If assessing… | Load |
|---|---|
| Deposits, money market, T-bills | `asset-classes/cash-liquidity.md` |
| Bonds, notes, private credit | `asset-classes/credit-fixed-income.md` (+ regional pack if needed) |
| Stocks / equity indices | `asset-classes/public-equity.md` |
| Mutual funds / ETFs / CCQ | `asset-classes/funds-etfs.md` |
| Gold, silver, other commodities | `asset-classes/gold-commodities.md` |
| BTC/ETH/alts, on-chain yield | `asset-classes/crypto.md` |
| Weights across sleeves | `portfolio-construction.md` |

Multiple modules OK for barbells (e.g. gold + credit).

---

## Phase 6 — Cross-asset comparison

1. **Job of money** for each candidate (liquidity / ballast / growth / hedge / speculation).  
2. **Net** expected path (fees, tax, dilution, storage).  
3. **Left tail** under stress regime.  
4. **Correlation** with existing book in stress (not only normal times).  
5. Reject “everything ranked by one 2y IRR” across unlike jobs.

---

## Phase 7 — Sizing & portfolio fit

See `portfolio-construction.md`.

Rules of thumb (override with rails):

- Single speculative name: often small vs NW; always ≤ max pain on wipeout path  
- Illiquid credit: ≤ max pain; HTM default  
- Core diversified equity/funds: sized to drawdown tolerance  
- Hedge (gold): sized to fear/need, not to coupon envy  
- Cash floor: never zero if life liquidity required  

Produce: target size or weight band + hard ceiling + what to cut if capital-constrained.

---

## Phase 8 — Decision card

| Field | Content |
|---|---|
| Verdict | GO / HOLD / TRIM / SKIP / CONDITIONAL |
| Size / weight | Number + ceiling |
| Regime bet | What must stay roughly true |
| Kill criteria | What makes you exit or refuse add |
| Review cadence | Calendar + event triggers |
| Confidence | High / med / low + unknowns |

---

## Phase 9 — Optional challenge

- Finance cast deliberation, or  
- `reviewer` → `investment-memo` lens, or  
- Swarm finance domain  

---

## Memo template

```markdown
# Investment assessment: [TITLE]

**Disclaimer:** Decision-support only — not licensed financial advice.

## 1. Rails
## 2. Decision type (A/B/C)
## 3. Regime (base + stress)
## 4. Observed facts (sources)
## 5. Inferences (labeled)
## 6. Class module notes
## 7. Cross-asset roles & net comparison
## 8. Scenarios
## 9. Sizing / weights
## 10. Verdict + checklist + triggers
## 11. Open items & confidence
## 12. One-page card
```

## Worked pattern library (generic, not one issuer)

Credit unsecured HY, gold vs carry, equity cycle entry, fund vs single name, crypto position sizing — see class modules + `anti-patterns.md`. Bond-specific waterline detail lives under `asset-classes/credit-fixed-income.md` as **one** pattern family.
