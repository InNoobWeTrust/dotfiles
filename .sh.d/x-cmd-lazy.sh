#!/usr/bin/env sh

# Lazy-load x-cmd to improve shell startup time
# x-cmd is the biggest bottleneck (~2.38s) and should be deferred until needed

___X_CMD_LAZY_LOADED=0

___x_cmd_lazy_load() {
    if [ "$___X_CMD_LAZY_LOADED" -eq 0 ]; then
        ___X_CMD_LAZY_LOADED=1
        # Remove our lazy wrapper
        unalias x 2>/dev/null
        # Source the real x-cmd
        [ ! -f "$HOME/.x-cmd.root/X" ] || . "$HOME/.x-cmd.root/X"
        # Re-execute with original arguments
        x "$@"
    fi
}

# Create a lazy alias for the x command
alias x='___x_cmd_lazy_load'
# Create a lazy alias for x starship
alias ss='x starship use gruvbox-rainbow'

# Also lazy-load x-cmd if it was already sourced at startup
# This handles the case where .bashrc sources x-cmd directly
if [ -n "$___X_CMD_ROOT_MOD" ]; then
    ___X_CMD_LAZY_LOADED=1
fi
