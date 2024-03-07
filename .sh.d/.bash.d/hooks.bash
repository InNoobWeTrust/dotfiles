#!/usr/bin/env bash

# Check if zoxide is usable and then source the hooks from zoxide.bash
usable zoxide && . "$CONF_BASH_DIR/zoxide.bash"

# Check if pkgx is usable and then source the hooks from pkgx.bash
usable pkgx && . "$CONF_BASH_DIR/pkgx.bash"
