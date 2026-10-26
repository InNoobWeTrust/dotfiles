# Linux lifecycle: install_services(script, clouds), uninstall_services(user_id, clouds).
# The first argument is unused on Linux; the dispatcher supplies the cloud list.
install_services() {
    systemd_clouds=$2
    if ! command -v systemctl >/dev/null 2>&1 || ! systemctl --user show --property=Version >/dev/null 2>&1; then
        printf '%s\n' 'rclone-mount: Skipping autostart; no systemd user manager. Rerun --install in a user login session.' >&2
        return
    fi
    directory="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
    mkdir -p "$directory"
    write_definition "$directory/rclone-mount@.service" <<EOF
# $marker
[Unit]
Description=Cloud mount (%i)
StartLimitIntervalSec=0

[Service]
Type=exec
ExecStart=/bin/sh "%h/.sh.d/utils/rclone-mount/rclone-mount.sh" %i
Restart=on-failure
RestartSec=30s
TimeoutStopSec=60
UMask=0077
StandardInput=null

[Install]
WantedBy=default.target
EOF
    if [ "$changed" = 1 ]; then
        systemctl --user daemon-reload
    fi
    install_failed=0
    for cloud in $systemd_clouds; do
        unit="rclone-mount@$cloud.service"
        status=$(systemctl --user is-enabled "$unit" 2>/dev/null || :)
        case $status in
            masked|masked-runtime) continue ;;
            enabled) ;;
            *)
                if ! systemctl --user enable "$unit"; then
                    printf 'rclone-mount: Cannot enable %s; continuing with other clouds.\n' "$unit" >&2
                    install_failed=1
                    continue
                fi
                ;;
        esac
        # start leaves an already-running service alone; never restart a live mount.
        if ! systemctl --user start "$unit"; then
            printf 'rclone-mount: Cannot start %s; check its user journal.\n' "$unit" >&2
            install_failed=1
        fi
    done
    [ "$install_failed" = 0 ] || fail 'Some services could not be enabled or started; see errors above.'
    printf '%s\n' 'rclone-mount: Login autostart registered; unmasked services started (running mounts left alone).'
}

uninstall_services() {
    systemd_clouds=$2
    if ! command -v systemctl >/dev/null 2>&1 || ! systemctl --user show --property=Version >/dev/null 2>&1; then
        fail 'Cannot contact the systemd user manager; no definitions removed.'
    fi
    directory="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
    definition="$directory/rclone-mount@.service"
    check_owned_definition "$definition"
    to_stop=
    # Preflight every definition/link/instance before stopping anything.
    for cloud in $systemd_clouds; do
        unit="rclone-mount@$cloud.service"
        link="$directory/default.target.wants/$unit"
        if [ -e "$link" ] || [ -L "$link" ]; then
            [ -L "$link" ] || fail "Refusing foreign enablement: $link"
            target=$(readlink "$link") || fail "Cannot inspect $link"
            case $target in
                "$definition"|../rclone-mount@.service) ;;
                *) fail "Refusing foreign enablement: $link" ;;
            esac
        fi
        info=$(systemctl --user show --property=LoadState --property=ActiveState --property=FragmentPath "$unit") ||
            fail "Cannot inspect $unit; no definitions removed."
        load='' active='' fragment=''
        while IFS= read -r property; do
            case $property in
                LoadState=*) load=${property#LoadState=} ;;
                ActiveState=*) active=${property#ActiveState=} ;;
                FragmentPath=*) fragment=${property#FragmentPath=} ;;
            esac
        done <<EOF
$info
EOF
        case $load in
            not-found) ;;
            masked) [ "$active" = inactive ] || fail "Stop masked $unit manually before uninstalling." ;;
            loaded)
                [ "$fragment" = "$definition" ] && [ -f "$definition" ] ||
                    fail "Refusing to stop $unit (not loaded from our definition)."
                to_stop="$to_stop $unit"
                ;;
            *) fail "Cannot safely inspect $unit (load state: $load)." ;;
        esac
    done
    for unit in $to_stop; do
        systemctl --user stop "$unit" || fail "Cannot stop $unit; definitions kept."
    done
    check_owned_definition "$definition"
    for cloud in $systemd_clouds; do
        link="$directory/default.target.wants/rclone-mount@$cloud.service"
        if [ -L "$link" ]; then
            target=$(readlink "$link") || fail "Cannot inspect $link"
            case $target in
                "$definition"|../rclone-mount@.service) rm -f "$link" ;;
                *) fail "Enablement changed during uninstall: $link" ;;
            esac
        elif [ -e "$link" ]; then
            fail "Enablement changed during uninstall: $link"
        fi
    done
    [ ! -f "$definition" ] || rm -f "$definition"
    systemctl --user daemon-reload || fail 'Definitions removed, but systemd daemon-reload failed.'
}
