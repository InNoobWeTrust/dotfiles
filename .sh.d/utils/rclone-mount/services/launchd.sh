# macOS lifecycle: install_services(script, clouds), uninstall_services(user_id, clouds).
xml() {
    perl -e '$s = shift; $s =~ s/&/&amp;/g; $s =~ s/</&lt;/g; $s =~ s/>/&gt;/g; $s =~ s/"/&quot;/g; $s =~ s/\x27/&apos;/g; print $s' "$1"
}

install_services() {
    script=$1
    launchd_clouds=$2
    command -v perl >/dev/null 2>&1 || fail 'Perl is required to generate LaunchAgents.'
    directory="$HOME/Library/LaunchAgents"
    logs="$HOME/Library/Logs/rclone-mount"
    mkdir -p "$directory" "$logs"
    script_xml=$(xml "$script")
    home_xml=$(xml "$HOME")
    activate=0
    user_id=$(id -u)
    if command -v launchctl >/dev/null 2>&1 &&
        [ "$(launchctl managername 2>/dev/null || :)" = Aqua ] &&
        [ "$(launchctl manageruid 2>/dev/null || :)" = "$user_id" ]; then
        activate=1
    fi
    install_failed=0
    for cloud in $launchd_clouds; do
        label="local.rclone-mount.$cloud"
        log_xml=$(xml "$logs/$cloud.log")
        write_definition "$directory/local.rclone-mount.$cloud.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<!-- $marker -->
<plist version="1.0"><dict>
  <key>Label</key><string>local.rclone-mount.$cloud</string>
  <key>ProgramArguments</key><array>
    <string>/bin/sh</string><string>$script_xml</string><string>$cloud</string>
  </array>
  <key>EnvironmentVariables</key><dict><key>HOME</key><string>$home_xml</string></dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><dict><key>SuccessfulExit</key><false/></dict>
  <key>ThrottleInterval</key><integer>30</integer>
  <key>LimitLoadToSessionType</key><string>Aqua</string>
  <key>ExitTimeOut</key><integer>60</integer>
  <key>Umask</key><integer>63</integer>
  <key>StandardOutPath</key><string>$log_xml</string>
  <key>StandardErrorPath</key><string>$log_xml</string>
</dict></plist>
EOF
        [ "$activate" = 1 ] || continue
        if launchctl print "gui/$user_id/$label" >/dev/null 2>&1; then
            if [ "$changed" = 1 ]; then
                printf 'rclone-mount: %s is already loaded; log out/in to apply its updated definition (not restarted).\n' "$label" >&2
                continue
            fi
            # No -k: an existing mount must not be killed to refresh registration.
            if ! launchctl kickstart "gui/$user_id/$label"; then
                printf 'rclone-mount: Cannot start %s; check its log and launchctl disable policy.\n' "$label" >&2
                install_failed=1
            fi
        elif ! launchctl bootstrap "gui/$user_id" "$directory/$label.plist"; then
            printf 'rclone-mount: Cannot load %s; check its log and launchctl disable policy (not overridden).\n' "$label" >&2
            install_failed=1
        fi
    done
    [ "$install_failed" = 0 ] || fail 'Some LaunchAgents could not be loaded or started; see errors above.'
    if [ "$activate" = 1 ]; then
        printf '%s\n' 'rclone-mount: Login autostart registered; activation requested without restarting running mounts.'
    else
        printf '%s\n' 'rclone-mount: Login autostart registered; activation skipped. Rerun --install in a terminal in your macOS GUI login session.' >&2
    fi
}

uninstall_services() {
    user_id=$1
    launchd_clouds=$2
    command -v launchctl >/dev/null 2>&1 || fail 'launchctl is required.'
    manager=$(launchctl managername) || fail 'Cannot inspect the launchd session.'
    manager_uid=$(launchctl manageruid) || fail 'Cannot inspect the launchd user.'
    [ "$manager" = Aqua ] && [ "$manager_uid" = "$user_id" ] ||
        fail 'Run uninstall from a terminal in your macOS GUI login session.'
    directory="$HOME/Library/LaunchAgents"
    for cloud in $launchd_clouds; do
        check_owned_definition "$directory/local.rclone-mount.$cloud.plist"
    done
    jobs=$(launchctl list) || fail 'Cannot list LaunchAgents; no definitions removed.'
    # Legacy list has documented columns; modern print is NOT a parsing API.
    labels=$(printf '%s\n' "$jobs" | awk '
        NR == 1 { if (NF != 3 || $1 != "PID" || $2 != "Status" || $3 != "Label") exit 1; next }
        NF != 3 || $1 !~ /^(-|[0-9]+)$/ || $2 !~ /^-?[0-9]+$/ { exit 1 }
        { print $3 }
        END { if (NR == 0) exit 1 }
    ') || fail 'Unsupported launchctl list format; no definitions removed.'
    to_bootout=
    while IFS= read -r label; do
        case $label in
            local.rclone-mount.onedrive|local.rclone-mount.gdrive|local.rclone-mount.box|local.rclone-mount.dropbox)
                [ -f "$directory/$label.plist" ] || fail "Loaded $label has no owned definition; refusing to stop it."
                to_bootout="$to_bootout $label"
                ;;
            local.rclone-mount.*) fail "Unexpected job in the helper's reserved namespace: $label" ;;
        esac
    done <<EOF
$labels
EOF
    for label in $to_bootout; do
        launchctl bootout "gui/$user_id/$label" || fail "Cannot unload $label; definitions kept."
    done
    for cloud in $launchd_clouds; do
        definition="$directory/local.rclone-mount.$cloud.plist"
        check_owned_definition "$definition"
        [ ! -f "$definition" ] || rm -f "$definition"
    done
}
