#!/usr/bin/env bash
rm -rf $(pwd)/dotfiles && \
git clone https://github.com/innoobwetrust/dotfiles.git && \
cp -r dotfiles/.config $HOME/.config && \
cp dotfiles/.tmux.conf $HOME/.tmux.conf && \
bash update_system.sh && \
sudo apt install tmux -y && \
bash setup_neovim.sh && \
source ~/.bashrc