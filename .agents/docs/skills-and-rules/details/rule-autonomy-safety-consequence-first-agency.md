# Rule 8: Autonomy Safety (Consequence-First Agency)

**File:** `rules/autonomy-safety.md`

**What it prevents:** Agents with auto-approved tools or AFK modes treating capability as authorization and performing irreversible, high-blast-radius actions without consensus.

**Core components:**

```
1. Consequence-first table: reversible → proceed in bounds; irreversible → stop; unsure → treat as dangerous
2. Consensus before power: scope, stop conditions, allowed/forbidden, success criteria
3. Mandatory human-in-the-loop triggers (destructive, out of scope, ambiguous, secrets/prod)
4. Harness-agnostic adaptation: works with or without permission config; allowlists ≠ authorization
5. Audit trail: plan, assumptions, verify, rollback
```

**Without this rule:** An "autonomous" or AFK agent will roam under full tool allow, force-push, delete data, or expand scope because nothing prompted it to stop. Permission config alone does not encode judgment.

**Portability:** This is a **rule**, not a skill — always-on when autonomy is elevated. No harness-specific skill load required. Soft control (instruction-following) unless the harness isolates the workspace; prefer disposable worktrees for true AFK power.

---
