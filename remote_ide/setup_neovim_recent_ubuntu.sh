#!/usr/bin/env bash
bash setup_miniconda3.sh && \
source $HOME/miniconda3/bin/activate && \
pip install neovim && \
sudo apt-get install software-properties-common -y && \
sudo add-apt-repository ppa:neovim-ppa/stable -y && \
sudo apt-get update -y && \
sudo apt-get install neovim -y && \
sudo update-alternatives --install /usr/bin/editor editor /usr/bin/nvim 60
