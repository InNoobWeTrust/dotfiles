#!/usr/bin/env -S sh

# Install pkgx to use bun
command -v pkgx >/dev/null 2>&1 || eval "$(curl -Ssf https://pkgx.sh)"

touch checkpoint.txt
pkgx fb_auto_pressing.ts
