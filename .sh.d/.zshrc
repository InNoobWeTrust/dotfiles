#!/usr/bin/env zsh

export CONF_ZSH_DIR="${0:A:h}/.zsh.d"

# Check if hooks.zsh is readable in .zsh.d and source it
# shellcheck source=.sh.d/.zsh.d/hooks.sh
[ -r "$CONF_ZSH_DIR/hooks.zsh" ] && . "$CONF_ZSH_DIR/hooks.zsh"
