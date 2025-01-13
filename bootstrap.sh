#!/usr/bin/env bash

# Update package list
echo "Updating package list..."
sudo apt-get update

# Install system dependencies: stow, exa, ripgrep, zeoxide
echo "Installing system dependencies..."
sudo apt-get install -y stow ripgrep

# Symlink dotfiles by running stow
echo "Symlinking dotfiles..."
stow -t ~ .

# Load .shrc from shell config file by checking default shell
echo "Loading .shrc from shell config file..."
if [ -n "$ZSH_VERSION" ]; then
  echo "source ~/.shrc" >> ~/.zshrc
elif [ -n "$BASH_VERSION" ]; then
  echo "source ~/.shrc" >> ~/.bashrc
fi

# Load .shrc for this session
echo "Loading .shrc for this session..."
source ~/.shrc

# Install cheat.sh
echo "Installing cheat.sh..."
install-cheat-sh

# Install zeoxide
echo "Installing zeoxide..."
install-zeoxide

# Install pkgx
echo "Installing pkgx..."
install-pkgx

# Using pkgx to install additional user packages: bat, exa, trash
echo "Installing additional user packages using pkgx..."
pkgx install bat exa trash
