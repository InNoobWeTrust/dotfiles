# Agent Skills & AGENTS.md Specification Reference

Official Specs:
- Agent Skills: https://agentskills.io
- AGENTS.md Standard: https://agents.md

## Progressive Disclosure Model

Agent Skills use progressive disclosure to manage context efficiently:

1. **Tier 1: Metadata (~100 tokens)**
   - `name` and `description` in `SKILL.md` YAML frontmatter.
   - Loaded at session startup for all available skills.
   - Used exclusively by agent harnesses for initial skill discovery and routing.

2. **Tier 2: Instructions (< 5,000 tokens recommended)**
   - Full `SKILL.md` body loaded only when the skill is explicitly activated.
   - Contains core workflow, phases, stop conditions, and checklist.
   - Recommended to be kept under 500 lines.

3. **Tier 3: Deep Resources (On-Demand)**
   - Files in `references/`, `scripts/`, `assets/`.
   - Loaded by the agent only when specific steps or sub-workflows require them.

## Frontmatter Constraints (agentskills.io)

Allowed frontmatter fields:
- `name` (required): 1-64 chars, lowercase alphanumeric and single hyphens (`a-z`, `0-9`, `-`). Must match parent directory name.
- `description` (required): 1-1024 chars. Imperative phrasing ("Use this skill when..."). Describes user intent and trigger conditions.
- `license` (optional)
- `compatibility` (optional): max 500 chars.
- `metadata` (optional): key-value map.
- `allowed-tools` (optional): space-separated tool strings.

Do NOT add unspec'd custom fields (e.g. `triggers`, `category`, `priority`) to `SKILL.md` frontmatter.
