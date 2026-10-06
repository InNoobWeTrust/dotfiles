#!/usr/bin/env bash
# stdin is a lifeline: EOF stops only this invocation’s children.
set -euo pipefail
name="$1"; mode="$2"
export PATH="${PIXI_HOME:-$HOME/.pixi}/bin:$HOME/.local/bin:$PATH"
ts=$(command -v tailscale) && tsd=$(command -v tailscaled) || {
  echo "tailscale and tailscaled not found; run pixi global sync inside the container." >&2; exit 1;
}
umask 077
cache="${XDG_CACHE_HOME:-$HOME/.cache}/dev-workspace"
runtime=""; lock_dir=""; owns_lock=false
daemon_pid=""; client_pid=""; watcher_pid=""
cleanup() {
  rc=$?
  trap - EXIT
  trap '' INT TERM HUP
  for pid in "$watcher_pid" "$client_pid" "$daemon_pid"; do
    [ -z "$pid" ] || kill -TERM "$pid" 2>/dev/null || true
  done
  for attempt in 1 2 3 4 5; do
    alive=false
    for pid in "$watcher_pid" "$client_pid" "$daemon_pid"; do
      if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then alive=true; fi
    done
    "$alive" || break
    sleep 1
  done
  for pid in "$watcher_pid" "$client_pid" "$daemon_pid"; do
    if [ -n "$pid" ]; then
      kill -KILL "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
    fi
  done
  [ -z "$runtime" ] || rm -rf -- "$runtime"
  if "$owns_lock"; then rm -f -- "$lock_dir/owner"; rmdir -- "$lock_dir"; fi
  exit "$rc"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP
state="${XDG_STATE_HOME:-$HOME/.local/state}/dev-workspace/tailscale/$name"
mkdir -p -- "$state"
state=$(cd -- "$state" && pwd -P)
chmod 700 "$state"
lock_dir="$state/active.lock"
if ! mkdir -- "$lock_dir" 2>/dev/null; then
  echo "Tailscale identity is locked: $lock_dir. Stop its session before login/host." >&2
  echo "After a crash, verify no daemon uses this identity before removing the lock." >&2
  exit 1
fi
owns_lock=true
printf 'host=%s pid=%s\n' "$(hostname)" "$$" > "$lock_dir/owner"
mkdir -p -- "$cache"
runtime=$(mktemp -d "$cache/ts.XXXXXXXX")
# Relative socket paths avoid Unix-domain socket length limits in long XDG paths.
cd -- "$runtime"
supervisor=$$
exec 3<&0
(while IFS= read -r line; do :; done; kill -TERM "$supervisor") <&3 &
watcher_pid=$!
exec 3<&-
"$tsd" --tun=userspace-networking --port=0 --socket=s --state="$state/state" < /dev/null &
daemon_pid=$!
for attempt in {1..30}; do
  kill -0 "$daemon_pid" 2>/dev/null || exit 1
  [ ! -S s ] || break
  sleep 1
done
[ -S s ] || { echo "Timed out waiting for tailscaled socket" >&2; exit 1; }
if [ "$mode" = login ]; then
  echo "Authenticate using the login URL below (five-minute timeout)."
  "$ts" --socket=s up --ssh --hostname="$name" --timeout=5m < /dev/null &
  client_pid=$!
  while kill -0 "$client_pid" 2>/dev/null; do
    kill -0 "$daemon_pid" 2>/dev/null || exit 1
    sleep 1
  done
  rc=0; wait "$client_pid" || rc=$?; client_pid=""
  [ "$rc" -eq 0 ] || exit "$rc"
  kill -0 "$daemon_pid" 2>/dev/null || exit 1
  echo "Login saved in $state. You can now run tailscale host."
  exit 0
fi
# Startup reconnects using saved preferences; host never initiates interactive login.
for attempt in {1..30}; do
  kill -0 "$daemon_pid" 2>/dev/null || exit 1
  status_json=$("$ts" --socket=s status --json 2>/dev/null || true)
  if printf '%s' "$status_json" | grep -Eq '"BackendState"[[:space:]]*:[[:space:]]*"Running"'; then break; fi
  if printf '%s' "$status_json" | grep -Eq '"BackendState"[[:space:]]*:[[:space:]]*"(NeedsLogin|NeedsMachineAuth|Stopped)"'; then break; fi
  sleep 1
done
printf '%s' "$status_json" | grep -Eq '"BackendState"[[:space:]]*:[[:space:]]*"Running"' || {
  echo "Tailscale is not authenticated/ready. Run dev_workspace tailscale login for this repository; check device approval and network access." >&2
  exit 1
}
echo "SSH from a Tailscale device: ssh vscode@$name"
echo "Tailnet policy must allow network port 22 and Tailscale SSH as vscode."
# Integrated SSH is served by tailscaled itself; no separate server or Serve process.
rc=0; wait "$daemon_pid" || rc=$?; daemon_pid=""
[ "$rc" -ne 0 ] || rc=1
exit "$rc"
