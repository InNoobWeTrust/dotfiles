# Check if zoxide is usable and then source the hooks from zoxide.zsh
usable zoxide && . "$CONF_ZSH_DIR/zoxide.zsh"

# Pixi installs shell plugins as data files, not exposed commands.
if [[ -o interactive ]] && (( ! $+functions[_zsh_autosuggest_start] )); then
    if [[ -r ${PIXI_HOME:-$HOME/.pixi}/envs/core-utils/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh ]]; then
        source "${PIXI_HOME:-$HOME/.pixi}/envs/core-utils/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh"
    fi
fi
