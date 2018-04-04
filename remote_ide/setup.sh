#!/usr/bin/env bash
rm -rf "$(pwd)/dotfiles"
git clone https://github.com/innoobwetrust/dotfiles.git && \
cp -r dotfiles/.config "$HOME/.config" && \
cp dotfiles/.tmux.conf $HOME/.tmux.conf && \
sudo apt update -y && \
sudo apt upgrade -y && \
sudo apt autoremove -y && \
sudo apt autoclean -y && \
sudo apt install tmux -y && \
chmod +x setup_neovim.sh && \
./setup_neovim.sh && \