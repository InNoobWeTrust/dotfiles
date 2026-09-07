# SOLID checklist

Load before Phase 3. Expansion / Refactor and Hardening complete every item. Patch and MVP Slice apply only checks relevant to the touched boundary and mark each non-applicable item `N/A` explicitly.

| Check | Pass? |
|---|---|
| S — one responsibility | ☐ |
| O — extend without rewrite | ☐ |
| L — no weakened contracts | ☐ / N/A |
| I — minimal public surface | ☐ |
| D — depend on abstractions | ☐ |
| Docstrings on public APIs | ☐ |
| Deep modules (no shallow 1–3 line helpers) | ☐ |
| YAGNI | ☐ |
| SoC — logic free of framework/IO details | ☐ |
| Complexity budget OK | ☐ |

An unchecked applicable item must be fixed. When phased delivery applies, only a material, cross-slice compromise may be recorded in the shared canonical compromise register. Outside phased delivery, record only a small local deferral in the change context. A local debt marker must never substitute for a required safety or correctness fix.
