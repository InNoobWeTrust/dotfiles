#!/usr/bin/env bash
# Lifecycle CLI for the agent computer. Always execute, never source:
# error handling and traps must not affect the caller's shell.
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)

IMAGE="agent-computer:local"
BASE_IMAGE="${AGENT_COMPUTER_BASE_IMAGE:-lscr.io/linuxserver/webtop:ubuntu-xfce}"
DEFAULT_NAME="agent-computer"
LABEL="agent-computer=true"
DEFAULT_DESKTOP_PORT=6080
DEFAULT_WEBDRIVER_PORT=4444

die() { printf '%s\n' "agent_computer: $*" >&2; exit 1; }
note() { printf '%s\n' "$*"; }

usage() {
  cat <<'EOF'
Usage: agent_computer <command> [options]

Manage the agent computer: a local, loopback-only Webtop container whose
browser is attached and driven by automation tools and agents over WebDriver.
It is deliberately separate from the dev_* utilities: those persist development
environments on remote machines, while this desktop is a local container for
automation tools.

Commands:
  up [NAME] [--gpu-device PATH] [--tz TZ] [--puid N] [--pgid N]
            [--desktop-port N] [--webdriver-port N]
            [--rebuild] [--pull] [--no-browser]
                          Build the image if needed, create or start the
                          container, wait until the desktop answers, then start
                          the automation browser and its WebDriver server on the
                          published WebDriver port. --no-browser skips both (start
                          them yourself inside the container). NAME defaults to
                          agent-computer. The first detected GPU render node
                          (/dev/dri/renderD*) is attached automatically when
                          available; --gpu-device picks a specific device.
  stop [NAME]             Stop the container.
  rm [NAME] [--purge]     Remove the container. --purge also deletes the home
                          volume (site logins and profiles are lost).
  status [NAME]           Show one desktop's state, or list all desktops.
  build [--pull] [--driver-url URL]
                          Build or refresh the agent-computer image from the
                          self-contained context in images/agent-computer/;
                          the matching chromedriver is resolved inside the
                          build.
  names                   List instance names.
  completion [bash|zsh]   Emit shell completion.
  help, -h, --help        Show this help.

Environment:
  AGENT_COMPUTER_ENGINE      Force the container engine (podman or docker).
  AGENT_COMPUTER_BASE_IMAGE  Override the Webtop base image.
  AGENT_COMPUTER_TZ          Override the container timezone.
EOF
}

engine_reachable() {
  command -v "$1" >/dev/null 2>&1 || return 1
  # GNU timeout is not present on macOS by default; gtimeout ships with
  # Homebrew coreutils. Fall back to an unbounded probe if neither exists.
  local timeout_cmd=""
  if command -v timeout >/dev/null 2>&1; then
    timeout_cmd=timeout
  elif command -v gtimeout >/dev/null 2>&1; then
    timeout_cmd=gtimeout
  fi
  if [ -n "$timeout_cmd" ]; then
    "$timeout_cmd" 5 "$1" info >/dev/null 2>&1
  else
    "$1" info >/dev/null 2>&1
  fi
}

container_exists() {
  [ -n "$("$1" ps -a -q --filter "name=^$2\$" 2>/dev/null)" ]
}

container_running() {
  [ "$("$1" inspect -f '{{.State.Running}}' "$2" 2>/dev/null)" = "true" ]
}

# Echoes the engine to use. AGENT_COMPUTER_ENGINE forces one; otherwise
# probe podman then docker. An engine that already owns the named container
# wins, so a desktop is only ever managed by the engine that created it
# (switching engines selects different container storage).
detect_engine() {
  local name="$1" candidate
  if [ -n "${AGENT_COMPUTER_ENGINE:-}" ]; then
    engine_reachable "$AGENT_COMPUTER_ENGINE" ||
      die "engine '$AGENT_COMPUTER_ENGINE' (AGENT_COMPUTER_ENGINE) is not reachable."
    printf '%s\n' "$AGENT_COMPUTER_ENGINE"
    return 0
  fi
  local reachable=()
  for candidate in podman docker; do
    if engine_reachable "$candidate"; then
      reachable+=("$candidate")
    fi
  done
  [ "${#reachable[@]}" -gt 0 ] ||
    die "Install Podman or Docker on the host to use agent_computer."
  for candidate in "${reachable[@]}"; do
    if container_exists "$candidate" "$name"; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  printf '%s\n' "${reachable[0]}"
}

# Echoes the host port published for a container-side port, or nothing.
published_port() {
  local engine="$1" name="$2" cport="$3"
  command -v jq >/dev/null 2>&1 || return 0
  "$engine" inspect "$name" 2>/dev/null | jq -r --arg key "$cport/tcp" '
    (if type == "array" then (.[0] // {}) else . end)
    | (.NetworkSettings.Ports[$key]? // []) as $entries
    | ($entries | if type == "array" then (.[0] // {}) else . end)
    | .HostPort? // empty
  '
}

detect_tz() {
  if [ -n "${AGENT_COMPUTER_TZ:-}" ]; then
    printf '%s\n' "$AGENT_COMPUTER_TZ"
    return 0
  fi
  local tz=""
  if [ -L /etc/localtime ]; then
    tz=$(readlink /etc/localtime | sed -n 's#.*/zoneinfo/##p')
  fi
  if [ -z "$tz" ] && [ -r /etc/timezone ]; then
    tz=$(head -n 1 /etc/timezone)
  fi
  [ -n "$tz" ] || tz="UTC"
  printf '%s\n' "$tz"
}

image_exists() {
  "$1" image inspect "$2" >/dev/null 2>&1
}

build_image() {
  local engine="$1" pull="$2" driver_url="${3:-}"
  local -a pull_arg=()
  if [ "$pull" -eq 1 ]; then
    case "${engine##*/}" in
      *podman*) pull_arg=(--pull=always) ;;
      *) pull_arg=(--pull) ;;
    esac
  fi

  # The image directory is a self-contained build context: the Dockerfile
  # resolves and downloads a chromedriver matching the base image's Chromium
  # inside a builder stage, so no host tooling or staging files are needed.
  local context="$script_dir/images/agent-computer"
  local -a build_args=(--build-arg "BASE_IMAGE=$BASE_IMAGE")
  if [ -n "$driver_url" ]; then
    build_args+=(--build-arg "DRIVER_URL=$driver_url")
  fi

  note "Building $IMAGE ..."
  "$engine" build -t "$IMAGE" ${pull_arg[@]+"${pull_arg[@]}"} "${build_args[@]}" "$context"

  local info chromium_version="" driver_version=""
  info=$("$engine" run --rm --entrypoint /usr/bin/cat "$IMAGE" \
    /usr/local/share/agent-computer/build-info 2>/dev/null || true)
  chromium_version=$(printf '%s\n' "$info" | sed -n 's/^chromium=//p')
  driver_version=$(printf '%s\n' "$info" | sed -n 's/^chromedriver=//p')
  if [ -n "$chromium_version" ]; then
    note "Built $IMAGE (Chromium ${chromium_version}, chromedriver ${driver_version:-unknown})."
  else
    note "Built $IMAGE."
  fi
}

wait_ready() {
  local engine="$1" name="$2" desktop_port="$3" code elapsed=0
  note "Waiting for the desktop to answer on http://127.0.0.1:${desktop_port}/ ..."
  while :; do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 \
      "http://127.0.0.1:${desktop_port}/" 2>/dev/null || true)
    if [ "$code" = "200" ]; then
      break
    fi
    if ! container_running "$engine" "$name"; then
      "$engine" logs --tail 40 "$name" 2>&1 || true
      die "Container '$name' exited while waiting for the desktop."
    fi
    if [ "$elapsed" -ge 180 ]; then
      "$engine" logs --tail 40 "$name" 2>&1 || true
      die "Desktop did not become ready within 180s."
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  # The web server can answer before X is up on a first boot; give the X
  # server a bounded extra wait so the browser can start immediately.
  elapsed=0
  while ! "$engine" exec "$name" sh -c 'pgrep -x Xvfb >/dev/null || pgrep -x Xorg >/dev/null' 2>/dev/null; do
    if [ "$elapsed" -ge 120 ]; then
      note "Warning: X server not detected after 120s; continuing anyway."
      break
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  note "Desktop is up."
}

ensure_browser() {
  local engine="$1" name="$2"
  if "$engine" exec "$name" sh -c 'pgrep -f "[r]emote-debugging-port=9222" >/dev/null' 2>/dev/null; then
    note "Automation browser already running (remote debugging port 9222)."
    return 0
  fi
  note "Launching the automation browser ..."
  "$engine" exec -d -u abc -e HOME=/config -e DISPLAY=:1 "$name" \
    /bin/bash /usr/local/bin/start-chromium-automation.sh
  sleep 3
  if "$engine" exec "$name" sh -c 'pgrep -f "[r]emote-debugging-port=9222" >/dev/null' 2>/dev/null; then
    note "Browser launched."
  else
    note "Warning: the browser is not detected yet; check the container logs or the desktop UI."
  fi
}

ensure_webdriver() {
  local engine="$1" name="$2"
  if "$engine" exec "$name" sh -c 'pgrep -f "[c]hromedriver --port=" >/dev/null' 2>/dev/null; then
    note "WebDriver server already running."
    return 0
  fi
  note "Starting the WebDriver server ..."
  "$engine" exec -d -u abc -e HOME=/config "$name" \
    /bin/bash /usr/local/bin/start-webdriver.sh
  sleep 2
  if "$engine" exec "$name" sh -c 'pgrep -f "[c]hromedriver --port=" >/dev/null' 2>/dev/null; then
    note "WebDriver server started."
  else
    note "Warning: the WebDriver server is not detected yet; check the container logs."
  fi
}

cmd_up() {
  local name="$DEFAULT_NAME" gpu_device="" tz="" puid="" pgid=""
  local desktop_port="$DEFAULT_DESKTOP_PORT" webdriver_port="$DEFAULT_WEBDRIVER_PORT"
  local rebuild=0 pull=0 launch_browser=1
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --gpu-device)
        [ "$#" -ge 2 ] || die "up: --gpu-device requires a value."
        gpu_device="$2"
        shift ;;
      --tz) [ "$#" -ge 2 ] || die "up: --tz requires a value."; tz="$2"; shift ;;
      --puid) [ "$#" -ge 2 ] || die "up: --puid requires a value."; puid="$2"; shift ;;
      --pgid) [ "$#" -ge 2 ] || die "up: --pgid requires a value."; pgid="$2"; shift ;;
      --desktop-port) [ "$#" -ge 2 ] || die "up: --desktop-port requires a value."; desktop_port="$2"; shift ;;
      --webdriver-port) [ "$#" -ge 2 ] || die "up: --webdriver-port requires a value."; webdriver_port="$2"; shift ;;
      --rebuild) rebuild=1 ;;
      --pull) pull=1 ;;
      --no-browser) launch_browser=0 ;;
      -*) die "up: unknown option '$1' (see agent_computer help)." ;;
      *) name="$1" ;;
    esac
    shift
  done

  [ -n "$tz" ] || tz=$(detect_tz)
  [ -n "$puid" ] || puid=$(id -u)
  [ -n "$pgid" ] || pgid=$(id -g)

  local engine
  engine=$(detect_engine "$name")

  if [ "$rebuild" -eq 1 ] || [ "$pull" -eq 1 ] || ! image_exists "$engine" "$IMAGE"; then
    build_image "$engine" "$pull"
  fi

  if container_exists "$engine" "$name"; then
    if container_running "$engine" "$name"; then
      note "Container '$name' is already running."
    else
      note "Starting existing container '$name' ..."
      "$engine" start "$name" >/dev/null
    fi
    note "Note: creation options (ports, GPU, timezone) only apply when the container is first created; 'rm' then 'up' to change them."
    desktop_port=$(published_port "$engine" "$name" 3000)
    [ -n "$desktop_port" ] || die "Container '$name' has no published desktop port (3000/tcp)."
    webdriver_port=$(published_port "$engine" "$name" 4444)
    [ -n "$webdriver_port" ] || die "Container '$name' has no published WebDriver port (4444/tcp)."
  else
    local volume="${name}-config"
    "$engine" volume create "$volume" >/dev/null 2>&1 || true
    # SELinux hosts (Fedora/Bazzite): container_t may not mount devpts/proc, so
    # bubblewrap fails. gdk-pixbuf 2.44 routes image loads through the glycin
    # sandbox (bwrap); failed loads crash-loop xfce4-session on icon assertions.
    # Disabling the SELinux label for this rootless, loopback-only container
    # restores bwrap (accepted trade-off, see README). No-op on non-SELinux hosts.
    local -a args=(run -d
      --name "$name"
      --restart unless-stopped
      --label "$LABEL"
      --security-opt label=disable
      --shm-size=1gb
      --pids-limit=16384
      -e "PUID=$puid"
      -e "PGID=$pgid"
      -e "TZ=$tz"
      -e SELKIES_ENABLE_SHARING=false
      -e SELKIES_ENABLE_COLLAB=false
      -e PELORUS=false
      -p "127.0.0.1:${desktop_port}:3000"
      -p "127.0.0.1:${webdriver_port}:4444")
    if [ -z "$gpu_device" ]; then
      for candidate in /dev/dri/renderD*; do
        if [ -e "$candidate" ]; then
          gpu_device="$candidate"
          break
        fi
      done
      if [ -z "$gpu_device" ]; then
        note "No GPU render node found (/dev/dri/renderD*); creating '$name' without GPU passthrough."
      fi
    else
      [ -e "$gpu_device" ] || die "up: GPU device '$gpu_device' does not exist."
    fi
    if [ -n "$gpu_device" ]; then
      note "Attaching GPU device $gpu_device."
      args+=(--device "$gpu_device")
    fi
    args+=(-v "${volume}:/config" "$IMAGE")
    note "Creating container '$name' ..."
    "$engine" "${args[@]}" >/dev/null
  fi

  wait_ready "$engine" "$name" "$desktop_port"
  if [ "$launch_browser" -eq 1 ]; then
    ensure_browser "$engine" "$name"
    ensure_webdriver "$engine" "$name"
  fi

  note ""
  note "Desktop:    http://127.0.0.1:${desktop_port}"
  note "WebDriver:  127.0.0.1:${webdriver_port} (loopback only)"
  note "Container:  ${name}"
  note "Attach from a driving tool by connecting to http://127.0.0.1:${webdriver_port};"
  note "log into sites once in the desktop UI. Sessions persist in volume ${name}-config."
}

cmd_stop() {
  local name="${1:-$DEFAULT_NAME}"
  local engine
  engine=$(detect_engine "$name")
  container_exists "$engine" "$name" || die "No container named '$name'."
  note "Stopping '$name' ..."
  "$engine" stop "$name" >/dev/null
  note "Stopped."
}

cmd_rm() {
  local name="$DEFAULT_NAME" purge=0
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --purge) purge=1 ;;
      -*) die "rm: unknown option '$1' (see agent_computer help)." ;;
      *) name="$1" ;;
    esac
    shift
  done
  local engine
  engine=$(detect_engine "$name")
  container_exists "$engine" "$name" || die "No container named '$name'."
  note "Removing container '$name' ..."
  "$engine" rm -f "$name" >/dev/null
  note "Removed container '$name'."
  if [ "$purge" -eq 1 ]; then
    local volume="${name}-config"
    note "Removing volume '$volume' (site logins and profiles are lost) ..."
    "$engine" volume rm "$volume" >/dev/null
    note "Removed volume '$volume'."
  fi
}

cmd_status() {
  local name="${1:-}"
  local engine
  engine=$(detect_engine "${name:-$DEFAULT_NAME}")
  if [ -z "$name" ]; then
    local listing
    listing=$("$engine" ps -a --filter "label=$LABEL" --format '{{.Names}}\t{{.Status}}\t{{.Image}}' 2>/dev/null)
    if [ -z "$listing" ]; then
      note "No agent computers found (engine: $engine)."
    else
      printf '%s\n' "$listing"
    fi
    return 0
  fi
  container_exists "$engine" "$name" || die "No container named '$name'."
  local dp wp
  dp=$(published_port "$engine" "$name" 3000)
  wp=$(published_port "$engine" "$name" 4444)
  note "Container:  $name ($engine)"
  note "State:      $("$engine" inspect -f '{{.State.Status}}' "$name")"
  note "Image:      $("$engine" inspect -f '{{.Config.Image}}' "$name")"
  note "Desktop:    http://127.0.0.1:${dp:-6080}/"
  note "WebDriver:  127.0.0.1:${wp:-?} (loopback only)"
  if container_running "$engine" "$name"; then
    local driver running http webdriver_up
    driver=$("$engine" exec "$name" chromedriver --version 2>/dev/null || true)
    note "Driver:     ${driver:-(not found)}"
    webdriver_up=$("$engine" exec "$name" sh -c 'pgrep -f "[c]hromedriver --port=" | wc -l' 2>/dev/null | tr -d ' ' || echo 0)
    note "Server:     ${webdriver_up:-0} chromedriver server process(es)"
    running=$("$engine" exec "$name" sh -c 'pgrep -f "[r]emote-debugging-port=9222" | wc -l' 2>/dev/null | tr -d ' ' || echo 0)
    note "Browser:    ${running:-0} automation-browser process(es)"
    http=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:${dp:-6080}/" 2>/dev/null || true)
    note "HTTP:       ${http:-?}"
  fi
}

cmd_names() {
  local engine
  engine=$(detect_engine "$DEFAULT_NAME")
  "$engine" ps -a --filter "label=$LABEL" --format '{{.Names}}' 2>/dev/null || true
}

cmd_build() {
  local pull=0 driver_url=""
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --pull) pull=1 ;;
      --driver-url) [ "$#" -ge 2 ] || die "build: --driver-url requires a value."; driver_url="$2"; shift ;;
      -*) die "build: unknown option '$1' (see agent_computer help)." ;;
      *) die "build: unexpected argument '$1'." ;;
    esac
    shift
  done
  local engine
  engine=$(detect_engine "$DEFAULT_NAME")
  build_image "$engine" "$pull" "$driver_url"
}

action="${1:-help}"
[ "$#" -eq 0 ] || shift
case "$action" in
  up) cmd_up "$@" ;;
  stop) cmd_stop "$@" ;;
  rm) cmd_rm "$@" ;;
  status) cmd_status "$@" ;;
  build) cmd_build "$@" ;;
  names) cmd_names ;;
  completion)
    case "${1:-bash}" in
      bash|zsh) cat "$script_dir/completion.${1:-bash}" ;;
      *) die "completion: supported shells: bash, zsh." ;;
    esac ;;
  help|-h|--help) usage ;;
  *) die "Unknown command: $action. Run agent_computer --help." ;;
esac
