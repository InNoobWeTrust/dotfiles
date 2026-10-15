# Nice-to-Have Rules

These rules add value but aren't essential on day one. Add them when the failure pattern they prevent has actually occurred. The always-on baseline is the seven policies listed in [Essential policies](./essential-rules.md).

### Memory (Short-Term + Long-Term)

**Skill:** `skills/memory/SKILL.md`

**When to add:** When you've lost context between sessions and had to re-explain the task, need to persist facts/decisions/corrections across sessions, or want a curated long-term memory that stays bounded. Also the vehicle for applying the same progressive-disclosure pattern to docs and code.

**What it does:** Defines a two-tier store — unbounded short-term working notes (session checkpoints included) and a size-limited long-term index. All memory operations are user-controlled: trigger capture, recall, or the dream cycle consolidation only on explicit user request via the `memory` skill or the `/memory` command. No rule enforces automatic triggers.

### Skills Discovery

**Policy:** `rules/skill-use.md` (index-first routing)

**Status:** Part of the seven-policy baseline, not optional.

**What it does:** Defines index-first routing — read `skills/INDEX` before loading any skill body. Establishes `code-craft` as the default for implementation tasks. Worth noting once the catalog grows: with enough skills, agents start loading the wrong ones or too many.

### Command Routing

**Optional extension:** Harness-native commands that route to skills; no command-routing rule is included in the baseline.

**When to add:** When you want CLI shortcuts (e.g., `/review`, `/party-mode`) that route to specific skills without the user needing to know skill names.

**What it does:** Maps user-facing commands to skill-loading prompts.

---
