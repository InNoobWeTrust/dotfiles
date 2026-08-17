# Asset class: Credit & fixed income

Module for **bonds, notes, private credit, HY paper** — one sleeve inside `investment-assessment`, not the whole skill.

## Job

Contractual yield / ballast (IG, gov) or **carry for credit risk** (HY, unsecured single-name). Never mislabel HY unsecured as cash.

## Diligence checklist (any credit)

- [ ] Issuer legal entity vs guarantor/parent  
- [ ] Seniority: secured / unsecured / subordinated  
- [ ] Coupon, day-count, frequency, tenor, amortizing vs bullet  
- [ ] Covenants, EoD, cross-default, call/put  
- [ ] Min ticket, fees, tax withholding / gross-up  
- [ ] Transfer, listing, expected secondary liquidity  
- [ ] Use of proceeds  
- [ ] Issuer financials, leverage, maturity walls  
- [ ] Asset quality / recovery metric **definitions**  
- [ ] Rating: issuer vs issue  

Regional public-offer packs (e.g. VN): see `vn-public-bond-pack.md`.

## Credit waterline & LGD

### Claim stack (conceptual)

```
[Top] Perfected secured creditors (pledges, assignments, cash sweeps)
      Statutory priorities (tax, employees, insolvency costs — local law)
      Unsecured financial creditors (many public corp bonds)
      Subordinated / mezz (if any)
[Bottom] Equity
```

Always re-read **local insolvency priority** — do not invent statutes.

## Marketing comfort vs waterline reality

| Marketing line | Holder reality |
|---|---|
| “Loans are collateralized” | Collateral may secure **issuer vs its customers**, not **you vs issuer** |
| “Investment-grade / BBB” | Lower default odds than junk; **not** high recovery guarantee |
| “Parent is listed / PE-backed” | Support is optional unless **guarantee** or keepwell is documented |
| “International lenders fund us” | Often **more senior / covenant-heavy** than retail unsecured |
| “We always paid coupons” | Going-concern history ≠ insolvency recovery |
| “Sold-out prior batches” | Demand ≠ credit quality |

## Recovery series hygiene

1. State the **exact definition** (e.g. cash recovered on **already written-off** stock ÷ average off-balance stock).  
2. Never mix with “early collection success %” or rating-agency adjusted metrics without a bridge.  
3. Partial-year rates are **valid signals** if methodology matches full-year rows; do **not** naively annualize; do **not** dismiss multi-period collapses as “incomplete H1.”  
4. Falling last-resort recovery + high overdue migration = **thin residual value** in hard default.

## Illustrative LGD bands (unsecured retail HY — planning only)

| Scenario | Planning recovery on principal | Use |
|---|---|---|
| Base hold-to-maturity | ~100% + coupons | Coupon math |
| Soft stress | High / delays | Income risk |
| Restructuring | Wide **40–70%** (very uncertain) | Pain rehearsal |
| Hard default / fire sale | **0–40%** plausible when scrap recovery weak | **Size to max pain** |

Replace bands with jurisdiction/deal evidence when available; keep uncertainty explicit.

## Why “big franchise” ≠ bondholder recovery

1. Wrong collateral beneficiary  
2. Granular collection cost on small tickets  
3. Collateral depreciation / title fraud  
4. Observed scrap recovery low  
5. Early charge-off moves loss off-balance  
6. Senior secured capital structure  
7. No parent guarantee  
8. Franchise value evaporates on license/conduct shock  
9. Maturity-wall clustering kills refinance and secondary bids together  
10. Scale multiplies backlog in stress  

## Sizing rule

```
notional_ceiling ≈ max_pain   # when planning recovery can approach 0–40%
```

If official **min ticket > max pain** → **skip primary** (or wait secondary odd-lot with eyes open).  
Never “solve” min ticket with informal pool/split brokers.

## Secondary market

- Legal transfer + exchange listing = **optionality**  
- Credit scare → wide spreads or **no bid**  
- Plan: **hold-to-maturity / hold-to-default**; secondary is not the risk control

## Regime coupling

- Soft landing + disinflation: carry can work if micro OK  
- Inflation scare / FX gap / risk-off: often **bad** for HY unsecured; gold/cash may be preferred  
- Do not use single-name HY as collapse insurance — see parent skill `regime-and-cycle.md`

## Return to parent

Sizing vs full portfolio, cross-asset roles, and decision cards: `investment-assessment` phases + `portfolio-construction.md`.
