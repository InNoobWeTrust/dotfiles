#!/usr/bin/env bash
# ble.sh has no conda-forge package. Install a checksum-pinned upstream build.
set -euo pipefail

data_home=${XDG_DATA_HOME:-$HOME/.local/share}
if [[ -r $data_home/blesh/ble.sh ]]; then
    printf '%s\n' "ble.sh already installed: $data_home/blesh/ble.sh"
    exit 0
fi

version=20260908+d81fd54
checksum=7a2445f138e7f099dd5dee749391a8b045646d1b8a605975885be5b34b6b5f7e
scratch=$(mktemp -d)
trap 'rm -rf -- "$scratch"' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP

curl --fail --location --connect-timeout 15 --max-time 120 \
    "https://github.com/akinomyoga/ble.sh/releases/download/nightly/ble-nightly-${version}.tar.xz" \
    --output "$scratch/ble.tar.xz"
if command -v sha256sum >/dev/null 2>&1; then
    actual=$(sha256sum "$scratch/ble.tar.xz")
else
    actual=$(shasum -a 256 "$scratch/ble.tar.xz")
fi
if [[ ${actual%% *} != "$checksum" ]]; then
    printf '%s\n' 'Error: ble.sh checksum mismatch; refusing to install.' >&2
    exit 1
fi

tar -xJf "$scratch/ble.tar.xz" -C "$scratch"
bash "$scratch/ble-nightly-$version/ble.sh" --install "$data_home"
