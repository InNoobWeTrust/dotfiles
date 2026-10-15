# Instruction Bloat & MCP-Not-Default Caution

> Read when: adding a new rule, expanding `AGENTS.md`, or deciding whether an integration should be an MCP server.
>
> This is a just-in-time reference. Load it only when its trigger fires; do not bulk-load it at session start.

---

## The problem

Agents have a finite attention budget. Every always-on line competes with task context, file contents, and tool results. Bloat manifests as:

- `AGENTS.md` that is longer than the code it governs.
- Rules that duplicate a skill's internal workflow.
- Harness-specific protocol details (MCP server names, transport URLs, tool schemas) embedded in project-agnostic skills.
- Progressive disclosure collapsed into one mega-prompt.

The result is **context rot**: the agent ignores instructions, hallucinates shortcuts, or spends turns re-reading governance instead of working.

---

## Anti-bloat checks

Before adding text to `AGENTS.md` or an always-on rule, answer:

| Question | If yes, the text probably belongs elsewhere |
|---|---|
| Is this a reusable method needed only by a specific skill? | Move it to that skill's `references/`; deployment records stay in scoped integration docs. |
| Is this a worked example longer than 5 lines? | Move it to `references/` and leave a one-line pointer. |
| Does this duplicate a skill stop condition or phase? | Delete the duplication; link the skill. |
| Is this about one harness (Kilo, Claude Code, Cursor, etc.)? | Keep it in harness config or a thin adapter, not in project skills. |
| Would a newcomer need this on every single turn? | Keep it always-on. Otherwise, make it JIT. |

**Length heuristic:** If `AGENTS.md` exceeds ~150 lines or 8 KB, treat it as a warning. If it exceeds ~250 lines, it is a bug.

---

## MCP-not-default decision gate

MCP (Model Context Protocol) is useful, but "MCP by default" is a caution blip in current industry radar. Prefer simpler options first.

| Alternative | Use when | MCP only when |
|---|---|---|
| **CLI script / Makefile target** | One command, deterministic output, local use | You need cross-harness reuse of the same tool surface |
| **Skill reference with capability guidance** | The agent needs methods + examples + stop conditions | Protocol-level governance or reuse is required and verified, rather than assumed from using MCP |
| **Existing harness tool** | The harness already exposes read/edit/search | You are adding a capability the harness lacks (e.g., LSP symbol graph) |

### MCP warning signs

- The MCP server wraps a capability the agent already has (e.g., another `read_file`).
- The project skill hard-codes a server name, port, or transport.
- The skill cannot be used without first installing and configuring a server per project.
- Plain-file fallback tools in the MCP server duplicate native harness tools.

If any are true, reconsider whether a script or skill reference is enough.

---

## Safe patterns for MCP when it is justified

1. **Isolate MCP details in scoped integration docs/config** — a generic skill must not require a local adapter, even under `references/`. Discover the available capability and read its actual contract.
2. **Disable duplicate fallback tools** — if the harness has `read_file`, the MCP server should not expose its own plain-file read.
3. **Keep setup separately authorized** — integration docs may describe verified setup commands for an authorized setup task. Missing capability in a generic workflow is not permission to install, reconfigure or create a replacement.
4. **Gate promotion by evidence** — run a pilot with objective metrics (tool turns, correctness) before making an MCP-backed workflow the default.

---

## One-line decision summary

> Prefer skills and scripts; add MCP only when protocol-level reuse or governance is the reason, not because it is the new default.

---

## Related

- `.agents/skills/skill-author/references/aci-checklist.md` — interface design for any agent-facing surface
- `.agents/skills/skill-author/SKILL.md` — workflow for creating skills
- Script execution: use available compatible sandboxes, declared dependencies and authorized writable/network boundaries; a missing capability is not permission to install or bypass restrictions.
- Research: `.agents/docs/research/thoughtworks-radar-vol34/` — "MCP by default" caution blip
