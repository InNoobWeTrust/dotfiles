#!/usr/bin/env sh

# Lazy-load starship prompt via x-cmd
# Use 'ss' to initialize starship on demand

___STARSHIP_LOADED=0

___starship_lazy_load() {
    if [ "$___STARSHIP_LOADED" -eq 0 ]; then
        ___STARSHIP_LOADED=1
        # Load x-cmd first if not already loaded
        if [ -z "$___X_CMD_ROOT_MOD" ]; then
            [ ! -f "$HOME/.x-cmd.root/X" ] || . "$HOME/.x-cmd.root/X"
        fi
        # Initialize starship
        eval "$(x starship init bash 2>/dev/null)" 2>/dev/null || true
    fi
}

# Short alias to trigger starship initialization
alias ss='___starship_lazy_load'

# Set a basic PS1 as fallback until starship is loaded
if [ -z "$STARSHIP_CONFIG" ] && [ "$___STARSHIP_LOADED" -eq 0 ]; then
    PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
fi
