# Persistent attempt gate. Inputs: state directory, cloud; effect: reserve state.
# No rclone/config access. Prefix private variables (POSIX sh has no local scope).
reserve_retry() {
    retry_directory=$1
    retry_cloud=$2
    [ ! -L "$retry_directory" ] || fail "Refusing symlinked state directory: $retry_directory"
    mkdir -p "$retry_directory"
    retry_state="$retry_directory/$retry_cloud.state"
    if [ -L "$retry_state" ] || { [ -e "$retry_state" ] && [ ! -f "$retry_state" ]; }; then
        fail "Refusing non-regular state: $retry_state"
    fi
    # State is data, never sourced; malformed state starts a fresh sequence.
    retry_last_delay=0
    retry_next_due=0
    if [ -f "$retry_state" ]; then
        read -r retry_last_delay retry_next_due retry_extra < "$retry_state" || :
        retry_invalid=0
        case $retry_last_delay in ''|*[!0-9]*) retry_invalid=1 ;; esac
        case $retry_next_due in ''|*[!0-9]*) retry_invalid=1 ;; esac
        case $retry_last_delay in 0?*) retry_invalid=1 ;; esac
        case $retry_next_due in 0?*) retry_invalid=1 ;; esac
        if [ "$retry_invalid" = 1 ] || [ -n "${retry_extra:-}" ] || [ "${#retry_last_delay}" -gt 5 ] || [ "${#retry_next_due}" -gt 11 ]; then
            retry_last_delay=0; retry_next_due=0
        elif [ "$retry_last_delay" -lt 60 ] || [ "$retry_last_delay" -gt 21600 ]; then
            retry_last_delay=0; retry_next_due=0
        fi
    fi
    # A long healthy mount/inactive period resets the gate, not a successful lsd.
    retry_now=$(date +%s)
    if [ "$retry_now" -gt "$((retry_next_due + 21600))" ]; then
        retry_last_delay=0; retry_next_due=0
    fi
    if [ "$retry_next_due" -gt "$retry_now" ]; then
        retry_remaining=$((retry_next_due - retry_now))
        [ "$retry_remaining" -le 21600 ] || retry_remaining=21600
        sleep "$retry_remaining" &
        retry_sleeper=$!
        trap 'kill "$retry_sleeper" 2>/dev/null || :; wait "$retry_sleeper" 2>/dev/null || :; exit 0' TERM INT HUP
        wait "$retry_sleeper"
        trap - TERM INT HUP
    fi
    # Reserve BEFORE all probes/mount exec, so even mount-start failures back off.
    retry_delay=$((retry_last_delay * 2))
    [ "$retry_delay" -ge 60 ] || retry_delay=60
    [ "$retry_delay" -le 21600 ] || retry_delay=21600
    retry_next_due=$(($(date +%s) + retry_delay))
    retry_temporary=$(mktemp "$retry_state.XXXXXX") || fail 'Cannot reserve next retry.'
    printf '%s %s\n' "$retry_delay" "$retry_next_due" > "$retry_temporary"
    mv -f "$retry_temporary" "$retry_state"
}
