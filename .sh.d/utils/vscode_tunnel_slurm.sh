#!/usr/bin/env bash
# vscode_tunnel_slurm.sh - Run VS Code tunnel on a Slurm node
#
# Usage:
#   ./vscode_tunnel_slurm.sh auth              # Interactive PTY shell for auth
#   ./vscode_tunnel_slurm.sh run <repo>        # Submit tunnel job (runs until scancel)
#
# Workflow:
#   1. Run 'auth' to get an interactive shell on a node
#   2. Run 'code tunnel' to authenticate (opens browser)
#   3. Exit the shell
#   4. Run 'run' to submit the tunnel as a batch job (unlimited time)

set -euo pipefail

VSCODE_FILE_KEYCHAIN="VSCODE_CLI_USE_FILE_KEYCHAIN=1"

cmd="${1:-}"
if [ -n "$cmd" ]; then
  shift
fi

case "$cmd" in
  auth)
    echo "=== Starting interactive shell for VS Code auth ==="
    echo "Run 'code tunnel' to authenticate, then type 'exit' when done."
    echo ""
    exec srun --pty bash
    ;;
  run)
    repo="${1:-}"
    if [ -z "$repo" ]; then
      echo "Usage: $0 run <repo>" >&2
      exit 1
    fi
    name="dw-$(printf '%s' "$repo" | sha256sum | cut -c1-16)"
    echo "=== Submitting tunnel job (unlimited time) ==="
    sbatch \
      --job-name=vscode-tunnel \
      --time=0 \
      --output="$PWD/vscode-tunnel-%j.out" \
      --error="$PWD/vscode-tunnel-%j.err" \
      --wrap="bash -lc 'code=\$(command -v code) || { echo \"code CLI not found in PATH\" >&2; exit 1; }; env $VSCODE_FILE_KEYCHAIN \"\$code\" tunnel --accept-server-license-terms --name $name'"
    echo ""
    echo "Job submitted. Check status with: squeue -u $USER"
    echo "Logs: $PWD/vscode-tunnel-<jobID>.out and $PWD/vscode-tunnel-<jobID>.err (%j is the job ID)"
    echo "Stop with: $0 stop"
    ;;
  stop)
    jobid="$(squeue -u "$USER" -n vscode-tunnel -h -o %i)"
    if [ -z "$jobid" ]; then
      echo "No vscode-tunnel job found for $USER"
      return 0 2>/dev/null || exit 0
    fi
    echo "Cancelling job $jobid"
    scancel "$jobid"
    ;;
  *)
    echo "Usage: $0 {auth|run <repo>|stop}"
    echo ""
    echo "  auth           - Get interactive PTY shell for auth"
    echo "  run <repo>     - Submit tunnel job (runs until scancel)"
    echo "  stop           - Cancel the running tunnel job"
    exit 1
    ;;
esac
