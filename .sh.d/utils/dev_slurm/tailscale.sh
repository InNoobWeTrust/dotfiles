# Tailscale job worker and Slurm submission/login/cancellation.
# Embedded in the batch script so jobs do not depend on this file's location.
run_tailscale_job() {
  set -euo pipefail
  local name="$1" mode="$2" attempt status state_dir status_json
  # EXIT traps need state that survives function scope unwinding.
  runtime="" daemon_pid="" client_pid="" lock_dir="" owns_lock=false
  export PATH="${PIXI_HOME:-$HOME/.pixi}/bin:$HOME/.local/bin:$PATH"
  command -v tailscaled >/dev/null && command -v tailscale >/dev/null || {
    echo "tailscale and tailscaled not found; run pixi global sync on shared cluster storage." >&2; exit 1;
  }
  umask 077
  local cache_root="${XDG_CACHE_HOME:-$HOME/.cache}/dev-slurm"
  cleanup_tailscale() {
    local rc=$? pid remaining alive
    trap - EXIT
    trap '' INT TERM HUP
    for pid in "$client_pid" "$daemon_pid"; do
      [ -z "$pid" ] || kill -TERM "$pid" 2>/dev/null || true
    done
    for remaining in 1 2 3 4 5; do
      alive=false
      for pid in "$client_pid" "$daemon_pid"; do
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then alive=true; fi
      done
      "$alive" || break
      sleep 1
    done
    for pid in "$client_pid" "$daemon_pid"; do
      if [ -n "$pid" ]; then
        kill -KILL "$pid" 2>/dev/null || true
        wait "$pid" 2>/dev/null || true
      fi
    done
    [ -z "$runtime" ] || rm -rf -- "$runtime"
    if "$owns_lock"; then rm -f -- "$lock_dir/owner"; rmdir -- "$lock_dir"; fi
    return "$rc"
  }
  trap cleanup_tailscale EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM
  trap 'exit 129' HUP
  state_dir="${XDG_STATE_HOME:-$HOME/.local/state}/dev-slurm/tailscale/$name"
  mkdir -p -- "$state_dir"
  state_dir="$(cd -- "$state_dir" && pwd -P)"
  chmod 700 "$state_dir"
  lock_dir="$state_dir/active.lock"
  if ! mkdir -- "$lock_dir" 2>/dev/null; then
    echo "Tailscale identity is locked: $lock_dir. Stop its session before login/host." >&2
    echo "After a crash, verify no daemon uses this identity before removing the lock." >&2
    exit 1
  fi
  owns_lock=true
  printf 'host=%s pid=%s job=%s\n' "$(hostname)" "$$" "${SLURM_JOB_ID:-none}" > "$lock_dir/owner"
  mkdir -p -- "$cache_root"
  runtime="$(mktemp -d "$cache_root/ts.XXXXXXXX")"
  # Short relative socket names also work with long XDG cache paths.
  cd -- "$runtime"
  tailscaled --tun=userspace-networking --port=0 --socket=s --state="$state_dir/state" &
  daemon_pid=$!
  for attempt in {1..30}; do
    kill -0 "$daemon_pid" 2>/dev/null || { echo "tailscaled exited during startup" >&2; exit 1; }
    [ ! -S s ] || break
    sleep 1
  done
  [ -S s ] || { echo "Timed out waiting for tailscaled socket" >&2; exit 1; }
  if [ "$mode" = login ]; then
    echo "Authenticate using the login URL below (five-minute timeout)."
    tailscale --socket=s up --ssh --hostname="$name" --timeout=5m &
    client_pid=$!
    while kill -0 "$client_pid" 2>/dev/null; do
      kill -0 "$daemon_pid" 2>/dev/null || { echo "tailscaled exited during login" >&2; exit 1; }
      sleep 1
    done
    status=0; wait "$client_pid" || status=$?; client_pid=""
    [ "$status" -eq 0 ] || exit "$status"
    kill -0 "$daemon_pid" 2>/dev/null || exit 1
    echo "Login saved in $state_dir. You can now submit tailscale host."
    exit 0
  fi
  # Startup reconnects using saved preferences; host never initiates interactive login.
  for attempt in {1..30}; do
    kill -0 "$daemon_pid" 2>/dev/null || exit 1
    status_json="$(tailscale --socket=s status --json 2>/dev/null || true)"
    if printf '%s' "$status_json" | grep -Eq '"BackendState"[[:space:]]*:[[:space:]]*"Running"'; then break; fi
    if printf '%s' "$status_json" | grep -Eq '"BackendState"[[:space:]]*:[[:space:]]*"(NeedsLogin|NeedsMachineAuth|Stopped)"'; then break; fi
    sleep 1
  done
  printf '%s' "$status_json" | grep -Eq '"BackendState"[[:space:]]*:[[:space:]]*"Running"' || {
    echo "Tailscale is not authenticated/ready. Run dev_slurm tailscale login for this repository; check device approval and network access." >&2
    exit 1
  }
  echo "SSH: ssh ${USER:-USER}@$name (from a Tailscale device)"
  echo "Tailnet policy must permit network port 22 and SSH as your current account."
  # tailscaled supplies SSH itself; no OpenSSH server or tailscale serve required.
  status=0; wait "$daemon_pid" || status=$?; daemon_pid=""
  [ "$status" -ne 0 ] || status=1
  exit "$status"
}

tailscale_command() {
  local action repo name payload invocation wrap jobids
  action="host"
  case "${1:-}" in host|login|stop) action="$1"; shift ;; esac
  case "$action" in
    host|login)
      [ $# -le 1 ] || { echo "Usage: $0 tailscale [host|login] [REPO] (SSH port is fixed at 22)" >&2; exit 1; }
      repo="${1:-.}"
      name="ts-$(repo_hash "$repo")"
      payload="$(declare -f run_tailscale_job)"
      printf -v invocation 'run_tailscale_job %q %q' "$name" "$action"
      if [ "$action" = login ]; then
        exec srun --job-name=tailscale-login --time=00:10:00 --pty bash -lc "$payload"$'\n'"$invocation"
      fi
      printf -v wrap 'exec bash -lc %q' "$payload"$'\n'"$invocation"
      sbatch --job-name=tailscale --time=0 --signal=B:TERM@10 \
        --output="$PWD/tailscale-%j.out" --error="$PWD/tailscale-%j.err" --wrap="$wrap"
      echo "Job submitted. SSH once ready: ssh $USER@$name (from a Tailscale device)."
      echo "First use or expired authentication: $0 tailscale login $repo"
      echo "Stop with: $0 tailscale stop"
      ;;
    stop)
      jobids="$(squeue -u "$USER" -n tailscale -h -o %i 2>/dev/null | tr '\n' ' ')"
      if [ -z "${jobids// /}" ]; then
        echo "No tailscale jobs found for $USER"
      else
        scancel --full $jobids
      fi
      ;;
  esac
}
