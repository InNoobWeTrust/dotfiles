# Installing Skills via `npx skills add`

Use the `skills` CLI to quickly install and update agent skills from this repository into any project workspace.

---

## Quick Start

To install all skills from this repository into your workspace:

```bash
npx skills add InNoobWeTrust/dotfiles
```

To install a specific skill (e.g., `code-craft` or `systematic-investigation`):

```bash
npx skills add InNoobWeTrust/dotfiles --skill code-craft
```

---

## How `npx skills add` Works

The `skills` CLI (part of the open [Agent Skills standard](https://agentskills.io)) scans the target repository for valid skill packages containing a `SKILL.md` frontmatter definition. 

When you run `npx skills add`:
1. It locates the skill directories under `.agents/skills/`.
2. It copies the requested skill folder(s) (including `SKILL.md`, `scripts/`, `references/`, and `resources/`) into your workspace's skill directory (e.g., `.agents/skills/` or `.claude/skills/`).
3. Your AI agent harness automatically detects and makes the skill available during agent interactions.

---

## Crucial Pairing: Skills Work Best Paired with `.agents/rules`

> [!IMPORTANT]
> Skills define **how** to execute specific workflows (e.g., refactoring code, conducting code reviews, or investigating root causes). However, skills rely heavily on **`.agents/rules/`** to enforce non-negotiable constraints, execution safety, and quality baselines.

If you install `.agents/skills/` without `.agents/rules/`, AI agents may attempt to follow the workflow but lack the strict safety gates, quality baselines, and execution boundaries required for reliable operation.

### Key Rule-Skill Interactions

| Rule (`.agents/rules/`) | Skill (`.agents/skills/`) | Pairing Benefit |
|---|---|---|
| `skill-compliance.md` | All skills | Guarantees the agent strictly executes the complete `SKILL.md` workflow without skipping steps or hallucinating phase completion. |
| `code-quality.md` & `tdd.md` | `code-craft`, `db-design` | Enforces SOLID, DRY, KISS, and test-driven standards during feature creation and refactoring. |
| `self-grounded-verification.md` | `reviewer`, `web-qa-audit` | Requires machine-verifiable proof before claiming tasks are "done" or tests pass. |
| `git-safety.md` & `execution-safety.md` | `subagent-dispatch`, `devsecops` | Protects git status/staging, prevents destructive shell commands, and guards credentials. |
| `memory.md` | `memory` | Standardizes short-term handoffs and long-term dream-cycle consolidation across agent sessions. |

---

## Recommended Setup for Team Projects

When sharing or adopting skills across projects or teams:

1. **Install Skills**:
   Run `npx skills add InNoobWeTrust/dotfiles` to copy the skill catalog into `.agents/skills/`.

2. **Include `.agents/rules/`**:
   Copy or sync `.agents/rules/` (and `.agents/AGENTS.md`) into your repository root alongside `.agents/skills/`.

3. **Wire via `AGENTS.md`**:
   Ensure your harness entry point (`AGENTS.md` or `.agents/AGENTS.md`) references `rules/INDEX` and `skills/INDEX.md` so agents know when to load rules and skills.
