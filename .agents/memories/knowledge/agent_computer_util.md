---
kind: knowledge
memory_scope: project
repo_id: dotfiles
created: 2026-10-18
updated: 2026-10-19
---
# agent_computer utility

Lifecycle CLI for an isolated, loopback-only browser-automation desktop: a
LinuxServer.io Webtop (XFCE) container running Chromium with a matching
chromedriver. An agent or a human calls the CLI, then drives the resulting
computer over WebDriver or CDP; the desktop UI itself is only needed for the
one-time manual site logins.

## Current state

- Location `.sh.d/utils/agent_computer/`; image `agent-computer:local`
- Container name: CLI default `agent-computer`; instances are named per use and
  several can coexist
- Terminal-first workflow: `up` creates/starts the container and launches the
  browser; `up` on an existing container relaunches the browser if it was closed
- Persistence: the `<name>-config` volume keeps desktop/browser state and
  one-time logins across `rm` + `up`

## CLI surface

- Kept: `up | stop | rm | status | build | names | completion | help`
- Removed `exec` and `logs`: they duplicated `podman exec`/`logs` and lazydocker
  (pixi `dev` env)

## Container contract

- Desktop UI: host `127.0.0.1:6080` → container `3000`, plain http (no cert
  warning on loopback); the earlier TLS/3001 iteration is superseded
- WebDriver: `127.0.0.1:4444`, loopback only
- Volume: `<name>-config`, created on first `up`
- Verified 2026-10-19 on the reference host: image `7fcdb98ad464`, desktop
  `http://127.0.0.1:6080/` → 200, CDP `Chrome/155.0.8059.39`, render node
  attached, volume untouched across recreate

## Image build (self-contained)

- Build context `images/agent-computer/`: `Dockerfile` + `fetch-chromedriver.sh`
  + `start-chromium-automation.sh`
- Two-stage build: the builder stage resolves and downloads the matching
  chromedriver — arch-aware Chrome for Testing platform, `linux64`/`linux-arm64`
  — using the base image's curl+jq+unzip; the final stage copies only the driver,
  `build-info` and the launcher. No build residue, no host staging, and
  `podman build .` works standalone.
- `build-info` lands at `/usr/local/share/agent-computer/build-info`; the `build`
  subcommand reads the Chromium/chromedriver versions back from it
- Optional `--driver-url` build arg overrides driver resolution
- Host CLI needs only `curl` (`jq` optional); the old host-side probe/download
  cache `~/.cache/agent_computer` was removed

## GPU posture

- Default: every `up` auto-attaches the first `/dev/dri/renderD*` render node;
  a host without one still comes up with software rendering. This replaced the
  removed `--gpu` flag.
- `--gpu-device PATH`: explicit selection on multi-GPU hosts
- Intel/AMD (proven): one render node covers rendering and encode — DRI3 on
  `renderD128` plus VA-API H.264/H.265/VP9
- NVIDIA (manual, create-time): host `nvidia-container-toolkit`
  (`--runtime nvidia --gpus all --device /dev/nvidia-modeset` on driver 595.80+,
  or Podman CDI `nvidia.com/gpu=all`); cannot be added to an existing container
- No GPU, macOS and WSL2: software rendering (llvmpipe + x264) is the automatic,
  documented fallback. macOS runs containers only — no `/dev/dri` passthrough,
  Docker Desktop exposes no GPU, and podman libkrun Venus needs a patched Mesa
  the image does not ship — but the Webtop image is arm64-native.

## SELinux and create-time gotchas

- Root cause (2026-10-19): SELinux enforcing denies `container_t` the devpts/proc
  mounts bubblewrap needs → `bwrap` fails → glycin/gdk-pixbuf sandbox pixbuf
  loads fail → libwnck assertion → `xfce4-session` SIGABRT loop → leaked session
  daemons saturate PIDs and X clients
- Fix: create with `--security-opt label=disable` (no-op off SELinux)
- Invariant: create-time options (ports, GPU, security-opt) cannot be changed in
  place — recreate with `rm` + `up`
- Historical: a rootless-Podman PID exhaustion incident (default 2048) led to
  `--pids-limit 16384`; moot for new creates

## Host environment and toolchain notes

- Rust toolchain: pixi global env `rust` — `[envs.rust]`: rust 1.99.0,
  pkg-config 0.29.2, openssl 4.0.3, with `cargo`/`rustc` exposed via
  `~/.pixi/bin`. conda rustc bakes a RUNPATH to `~/.pixi/envs/rust/lib`, so
  OpenSSL 4 resolves at runtime without env vars or project config; the old
  project-level `.cargo/config.toml` PKG_CONFIG_PATH shim was removed.
  Homebrew rust stays installed but shadowed (`~/.pixi/bin` precedes linuxbrew);
  `bootstrap.sh` updates the env via `pixi global update … rust`.
- Portability: `engine_reachable` no longer requires GNU `timeout` — it uses
  `gtimeout` on macOS or an unbounded probe — so the CLI probes the engine on
  stock macOS too.

## Origin and boundaries

- Grew out of a closed dev_workspace + Webtop TODO (2026-10-18) but ships as a
  standalone utility: the browser-automation desktop stays deliberately separate
  from `dev_workspace`/`dev_tailscale` — no shared homes, credentials or
  lifecycle — and consumer projects only attach to and drive the container.
  The dev_* utilities carry no Webtop features.
- The desktop menu entry `chromium-automation.desktop` was dropped; the browser
  is launched by the CLI only.

## Milestones

| Date | Milestone |
|---|---|
| 2026-10-18 | Shipped as `automation_desktop`, kept separate from the dev_* utilities |
| 2026-10-19 | SELinux crash-loop root cause found; `--security-opt label=disable` verified |
| 2026-10-19 | Renamed to `agent_computer`; desktop UI moved to plain http 6080 → 3000 |
| 2026-10-19 | GPU auto-attach on every `up`; `--gpu` flag and `exec`/`logs` removed |
| 2026-10-19 | GPU compatibility documented; macOS portability fix (`gtimeout`) |
| 2026-10-19 | Self-contained two-stage image build; desktop menu entry dropped |
