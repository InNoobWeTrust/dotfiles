#!/usr/bin/env sh
# sync-remote-skills.sh — Fetch/update skills from remote GitHub repositories.
#
# Usage:
#   .agents/scripts/sync-remote-skills.sh              # Check for updates (dry run)
#   .agents/scripts/sync-remote-skills.sh --apply       # Pull updates from remote
#   .agents/scripts/sync-remote-skills.sh --apply --force  # Re-download even if SHA matches
#
# Reads mappings from .agents/skills/remote-skills-manifest.json
# Requires: jq, curl
#
# Note: Uses unauthenticated GitHub API (60 req/hr). Set GITHUB_TOKEN env var
# for higher rate limits (5000 req/hr).

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/../skills"
MANIFEST="$SKILLS_DIR/remote-skills-manifest.json"

# --- Preflight checks ---
if [ ! -f "$MANIFEST" ]; then
  echo "Error: Manifest not found: $MANIFEST"
  exit 1
fi

for cmd in jq curl; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: $cmd is required but not installed."
    exit 1
  fi
done

# --- Safety: resolve real path ---
resolve_path() {
  cd "$1" 2>/dev/null && pwd -P
}

# Validate a directory is inside SKILLS_DIR before destructive ops
assert_inside_skills_dir() {
  _target="$1"
  _resolved_skills=$(cd "$SKILLS_DIR" && pwd -P)
  _resolved_target=$(cd "$_target" && pwd -P)
  case "$_resolved_target" in
    "$_resolved_skills"/*) return 0 ;;
    *) echo "Error: $1 is not inside skills directory. Aborting."; exit 2 ;;
  esac
}

MODE="${1:-check}"
FORCE=""
if [ "${2:-}" = "--force" ]; then
  FORCE="yes"
fi

# --- GitHub API helpers ---
gh_api() {
  _url="$1"
  if [ -n "${GITHUB_TOKEN:-}" ]; then
    curl -fsSL -H "Accept: application/vnd.github.v3+json" \
         -H "Authorization: token $GITHUB_TOKEN" \
         -H "User-Agent: sync-remote-skills/1.0" \
         "$_url"
  else
    curl -fsSL -H "Accept: application/vnd.github.v3+json" \
         -H "User-Agent: sync-remote-skills/1.0" \
         "$_url"
  fi
}

gh_download() {
  _url="$1"
  if [ -n "${GITHUB_TOKEN:-}" ]; then
    curl -fsSL -H "Authorization: token $GITHUB_TOKEN" \
         -H "User-Agent: sync-remote-skills/1.0" \
         "$_url"
  else
    curl -fsSL -H "User-Agent: sync-remote-skills/1.0" \
         "$_url"
  fi
}

# --- Recursive directory fetch ---
# Fetches all files from a GitHub directory tree recursively
# Arguments: owner repo path branch local_dir
fetch_directory() {
  _owner="$1"
  _repo="$2"
  _remote_path="$3"
  _branch="$4"
  _local_dir="$5"

  _api_url="https://api.github.com/repos/${_owner}/${_repo}/contents/${_remote_path}?ref=${_branch}"
  _listing=$(gh_api "$_api_url")

  echo "$_listing" | jq -c '.[]' | while IFS= read -r item; do
    _name=$(echo "$item" | jq -r '.name')
    _type=$(echo "$item" | jq -r '.type')
    _download_url=$(echo "$item" | jq -r '.download_url // empty')
    _item_path=$(echo "$item" | jq -r '.path')

    if [ "$_type" = "dir" ]; then
      mkdir -p "$_local_dir/$_name"
      fetch_directory "$_owner" "$_repo" "$_item_path" "$_branch" "$_local_dir/$_name"
    elif [ "$_type" = "file" ] && [ -n "$_download_url" ]; then
      echo "  ↓ $_name"
      gh_download "$_download_url" > "$_local_dir/$_name"
    fi
  done
}

# --- Get tree SHA for a path (used for drift detection) ---
get_tree_sha() {
  _owner="$1"
  _repo="$2"
  _path="$3"
  _branch="$4"

  _api_url="https://api.github.com/repos/${_owner}/${_repo}/contents/${_path}?ref=${_branch}"
  # For directories, the response is an array; we get the parent's tree SHA instead
  _parent_path=$(dirname "$_path")
  if [ "$_parent_path" = "." ]; then
    _parent_path=""
  fi
  _parent_url="https://api.github.com/repos/${_owner}/${_repo}/contents/${_parent_path}?ref=${_branch}"
  _dir_name=$(basename "$_path")

  gh_api "$_parent_url" | jq -r ".[] | select(.name == \"$_dir_name\" and .type == \"dir\") | .sha"
}

# --- Update manifest with new SHA and timestamp ---
update_manifest() {
  _skill_name="$1"
  _sha="$2"
  _timestamp="$3"

  # Use jq to update in place
  _tmp=$(mktemp)
  jq ".remotes[\"$_skill_name\"].last_synced_sha = \"$_sha\" | .remotes[\"$_skill_name\"].last_synced_at = \"$_timestamp\"" "$MANIFEST" > "$_tmp"
  mv "$_tmp" "$MANIFEST"
}

# --- Main loop ---
UPDATE_COUNT=0
DRIFT_COUNT=0

for SKILL_NAME in $(jq -r '.remotes | keys[]' "$MANIFEST"); do
  OWNER=$(jq -r ".remotes[\"$SKILL_NAME\"].owner" "$MANIFEST")
  REPO=$(jq -r ".remotes[\"$SKILL_NAME\"].repo" "$MANIFEST")
  REMOTE_PATH=$(jq -r ".remotes[\"$SKILL_NAME\"].path" "$MANIFEST")
  BRANCH=$(jq -r ".remotes[\"$SKILL_NAME\"].branch" "$MANIFEST")
  LOCAL_PATH=$(jq -r ".remotes[\"$SKILL_NAME\"].local_path" "$MANIFEST")
  LAST_SHA=$(jq -r ".remotes[\"$SKILL_NAME\"].last_synced_sha" "$MANIFEST")

  LOCAL_DIR="$SKILLS_DIR/$LOCAL_PATH"

  echo "=== $SKILL_NAME ==="
  echo "  Remote: $OWNER/$REPO/$REMOTE_PATH@$BRANCH"
  echo "  Local:  $LOCAL_PATH/"

  # Get current remote tree SHA
  CURRENT_SHA=$(get_tree_sha "$OWNER" "$REPO" "$REMOTE_PATH" "$BRANCH")

  if [ -z "$CURRENT_SHA" ]; then
    echo "  ⚠ Could not fetch remote SHA. Skipping."
    continue
  fi

  if [ "$CURRENT_SHA" = "$LAST_SHA" ] && [ -z "$FORCE" ]; then
    echo "  ✓ Up to date (SHA: $(printf '%.12s' "$CURRENT_SHA"))"
    continue
  fi

  if [ -n "$LAST_SHA" ] && [ "$CURRENT_SHA" != "$LAST_SHA" ]; then
    echo "  ⚡ DRIFT detected: local SHA $(printf '%.12s' "$LAST_SHA") → remote SHA $(printf '%.12s' "$CURRENT_SHA")"
  elif [ -z "$LAST_SHA" ]; then
    echo "  🆕 First sync"
  fi

  DRIFT_COUNT=$((DRIFT_COUNT + 1))

  if [ "$MODE" = "--apply" ]; then
    echo "  Fetching files..."
    mkdir -p "$LOCAL_DIR"

    # Clear existing content before re-syncing
    if [ -d "$LOCAL_DIR" ]; then
      # Remove all files but keep .git-related stuff if any
      assert_inside_skills_dir "$LOCAL_DIR"
      find "$LOCAL_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
    fi

    fetch_directory "$OWNER" "$REPO" "$REMOTE_PATH" "$BRANCH" "$LOCAL_DIR"

    TIMESTAMP=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    update_manifest "$SKILL_NAME" "$CURRENT_SHA" "$TIMESTAMP"

    echo "  ✓ Synced (SHA: $(printf '%.12s' "$CURRENT_SHA"), at: $TIMESTAMP)"
    UPDATE_COUNT=$((UPDATE_COUNT + 1))
  fi

  echo ""
done

# --- Summary ---
echo ""
if [ "$DRIFT_COUNT" -eq 0 ]; then
  echo "All remote skills are up to date."
else
  echo "$DRIFT_COUNT remote skill(s) have updates available."
  if [ "$MODE" = "--apply" ]; then
    echo "$UPDATE_COUNT skill(s) synced."
  else
    echo "Run with --apply to pull updates."
  fi
fi
