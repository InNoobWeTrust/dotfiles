# Resolve an explicit directory or the current Git root; fail rather than hash a missing path.
# Prints a canonical path. Used by local CLIs and Slurm, before transporting a session.
dev_repository() {
  local target
  if [ $# -gt 0 ]; then
    target="$1"
  else
    target="$(git rev-parse --show-toplevel)" || return
  fi
  [ -d "$target" ] || { echo "REPO must be an existing directory: $target" >&2; return 1; }
  (cd -- "$target" && pwd -P)
}

# Stable 16-character SHA-256 identity from a canonical repository path (no trailing newline).
dev_repo_hash() {
  if command -v sha256sum >/dev/null 2>&1; then
    printf '%s' "$1" | sha256sum | cut -c1-16
  else
    printf '%s' "$1" | shasum -a 256 | cut -c1-16
  fi
}
