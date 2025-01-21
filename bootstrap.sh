#!/usr/bin/env -S ${SHELL} -l

# Install pkgx if not already there
if ! (command -v pkgx); then
    echo "Installing pkgx..."
    curl -fsS "https://pkgx.sh" | sh
fi

# Symlink dotfiles by running stow
echo "Symlinking dotfiles..."
pkgx stow . -t ~ --dotfiles

# Load .shrc from shell config file by checking default shell
echo "Set autoload of .shrc from shell config file..."
if [[ -n "$ZSH_VERSION" && -z "$CONF_SH_DIR" ]]; then
  echo "[ -e ~/.shrc ] && . ~/.shrc" >> ~/.zshrc
elif [[ -n "$BASH_VERSION" && -z "$CONF_SH_DIR" ]]; then
  echo "[ -e ~/.shrc ] && . ~/.shrc" >> ~/.bashrc
fi
