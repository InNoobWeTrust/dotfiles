#!/usr/bin/env sh
# sync-remotes.sh — Fetch/update skills and data from remote GitHub repositories.
#
# Usage:
#   .agents/scripts/sync-remotes.sh              # Check for updates (dry run)
#   .agents/scripts/sync-remotes.sh --apply       # Pull updates from remote
#   .agents/scripts/sync-remotes.sh --apply --force  # Re-download even if SHA matches
#
# Reads mappings from .agents/skills/remote-skills-manifest.json

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_DIR="$(cd "$SCRIPT_DIR/../skills" && pwd)"
MANIFEST="$SKILLS_DIR/remote-skills-manifest.json"
MAX_DEPTH=5

# --- Preflight checks ---
if [ ! -f "$MANIFEST" ]; then
  echo "Error: Manifest not found: $MANIFEST"
  exit 1
fi

if ! jq . "$MANIFEST" >/dev/null 2>&1; then
  echo "Error: Manifest is not valid JSON: $MANIFEST"
  exit 1
fi

for cmd in jq curl; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: $cmd is required but not installed."
    exit 1
  fi
done

MODE="${1:-check}"
FORCE=""
if [ "${2:-}" = "--force" ]; then
  FORCE="yes"
fi

# --- GitHub API helpers ---
gh_api() {
  _url="$1"
  _auth_header=""
  [ -n "${GITHUB_TOKEN:-}" ] && _auth_header="-H \"Authorization: token $GITHUB_TOKEN\""
  
  _response=$(curl -sSL -w "\n%{http_code}" -H "Accept: application/vnd.github.v3+json" \
         ${_auth_header} -H "User-Agent: sync-remotes/1.0" "$_url")
  
  _http_code=$(echo "$_response" | tail -n1)
  _body=$(echo "$_response" | sed '$d')

  if [ "$_http_code" -ne 200 ]; then
    echo "Error: GitHub API returned $_http_code for $_url" >&2
    echo "$_body" | jq -r '.message // "Unknown error"' >&2
    return 1
  fi
  echo "$_body"
}

gh_download() {
  _url="$1"
  _auth_header=""
  [ -n "${GITHUB_TOKEN:-}" ] && _auth_header="-H \"Authorization: token $GITHUB_TOKEN\""
  curl -fsSL ${_auth_header} -H "User-Agent: sync-remotes/1.0" "$_url"
}

# --- CSV to JSON helper (handles quoted commas) ---
csv_to_json() {
  _input="$1"
  _output="$2"
  # Improved CSV to JSON: handle empty lines and headers-only case
  cat "$_input" | jq -Rs '
    split("\n") | 
    map(select(length > 0)) |
    if length == 0 then []
    else
      (.[0] | split(",")) as $headers | 
      .[1:] | 
      if length == 0 then []
      else
        map(split(",")) | 
        map(. as $row | $headers | with_entries(.value = $row[.key]))
      end
    end
  ' > "$_output"
}

# --- Recursive directory fetch ---
fetch_directory() {
  _owner="$1" _repo="$2" _remote_path="$3" _branch="$4" _local_dir="$5" _convert_csv="${6:-no}" _depth="${7:-0}"

  if [ "$_depth" -gt "$MAX_DEPTH" ]; then
    echo "  ⚠ Max depth ($MAX_DEPTH) reached for $_remote_path. Skipping."
    return 0
  fi

  _api_url="https://api.github.com/repos/${_owner}/${_repo}/contents/${_remote_path}?ref=${_branch}"
  _listing=$(gh_api "$_api_url") || return 1

  echo "$_listing" | jq -c '.[]' | while IFS= read -r item; do
    _name=$(echo "$item" | jq -r '.name')
    _type=$(echo "$item" | jq -r '.type')
    _download_url=$(echo "$item" | jq -r '.download_url // empty')
    _item_path=$(echo "$item" | jq -r '.path')

    if [ "$_type" = "dir" ]; then
      fetch_directory "$_owner" "$_repo" "$_item_path" "$_branch" "$_local_dir/$_name" "$_convert_csv" $((_depth + 1))
    elif [ "$_type" = "file" ] && [ -n "$_download_url" ]; then
      case "$_name" in
        *.md|*.json|*.csv)
          mkdir -p "$_local_dir"
          echo "  ↓ $_name"
          if [ "$_convert_csv" = "yes" ] && [ "${_name##*.}" = "csv" ]; then
            _tmp_csv=$(mktemp)
            gh_download "$_download_url" > "$_tmp_csv"
            csv_to_json "$_tmp_csv" "$_local_dir/${_name%.csv}.json"
            rm "$_tmp_csv"
          else
            gh_download "$_download_url" > "$_local_dir/$_name"
          fi
          ;;
      esac
    fi
  done
}

get_tree_sha() {
  _owner="$1" _repo="$2" _path="$3" _branch="$4"
  _parent_path=$(dirname "$_path")
  [ "$_parent_path" = "." ] && _parent_path=""
  _parent_url="https://api.github.com/repos/${_owner}/${_repo}/contents/${_parent_path}?ref=${_branch}"
  _dir_name=$(basename "$_path")
  _listing=$(gh_api "$_parent_url") || return 1
  echo "$_listing" | jq -r ".[] | select(.name == \"$_dir_name\" and .type == \"dir\") | .sha"
}

update_manifest_sha() {
  _key_path="$1" _sha="$2" _timestamp="$3"
  _tmp=$(mktemp)
  jq "$_key_path.last_synced_sha = \"$_sha\" | $_key_path.last_synced_at = \"$_timestamp\"" "$MANIFEST" > "$_tmp"
  mv "$_tmp" "$MANIFEST"
}

# --- Sync Logic ---
sync_item() {
  _label="$1" _type_label="$2" _config="$3" _local_root="$4" _manifest_key_path="$5"
  
  _owner=$(echo "$_config" | jq -r '.owner')
  _repo=$(echo "$_config" | jq -r '.repo')
  _remote_path=$(echo "$_config" | jq -r '.path')
  _branch=$(echo "$_config" | jq -r '.branch')
  _local_sub=$(echo "$_config" | jq -r '.local_path // .name')
  _last_sha=$(echo "$_config" | jq -r '.last_synced_sha // empty')
  _convert_csv=$(echo "$_config" | jq -r '.convert_csv // "no"')

  _local_dir="$_local_root/$_local_sub"

  echo "=== $_label ($_type_label) ==="
  echo "  Remote: $_owner/$_repo/$_remote_path@$_branch"
  echo "  Local:  $_local_dir"

  _current_sha=$(get_tree_sha "$_owner" "$_repo" "$_remote_path" "$_branch") || { echo "  ⚠ Could not fetch remote SHA. Skipping."; return; }

  if [ "$_current_sha" = "$_last_sha" ] && [ -z "$FORCE" ]; then
    echo "  ✓ Up to date ($(printf '%.8s' "$_current_sha"))"
    return
  fi

  echo "  ⚡ $([ -z "$_last_sha" ] && echo "First Sync" || echo "Drift detected"): $(printf '%.8s' "${_last_sha:-init}") → $(printf '%.8s' "$_current_sha")"

  if [ "$MODE" = "--apply" ]; then
    # Removed destructive rm -rf; fetch_directory handles file-level overwrites
    fetch_directory "$_owner" "$_repo" "$_remote_path" "$_branch" "$_local_dir" "$_convert_csv"
    _ts=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    update_manifest_sha "$_manifest_key_path" "$_current_sha" "$_ts"
    echo "  ✓ Synced"
  fi
  echo ""
}

# --- Main ---
echo "Starting sync..."
[ -z "${GITHUB_TOKEN:-}" ] && echo "⚠ GITHUB_TOKEN not set. Rate limits may apply."

# 1. Sync Remotes (Skills)
for SKILL in $(jq -r '.remotes | keys[]' "$MANIFEST"); do
  _conf=$(jq -c ".remotes[\"$SKILL\"]" "$MANIFEST")
  sync_item "$SKILL" "Skill" "$_conf" "$SKILLS_DIR" ".remotes[\"$SKILL\"]"
done

# 2. Sync Data Sources
for SKILL in $(jq -r '.data_sources | keys[]' "$MANIFEST"); do
  jq -c ".data_sources[\"$SKILL\"][]" "$MANIFEST" | while read -r _conf; do
    _name=$(echo "$_conf" | jq -r '.name')
    _cache_env=$(echo "$_conf" | jq -r '.cache_env')
    _def_cache=$(echo "$_conf" | jq -r '.default_cache')
    
    _cache_dir=$(printenv "$_cache_env" || echo "$HOME/$_def_cache")
    
    _merged_conf=$(echo "$_conf" | jq -c ". + {local_path: \"$_name\", convert_csv: \"yes\"}")
    _idx=$(jq ".data_sources[\"$SKILL\"] | map(.name == \"$_name\") | index(true)" "$MANIFEST")
    
    sync_item "$_name" "Data" "$_merged_conf" "$_cache_dir" ".data_sources[\"$SKILL\"][$_idx]"
  done
done

echo "Done."
