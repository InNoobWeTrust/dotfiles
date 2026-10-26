# Manual lifecycle dispatch. Loads one native adapter, never the mount/retry flow.
manage_services() {
    mode=$1
    service_base=$2
    service_user_id=$(id -u)
    if [ "$service_user_id" = 0 ]; then
        case $mode in
            --install)
                printf '%s\n' 'rclone-mount: Skipping root; install as the desktop user.' >&2
                return
                ;;
            --uninstall) fail 'Uninstall as the desktop user, not root.' ;;
        esac
    fi
    if [ "$mode" = --install ]; then
        service_script="$HOME/.sh.d/utils/rclone-mount/rclone-mount.sh"
        [ -f "$service_script" ] || fail "Stow dotfiles first; missing $service_script."
    fi
    # shellcheck source=services/definitions.sh
    . "$service_base/services/definitions.sh"
    case $(uname -s) in
        Linux)
            # shellcheck source=services/systemd.sh
            . "$service_base/services/systemd.sh"
            ;;
        Darwin)
            # shellcheck source=services/launchd.sh
            . "$service_base/services/launchd.sh"
            ;;
        *)
            case $mode in
                --install)
                    printf '%s\n' 'rclone-mount: Skipping autostart; only Linux/systemd and macOS GUI login are supported.' >&2
                    return
                    ;;
                --uninstall) fail 'Uninstall supports only Linux/systemd and macOS GUI sessions.' ;;
            esac
            ;;
    esac
    service_clouds=$(cloud_names)
    case $mode in
        --install) install_services "$service_script" "$service_clouds" ;;
        --uninstall)
            # Include retired clouds only for safe cleanup of older registrations.
            uninstall_services "$service_user_id" "$service_clouds gdrive"
            printf '%s\n' 'rclone-mount: Startup services removed; credentials, retry state, caches, logs and mount folders kept.'
            ;;
    esac
}
