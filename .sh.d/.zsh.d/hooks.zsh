# Check if zoxide is usable and then source the hooks from zoxide.zsh
usable zoxide && . "$CONF_ZSH_DIR/zoxide.zsh"

# Check if pkgx is usable and then source the hooks from pkgx.bash
usable pkgx && . "$CONF_ZSH_DIR/pkgx.zsh"
