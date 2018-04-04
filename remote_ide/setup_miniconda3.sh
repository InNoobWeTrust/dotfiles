#!/usr/bin/env bash
rm Miniconda3-latest-Linux-x86_64.sh*
wget "https://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh" && \
chmod +x Miniconda3-latest-Linux-x86_64.sh && \
./Miniconda3-latest-Linux-x86_64.sh && \    # Don't let the installer append the PATH, it is done manually below
echo "export PATH=\"\$HOME/minconda3/bin:\$PATH\"" >> ~/.bashrc