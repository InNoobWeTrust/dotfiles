#!/usr/bin/env bash
# Persona discovery helpers for swarm-intelligence skill.
# Three-level loading: filename scan → frontmatter parse → body load.
#
# Usage:
#   discover-personas.sh list                    # list all personas (name + group)
#   discover-personas.sh search <pattern>       # fuzzy search names
#   discover-personas.sh frontmatter <name>     # print YAML frontmatter only
#   discover-personas.sh prompt <name>          # print system prompt body only
#   discover-personas.sh by-group <group>       # list personas in a functional group
#   discover-personas.sh by-tag <tag>           # list personas with a tag (substring match)
#   discover-personas.sh count                  # total persona count

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PERSONAS_DIR="${SCRIPT_DIR}/personas"

if [[ ! -d "$PERSONAS_DIR" ]]; then
  echo "ERROR: Personas directory not found at $PERSONAS_DIR" >&2
  exit 1
fi

extract_field() {
  local file="$1"
  local field="$2"
  local in_fm=0
  local in_multiline=0
  local result=""
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" == "---" ]]; then
      ((in_fm++))
      continue
    fi
    [[ $in_fm -lt 1 || $in_fm -gt 2 ]] && continue

    if [[ $in_multiline -eq 1 ]]; then
      # Check if line is still indented continuation (starts with space or two spaces)
      if [[ "$line" =~ ^[[:space:]]{2,} ]]; then
        result+=$'\n'"$line"
        continue
      else
        in_multiline=0
      fi
    fi

    if [[ "$line" =~ ^$field:[[:space:]]*(.*)$ ]]; then
      local val="${BASH_REMATCH[1]}"
      if [[ -z "$val" ]]; then
        # Empty value - might be multi-line block (e.g., tags:, description:)
        in_multiline=1
        result=""
      else
        echo "$val"
        return 0
      fi
    fi

    # If we're inside a multi-line block, accumulate lines
    [[ $in_multiline -eq 1 ]] && result+=$'\n'"$line"

  done < "$file"

  [[ -n "$result" ]] && echo "$result"
  return 0
}

list_all() {
  find "$PERSONAS_DIR" -name '*.md' -type f | while read -r f; do
    name=$(extract_field "$f" "name")
    group=$(extract_field "$f" "group")
    printf "  %-45s %s\n" "${name:-UNKNOWN}" "${group:-UNKNOWN}"
  done | sort
}

search() {
  local pattern="$2"
  echo "Personas matching '$pattern':"
  find "$PERSONAS_DIR" -name '*.md' -type f | while read -r f; do
    name=$(extract_field "$f" "name")
    if echo "$name" | grep -qi "$pattern"; then
      group=$(extract_field "$f" "group")
      printf "  %-45s %s\n" "${name:-UNKNOWN}" "${group:-UNKNOWN}"
    fi
  done | sort
}

show_frontmatter() {
  local name="$2"
  local found=""
  while IFS= read -r f; do
    fname=$(extract_field "$f" "name")
    if [[ "$fname" == "$name" ]]; then
      found="$f"
      break
    fi
  done < <(find "$PERSONAS_DIR" -name '*.md' -type f)
  if [[ -z "$found" || ! -f "$found" ]]; then
    echo "ERROR: Persona '$name' not found" >&2
    return 1
  fi
  local printing=0
  while IFS= read -r line; do
    if [[ "$line" == "---" ]]; then
      ((printing++))
      continue
    fi
    [[ $printing -eq 1 ]] && echo "$line"
  done < "$found"
}

show_prompt() {
  local name="$2"
  local found=""
  while IFS= read -r f; do
    fname=$(extract_field "$f" "name")
    if [[ "$fname" == "$name" ]]; then
      found="$f"
      break
    fi
  done < <(find "$PERSONAS_DIR" -name '*.md' -type f)
  if [[ -z "$found" || ! -f "$found" ]]; then
    echo "ERROR: Persona '$name' not found" >&2
    return 1
  fi
  local printing=0
  while IFS= read -r line; do
    if [[ "$line" == "---" ]]; then
      ((printing++))
      continue
    fi
    [[ $printing -ge 2 ]] && echo "$line"
  done < "$found"
}

by_tag() {
  local tag="$2"
  echo "Personas with tag '$tag':"
  find "$PERSONAS_DIR" -name '*.md' -type f | while read -r f; do
    # Extract whole frontmatter block and search for the tag
    local fm
    fm=$(sed -n '/^---$/,/^---$/p' "$f")
    if echo "$fm" | grep -qi "[-[:space:]]$tag"; then
      name=$(extract_field "$f" "name")
      group=$(extract_field "$f" "group")
      printf "  %-45s %s\n" "${name:-UNKNOWN}" "${group:-UNKNOWN}"
    fi
  done | sort
}

by_group() {
  local group="$2"
  echo "Personas in group '$group':"
  find "$PERSONAS_DIR" -name '*.md' -type f | while read -r f; do
    g=$(extract_field "$f" "group")
    if [[ "$g" == "$group" ]]; then
      name=$(extract_field "$f" "name")
      echo "  $name"
    fi
  done | sort
}

count_all() {
  local count=0
  while IFS= read -r f; do
    ((count++))
  done < <(find "$PERSONAS_DIR" -name '*.md' -type f)
  echo "Total personas: $count"
}

# Entrypoint — only run if executed directly, not when sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  cmd="${1:-list}"
  case "$cmd" in
    list)        echo "All personas:";        list_all ;;
    search)      search "$@" ;;
    frontmatter) show_frontmatter "$@" ;;
    prompt)      show_prompt "$@" ;;
    by-tag)      by_tag "$@" ;;
    by-group)    by_group "$@" ;;
    count)       count_all ;;
    *) echo "Usage: $0 {list|search <pattern>|frontmatter <name>|prompt <name>|by-group <group>|by-tag <tag>|count}" >&2; exit 1 ;;
  esac
fi
