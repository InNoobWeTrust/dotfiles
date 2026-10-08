#!/bin/sh
set -eu

# Register only local source; never fetch or replace an existing extension.
command -v gh >/dev/null 2>&1 || exit 0
helper_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
extensions=$(command gh extension list)
if ! printf '%s\n' "$extensions" | grep -q '^gh codespace-sync[[:space:]]'; then
    (cd "$helper_dir" && command gh extension install .)
fi

# Keep any user-defined expansion rather than clobbering it.
aliases=$(command gh alias list)
if ! printf '%s\n' "$aliases" | grep -q '^codespace sync:'; then
    command gh alias set 'codespace sync' 'codespace-sync'
fi
