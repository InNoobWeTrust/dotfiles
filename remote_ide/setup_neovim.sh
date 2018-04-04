#!/usr/bin/env bash
chmod +x setup_miniconda3.sh && \
./setup_miniconda3.sh && \
source "$HOME/miniconda3/bin/activate" && \
pip install neovim && \
sudo apt-get install software-properties-common && \
sudo add-apt-repository ppa:neovim-ppa/stable && \
sudo apt-get update && \
sudo apt-get install neovim && \
sudo update-alternatives --install /usr/bin/editor editor /usr/bin/nvim 60