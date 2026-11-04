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

Manage loopback-only computers: Webtop default; Tuxee pinned upstream, no build/driver.

Commands:
  up [NAME] [--mode webtop|tuxee] [--desktop-port N] [--tz TZ] [--pull]
    [--password-file PATH] Creation-only override; otherwise root / agent-computer.
    Default: ${XDG_CONFIG_HOME:-$HOME/.config}/agent-computer/password (never overwritten).
    Overrides: nonempty, current-owner 0600 regular files, no links. Retain for restarts.
    Recreate to rotate; rm --purge preserves the password file.
    Defaults: webtop / agent-computer / 6080; tuxee / agent-computer-tuxee / 6081.
    Existing NAME recovers its mode; explicit mismatches fail.
    Webtop: [--gpu-device PATH] [--puid N] [--pgid N] [--webdriver-port N] [--rebuild] [--no-browser]
      Automatic GPU selection; persistent abc config; browser/driver unless --no-browser.
    Tuxee: [--cpus DECIMAL] [--memory N[b|k|m|g]]
      Optional CPU/memory limits; PID limit 4096; no bundled browser or terminal tools.
      Existing instances reject explicit resources/ports/timezone; recreate to change.
      Bare restarts need no password flag; --pull refreshes the image, not the instance.
      Access HTTP UI or engine exec -it NAME /bin/bash.
  stop [NAME]             Stop (default NAME: agent-computer).
  rm [NAME] [--purge]      Preserve volumes unless --purge (Tuxee checks ownership).
  status [NAME]           Show instance details or list all computers.
  names                   List instance names (original ownership label).
  completion [bash|zsh]   Emit shell completion.
  help, -h, --help        Show help.

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
  "$engine" inspect -f "{{range (index .NetworkSettings.Ports \"$cport/tcp\")}}{{.HostPort}}{{break}}{{end}}" "$name" 2>/dev/null
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

# shellcheck source-path=SCRIPTDIR
# shellcheck source=credentials.sh
source "$script_dir/credentials.sh"

# shellcheck source-path=SCRIPTDIR
# shellcheck source=modes/webtop.sh
source "$script_dir/modes/webtop.sh"

# shellcheck source-path=SCRIPTDIR
# shellcheck source=modes/tuxee.sh
source "$script_dir/modes/tuxee.sh"

require_value() {
  [ "$#" -ge 2 ] && [ -n "$2" ] && [[ "$2" != -* ]] ||
    die "$1 requires a nonempty value."
}

validate_mode() {
  case "$1" in webtop|tuxee) ;; *) die "Unknown mode '$1' (use webtop or tuxee)." ;; esac
}

validate_port() {
  if [[ "$1" =~ ^[0-9]{1,5}$ ]] && ((10#$1 >= 1 && 10#$1 <= 65535)); then return; fi
  die "Port must be an integer from 1 through 65535."
}

# Parse into cmd_up's dynamic locals; record explicit presence, not defaults.
parse_up() {
  while [ "$#" -gt 0 ]; do
    seen_flags+=("$1")
    case "$1" in
      --mode|--tz|--desktop-port|--webdriver-port) parse_up_connection "$@"; shift ;;
      --gpu-device|--puid|--pgid) parse_up_webtop "$@"; shift ;;
      --password-file|--cpus|--memory) parse_up_resources "$@"; shift ;;
      --rebuild) rebuild=1 ;;
      --pull) pull=1 ;;
      --no-browser) launch_browser=0 ;;
      -*) die "up: unknown option '$1' (see agent_computer help)." ;;
      *) [ -z "$name" ] || die "up: unexpected argument '$1'."; name="$1" ;;
    esac
    shift
  done
}

parse_up_connection() {
  require_value "$@"
  case "$1" in
    --mode) mode="$2"; validate_mode "$mode" ;;
    --tz) tz="$2" ;;
    --desktop-port) desktop_port="$2"; validate_port "$desktop_port" ;;
    --webdriver-port) webdriver_port="$2"; validate_port "$webdriver_port" ;;
  esac
}

parse_up_webtop() {
  require_value "$@"
  case "$1" in
    --gpu-device) gpu_device="$2" ;;
    --puid) puid="$2"; [[ "$puid" =~ ^[0-9]+$ ]] || die "Invalid PUID." ;;
    --pgid) pgid="$2"; [[ "$pgid" =~ ^[0-9]+$ ]] || die "Invalid PGID." ;;
  esac
}

parse_up_resources() {
  require_value "$@"
  case "$1" in
    --password-file) password_file="$2" ;;
    --cpus)
      cpus="$2"
      [[ "$cpus" =~ ^[0-9]+([.][0-9]+)?$ && "$cpus" =~ [1-9] ]] || die "CPUs must be a positive decimal."
      ;;
    --memory)
      memory="$2"
      [[ "$memory" =~ ^[0-9]+[bBkKmMgG]?$ && "$memory" =~ [1-9] ]] || die "Memory must be a positive integer with optional b/k/m/g."
      ;;
  esac
}

container_mode() {
  local mode
  mode=$("$1" inspect -f '{{index .Config.Labels "agent-computer-mode"}}' "$2") ||
    die "Cannot inspect mode for '$2'."
  case "$mode" in ""|"<no value>") mode=webtop ;; esac
  validate_mode "$mode"
  printf '%s\n' "$mode"
}

flag_seen() {
  local flag
  for flag in ${seen_flags[@]+"${seen_flags[@]}"}; do
    [ "$flag" != "$1" ] || return 0
  done
  return 1
}

validate_up_mode() {
  local flag forbidden="--cpus --memory"
  [ "$mode" != tuxee ] || forbidden="--gpu-device --puid --pgid --webdriver-port --no-browser --rebuild"
  for flag in $forbidden; do
    if flag_seen "$flag"; then die "up: $flag is not supported in $mode mode."; fi
  done
  if [ "$mode" = tuxee ] && [ "$exists" -eq 1 ]; then
    for flag in --cpus --memory --desktop-port --tz; do
      if flag_seen "$flag"; then die "up: $flag is creation-only; rm then up to recreate Tuxee."; fi
    done
  fi
}

cmd_up() {
  local name="" mode="" gpu_device="" tz="" puid="" pgid=""
  local -a seen_flags=()
  local desktop_port="$DEFAULT_DESKTOP_PORT" webdriver_port="$DEFAULT_WEBDRIVER_PORT"
  local password_file="" credential_path="" credential_kind=default credential_created=0
  local cpus="" memory="" rebuild=0 pull=0 launch_browser=1
  local engine exists=0 stored_mode
  parse_up "$@"
  if [ "$mode" = tuxee ]; then
    [ -n "$name" ] || name=agent-computer-tuxee
    flag_seen --desktop-port || desktop_port=6081
  fi
  [ -n "$name" ] || name="$DEFAULT_NAME"
  engine=$(detect_engine "$name")
  if container_exists "$engine" "$name"; then
    exists=1
    if flag_seen --password-file; then
      die "--password-file is creation-only; rm then up to recreate $name"
    fi
    stored_mode=$(container_mode "$engine" "$name")
    [ -z "$mode" ] || [ "$mode" = "$stored_mode" ] ||
      die "Container '$name' uses $stored_mode, not $mode; no mode conversion."
    mode="$stored_mode"
  fi
  mode="${mode:-webtop}"
  validate_up_mode
  if [ "$exists" -eq 0 ]; then credential_gate; fi
  [ -n "$tz" ] || tz=$(detect_tz)
  if [ "$mode" = tuxee ]; then
    up_tuxee
  else
    [ -n "$puid" ] || puid=$(id -u)
    [ -n "$pgid" ] || pgid=$(id -g)
    up_webtop
  fi
  if [ "$exists" -eq 0 ]; then print_login; fi
}

up_tuxee() {
  if [ "$exists" -eq 1 ]; then
    tuxee_volumes "$engine" "$name" check
    desktop_port=$(published_port "$engine" "$name" 80)
    [ -n "$desktop_port" ] || die "Container '$name' has no published HTTP port (80/tcp)."
    if [ "$pull" -eq 1 ]; then
      "$engine" pull "$(tuxee_image)"
      note "Image refreshed; existing instance not upgraded. Recreate to upgrade."
    fi
    if ! container_running "$engine" "$name"; then "$engine" start "$name" >/dev/null; fi
  else
    create_tuxee
  fi
  wait_tuxee_ready "$engine" "$name" "$desktop_port"
  note "HTTP:       http://127.0.0.1:${desktop_port}/"
  note "Container:  $name"
  note "Exec:       $engine exec -it $name /bin/bash"
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
  local mode
  mode=$(container_mode "$engine" "$name")
  if [ "$mode" = tuxee ] && [ "$purge" -eq 1 ]; then tuxee_volumes "$engine" "$name" check; fi
  note "Removing container '$name' ..."
  "$engine" rm -f "$name" >/dev/null
  note "Removed container '$name'."
  if [ "$purge" -eq 1 ]; then
    if [ "$mode" = tuxee ]; then tuxee_volumes "$engine" "$name" purge; return; fi
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
  local mode
  mode=$(container_mode "$engine" "$name")
  case "$mode" in
    tuxee) status_tuxee "$engine" "$name" ;;
    webtop) status_webtop "$engine" "$name" ;;
  esac
}

cmd_names() {
  local engine
  engine=$(detect_engine "$DEFAULT_NAME")
  "$engine" ps -a --filter "label=$LABEL" --format '{{.Names}}' 2>/dev/null || true
}

action="${1:-help}"
[ "$#" -eq 0 ] || shift
case "$action" in
  up) cmd_up "$@" ;;
  stop) cmd_stop "$@" ;;
  rm) cmd_rm "$@" ;;
  status) cmd_status "$@" ;;
  names) cmd_names ;;
  completion)
    case "${1:-bash}" in
      bash|zsh) cat "$script_dir/completion.${1:-bash}" ;;
      *) die "completion: supported shells: bash, zsh." ;;
    esac ;;
  help|-h|--help) usage ;;
  *) die "Unknown command: $action. Run agent_computer --help." ;;
esac
