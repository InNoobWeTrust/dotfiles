#!/bin/sh
# Public CLI/composition root. Modules declare functions; only this entry runs them.
set -eu
umask 077

PATH="${PIXI_HOME:-$HOME/.pixi}/bin:$HOME/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"
export PATH
utility_dir=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
# shellcheck source=lib/common.sh
. "$utility_dir/lib/common.sh"

case ${1:-} in
    --install|--uninstall)
        # shellcheck source=services/manage.sh
        . "$utility_dir/services/manage.sh"
        manage_services "$1" "$utility_dir"
        ;;
    *)
        folder=$(cloud_folder "${1:-}") || {
            printf '%s\n' 'Usage: sh rclone-mount.sh --install | --uninstall | onedrive | box | dropbox' >&2
            exit 64
        }
        # shellcheck source=lib/retry.sh
        . "$utility_dir/lib/retry.sh"
        # shellcheck source=lib/mount.sh
        . "$utility_dir/lib/mount.sh"
        run_mount "$1" "$folder"
        ;;
esac
