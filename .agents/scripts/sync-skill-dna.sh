#!/usr/bin/env sh
# sync-skill-dna.sh — Detect and resolve drift between canonical skills and their synced copies.
#
# Usage:
#   .agents/scripts/sync-skill-dna.sh              # Report drift only
#   .agents/scripts/sync-skill-dna.sh --apply      # Copy source to all stale consumers
#   .agents/scripts/sync-skill-dna.sh --diff       # Show full diff for each stale consumer
#
# Reads mappings from .agents/skills/skill-dna-manifest.json
# Requires: jq

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/../skills"
MANIFEST="$SKILLS_DIR/skill-dna-manifest.json"

if [ ! -f "$MANIFEST" ]; then
  echo "Error: Manifest not found: $MANIFEST"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required but not installed."
  exit 1
fi

MODE="${1:-report}"
DRIFT_COUNT=0
SYNC_COUNT=0

# Parse manifest — iterate over each source and its consumers
for SOURCE_REL in $(jq -r '.sources | keys[]' "$MANIFEST"); do
  SOURCE="$SKILLS_DIR/$SOURCE_REL"

  if [ ! -f "$SOURCE" ]; then
    echo "Warning: Source missing: $SOURCE_REL"
    continue
  fi

  CONSUMERS=$(jq -r ".sources[\"$SOURCE_REL\"].consumers[]" "$MANIFEST")

  for CONSUMER_REL in $CONSUMERS; do
    CONSUMER="$SKILLS_DIR/$CONSUMER_REL"

    if [ ! -f "$CONSUMER" ]; then
      echo "NEW: Consumer missing (needs initial sync): $CONSUMER_REL"
      if [ "$MODE" = "--apply" ]; then
        mkdir -p "$(dirname "$CONSUMER")"
        {
          echo "<!-- synced-from: $SOURCE_REL | last-synced: $(date '+%Y-%m-%d %H:%M') -->"
          echo "<!-- Note: YAML frontmatter stripped; this is a reference copy, not an activatable skill -->"
          echo ""
          # Strip YAML frontmatter (lines between --- markers at start of file)
          awk 'BEGIN{skip=0} /^---$/{if(NR==1){skip=1;next}else if(skip){skip=0;next}} !skip{print}' "$SOURCE"
        } > "$CONSUMER"
        echo "  -> Created: $CONSUMER_REL"
        SYNC_COUNT=$((SYNC_COUNT + 1))
      fi
      DRIFT_COUNT=$((DRIFT_COUNT + 1))
      continue
    fi

    # Compare content (skip the synced-from header lines in consumer)
    # Detect header size: count lines before first non-comment, non-blank line
    HEADER_LINES=0
    while IFS= read -r hline; do
      case "$hline" in
        "<!--"*|"")
          HEADER_LINES=$((HEADER_LINES + 1))
          ;;
        *)
          break
          ;;
      esac
    done < "$CONSUMER"
    CONSUMER_CONTENT=$(tail -n +$((HEADER_LINES + 1)) "$CONSUMER" | sed '/./,$!d')
    # Strip YAML frontmatter from source for comparison, plus leading blank lines
    SOURCE_CONTENT=$(awk 'BEGIN{skip=0} /^---$/{if(NR==1){skip=1;next}else if(skip){skip=0;next}} !skip{print}' "$SOURCE" | sed '/./,$!d')

    if [ "$CONSUMER_CONTENT" != "$SOURCE_CONTENT" ]; then
      SYNCED_DATE=$(head -1 "$CONSUMER" | sed -n 's/.*last-synced: \(.*\) -->/\1/p')
      echo "DRIFT: $CONSUMER_REL"
      echo "  Last synced: ${SYNCED_DATE:-unknown}"

      if [ "$MODE" = "--diff" ]; then
        # Write to temp files for portable diff
        TMP_CONSUMER=$(mktemp)
        TMP_SOURCE=$(mktemp)
        echo "$CONSUMER_CONTENT" > "$TMP_CONSUMER"
        echo "$SOURCE_CONTENT" > "$TMP_SOURCE"
        echo "  --- Diff ---"
        diff "$TMP_CONSUMER" "$TMP_SOURCE" || true
        rm -f "$TMP_CONSUMER" "$TMP_SOURCE"
        echo ""
      fi

      if [ "$MODE" = "--apply" ]; then
        {
          echo "<!-- synced-from: $SOURCE_REL | last-synced: $(date '+%Y-%m-%d %H:%M') -->"
          echo "<!-- Note: YAML frontmatter stripped; this is a reference copy, not an activatable skill -->"
          echo ""
          # Strip YAML frontmatter
          awk 'BEGIN{skip=0} /^---$/{if(NR==1){skip=1;next}else if(skip){skip=0;next}} !skip{print}' "$SOURCE"
        } > "$CONSUMER"
        echo "  -> Synced: $CONSUMER_REL"
        SYNC_COUNT=$((SYNC_COUNT + 1))
      fi

      DRIFT_COUNT=$((DRIFT_COUNT + 1))
    else
      echo "OK: In sync: $CONSUMER_REL"
    fi
  done
done

echo ""
if [ "$DRIFT_COUNT" -eq 0 ]; then
  echo "All consumers are in sync."
else
  echo "$DRIFT_COUNT consumer(s) have drifted from their source."
  if [ "$MODE" = "--apply" ]; then
    echo "$SYNC_COUNT consumer(s) synced."
  else
    echo "Run with --diff to see changes, or --apply to sync."
  fi
fi
