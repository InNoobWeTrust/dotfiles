#!/usr/bin/env bash
rm -f Miniconda3-latest-Linux-x86_64.sh* && \
bash update_system.sh && \
sudo apt install bzip2 -y && \
wget "https://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh" && \
rm -rf $HOME/miniconda3 && \
bash Miniconda3-latest-Linux-x86_64.sh