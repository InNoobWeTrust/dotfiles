#!/usr/bin/env bash
# Local foreground VS Code tunnel CLI; no scheduler or container dependency.
set -euo pipefail
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
. "$script_dir/../shared/repository.sh"
action="${1:-help}"
[ $# -eq 0 ] || shift
case "$action" in
  host)
    [ $# -le 1 ] || { echo "Usage: dev_tunnel host [REPO]" >&2; exit 1; }
    repo="$(dev_repository "$@")"
    name="dw-$(dev_repo_hash "$repo")"
    exec bash "$script_dir/session.sh" "$name"
    ;;
  completion)
    case "${1:-bash}" in
      bash|zsh) cat "$script_dir/completion.${1:-bash}" ;;
      *) echo "Supported shells: bash, zsh" >&2; exit 1 ;;
    esac
    ;;
  help|-h|--help)
    echo "Usage: dev_tunnel host [REPO]"
    echo "Run a VS Code tunnel here, without Slurm or Docker. Host stays in foreground."
    echo "REPO defaults to the current Git root. The VS Code CLI handles authentication."
    echo "Ctrl-C stops the tunnel and returns to your shell."
    echo "dev_tunnel completion [bash|zsh] emits shell completions."
    ;;
  *) echo "Unknown command: $action. Run dev_tunnel --help." >&2; exit 1 ;;
esac
