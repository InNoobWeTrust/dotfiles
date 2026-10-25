# Generated-service ownership and atomic updates. Requires fail from common.sh.
marker="Managed by dotfiles rclone-mount.sh"

check_owned_definition() {
    if [ -e "$1" ] || [ -L "$1" ]; then
        if [ -L "$1" ] || [ ! -f "$1" ] || ! grep -qF "$marker" "$1"; then
            fail "Refusing to ${2:-remove} $1 (not a generated definition)."
        fi
    fi
}

# Atomically replace only our definitions. `changed` reports whether to reload.
write_definition() {
    destination=$1
    changed=0
    check_owned_definition "$destination" replace
    temporary=$(mktemp "$destination.XXXXXX") || fail "Cannot create $destination."
    if ! cat > "$temporary"; then
        rm -f "$temporary"
        fail "Cannot write $destination."
    fi
    case $destination in
        *.plist)
            if ! plutil -lint "$temporary" >/dev/null; then
                rm -f "$temporary"
                fail "Invalid LaunchAgent: $destination"
            fi
            ;;
    esac
    if [ -f "$destination" ] && cmp -s "$temporary" "$destination"; then
        rm -f "$temporary"
    else
        mv -f "$temporary" "$destination"
        changed=1
    fi
}
