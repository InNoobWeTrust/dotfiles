# agent_computer

| Audience | Operators and agents that drive logged-in browsers from automation tools |
| --- | --- |
| Goal | A local, loopback-only Webtop desktop whose browser can be attached and driven over WebDriver |
| Prerequisites | A reachable Podman or Docker engine; `curl` on the host for readiness probes (`jq` optional, for port discovery) |
| Boundary | Loopback-only published ports; no host home, display, SSH agent or engine-socket mounts; kept separate from development environments |

`agent_computer` manages the **agent computer**: a local Webtop
container that hosts browsers which automation tools and agents attach to and
drive from outside. It builds its own small image — the Webtop base plus a
chromedriver matched to the image's Chromium and the browser launcher baked
in — so re-creating the desktop loses nothing: site logins live in the home
volume, not in the container or this repository.

Automation scope is deliberately separate from the `dev_*` utilities. Those
serve persistent development environments on remote machines; this desktop is
a local container for automation tools and agents. The two never share homes,
credentials or lifecycle. Both happen to build on the same upstream base
(`lscr.io/linuxserver/webtop:ubuntu-xfce`) — that is the only relation.

## Requirements

- A reachable container engine: rootless Podman or Docker. The CLI probes
  `podman` then `docker` (see [Engine notes](#engine-notes)).
- `curl` on the host: `up` and `status` use it for readiness/health probes.
  `jq` is optional — without it, `up` falls back to the configured desktop
  port instead of discovering the published one.
- Image builds need no host tooling: `images/agent-computer/` is a
  self-contained build context, and the chromedriver matching the base
  image's Chromium is resolved and downloaded inside the build (network
  access is required when the build cache is cold).
- A driving tool on the same host for the WebDriver attach (see
  [Attach contract](#attach-contract-what-driving-tools-rely-on) below).

## Quick start

```sh
agent_computer up
```

This builds the image if needed, creates (or starts) the container, waits
until the desktop answers, and launches the automation browser. Then:

1. Open `http://127.0.0.1:6080` and log into your sites once in the
   automation Chromium window.
2. Point a driving tool at the container by name — pass `agent-computer` (the
   CLI default) through whatever container flag or variable your tool expects.

`up` launches the browser (unless `--no-browser`); if it was closed, run
`agent_computer up` again to relaunch it.

Sessions and profiles persist in the `<name>-config` volume across restarts
and across `rm` + `up`, so the manual login is one-time.

## Commands

| Command | Purpose |
| --- | --- |
| `up [NAME]` | Build if needed, create or start, wait until ready, launch the browser |
| `stop [NAME]` | Stop the container |
| `rm [NAME] [--purge]` | Remove the container; `--purge` also deletes the home volume |
| `status [NAME]` | Show one desktop's state, or list all desktops |
| `build [--pull] [--driver-url URL]` | Build or refresh the image (self-contained; the matching chromedriver is resolved inside the build) |
| `names` | List instance names |
| `completion [bash\|zsh]` | Emit shell completion |
| `help` | Show help |

`NAME` defaults to `agent-computer`; several desktops can coexist under
different names.

### `up` options

| Option | Default | Meaning |
| --- | --- | --- |
| `--gpu-device PATH` | first `/dev/dri/renderD*` | Attach a specific GPU node (multi-GPU hosts); the first detected render node is attached automatically (see [GPU compatibility](#gpu-compatibility)) |
| `--tz TZ` | host timezone | Container timezone (`AGENT_COMPUTER_TZ` overrides) |
| `--puid N` / `--pgid N` | current user | Owner for the container's `abc` user |
| `--desktop-port N` | `6080` | Loopback port for the desktop UI |
| `--webdriver-port N` | `4444` | Loopback port for the WebDriver endpoint |
| `--rebuild` | | Rebuild the image before starting |
| `--pull` | | Pull the base image while building |
| `--no-browser` | | Do not launch the automation browser |

Creation options (ports, GPU, timezone) only apply when the container is first
created; recreate with `rm` + `up` to change them.

## What `up` does

1. Detects the container engine (see below) and builds
   `agent-computer:local` if missing (or with `--rebuild`/`--pull`).
2. Creates the `<name>-config` volume (if new) and runs the container as
   `127.0.0.1`-only on the desktop and WebDriver ports, with `1 GiB` shared
   memory, a `16384` PID limit and `--security-opt label=disable` (see
   [Gotchas](#gotchas)).
3. Waits until the desktop web UI answers and the X server is present.
4. Launches the browser (unless `--no-browser`): Chromium with
   `--remote-debugging-port=9222` and the non-default profile
   `~/.chromium-automation` (Chromium ≥ 136 ignores the debug port on the
   default profile). The profile and all site logins live in the volume.

## Attach contract (what driving tools rely on)

- The driver lives inside the image at `/usr/local/bin/chromedriver`, matched
  to the image's Chromium at build time; the matched versions are recorded in
  `/usr/local/share/agent-computer/build-info`. After changing the base image,
  run `up --rebuild` so the driver major catches up.
- Driving tools start the driver inside the container (via the resolved
  engine's `exec`) and connect through the loopback-published WebDriver port.
  Keep the published mapping 1:1: geckodriver validates the HTTP `Host`
  header, and separated host/container ports are rejected.
- Chromium attaches through `goog:chromeOptions.debuggerAddress` pointing at
  `127.0.0.1:9222` inside the container.
- chromedriver should be started with an empty `--allowed-ips=` when reached
  through a forwarded port, because forwarded connections lose their source
  address.
- The browser keeps running when a driving tool disconnects; only the driver
  process is per-run.

## Engine notes

- Probe order: `podman`, then `docker`. An engine that already owns the named
  container wins, so a desktop is always managed by the engine that created
  it. `AGENT_COMPUTER_ENGINE=podman|docker` forces one explicitly.
- Switching engines selects different container storage: the volume and image
  of one engine are invisible to the other.
- The Docker path uses the same flags and follows the same probe logic, but
  the reference host has no Docker installed, so it is **untested**. Report
  engine-specific issues rather than assuming parity.
- Some driving tools shell out to the `podman` CLI for inspect/exec/kill; on a
  Docker-only host, provide a `podman` shim that forwards to Docker or adapt
  the tool. The container-side contract is engine-identical.

## GPU compatibility

`up` attaches the first detected render node (`/dev/dri/renderD*`) by default.
A GPU is optional: hosts without one still come up and render in software
(llvmpipe + x264), which is adequate for navigation, clicking, typing and
screenshots. Behavior by host:

| Host | GPU path | Result |
| ---- | -------- | ------ |
| Linux, Intel or AMD (open-source drivers) | first render node attached automatically | Full acceleration: DRI3 rendering + VA-API H.264/H.265/VP9 encoding |
| Linux, NVIDIA proprietary | not attached by default | Software fallback; for real acceleration the container must be created with NVIDIA runtime/CDI flags (see below) |
| Linux without GPU, VM, CI, WSL2 | none | Software rendering; sufficient for automation workloads |
| macOS (Intel and Apple Silicon) | none available | Containers run in a Linux VM with no GPU passthrough (Docker Desktop supports GPUs only on Windows/WSL2; the podman machine libkrun `venus` path needs a patched Mesa the image does not ship), so software rendering. The image is arm64-native on Apple Silicon |

- NVIDIA acceleration is a manual, create-time path: install the host driver
  from the NVIDIA `.run` installer (distro packages are frequently
  problematic), then create with `--runtime nvidia --gpus all --device
  /dev/nvidia-modeset` (driver 595.80+; drivers 580–594 also need
  `nvidia-drm.modeset=1` and `nvidia_drm.fbdev=1`; headless machines may need
  a dummy plug and a one-time `nvidia-modprobe --modeset`). Podman uses a CDI
  device (`nvidia.com/gpu=all`) instead. `--gpu-device` cannot pass runtime
  flags; without them the desktop simply stays on software rendering. Not
  available on Alpine-based Webtop tags.
- `--gpu-device PATH` picks among multiple `/dev/dri/renderD*` nodes. Only the
  chosen node is visible inside the container, so LinuxServer.io's `DRINODE` /
  `DRI_NODE` pinning variables are unnecessary.
- If the desktop stays on software despite an attached node, check the
  container logs for the `DRI3` / `vaapi` lines and that your user can access
  the render node on the host (typically the `render` or `video` group).
- Extra container-side knobs (LinuxServer.io): `AUTO_GPU=false` mounts but
  ignores the GPU; `DISABLE_DRI3=true` runs X11 without GPU; lower the stream
  bitrate or use the JPEG encoder to relieve CPU on software rendering.

## Gotchas

- **SELinux hosts: bwrap/glycin needs `label=disable`.** gdk-pixbuf 2.44
  loads images through glycin, which sandboxes each image load with
  bubblewrap. SELinux denies `container_t` the `devpts`/`proc` mounts bwrap
  needs, so pixbuf loads fail, the desktop session (`xfce4-session`) aborts in
  a loop, and each attempt leaks a set of session daemons. `up` therefore
  creates the container with `--security-opt label=disable`. Trade-off: the
  container gets no SELinux type; it remains rootless, loopback-only and
  mount-free, so the boundary is the rootless engine plus the loopback
  binding. The flag is a no-op on non-SELinux hosts. Containers created
  elsewhere need the same flag; it cannot be changed in place — recreate with
  `rm` + `up`.
- **PID/X saturation collateral.** The abort loop's leaked session daemons can
  exhaust the default rootless PID limit of 2048 and leak X clients until the
  X server saturates (255 client slots). This utility creates containers with
  `--pids-limit=16384` up front; if a container created elsewhere runs low,
  `podman update --pids-limit=16384 <c>` repairs it.
- **`pkill -f <pattern>` self-matches** the invoking shell; use exact PIDs
  (driving tools commonly track per-run driver PIDs in pid files).
- **The desktop UI has passwordless sudo inside the container.** The loopback
  binding is the access boundary — never publish the ports beyond `127.0.0.1`.
- One WebDriver client at a time per browser; multiple browsers cannot share
  one profile directory simultaneously.

## Layout

| Path | Contents |
| --- | --- |
| `agent_computer.sh` | The lifecycle CLI (this utility's entry point) |
| `images/agent-computer/` | Self-contained build context for the desktop image: `Dockerfile` (builder stage resolves the driver; final stage receives only the binary), `fetch-chromedriver.sh` (driver resolution and download), `start-chromium-automation.sh` (browser launcher; baked to `/usr/local/bin`) |
| `completion.bash`, `completion.zsh` | Shell completion for the CLI |

## Verification log

Reference host: Bazzite (Silverblue-family), rootless Podman 5.8.7, Chromium
155 (Ubuntu-based Webtop image); verified 2026-10-18/19:

- Image builds as `automation-desktop:local` with Chromium `155.0.8059.39` and
  chromedriver `155.0.8059.39` (resolved for the image's Chromium via Chrome
  for Testing).
- Desktop answers `200` on `https://127.0.0.1:3001/` (no login gate; loopback
  is the boundary) and the WebDriver port is published 1:1 on
  `127.0.0.1:4444`.
- `chromedriver --port=4444 --allowed-ips=` runs inside the container; a
  WebDriver `POST /session` with `debuggerAddress: 127.0.0.1:9222` attaches to
  the running Chromium, and killing the driver leaves the browser running.
- `/json/version` inside the container reports `Chrome/155.0.8059.39` with a
  live debugging websocket.

SELinux/bwrap root cause verified and fixed, 2026-10-19 (same host):

- **Root cause chain:** SELinux enforcing denies `container_t` the devpts/proc
  mounts bubblewrap needs → bwrap exits 1 → gdk-pixbuf 2.44 (glycin 2.1.5
  sandbox) pixbuf loads fail → GTK cannot load icon-theme pixbufs → libwnck
  `default_icon_at_size` assertion → xfce4-session SIGABRT loop → leaked
  session daemons saturate PIDs and X clients.
- **Fix:** containers created with `--security-opt label=disable`; a no-op on
  non-SELinux hosts, documented in Gotchas as an accepted trade-off. Create-time
  options cannot be changed in place — apply with `rm` + `up`.
- Throwaway-container test: bwrap rc=0 and GdkPixbuf PNG LOAD-OK only with
  `label=disable`; fails without it.
- Live recreate: `automation-desktop:local` image `06ec1e396be3`,
  `SecurityOpt: ["label=disable"]`; in-container bwrap rc=0, pixbuf LOAD-OK
  48×48, Chrome/155.0.8059.39 CDP on `127.0.0.1:9222`, desktop
  `https://127.0.0.1:3001` → 200, baked launcher sha256 prefix `e6e9f322c04d`.
- Session counts stable over 25 s (xfce=2, dbus=4, xfconfd=1; procs 106→91);
  ports loopback-only 3001 and 4444.

GPU passthrough (`up --gpu`), verified 2026-10-19 (the `--gpu` flag has since
been removed — GPU attach is now the default):

- `Config.CreateCommand` includes `--device /dev/dri/renderD128`, the node is
  visible at `/dev/dri/renderD128` inside the container, and a container
  created without `--gpu` has no `/dev/dri` at all.
- Rootless Podman can report an empty `HostConfig.Devices` in `inspect` even
  though the flag was applied (device nodes are materialized through the user
  namespace); verify device presence from inside the container instead of that
  field.

HTTP port and rename, verified 2026-10-19:

- Webtop serves the UI over plain **http** on container port **3000** (3001 is TLS-only). The CLI publishes host loopback port **6080 → 3000** and prints an `http://` URL, so browsers no longer hit certificate warnings.
- GPU passthrough is automatic: every `up` attaches the first detected render node (`/dev/dri/renderD*`; only `/dev/dri/renderD128` exists on this host), so agents get GPU rendering/encoding by default. `--gpu-device PATH` selects a specific device on multi-GPU hosts; a host without a render node still comes up, without GPU. The `--gpu` flag was removed.
- Renamed from `automation_desktop` to `agent_computer`: image `agent-computer:local`, default container name `agent-computer`, env prefix `AGENT_COMPUTER_`. The old image `automation-desktop:local` is left untouched.

Desktop menu entry removed; terminal-driven launch, verified 2026-10-19:

- The `chromium-automation.desktop` XDG entry is gone from the image and the
  build context (image `agent_computer:local` `0b2ddaca5d49`); no references
  remain repo-wide. The browser is launched by `up` via
  `/usr/local/bin/start-chromium-automation.sh`; `up` on a running container
  relaunches it if it was closed.
- Recreate proof on the new image: the menu entry file is absent inside the
  container, `/dev/dri/renderD128` is attached, desktop `http://127.0.0.1:6080/`
  answers 200, CDP reports `Chrome/155.0.8059.39`, and the `-config` volume was
  left untouched (logins persisted).

GPU compatibility documented; host portability fixes, verified 2026-10-19:

- Container proof for the auto-attach path: logs show `Xvfb using DRI3 on
  /dev/dri/renderD128 (i915)` and `[pixelflux] Render node 0 encodes H264, VP9,
  H265 on vaapi.` — one render node covers both rendering and hardware
  encoding on Intel/AMD (see [GPU compatibility](#gpu-compatibility)).
- `resolve_driver` now picks the Chrome for Testing platform from the host
  architecture (`linux64`, or `linux-arm64` on `arm64`/`aarch64`), so builds on
  Apple Silicon — where Webtop runs arm64-native — resolve a matching
  chromedriver; both CfT URLs verified for `155.0.8059.39` (untested on real
  Apple hardware).
- `engine_reachable` no longer depends on GNU `timeout`: it uses `timeout` when
  installed, `gtimeout` (Homebrew coreutils) on macOS, or an unbounded probe
  otherwise; `bash -n`, shellcheck, `names` and a full cached `build` pass
  after the change.

Self-contained image build; CLI staging removed, verified 2026-10-19:

- The image builds end-to-end from `images/agent-computer/` alone: a builder
  stage (same base) runs `fetch-chromedriver.sh`, which reads the base Chromium
  version, resolves the matching Chrome for Testing build (arch-aware:
  `linux64` / `linux-arm64`) and stages the binary plus a `build-info` file;
  the final stage copies in only those artifacts and the launcher, so no build
  residue remains (`fetch-chromedriver` is absent from the final image and the
  baked driver runs as `ChromeDriver 155.0.8059.39`). `build --driver-url URL`
  still overrides resolution through the `DRIVER_URL` build arg.
- Proof without the CLI: a fresh copy of the directory outside the repo built
  clean with `podman build --no-cache`; `agent_computer build` builds the same
  context end-to-end and reports `Built agent-computer:local (Chromium
  155.0.8059.39, chromedriver 155.0.8059.39)` read back from
  `/usr/local/share/agent-computer/build-info`; image `7fcdb98ad464` replaces
  `0b2ddaca5d49`.
- Host tooling dropped: builds no longer need `jq`, `unzip` or host staging
  (the old `~/.cache/agent_computer` is unused); only `curl` remains for
  readiness/health probes. Recreate on the new image verified: desktop 200,
  CDP `Chrome/155.0.8059.39`, `/dev/dri/renderD128` attached, menu entry still
  absent, `-config` volume untouched.
