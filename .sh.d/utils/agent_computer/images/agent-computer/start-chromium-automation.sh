#!/bin/bash
set -eu
export HOME="${HOME:-/config}"
export DISPLAY="${DISPLAY:-:1}"
mkdir -p "$HOME/.local/state"

# The profile persists across container recreation, but Chromium's singleton
# lock names the old container's hostname; the new container is then refused
# the profile ("another computer") and the debug port never binds. Clear stale
# locks when no Chromium is running for this profile.
profile="$HOME/.chromium-automation"
if ! pgrep -f "[u]ser-data-dir=.*/\.chromium-automation" >/dev/null 2>&1; then
  rm -f "$profile"/Singleton*
fi

exec /usr/bin/chromium \
  --remote-debugging-port=9222 \
  --user-data-dir="$profile" \
  "$@" >> "$HOME/.local/state/chromium-automation.log" 2>&1
