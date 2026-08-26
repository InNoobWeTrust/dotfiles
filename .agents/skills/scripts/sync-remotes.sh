#!/usr/bin/env bash
# sync-remotes.sh — Track upstream changes to external skill references.
#
# Usage:
#   sync-remotes.sh --apply     Update .remote cache, flag changed refs
#   sync-remotes.sh --check     Check for upstream changes (dry-run)
#   sync-remotes.sh --help      Show this help
#
# Reference files in references/ are CURATED ADAPTATIONS — they restructure
# upstream content for this skill's workflow (adding "When to Use", "See Also",
# pipeline-step mapping). This script tracks the raw upstream source in a
# .remote/ cache and flags when a reference needs manual review because the
# upstream source changed since last sync.

set -euo pipefail

# --- Configuration ---
# Each entry: "local_path|remote_url|description"
# Add new external references here as they are adopted.
declare -a REMOTES=(
  ".agents/skills/video-production/references/editframe-composition.md|https://editframe.com/skills/composition.md|Editframe composition API"
  ".agents/skills/video-production/references/editframe-motion-design.md|https://editframe.com/skills/motion-design.md|Editframe motion design"
  ".agents/skills/video-production/references/editframe-brand-video.md|https://editframe.com/skills/brand-video-generator.md|Editframe brand video generator"
  ".agents/skills/video-production/references/editframe-tooling.md|https://editframe.com/skills/editframe-api.md|Editframe tooling (API/dev-server/create/GUI/webhooks)"
)

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# --- Helpers ---
log_info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }

usage() {
  head -10 "$0" | grep -E "^#" | sed 's/^#\s\?//'
  exit 0
}

# --- Main ---
MODE="dry-run"
case "${1:-}" in
  --apply) MODE="apply" ;;
  --check) MODE="check" ;;
  --help|-h) usage ;;
  "")
    MODE="dry-run"
    log_info "No flag provided — running in dry-run mode (use --apply to update cache)"
    ;;
  *)
    log_error "Unknown flag: $1"
    usage
    ;;
esac

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

FLAGGED=0
UPTODATE=0
ERRORS=0

for entry in "${REMOTES[@]}"; do
  IFS='|' read -r local_path remote_url description <<< "$entry"

  echo ""
  log_info "Checking: $description"
  log_info "  Remote: $remote_url"
  log_info "  Reference: $local_path"

  # Fetch remote content
  tmpfile=$(mktemp)
  trap "rm -f $tmpfile" RETURN

  if ! curl -fsSL --max-time 30 "$remote_url" > "$tmpfile" 2>/dev/null; then
    log_error "  Failed to fetch $remote_url"
    ((ERRORS++)) || true
    continue
  fi

  # Determine cache path (stores raw upstream for change detection)
  cache_dir=".agents/skills/.remote"
  cache_file="${cache_dir}/$(echo "$local_path" | tr '/' '_')"

  # Compare against cached upstream
  if [[ -f "$cache_file" ]]; then
    if diff -q "$cache_file" "$tmpfile" >/dev/null 2>&1; then
      log_ok "  Up to date — upstream unchanged"
      ((UPTODATE++)) || true
      continue
    fi
    log_warn "  Upstream changed since last sync"
  else
    log_info "  First sync — establishing baseline"
  fi

  # Upstream changed (or first sync)
  if [[ "$MODE" == "check" ]]; then
    log_info "  Would flag for review (dry-run: --check mode)"
    ((FLAGGED++)) || true
    continue
  fi

  # Update cache
  mkdir -p "$cache_dir"
  cp "$tmpfile" "$cache_file"

  if [[ "$MODE" == "apply" ]]; then
    log_ok "  Cache updated: $cache_file"
    log_warn "  Review $local_path and update if needed"
    ((FLAGGED++)) || true
  else
    log_info "  Would update cache and flag for review (dry-run — use --apply)"
    ((FLAGGED++)) || true
  fi
done

echo ""
echo "========================================="
log_info "Sync complete: $FLAGGED to review, $UPTODATE up to date, $ERRORS errors"

if [[ "$MODE" != "apply" && $FLAGGED -gt 0 ]]; then
  echo ""
  log_info "Run with --apply to update cache and flag references for review"
fi

exit $ERRORS
