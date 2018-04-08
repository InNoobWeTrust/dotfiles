export QT_QPA_PLATFORMTHEME="qt5ct"
export GTK2_RC_FILES="$HOME/.gtkrc-2.0"
# fix "xdg-open fork-bomb" export your preferred browser from here
export BROWSER=/usr/bin/firefox

# Set TERMINFO
#export TERMINFO=/usr/lib/terminfo

# Set neovim as default editor
if [[ $(which nvim) ]]; then
    export EDITOR="$(which nvim)"
else
    export EDITOR=/usr/bin/nano
fi

# Set mousepad as default visual editor
[[ $(which mousepad) ]] && export EDITOR="$(which mousepad)"