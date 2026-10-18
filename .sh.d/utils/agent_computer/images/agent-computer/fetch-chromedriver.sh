#!/usr/bin/env bash
# Resolve and stage the chromedriver that matches this image's Chromium.
#
# Runs inside the image build (driver-builder stage), where curl, jq and unzip
# are already provided by the LinuxServer.io base image. Writes the driver
# binary and a build-info file into the staging directory (default /out), so
# the final stage can copy them in without carrying any build residue.
#
# DRIVER_URL: explicit chromedriver zip URL; skips resolution when set.
set -euo pipefail

dest_dir="${1:-/out}"
driver_url="${DRIVER_URL:-}"

for tool in curl jq unzip; do
  command -v "$tool" >/dev/null 2>&1 ||
    { printf '%s\n' "fetch-chromedriver: '$tool' is not available in the base image." >&2; exit 1; }
done

version=$(/usr/bin/chromium --version | head -n 1 | sed -n 's/^Chromium \([0-9][0-9.]*\).*/\1/p')
[ -n "$version" ] || { printf '%s\n' "fetch-chromedriver: could not parse the Chromium version." >&2; exit 1; }
major="${version%%.*}"

# Chrome for Testing publishes per-architecture builds; match the architecture
# of the image being built.
case "$(uname -m)" in
  arm64 | aarch64) cft_platform=linux-arm64 ;;
  *) cft_platform=linux64 ;;
esac

if [ -z "$driver_url" ]; then
  printf '%s\n' "Resolving chromedriver ${major}.x via Chrome for Testing (${cft_platform}) ..."
  index_file=$(mktemp)
  if ! curl -fsSL "https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json" -o "$index_file"; then
    rm -f "$index_file"
    printf '%s\n' "fetch-chromedriver: failed to download the Chrome for Testing version index." >&2
    exit 1
  fi
  driver_url=$(jq -r --arg major "${major}." --arg exact "$version" --arg platform "$cft_platform" '
    [.versions[] | select(.version | startswith($major)) | select(.downloads.chromedriver != null)]
    | (map(select(.version == $exact))[0] // .[-1] // null)
    | if . == null then empty
      else (.downloads.chromedriver[]? | select(.platform == $platform) | .url)
      end' "$index_file")
  rm -f "$index_file"
  [ -n "$driver_url" ] ||
    { printf '%s\n' "fetch-chromedriver: no chromedriver download found for Chromium ${version}." >&2; exit 1; }
fi
printf '%s\n' "chromedriver URL: $driver_url"
driver_version=$(printf '%s\n' "$driver_url" | sed -n "s#.*/\([0-9][0-9.]*\)/${cft_platform}/.*#\1#p")

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
if ! curl -fsSL "$driver_url" -o "$tmp/chromedriver.zip"; then
  printf '%s\n' "fetch-chromedriver: failed to download $driver_url." >&2
  exit 1
fi
if ! unzip -o -q "$tmp/chromedriver.zip" -d "$tmp"; then
  printf '%s\n' "fetch-chromedriver: failed to extract $driver_url." >&2
  exit 1
fi
bin=$(find "$tmp" -type f -name chromedriver -print -quit)
[ -n "$bin" ] || { printf '%s\n' "fetch-chromedriver: no chromedriver binary inside $driver_url." >&2; exit 1; }

mkdir -p "$dest_dir"
install -m 0755 "$bin" "$dest_dir/chromedriver"
printf 'chromium=%s\nchromedriver=%s\nplatform=%s\n' \
  "$version" "${driver_version:-unknown}" "$cft_platform" > "$dest_dir/build-info"
printf '%s\n' "Staged chromedriver ${driver_version:-unknown} for Chromium ${version} (${cft_platform})."
