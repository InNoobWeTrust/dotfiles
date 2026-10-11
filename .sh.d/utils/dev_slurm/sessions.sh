# Slurm transport only. Shared session scripts are embedded; compute nodes need no module paths.
# session_command SERVICE [host|stop] [REPO] submits or cancels the selected service.
session_command() {
  local service="$1" action="${2:-host}" repo name payload wrap job_name jobids
  local -a options
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
  options=(--job-name="$job_name" --time="${SBATCH_TIMELIMIT:-0}" \
    --signal="${SBATCH_SIGNAL:-B:TERM@10}" \
    --output="${SBATCH_OUTPUT:-$PWD/$job_name-%j.out}" --error="${SBATCH_ERROR:-$PWD/$job_name-%j.err}")
  # These explicit request aliases have no native sbatch environment equivalent.
  [ -z "${SBATCH_NODELIST:-}" ] || options+=(--nodelist="$SBATCH_NODELIST")
  [ -z "${SBATCH_NODES:-}" ] || options+=(--nodes="$SBATCH_NODES")
  [ -z "${SBATCH_CPUS_PER_TASK:-}" ] || options+=(--cpus-per-task="$SBATCH_CPUS_PER_TASK")
  [ -z "${SBATCH_NTASKS:-}" ] || options+=(--ntasks="$SBATCH_NTASKS")
  sbatch "${options[@]}" --wrap="$wrap"
  echo "Job submitted. Stop with: dev_slurm $service stop"
}
