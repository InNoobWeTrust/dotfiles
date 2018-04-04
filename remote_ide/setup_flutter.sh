#!/usr/bin/env bash
rm -rf "$(pwd)/flutter" && \
git clone -b beta https://github.com/flutter/flutter.git && \
echo "export PATH=\"$(pwd)/flutter/bin:\$PATH\"" >> ~/.bashrc && \
flutter/bin/flutter doctor