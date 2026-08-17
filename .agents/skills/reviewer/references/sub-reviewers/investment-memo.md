# Sub-reviewer: Investment Memo

**Axis:** Suitability and analytical integrity of a **multi-asset investment assessment** (allocation, single opportunity, or sleeve choice) — not software quality.

**Load when:** Artifact is an investment memo, portfolio plan, bond/credit note, gold/crypto/equity sizing, or “should I buy/allocate” decision.  
**Do not load for:** Code PRs, pure prose unrelated to capital decisions.

**Author via:** skill `investment-assessment`. This lens **reviews** that output. Credit-specific checks are subsection C2 when the memo includes bonds/credit.

---

## Author bias

If you wrote the memo → **delegate** this review (Gate 1 of `reviewer`).

---

## Checklist

### A. Rails & decision type

| ID | Check | Sev if fail |
|---|---|---|
| A1 | Goals / horizon / liquidity rails present | CRITICAL |
| A2 | Max pain or drawdown budget stated when sizing | CRITICAL |
| A3 | Decision type clear (single / sleeve / portfolio) | HIGH |
| A4 | Job of money labeled (liquidity/ballast/growth/hedge/spec) | CRITICAL |
| A5 | Size/weight ≤ pain budget on stated left tail | CRITICAL |

### B. Regime & evidence

| ID | Check | Sev |
|---|---|---|
| B1 | Base regime + at least one stress regime | HIGH |
| B2 | Observed / inferred / recommended separated | HIGH |
| B3 | Primary sources for product terms (or unknown) | HIGH |
| B4 | No invented fees/covenants/ratings | CRITICAL |
| B5 | Sources listed | MED |

### C. Asset-class fit

| ID | Check | Sev |
|---|---|---|
| C1 | Correct class issues addressed (equity ≠ bond checklist only) | HIGH |
| C2 | If credit: ranking/security/LGD treated | CRITICAL for credit |
| C3 | If gold: role = hedge not coupon race | HIGH for gold |
| C4 | If crypto: wipeout-sized; not cash | HIGH for crypto |
| C5 | If funds: fees/mandate/overlap | MED–HIGH |

### D. Cross-asset & portfolio

| ID | Check | Sev |
|---|---|---|
| D1 | Unlike assets not ranked by single fake IRR only | HIGH |
| D2 | Stress correlation / co-failure considered | HIGH |
| D3 | Tax/fees netted or marked unknown | HIGH |
| D4 | Capital priority sensible under investor’s fear (e.g. hedge before HY if collapse narrative) | HIGH when relevant |
| D5 | Liquidity plan for illiquids (HTM) | HIGH if illiquid |

### E. Decision hygiene

| ID | Check | Sev |
|---|---|---|
| E1 | Disclaimer present | HIGH |
| E2 | Verdict + triggers + confidence | MED |
| E3 | No guaranteed-return language | CRITICAL |
| E4 | Open items honest | MED |

---

## Output format

```markdown
## Investment-memo review

**Verdict:** ACCEPT | CONDITIONAL | REJECT
**Artifact:** [path/title]

### Critical
### High
### Med
### What would change my mind
### Suitability one-liner
```

## Persona escalation

CONDITIONAL/REJECT → re-run with Portfolio Manager + Investment Quality Reviewer + Macro (if regime weak) via swarm finance personas.
