# VS Code job worker and Slurm submission/login/cancellation.
# Both interactive login and batch hosting use the same private CLI state directory.
run_vscode_job() {
  set -euo pipefail
  export PATH="${PIXI_HOME:-$HOME/.pixi}/bin:$HOME/.local/bin:$PATH"
  local mode="$1" name="${2:-}" code state_dir
  umask 077
  state_dir="${XDG_STATE_HOME:-$HOME/.local/state}/dev-slurm/vscode-cli"
  mkdir -p -- "$state_dir"
  chmod 700 "$state_dir"
  code="$(command -v code)" || { echo "VS Code CLI not found; run install-vscode-cli on shared cluster storage." >&2; exit 1; }
  if [ "$mode" = login ]; then
    exec env VSCODE_CLI_USE_FILE_KEYCHAIN=1 "$code" --cli-data-dir "$state_dir" tunnel user login
  fi
  exec env VSCODE_CLI_USE_FILE_KEYCHAIN=1 "$code" --cli-data-dir "$state_dir" tunnel --accept-server-license-terms --name "$name"
}

vscode_command() {
  local action repo hash name payload invocation wrap jobids
  action="host"
  if [ $# -gt 0 ]; then
    case "$1" in
      host|auth|login|stop)
        action="$1"
        shift
        ;;
      *)
        action="host"
        ;;
    esac
  fi

  case "$action" in
    auth|login)
      [ $# -eq 0 ] || { echo "Usage: $0 tunnel login (account shared across repositories)" >&2; exit 1; }
      echo "=== Interactive VS Code Tunnel login (XDG state, file keychain) ==="
      payload="$(declare -f run_vscode_job)"
      exec srun --pty bash -lc "$payload"$'\n''run_vscode_job login'
      ;;
    host)
      repo="${1:-.}"
      hash="$(repo_hash "$repo")"
      name="dw-$hash"
      echo "=== Submitting full VS Code tunnel job (unlimited time) ==="
      payload="$(declare -f run_vscode_job)"
      printf -v invocation 'run_vscode_job host %q' "$name"
      printf -v wrap 'exec bash -lc %q' "$payload"$'\n'"$invocation"
      sbatch \
        --job-name=vscode-tunnel \
        --time=0 \
        --output="$PWD/vscode-tunnel-%j.out" \
        --error="$PWD/vscode-tunnel-%j.err" \
        --wrap="$wrap"

      echo ""
      echo "Job submitted (job-name: vscode-tunnel). Check status with: squeue -u $USER -n vscode-tunnel"
      echo "Logs: $PWD/vscode-tunnel-<jobID>.out and $PWD/vscode-tunnel-<jobID>.err (%j is the job ID)"
      echo "Connect via: https://vscode.dev/tunnel/$name or VS Code Desktop"
      echo "Stop with: $0 tunnel stop"
      ;;
    stop)
      jobids="$(squeue -u "$USER" -n vscode-tunnel -h -o %i 2>/dev/null | tr '\n' ' ')"
      if [ -z "${jobids// /}" ]; then
        echo "No vscode-tunnel jobs found for $USER"
        exit 0
      fi
      echo "Cancelling vscode-tunnel job(s): $jobids"
      scancel $jobids
      ;;
  esac
}
