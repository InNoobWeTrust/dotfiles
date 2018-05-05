#!/usr/bin/env bash
rm -rf $(pwd)/flutter && \
git clone -b beta https://github.com/flutter/flutter.git && \
echo "export PATH=\"$(pwd)/flutter/bin:\$PATH\"" >> ~/.bashrc && \
sudo apt install lib32stdc++6 -y && \
flutter/bin/flutter doctor