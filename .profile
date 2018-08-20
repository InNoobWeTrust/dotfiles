export QT_QPA_PLATFORMTHEME="qt5ct"
export GTK2_RC_FILES="$HOME/.gtkrc-2.0"
# fix "xdg-open fork-bomb" export your preferred browser from here
export BROWSER=/usr/bin/firefox

# Set TERMINFO
#export TERMINFO=/usr/lib/terminfo

# Set neovim as default editor
if [[ $(which nvim) ]]; then
    export EDITOR="$(which nvim)"
    export VISUAL="$(which nvim)"
else
    export EDITOR=/usr/bin/nano
fi

# Add OniVim to PATH
[[ -d $HOME/Oni ]] && [[ ":$PATH:" != *":$HOME/Oni:"* ]] && export PATH="$HOME/Oni:$PATH"

# Add flutter to PATH
[[ -d $HOME/flutter/bin ]] && [[ ":$PATH:" != *":$HOME/flutter/bin:"* ]] && export PATH="$HOME/flutter/bin:$PATH"

# Add dart-sdk to PATH
[[ -d $HOME/dart/bin ]] && [[ ":$PATH:" != *":$HOME/dart/bin:"* ]] && export PATH="$HOME/dart/bin:$PATH"

# Add pub cache to PATH
[[ -d $HOME/.pub-cache/bin ]] && [[ ":$PATH:" != *":$HOME/.pub-cache/bin:"* ]] && export PATH="$HOME/.pub-cache/bin:$PATH"

# Set OniVim as default visual editor
# [[ -d $HOME/Oni ]] && export VISUAL="$HOME/Oni/oni"