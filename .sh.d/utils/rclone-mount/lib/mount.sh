# Foreground cloud mount flow. Requires common.sh and reserve_retry from retry.sh.
# rclone owns credentials/VFS; the native supervisor owns process lifetime.
run_mount() {
    cloud=$1
    folder=$2
    case $(uname -s) in
        Linux)
            mount_command=mount
            cache="${XDG_CACHE_HOME:-$HOME/.cache}/rclone-mount/$cloud"
            state_directory="${XDG_STATE_HOME:-$HOME/.local/state}/rclone-mount"
            ;;
        Darwin)
            mount_command=nfsmount
            cache="$HOME/Library/Caches/rclone-mount/$cloud"
            state_directory="$HOME/Library/Application Support/rclone-mount"
            ;;
        *) fail 'Unsupported OS.' ;;
    esac
    reserve_retry "$state_directory" "$cloud"

    rclone=$(command -v rclone) || fail 'rclone is not installed; retrying via the login service.'
    command -v perl >/dev/null 2>&1 || fail 'Perl is required for the credential-check deadline.'
    if [ "$mount_command" = mount ]; then
        command -v fusermount3 >/dev/null 2>&1 || command -v fusermount >/dev/null 2>&1 || fail 'Install FUSE (fusermount3 or fusermount).'
    fi

    # No password prompt/browser or config creation; rclone refreshes valid tokens.
    remotes=$("$rclone" listremotes --ask-password=false </dev/null) || fail 'Cannot read rclone config (encrypted configs need unattended secret provisioning).'
    printf '%s\n' "$remotes" | grep -qxF "$cloud:" || fail "Configure remote '$cloud' with rclone config; the service will retry."

    # Empty accounts are valid (exit 0). Unix alarm survives exec: 30s total bound.
    perl -e 'alarm 30; exec @ARGV; die "Cannot execute rclone: $!\n"' \
        "$rclone" lsd "$cloud:" --ask-password=false --contimeout 10s --timeout 20s \
        --retries 1 --low-level-retries 1 --log-level ERROR </dev/null >/dev/null || \
        fail "Remote '$cloud' unavailable; check login/network. The service will retry."

    mountpoint="$HOME/Cloud/$folder"
    mkdir -p "$mountpoint" "$cache"
    # Never cover nonempty directories, detach, or run sudo. Local NFS has no auth.
    if [ "$mount_command" = nfsmount ]; then
        set -- --addr localhost:0
    else
        set --
    fi
    exec "$rclone" "$mount_command" "$cloud:" "$mountpoint" \
        --ask-password=false --vfs-cache-mode writes --cache-dir "$cache" \
        --contimeout 10s --timeout 20s --log-level NOTICE "$@" </dev/null
}
