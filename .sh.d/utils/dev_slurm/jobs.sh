# Cross-service Slurm job status and cancellation; no session/authentication logic.
show_jobs() {
  squeue -u "$USER" -n vscode-tunnel,tailscale
}

stop_jobs() {
  local jobids
  jobids="$(squeue -u "$USER" -n vscode-tunnel,tailscale -h -o %i 2>/dev/null | tr '\n' ' ')"
  if [ -z "${jobids// /}" ]; then
    echo "No tunnel jobs found for $USER"
    exit 0
  fi
  echo "Cancelling all tunnel job(s): $jobids"
  scancel --full $jobids
}
