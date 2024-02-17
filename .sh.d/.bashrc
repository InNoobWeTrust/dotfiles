#!/usr/bin/env bash

# Set CONF_BASH_DIR to absolute path of local .bash.d directory
export CONF_BASH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)/.bash.d"

# Check if hooks.bash is readable in .bash.d and source it
# shellcheck source=.sh.d/.bash.d/hooks.bash
[ -r "$CONF_BASH_DIR/hooks.bash" ] && . "$CONF_BASH_DIR/hooks.bash"
