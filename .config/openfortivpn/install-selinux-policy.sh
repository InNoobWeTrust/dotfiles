#!/usr/bin/env bash
# Install both adjacent SELinux policies; leave the VPN service alone.
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
module=local_openfortivpn_network

for tool in checkmodule semodule_package semodule getenforce sudo; do
    command -v "$tool" >/dev/null || {
        printf 'Required tool not found: %s\n' "$tool" >&2
        exit 1
    }
done

if [[ $(getenforce) != Enforcing ]]; then
    printf 'SELinux must be Enforcing; no policy installed.\n' >&2
    exit 1
fi

tmp=$(mktemp -d)
trap 'rm -f "$tmp/$module.mod" "$tmp/$module.pp"; rmdir "$tmp"' EXIT

checkmodule -M -m -o "$tmp/$module.mod" "$script_dir/$module.te"
semodule_package -o "$tmp/$module.pp" -m "$tmp/$module.mod"
sudo semodule -i "$script_dir/local_openfortivpn_saml.cil" -i "$tmp/$module.pp"
installed_modules=$(sudo semodule -l)
for installed_module in local_openfortivpn_saml "$module"; do
    printf '%s\n' "$installed_modules" | grep -E "^$installed_module([[:space:]]|$)"
done
printf 'SAML and network/DNS policies installed; VPN service was not restarted.\n'
