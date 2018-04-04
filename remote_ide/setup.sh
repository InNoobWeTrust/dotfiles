#!/usr/bin/env bash
rm -rf "$(pwd)/dotfiles"
git clone https://github.com/innoobwetrust/dotfiles.git && \
cp -r dotfiles/.config "$HOME/.config" && \
cp dotfiles/.tmux.conf $HOME/.tmux.conf && \
sudo apt install tmux && \
chmod +x setup_neovim.sh && \
./setup_neovim.sh && \
chmod +x setup_flutter.sh && \
./setup_flutter.sh