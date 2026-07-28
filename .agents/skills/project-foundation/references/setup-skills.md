# Skills as Executable Onboarding

> Read when: bootstrapping a new project, replacing a static README setup section, or converting tribal setup knowledge into something an agent can run.

---

## Idea

A project-local `setup` skill replaces the static "Getting Started" README block with an idempotent, verifiable, agent-runnable procedure. Instead of pasting shell blocks into chat, the agent loads the skill and follows the phases. If a harness supports slash commands, it may expose that skill as `/setup`, but the canonical artifact here is a project-local `setup` skill.

This maps to the Thoughtworks Radar Vol 34 Assess blip **"Skills as executable onboarding."**

---

## When to use

- A project has four or more distinct setup actions (heuristic), especially when they modify system state, generate files, start services, or require environment detection.
- Newcomers repeatedly miss a setup step or use the wrong tool version.
- Setup depends on detecting the host environment (OS, package manager, existing installs).
- You want the agent to be able to bootstrap its own environment before coding.

When **not** to use:
- A one-line `uv run` or `make dev-up` is enough.
- The setup is fully handled by an existing Dev Container or Nix flake.

---

## Skill structure

Create the skill under `.agents/skills/setup/` for the project, or add a `setup` reference under `project-foundation` if you want a reusable pattern.

### `SKILL.md` frontmatter

```yaml
---
name: setup
description: "Use this skill when setting up a new development environment for this project. Detects the host, installs prerequisites, verifies the install, and leaves the project ready for `make dev` or equivalent."
---
```

### Phases

| Phase | Goal | Typical commands |
|---|---|---|
| **S1 — Detect** | Identify OS, package manager, and what is already installed. | `uname -s`, `command -v uv`, `command -v bun`, `command -v docker` |
| **S2 — Install prerequisites** | Install only what is missing; prefer idempotent installers. | `curl -LsSf https://astral.sh/uv/install.sh \| sh`, `brew install ...` |
| **S3 — Bootstrap project** | Run the project-specific setup script or command. | `uv sync`, `bun install`, `make bootstrap` |
| **S4 — Verify** | Prove the environment works before declaring done. | `make lint`, `make test`, `make dev-up --dry-run` |

### Stop conditions

- Stop and ask if the user wants to install a global package manager (e.g., Homebrew on a work machine).
- Stop if verification fails; do not proceed to coding tasks on a broken environment.
- Stop if the project already appears set up and the user only asked for a check.

---

## Bootstrap command patterns

Use these patterns so the skill needs no pre-installed dependencies beyond a shell.

Before running any remote installer or global package install, get user approval and prefer repository-pinned or tool-managed alternatives when the project already provides them.

### Python projects

```bash
# Ensure uv is present
command -v uv >/dev/null 2>&1 || curl -LsSf https://astral.sh/uv/install.sh | sh

# Sync environment
uv sync

# Verify
uv run pytest tests/ -q
```

### Node/TypeScript projects

```bash
# Ensure bun is present (fast, single binary)
command -v bun >/dev/null 2>&1 || curl -fsSL https://bun.sh/install | bash

# Install and verify
bun install
bun run lint
bun run test
```

### Polyglot projects

```bash
# Use a Makefile as the single entry point
make bootstrap   # installs uv, bun, etc. per project policy
make verify      # runs format/lint/type/test subset
```

### Container projects

```bash
# Prefer an existing devcontainer CLI; otherwise ask before using a global install.
command -v devcontainer >/dev/null 2>&1 || npx @devcontainers/cli --version

# Build and run
make dev-up
```

---

## Verification checklist

### Required local checks

- [ ] All prerequisite commands are available in `PATH`.
- [ ] Project dependencies are installed.
- [ ] A fast verification command (`make lint`, `make test`, etc.) passes.

### Optional full-stack checks

Run these only when the project expects local services, credentials, ports, or external infrastructure and they are available.

- [ ] The default dev command (`make dev`, `make dev-up`) runs without setup-related errors.
- [ ] Any required local services or containers can start.

---

## Example: minimal project-local setup skill

````markdown
# Setup Skill

## Detect

Run `scripts/detect_env.sh` or inline:

```bash
OS=$(uname -s)
PKG_MGR=$(command -v apt-get || command -v brew || command -v pacman || true)
```

## Install

```bash
# Ask before running remote installers.
command -v uv >/dev/null 2>&1 || curl -LsSf https://astral.sh/uv/install.sh | sh
command -v bun >/dev/null 2>&1 || curl -fsSL https://bun.sh/install | bash
```

## Bootstrap

```bash
uv sync
bun install
```

## Verify

```bash
make lint
make test
```

## Stop

- If `make test` fails, report the failure and stop. Do not start feature work.
````

---

## Relationship to project-foundation

`project-foundation` Mode A (Bootstrap) can materialize a project-local `setup` skill as part of the core pack if the project needs it. Do not force a project-local `setup` skill on projects with trivial onboarding.

When `project-foundation` detects a complex stack, it should:

1. Ask whether to create a project-local `setup` skill.
2. If yes, generate the skill from this reference pattern.
3. Add `setup` to the project `skills/INDEX.md`.

---

## Anti-patterns

| Temptation | Why wrong |
|---|---|
| Put setup steps only in README | Agents and CI cannot run README prose consistently. |
| Install global packages silently | Violates `execution-safety` script-sandboxing constraint. |
| Make setup interactive | Agents cannot answer interactive prompts reliably; use flags or env vars. |
| Skip verification | A "set up" environment that cannot run tests is not set up. |

---

## Related

- `.agents/skills/project-foundation/SKILL.md` — bootstrap mode
- `.agents/rules/execution-safety.md` — script sandboxing and dependency isolation
- `.agents/skills/devsecops/SKILL.md` — CI pipeline setup
- Research: `.agents/docs/research/thoughtworks-radar-vol34/` — "Skills as executable onboarding" blip
