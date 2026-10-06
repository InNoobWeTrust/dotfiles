# Slurm transport only. Shared session scripts are embedded; compute nodes need no module paths.
# session_command SERVICE [host|stop] [REPO] submits or cancels the selected service.
session_command() {
  local service="$1" action="${2:-host}" repo name payload wrap job_name jobids
  shift
  case "$action" in host|stop) [ $# -eq 0 ] || shift ;; *) action=host ;; esac
  case "$service" in
    tailscale) job_name=tailscale ;;
    tunnel) job_name=vscode-tunnel ;;
    *) echo "Unknown service: $service" >&2; exit 1 ;;
  esac
  if [ "$action" = stop ]; then
    [ $# -eq 0 ] || { echo "Usage: dev_slurm $service stop" >&2; exit 1; }
    jobids="$(squeue -u "$USER" -n "$job_name" -h -o %i)"
    if [ -z "$jobids" ]; then
      echo "No $job_name jobs found for $USER"
    else
      # Slurm prints numeric job IDs, one per line; splitting is intentional.
      scancel --full $jobids
    fi
    return
  fi
  [ $# -le 1 ] || { echo "Usage: dev_slurm $service [host] [REPO]" >&2; exit 1; }
  repo="$(dev_repository "$@")"
  case "$service" in
    tailscale) name="ts-$(dev_repo_hash "$repo")" ;;
    tunnel) name="dw-$(dev_repo_hash "$repo")" ;;
  esac
  payload="$(cat "$script_dir/../dev_$service/session.sh")"
  printf -v wrap 'exec bash -c %q %q %q' "$payload" "dev-$service" "$name"
  sbatch --job-name="$job_name" --time=0 --signal=B:TERM@10 \
    --output="$PWD/$job_name-%j.out" --error="$PWD/$job_name-%j.err" --wrap="$wrap"
  echo "Job submitted. Stop with: dev_slurm $service stop"
}
