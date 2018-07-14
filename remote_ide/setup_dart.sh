#!/usr/bin/env bash
rm -rf $(pwd)/dart-sdk && \
curl --output dart-sdk.zip https://storage.googleapis.com/dart-archive/channels/dev/release/2.0.0-dev.68.0/sdk/dartsdk-linux-x64-release.zip && \
unzip dart-sdk.zip && \
rm dart-sdk.zip && \
echo "export PATH=\"$(pwd)/dart-sdk/bin:\$PATH\"" >> ~/.bashrc