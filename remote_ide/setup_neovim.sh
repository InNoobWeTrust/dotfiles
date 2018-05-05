#!/usr/bin/env bash
bash setup_miniconda3.sh && \
source $HOME/miniconda3/bin/activate && \
pip install neovim && \
curl -LO https://github.com/neovim/neovim/releases/download/nightly/nvim.appimage && \
chmod u+x nvim.appimage && \
ln -s /usr/bin/nvim nvim.appimage && \
sudo update-alternatives --install /usr/bin/editor editor /usr/bin/nvim 60