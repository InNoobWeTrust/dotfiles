# agent_computer

| Audience | Operators and agents that drive browsers or control headless environments from automation tools |
| --- | --- |
| Goal | Local loopback-only containers: Webtop (browser + WebDriver) and Tuxee (lightweight headless shell/filemanager) |
| Prerequisites | A reachable Podman or Docker engine; `curl` on the host for readiness probes |
| Boundary | Loopback-only published ports; no host home, display, SSH agent or engine-socket mounts; kept separate from development environments |

`agent_computer` manages two kinds of local container:

- **Webtop** (default `up`): Builds a small local image — Webtop base, a chromedriver matched to the image's Chromium and the browser launcher baked in. The automation Chromium is launched into the container; driving tools attach over WebDriver. Site logins persist in the home volume across restarts.
- **Tuxee** (explicit `up --mode tuxee`): A lightweight headless desktop providing a shell and file manager. Uses the pinned upstream image (`docker.io/agent0ai/tuxee:1.0.2`) without a local build. Operators and agent tools control it through the HTTP UI or `exec` shell. Terminal-browser is not pre-installed; operators may install it or use other tools. No Chromium, chromedriver or WebDriver bundled.

| Aspect | Webtop | Tuxee |
| --- | --- | --- |
| **Default name** | `agent-computer` | `agent-computer-tuxee` |
| **Default desktop port** | 6080 | 6081 |
| **Authentication** | HTTP Basic login for desktop; separate site logins | Root login via Linux PAM |
| **Control** | WebDriver + Chromium automation | HTTP UI / `engine exec -it <name> /bin/bash` |
| **Image** | Local build (Webtop base + chromedriver) | Pinned upstream pull |
| **Home volume** | `<name>-config` | `<name>-tuxee-root` |
| **Extra volumes** | None | `<name>-tuxee-state`, `<name>-tuxee-init` |
| **Resource options** | `--gpu-device`, `--puid`, `--pgid`, `--webdriver-port` | `--cpus`, `--memory` (fixed PID limit 4096) |
| **SELinux label** | `label=disable` (bwrap/glycin requirement) | Normal; credential mount uses shared `z` relabeling |

Automation scope is deliberately separate from the `dev_*` utilities. Webtop mode and the development environments share an upstream Webtop base; Tuxee uses its own upstream image. They do not share homes or lifecycle.

## Requirements

- A reachable container engine: rootless Podman or Docker (see [Engine notes](#engine-notes)).
- `curl` on the host: `up` and `status` use it for readiness/health probes.
- **Webtop only:** Image builds need no host tooling; `images/agent-computer/` is a self-contained build context, and the chromedriver matching the base Chromium is resolved and downloaded inside the build (network access when the build cache is cold).
- For an optional password override, prepare a dedicated file outside the repo: current owner, mode 0600, readable nonempty regular file, no symlinks and exactly one hard link. Its path cannot contain a colon, newline or carriage return.

## Quick start

### Webtop (default)

```sh
agent_computer up
```

Builds the image if needed, creates (or starts) the container, waits until the desktop answers, and launches the automation browser. Then:

1. Open `http://127.0.0.1:6080`, log in as `root` with password `agent-computer`, and log into your sites in the Chromium window.
2. Point a driving tool at `agent-computer` (the default container name).

Sessions and profiles persist in `agent-computer-config` across restarts and `rm` + `up`.

### Tuxee

```sh
agent_computer up --mode tuxee
```

The default login is `root` / `agent-computer`. If you want resource limits, use this **instead of the first command** when creating the instance:

```sh
agent_computer up agent-computer-tuxee --mode tuxee --cpus 2 --memory 512m
```

Subsequent starts require no creation flags:

```sh
agent_computer up agent-computer-tuxee
```

Access the UI on `http://127.0.0.1:6081/` or open a shell:

```sh
podman exec -it agent-computer-tuxee /bin/bash
# Docker equivalent:
docker exec -it agent-computer-tuxee /bin/bash
```

`stop` and `rm` default to `agent-computer` (Webtop); pass the Tuxee name explicitly:

```sh
agent_computer stop agent-computer-tuxee
agent_computer rm   agent-computer-tuxee
```

## Login and password overrides

For new containers in either mode, the default login is `root` / `agent-computer`. The password file is automatically created at `${XDG_CONFIG_HOME:-$HOME/.config}/agent-computer/password` with mode 0600 only if absent; an existing file is never overwritten or repaired and must pass the same metadata checks as an override. If that file already contains a different password, use that password instead. The CLI prints the initial public password only when it creates the default file; for an existing file or explicit override, it prints the file location, never its contents.

**Security:** The default password is public and is not a security boundary. Ports bind to `127.0.0.1` only; do not expose them beyond localhost. Webtop uses HTTP Basic authentication and retains `label=disable`; Tuxee uses Linux PAM and its shared SELinux `z` mount can relabel the selected password file, including an override.

To use a private password instead, create a dedicated file interactively outside the repository (this example does not echo the input):

```sh
PWFILE="$HOME/.config/agent-computer-override"
( umask 077
  [ ! -e "$PWFILE" ] && [ ! -L "$PWFILE" ] || {
    printf 'File already exists: %s\n' "$PWFILE" >&2; exit 1;
  }
  set -C # Refuse to overwrite a file created while entering the password.
  mkdir -p "$HOME/.config"
  read -r -s -p 'Container password: ' pw || exit 1
  printf '\n'
  [ -n "$pw" ] || { printf 'Password must not be empty.\n' >&2; exit 1; }
  printf '%s' "$pw" > "$PWFILE" )
agent_computer up --password-file "$PWFILE"
# Or, for a new Tuxee instance:
agent_computer up --mode tuxee --password-file "$PWFILE"
```

The override must already exist and meet the metadata requirements above; it is never created or edited by the CLI. Never put a private password value in command arguments or environment variables. `--password-file` is creation-only in both modes: to rotate a password or change its path, remove and recreate the container rather than editing the file in place. Tuxee applies its password only on first start. The default file persists even after `rm --purge`.

Existing containers are not automatically migrated to managed authentication; recreate them to apply it. Starting an existing container without the flag does not validate or change its credentials.

## Commands

| Command | Purpose |
| --- | --- |
| `up [NAME] [--mode webtop\|tuxee]` | Build (Webtop) or pull (Tuxee) if needed; create or start; wait until ready |
| `stop [NAME]` | Stop the container (default NAME: `agent-computer`) |
| `rm [NAME] [--purge]` | Remove; preserve volumes unless `--purge`. Tuxee purge requires all three volumes be owned |
| `status [NAME]` | Show one container's state, or list all agent computers |
| `names` | List instance names |
| `completion [bash\|zsh]` | Emit shell completion |
| `help` | Show help |

Existing named instances recover their mode from the container label. Passing an explicit `--mode` that mismatches the existing mode fails without mutation.

### `up` options — common

| Option | Meaning |
| --- | --- |
| `--password-file PATH` | Existing password file override, creation-only for either mode; see [Login and password overrides](#login-and-password-overrides). |

### `up` options — Webtop

| Option | Default | Meaning |
| --- | --- | --- |
| `--gpu-device PATH` | first `/dev/dri/renderD*` | Attach a specific GPU render node (auto-detected; see [GPU compatibility](#gpu-compatibility)) |
| `--tz TZ` | host timezone | Container timezone (`AGENT_COMPUTER_TZ` overrides) |
| `--puid N` / `--pgid N` | current user | Owner for the container's `abc` user |
| `--desktop-port N` | `6080` | Loopback port for the desktop UI |
| `--webdriver-port N` | `4444` | Loopback port for the WebDriver endpoint |
| `--rebuild` | | Rebuild the local image before starting |
| `--pull` | | Pull the base image while rebuilding |
| `--no-browser` | | Do not launch the automation browser |

`up` automatically builds the Webtop image or pulls the pinned Tuxee image when missing; no separate build command is needed. To clear an unused cached Webtop image, use the engine directly, then run `up`:

```sh
podman image rm agent-computer:local
# Or: docker image rm agent-computer:local
agent_computer up
```

If a container still references the image, remove it first with `agent_computer rm NAME` (without `--purge` to retain persistent data). `--rebuild` / `--pull` remain available on `up` to refresh the image without clearing it manually. Existing containers keep the image they were created with — recreate with `rm` + `up` to use new image layers.

### `up` options — Tuxee

| Option | Meaning |
| --- | --- |
| `--cpus DECIMAL` | CPU limit (e.g. `2`, `1.5`); creation-only. |
| `--memory N[b\|k\|m\|g]` | Memory limit (e.g. `512m`); creation-only. Fixed PID limit: 4096. |
| `--desktop-port N` | Loopback port (default 6081); creation-only. |
| `--tz TZ` | Container timezone; creation-only. |
| `--pull` | Refresh the pinned upstream image. Does not upgrade an existing container; recreate to use a refreshed image. |

Creation-only flags (`--password-file`, `--cpus`, `--memory`, `--desktop-port`, `--tz`) are rejected on existing Tuxee instances — `rm` then `up` to recreate.

## What `up` does

**For new containers:** prepares or validates the password file using metadata only, then mounts it read-only. Existing containers are not migrated automatically.

**Webtop:**
1. Detects the container engine and builds `agent-computer:local` if missing (or with `--rebuild` / `--pull`).
2. Creates the `<name>-config` volume (if new) and runs the container loopback-only on the desktop and WebDriver ports, with 1 GiB shared memory, a 16384 PID limit and `--security-opt label=disable` (see [Gotchas](#gotchas)).
3. Waits until the desktop web UI answers and the X server is present.
4. Launches Chromium with `--remote-debugging-port=9222` and the non-default profile `~/.chromium-automation` (Chromium ≥ 136 ignores the debug port on the default profile). The profile lives in the volume.

**Tuxee:**
1. Prepares or validates the password file metadata (never reads its contents).
2. Checks or creates the three named volumes.
3. Pulls `docker.io/agent0ai/tuxee:1.0.2` if not present (or with `--pull`).
4. Starts the container with fixed `--pids-limit=4096`; optional `--cpus` / `--memory`.
5. Waits for `http://127.0.0.1:<port>/health` to return 200.

## Volumes and purge

**Webtop:** One volume `<name>-config` (home, browser profile, site logins). `rm --purge` removes it; session data is lost.

**Tuxee:** Three volumes (all labeled `agent-computer-instance=<name>`):

| Volume | Contents |
| --- | --- |
| `<name>-tuxee-root` | Root home directory, SSH keys |
| `<name>-tuxee-state` | Tuxee application state |
| `<name>-tuxee-init` | Init scripts and configuration |

`rm` (without `--purge`) preserves all three. `rm --purge` verifies ownership of all three before any deletion; foreign or unlabeled volumes are refused. If the container is already gone, inspect volumes directly:

```sh
podman volume ls --filter label=agent-computer-instance=agent-computer-tuxee
```

## Attach contract (what driving tools rely on)

- The driver lives inside the image at `/usr/local/bin/chromedriver`, matched to the image's Chromium at build time; matched versions are recorded in `/usr/local/share/agent-computer/build-info`. After changing the base image, run `up --rebuild` so the driver major catches up.
- Driving tools start the driver inside the container via the engine's `exec` and connect through the loopback-published WebDriver port. Keep the published mapping 1:1: geckodriver validates the HTTP `Host` header, and separated host/container ports are rejected.
- Chromium attaches through `goog:chromeOptions.debuggerAddress` pointing at `127.0.0.1:9222` inside the container.
- Start chromedriver with an empty `--allowed-ips=` when reached through a forwarded port.
- The browser keeps running when a driving tool disconnects; only the driver process is per-run.

## Engine notes

- Probe order: `podman`, then `docker`. An engine that already owns the named container wins, so a container is always managed by the engine that created it. `AGENT_COMPUTER_ENGINE=podman|docker` forces one explicitly.
- Switching engines selects different container storage; volumes and images of one are invisible to the other.
- The Docker path uses the same flags and probe logic but is **untested** on the reference host. Report engine-specific issues rather than assuming parity.
- Some driving tools shell out to the `podman` CLI for inspect/exec/kill; on a Docker-only host, provide a `podman` shim or adapt the tool.

## GPU compatibility

`up` attaches the first detected render node (`/dev/dri/renderD*`) by default. A GPU is optional; hosts without one render in software (llvmpipe + x264), which is adequate for navigation, clicking, typing and screenshots.

| Host | GPU path | Result |
| ---- | -------- | ------ |
| Linux, Intel or AMD (open-source drivers) | First render node attached automatically | Full acceleration: DRI3 rendering + VA-API H.264/H.265/VP9 encoding |
| Linux, NVIDIA proprietary | Not attached by default | Software fallback; real acceleration requires manual NVIDIA runtime/CDI flags at creation (see below) |
| Linux without GPU, VM, CI, WSL2 | None | Software rendering; sufficient for automation workloads |
| macOS (Intel and Apple Silicon) | None available | Containers run in a Linux VM; no GPU passthrough (Docker Desktop supports GPUs only on Windows/WSL2); software rendering. The image is arm64-native on Apple Silicon |

- NVIDIA acceleration: install the host driver from the NVIDIA `.run` installer (distro packages are frequently problematic), then create with `--runtime nvidia --gpus all --device /dev/nvidia-modeset` (driver 595.80+; drivers 580–594 also need `nvidia-drm.modeset=1`; headless machines may need a dummy plug). Podman uses a CDI device (`nvidia.com/gpu=all`) instead. `--gpu-device` cannot pass runtime flags; without them the desktop stays on software rendering.
- `--gpu-device PATH` picks among multiple render nodes. Only the chosen node is visible inside the container; LinuxServer.io's `DRINODE` / `DRI_NODE` pinning variables are unnecessary.
- If the desktop stays on software despite an attached node, check the container logs for `DRI3` / `vaapi` lines and confirm your user can access the render node on the host (typically the `render` or `video` group).
- Extra container-side knobs (LinuxServer.io): `AUTO_GPU=false` mounts but ignores the GPU; `DISABLE_DRI3=true` runs X11 without GPU; lower stream bitrate or use JPEG encoder to relieve CPU on software rendering.

## Gotchas

- **SELinux hosts: bwrap/glycin needs `label=disable` (Webtop only).** gdk-pixbuf 2.44 loads images through glycin, which sandboxes each image load with bubblewrap. SELinux denies `container_t` the `devpts`/`proc` mounts bwrap needs, so pixbuf loads fail, the desktop session aborts in a loop, and each attempt leaks a set of daemons. Webtop containers are created with `--security-opt label=disable`. Trade-off: the container gets no SELinux type; it remains rootless and loopback-only, with a read-only credential file mount. The flag is a no-op on non-SELinux hosts. Containers created elsewhere need the same flag; it cannot be changed in place — recreate with `rm` + `up`. Tuxee does not require this override.
- **PID/X saturation collateral (Webtop).** The abort loop's leaked daemons can exhaust the default rootless PID limit of 2048 and leak X clients until the X server saturates (255 client slots). Webtop containers are created with `--pids-limit=16384` up front; if a container created elsewhere runs low, `podman update --pids-limit=16384 <c>` repairs it.
- **`pkill -f <pattern>` self-matches** the invoking shell; use exact PIDs (driving tools commonly track per-run driver PIDs in pid files).
- **The desktop UI has passwordless sudo inside the Webtop container.** The public default password is not a security boundary; never publish ports beyond `127.0.0.1`.
- One WebDriver client at a time per browser; multiple browsers cannot share one profile directory simultaneously.

## Layout

| Path | Contents |
| --- | --- |
| `agent_computer.sh` | The lifecycle CLI |
| `modes/webtop.sh` | Webtop image build, GPU selection, readiness and browser launch |
| `modes/tuxee.sh` | Tuxee volume management, container create and health wait |
| `credentials.sh` | Shared credential file metadata and preparation |
| `images/agent-computer/` | Self-contained Webtop build context: `Dockerfile`, `fetch-chromedriver.sh`, `start-chromium-automation.sh` |
| `completion.bash`, `completion.zsh` | Shell completion for the CLI |

## Verification log

Historical pre-authentication reference host: Bazzite (Silverblue-family), rootless Podman 5.8.7, Chromium 155 (Ubuntu-based Webtop image); verified 2026-10-18/19. HTTP 200 observations below predate managed login:

- Image builds as `agent-computer:local` with Chromium `155.0.8059.39` and chromedriver `155.0.8059.39` (resolved for the image's Chromium via Chrome for Testing).
- Desktop answers `200` on `http://127.0.0.1:6080/` and the WebDriver port is published 1:1 on `127.0.0.1:4444`.
- `chromedriver --port=4444 --allowed-ips=` runs inside the container; a WebDriver `POST /session` with `debuggerAddress: 127.0.0.1:9222` attaches to the running Chromium, and killing the driver leaves the browser running.
- `/json/version` inside the container reports `Chrome/155.0.8059.39` with a live debugging websocket.

SELinux/bwrap root cause verified and fixed, 2026-10-19 (same host):

- **Root cause chain:** SELinux enforcing denies `container_t` the devpts/proc mounts bubblewrap needs → bwrap exits 1 → gdk-pixbuf 2.44 (glycin 2.1.5 sandbox) pixbuf loads fail → GTK cannot load icon-theme pixbufs → libwnck `default_icon_at_size` assertion → xfce4-session SIGABRT loop → leaked session daemons saturate PIDs and X clients.
- **Fix:** Webtop containers created with `--security-opt label=disable`; a no-op on non-SELinux hosts. Create-time options cannot be changed in place — apply with `rm` + `up`.
- Live recreate: image `06ec1e396be3`, `SecurityOpt: ["label=disable"]`; in-container bwrap rc=0, pixbuf LOAD-OK 48×48, Chrome/155.0.8059.39 CDP on `127.0.0.1:9222`, desktop 200, baked launcher sha256 prefix `e6e9f322c04d`. Session counts stable over 25 s (xfce=2, dbus=4, xfconfd=1).

GPU passthrough, verified 2026-10-19:

- Container logs show `Xvfb using DRI3 on /dev/dri/renderD128 (i915)` and `[pixelflux] Render node 0 encodes H264, VP9, H265 on vaapi.`
- Rootless Podman can report an empty `HostConfig.Devices` in `inspect` even when `--device` was applied (device nodes are materialized through the user namespace); verify device presence from inside the container.

HTTP port and rename, verified 2026-10-19:

- Webtop serves the UI over plain **http** on container port **3000**. The CLI publishes loopback **6080 → 3000** and prints an `http://` URL.
- Renamed from `automation_desktop` to `agent_computer`: image `agent-computer:local`, default container name `agent-computer`, env prefix `AGENT_COMPUTER_`.

Self-contained image build, verified 2026-10-19:

- A builder stage runs `fetch-chromedriver.sh`, which reads the base Chromium version, resolves the matching Chrome for Testing build (arch-aware: `linux64` / `linux-arm64`) and stages the binary and a `build-info` file; the final stage copies in only those artifacts and the launcher. For a manual `podman build` or `docker build`, `--build-arg DRIVER_URL=URL` overrides resolution.
- `resolve_driver` picks the CfT platform from the host architecture, so builds on Apple Silicon resolve a matching arm64 chromedriver.
- `engine_reachable` uses `timeout` when installed, `gtimeout` (Homebrew coreutils) on macOS, or an unbounded probe otherwise.

Tuxee runtime, verified (rootless Podman 5.8.9):

- Image `docker.io/agent0ai/tuxee:1.0.2` (imageID `2cc707…`), `/health` → 200, `exec` as root confirmed. Three volumes created with ownership labels. `--cpus 1 --memory 512m --pids-limit 4096` applied. Normal SELinux (no label override). No browser or chromedriver present in the image. Authenticated UI control not exercised in this verification pass.
