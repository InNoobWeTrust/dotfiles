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
| **S3 — Bootstrap project** | Run the project-specific setup script or command. | `uv sync` (CPU-only Python) or `pixi install` (GPU/accelerator Python), `bun install`, `make bootstrap` |
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

> **GPU/Accelerator decision rule** — pick the branch that matches the project:
>
> | Project condition | Recommended orchestrator |
> |---|---|
> | GPU / CUDA / accelerator required (e.g., PyTorch+CUDA, JAX-GPU, RAPIDS) | **Pixi** — see GPU branch below |
> | CPU-only, simple tooling, or pure data work | **uv** — see CPU branch below |
> | Existing project has `pyproject.toml` with `[tool.pixi]` | **Single manifest** — use `pixi` for Conda/GPU/binary deps, `uv` for pure Python/CPU |
> | Existing project already has `pixi.toml` | **Follow Pixi**; do not re-configure |
> | Existing GPU project has `uv.lock` (no `pixi.toml` / `[tool.pixi]`) | **Follow existing tool** unless user explicitly authorizes migration; recommend Pixi as the preferred future orchestrator but do not silently convert |
> | Existing CPU-only project has `uv.lock` | **Follow uv**; no migration needed |

#### Single manifest for both uv and pixi (`pyproject.toml`)

Pixi supports using [`pyproject.toml` as a single unified manifest](https://pixi.prefix.dev/latest/python/pyproject_toml/) alongside standard Python tools like `uv`:

- **Shared Dependencies**: Standard PEP 621 `[project.dependencies]` are automatically understood by Pixi as `[pypi-dependencies]`.
- **Optional Dependencies & Groups**: `[project.optional-dependencies]` and PEP 735 `[dependency-groups]` are automatically interpreted by Pixi as named features with corresponding `pypi-dependencies`, which can be mapped into `[tool.pixi.environments]`.
- **Conda & Accelerator Packages**: Binary packages, CUDA toolkits, and non-Python dependencies live under `[tool.pixi.dependencies]`. If a package appears in both `[project.dependencies]` and `[tool.pixi.dependencies]`, Pixi prefers the Conda package.
- **Pixi Workspace Configuration**: Settings like channels, platforms, and tasks live under `[tool.pixi.workspace]`, `[tool.pixi.tasks]`, and `[tool.pixi.environments]`.
- **Source Dependencies in Monorepos**: Because Pixi uses `uv` under the hood to build PyPI dependencies, `[tool.uv.sources]` in referenced sub-packages specifies git or local path sources.
- **Workflow Coexistence**:
  - Developers working on CPU/pure-Python tasks or standard CI use `uv sync` and `uv run`.
  - Developers or HPC environments requiring GPU/CUDA or C++ binaries use `pixi install` and `pixi run`.
  - Eliminates dual-manifest drift between `pixi.toml` and `pyproject.toml`.

#### CPU-only / simple Python (uv)

```bash
# Ensure uv is present
command -v uv >/dev/null 2>&1 || curl -LsSf https://astral.sh/uv/install.sh | sh

# Sync environment
uv sync

# Verify
uv run pytest tests/ -q
```

#### GPU / CUDA / accelerator Python (Pixi)

Pixi manages declared dependencies and lockfile in one `pixi.lock`. CUDA toolkit may be declared in `pixi.toml` or `pyproject.toml` under `[tool.pixi.dependencies]` (and thus locked by Pixi) or provided by the host system — verify host driver and runtime compatibility with whichever backend your project uses. Do **not** create a separate `conda`/`mamba` or bare `uv`-managed environment alongside it; Pixi may internally invoke `uv` as a build tool for PyPI packages, which is expected.

```bash
# Ensure pixi is present
command -v pixi >/dev/null 2>&1 || curl -fsSL https://pixi.sh/install.sh | bash

# Install all locked dependencies (reads pixi.toml or pyproject.toml + pixi.lock)
pixi install

# Inspect available tasks first, then run the actual name from manifest [tasks] / [tool.pixi.tasks]:
pixi task list
# The line below assumes the project declares a `test` task in the manifest.
# Substitute the task name discovered above; do not run this verbatim.
pixi run test
```

**Before claiming GPU works**, verify:

- [ ] CUDA toolkit is either declared in `pixi.toml` / `pyproject.toml` (locked in `pixi.lock`) or confirmed present on the host; verify host driver/runtime compatibility with the chosen backend.
- [ ] Target platform and accelerator deps/config are declared wherever the project specifies them (`[target]`, `[feature]`, dependency sections in `pixi.toml` or `[tool.pixi.*]` in `pyproject.toml`).
- [ ] Accelerator backend detects a device at runtime (e.g., `torch.cuda.is_available()` → `True`).

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

### HPC / restricted edge targets

> **Discover before any action.** HPC and restricted-edge sites vary widely in scheduler, policy, network access, and available software. Do not install software, submit jobs, download images, or run workloads during environment discovery.

#### D1 — Discover site context (read-only probes only)

Collect answers for each dimension before acting; all subsequent steps are gated on confirmed site facts.

| Dimension | Discovery approach | Why it matters |
|---|---|---|
| **Site policy / AUP** | Site docs, support portal | Confirm permitted uses and compliance requirements first |
| **Access tier** | `hostname`; confirm login node vs. allocated compute node | Login nodes typically prohibit heavy compute and large network transfers |
| **Scheduler** | `sbatch`/`qsub` presence is a clue only; confirm scheduler identity and version via site docs or support | Binary presence does not prove scheduler identity; features and resource syntax vary by version and site configuration |
| **Modules / drivers / accelerators** | `module avail` if Environment Modules is active; site hardware docs | Reveals site-provided CUDA, MPI, and runtime versions; do not assume GPU presence |
| **Network & install permissions** | Site docs and support portal | Outbound internet may be firewalled or proxied; install permissions are site-defined — do not run egress probes or infer install rights from local user identity |
| **Writable scratch / cache** | Site docs; site-defined variables such as `$SCRATCH` or `$TMPDIR` (names vary) | Confirm purge policy before writing large caches or build artifacts |
| **Bind-mounts & UID** | Site container docs | Which host paths appear inside containers; whether UID is remapped |
| **Storage quotas** | Site quota tool or portal (commands vary by filesystem) | Confirm headroom before large downloads or installs |
| **Permitted image provenance** | Site container registry / policy docs | Which registries or build paths are allowed; air-gapped sites may provide an internal registry or staged approved images — confirm with site support rather than assuming a tarball workflow |

#### D2 — Scheduler: Slurm (only if present at this site)

`--partition`, `--gres` / `--gpus`, `--time`, and `--array` values are **site-specific**. Names shown in external tutorials or documentation do not transfer to another site. Obtain each value from site documentation or inspect available resources using tools provided on the login node. Do not copy or fabricate resource flags; invalid resource requests may be rejected with an error at submission time, and valid but oversized requests can queue longer or waste allocation — inspect the submission result and monitor job status rather than assuming silent success. Job arrays (`--array` / `SLURM_ARRAY_TASK_ID`), success-dependencies (`afterok`), and monitoring with `squeue` / `sacct` are site-versioned scheduler concepts; confirm array limits, dependency keywords, accounting field names, and output log paths from site documentation before scripting around them.

#### D3 — Container runtimes

| Runtime | Availability | Notes |
|---|---|---|
| **Singularity / Apptainer** | Site-provided option — not universally available, not automatically installed | Supports unprivileged execution where the site deploys it; confirm permitted pull sources and local image cache location |
| **Docker** | Only where site policy explicitly permits | Availability and privilege requirements are site-specific; do not assume Docker is universally prohibited or universally available on shared HPC |
| Other (Podman, Charliecloud, etc.) | Site-dependent | Check with `which` before referencing |

For Singularity/Apptainer: where site policy requires image provenance review, confirm and satisfy that requirement before building or transferring images; use a site-approved transfer channel and obtain explicit user authorization before initiating any local image build or SIF transfer — provenance review is not universally mandated at all sites, so confirm applicable requirements with site support.

Verify bind-mount paths, UID mapping, and GPU device/driver library bindings on an **allocated compute node** only after confirming site permission and obtaining explicit user authorization for the compute use. GPU flags and options are site-specific and must not be assumed from external tutorials. If an allocated compute node, site permission, or explicit user authorization is unavailable, document container execution as **unverified**; policy and documentation discovery remains permitted without those prerequisites.

#### D4 — Pixi lock verification on allocated compute

Local `pixi.lock` files do not guarantee GPU driver availability, runtime version parity, or module compatibility with the HPC node environment. After transferring the project:

- [ ] Confirm Pixi installation is permitted by site policy, is available or supportable at the site, and obtain explicit user consent before installing it; writable target paths are site-defined.
- [ ] Discover `PIXI_CACHE_DIR` policy, retention schedule, and quota before writing large caches; preserve `pixi.lock` and `pixi.toml` outside any auto-purged scratch space. Offline package availability requires advance staging through site-approved channels — never assume login-node internet access or package installation is permitted.
- [ ] If the project declares a CUDA constraint, cross-check it against the node's CUDA driver version; otherwise verify host/backend compatibility via site documentation or framework guidance.
- [ ] On an **allocated compute node** (not the login node), run the smallest permitted smoke test to confirm the accelerator is reachable — only after confirming both site policy and explicit user authorization for the compute use. If allocation, site permission, or authorization is unavailable, report the accelerator check as unverified rather than skipping it silently.

#### D5 — Credentials & session hygiene

- Never commit tokens, SSH keys, or site credentials to the repository.
- Prefer site portal–managed interactive sessions (Jupyter, RStudio, VS Code) where available or required. When direct tunneling is permitted, use site-approved tunnel topology and authenticated endpoints; bind servers to the authorized interface only — not `0.0.0.0` by default, and do not expose account databases through the session. Do not open ports without explicit authorization.
- Store API tokens and job-submission credentials in environment variables or the site-approved secret store; confirm rotation and expiry policies with site support.

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
3. Add `setup` to the project `skills/INDEX`.

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

### Background examples (verify site policy — not authoritative)

- <https://pixi.prefix.dev/latest/python/pyproject_toml/> — Pixi single manifest with `pyproject.toml` (PyPI and Conda dependencies, dependency groups, `[tool.uv.sources]`)
- <https://ngs101.com/high-performance-computing-hpc-job-submission-systems-a-beginners-guide-to-slurm/> — Slurm SBATCH directives, arrays, `afterok` dependencies, `squeue`/`sacct`
- <https://ngs101.com/setting-up-single-cell-rna-seq-analysis-environment-with-pixi-10x-faster-setup-zero-version-conflicts/> — Pixi `PIXI_CACHE_DIR`, proxy/network constraints, offline staging patterns
- <https://ngs101.com/build-once-run-anywhere-creating-portable-ngs-analysis-environments-with-docker/> — Docker-to-Singularity/Apptainer SIF workflow, bind-mount paths, UID notes
- <https://ngs101.com/no-more-command-line-only-run-jupyter-lab-rstudio-and-vs-code-interactively-in-your-browser-on-any-hpc-cluster-with-pixi/> — Allocated-node interactive sessions, SSH tunnel topology, user-mapping considerations
