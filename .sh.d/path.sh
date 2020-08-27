#!/usr/bin/env sh

# Add ~/.local/**/bin to PATH if it's not there
[[ -d $HOME/.local ]] && for bin_path in $(find $HOME/.local -maxdepth 3 -name bin -type d 2>/dev/null); do
    [[ ":$PATH:" != *":$bin_path:"* ]] && [[ -d $bin_path ]] && export PATH="$bin_path:$PATH"
done

# Set neovim as default editor
if usable nvim ; then
    export EDITOR="$(which nvim)"
    export VISUAL="$(which nvim)"
else
    export EDITOR=/usr/bin/nano
fi

# Add dart-sdk to PATH
[[ -d /usr/lib/dart/bin ]] && [[ ":$PATH:" != *":/usr/lib/dart/bin:"* ]] && export PATH="$PATH:/usr/lib/dart/bin"

# Add pub cache to PATH
[[ -d $PUB_CACHE/bin ]] && [[ ":$PATH:" != *":$PUB_CACHE/bin:"* ]] && export PATH="$PUB_CACHE/bin:$PATH"

# Export GOPATH and add GOPATH to PATH
[[ -d $GOPATH/bin ]] && export PATH="$GOPATH/bin:$PATH"

# Add cargo to PATH
[[ -d $CARGO_HOME/bin ]] && [[ ":$PATH:" != *":$CARGO_HOME/bin:"* ]] && export PATH="$CARGO_HOME/bin:$PATH"

# Add homebrew to PATH
if [ -n "$BREW_HOME" ]; then
    eval $($BREW_HOME/bin/brew shellenv)
fi

# Activate python-poetry
[[ -d $POETRY_HOME ]] && source $POETRY_HOME/env

# Activate nvm
[[ -s "$NVM_DIR/nvm.sh" ]] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# Add completion for github's cli
usable gh && eval "$(gh completion)"

# Add completion for kitty terminal
usable kitty && source <(kitty + complete setup bash)

# Add Nix
if [ -r $HOME/.nix-profile/etc/profile.d/nix.sh ]; then source $HOME/.nix-profile/etc/profile.d/nix.sh; fi
