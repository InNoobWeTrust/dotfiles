# Shared repository identity and cross-backend job management.
repo_hash() {
  local target="${1:-.}"
  printf '%s' "$(realpath "$target" 2>/dev/null || echo "$target")" | sha256sum | cut -c1-16
}

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
