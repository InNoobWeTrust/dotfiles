#!/usr/bin/env zsh

# Check if zoxide is usable and then source the hooks from zoxide.zsh
usable zoxide && . "${0:A:h}/zoxide.zsh"

# Check if pkgx is usable and then source the hooks from pkgx.bash
usable pkgx && . "$CONF_BASH_DIR/pkgx.zsh"
