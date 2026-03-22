#!/usr/bin/env sh
# gap-check.sh — Detect implementation and test gaps in BDD specs.
#
# Usage:
#   .agents/scripts/gap-check.sh <spec-file>           # Check a single spec
#   .agents/scripts/gap-check.sh <spec-dir>            # Check all specs in directory
#   .agents/scripts/gap-check.sh                       # Check default SPEC_DIR
#
# Parses BDD specs for Traceability Matrix and reports gaps.
# Matrix format defined in: skills/requirements-driven-dev/references/templates/behavior-spec.md
# Exit code: 0 = no gaps, 1 = gaps found, 2 = error

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEFAULT_SPEC_DIR="${SPEC_DIR:-docs/specs}"

# Colors (disabled if not a terminal)
if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  NC='\033[0m'
else
  RED='' GREEN='' YELLOW='' NC=''
fi

usage() {
  echo "Usage: $0 [spec-file|spec-dir]"
  echo ""
  echo "Checks BDD specs for implementation and test gaps."
  echo "Parses the Traceability Matrix section and reports incomplete scenarios."
  exit 2
}

# Check a single spec file for gaps
check_spec() {
  SPEC_FILE="$1"
  
  if [ ! -f "$SPEC_FILE" ]; then
    echo "${RED}Error: File not found: $SPEC_FILE${NC}"
    return 2
  fi

  # Extract Traceability Matrix section
  # Look for lines between "## Traceability Matrix" and the next "## " or "---"
  IN_MATRIX=0
  SCENARIOS_TOTAL=0
  IMPL_COMPLETE=0
  TEST_COMPLETE=0
  GAPS=""

  while IFS= read -r line; do
    # Detect start of Traceability Matrix
    if echo "$line" | grep -q "^## Traceability Matrix"; then
      IN_MATRIX=1
      continue
    fi
    
    # Detect end of section
    if [ "$IN_MATRIX" -eq 1 ] && echo "$line" | grep -qE "^(## |---)"; then
      break
    fi
    
    # Parse table rows (skip header and separator)
    if [ "$IN_MATRIX" -eq 1 ] && echo "$line" | grep -qE "^\| [0-9]"; then
      SCENARIOS_TOTAL=$((SCENARIOS_TOTAL + 1))
      
      # Extract scenario name (column 2)
      SCENARIO=$(echo "$line" | cut -d'|' -f3 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
      
      # Extract impl status (column 3)
      IMPL_STATUS=$(echo "$line" | cut -d'|' -f4 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
      
      # Extract test status (column 5)
      TEST_STATUS=$(echo "$line" | cut -d'|' -f6 | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
      
      # Check statuses (✓/✔/☑ or ⊘ = complete, ⬚/☐ or ◐ = incomplete)
      IMPL_OK=0
      TEST_OK=0
      
      case "$IMPL_STATUS" in
        *✓*|*✔*|*☑*|*⊘*) IMPL_OK=1; IMPL_COMPLETE=$((IMPL_COMPLETE + 1)) ;;
      esac
      
      case "$TEST_STATUS" in
        *✓*|*✔*|*☑*|*⊘*) TEST_OK=1; TEST_COMPLETE=$((TEST_COMPLETE + 1)) ;;
      esac
      
      # Record gaps
      if [ "$IMPL_OK" -eq 0 ] || [ "$TEST_OK" -eq 0 ]; then
        MISSING=""
        [ "$IMPL_OK" -eq 0 ] && MISSING="impl"
        [ "$TEST_OK" -eq 0 ] && { [ -n "$MISSING" ] && MISSING="$MISSING, test" || MISSING="test"; }
        GAPS="${GAPS}  - ${SCENARIO}: missing ${MISSING}\n"
      fi
    fi
  done < "$SPEC_FILE"

  # Report results
  SPEC_NAME=$(basename "$SPEC_FILE" .md)
  
  if [ "$SCENARIOS_TOTAL" -eq 0 ]; then
    echo "${YELLOW}SKIP${NC}: $SPEC_NAME (no Traceability Matrix found)"
    return 0
  fi
  
  if [ "$IMPL_COMPLETE" -eq "$SCENARIOS_TOTAL" ] && [ "$TEST_COMPLETE" -eq "$SCENARIOS_TOTAL" ]; then
    echo "${GREEN}CLEAR${NC}: $SPEC_NAME ($SCENARIOS_TOTAL/$SCENARIOS_TOTAL scenarios complete)"
    return 0
  else
    echo "${RED}GAPS${NC}: $SPEC_NAME"
    echo "  Implemented: $IMPL_COMPLETE/$SCENARIOS_TOTAL"
    echo "  Tested: $TEST_COMPLETE/$SCENARIOS_TOTAL"
    printf '%s' "$GAPS"
    return 1
  fi
}

# Main
TARGET="${1:-}"
TOTAL_SPECS=0
TOTAL_GAPS=0

if [ -z "$TARGET" ]; then
  # Default: check all specs in SPEC_DIR
  if [ -d "$DEFAULT_SPEC_DIR" ]; then
    TARGET="$DEFAULT_SPEC_DIR"
  else
    echo "No spec directory found at $DEFAULT_SPEC_DIR"
    echo "Provide a spec file or directory as argument."
    usage
  fi
fi

if [ -f "$TARGET" ]; then
  # Single file
  check_spec "$TARGET" || TOTAL_GAPS=$((TOTAL_GAPS + 1))
  TOTAL_SPECS=1
elif [ -d "$TARGET" ]; then
  # Directory
  for spec in "$TARGET"/*.md; do
    [ -f "$spec" ] || continue
    TOTAL_SPECS=$((TOTAL_SPECS + 1))
    check_spec "$spec" || TOTAL_GAPS=$((TOTAL_GAPS + 1))
  done
else
  echo "Error: $TARGET is not a file or directory"
  usage
fi

# Summary
echo ""
if [ "$TOTAL_GAPS" -eq 0 ]; then
  echo "${GREEN}All $TOTAL_SPECS spec(s) clear — ready to commit.${NC}"
  exit 0
else
  echo "${RED}$TOTAL_GAPS/$TOTAL_SPECS spec(s) have gaps — resolve before commit.${NC}"
  exit 1
fi
