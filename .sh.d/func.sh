#!/usr/bin/env sh
# shellcheck disable=SC3043

#
# # usable - Check if command exist before invoking
# # usage: usable [some_command] && [some_command]
usable() {
    [ -n "${1-}" ] || return 1

    # Aliases can be defined after a command's absence was cached.
    alias "$1" >/dev/null 2>&1 && return 0

    case " ${__USABLE_HIT_CMDS-} " in
        *" $1 "*) return 0 ;;
    esac

    case " ${__USABLE_MISS_CMDS-} " in
        *" $1 "*) return 1 ;;
    esac

    if command -v "$1" >/dev/null 2>&1; then
        __USABLE_HIT_CMDS="${__USABLE_HIT_CMDS-} $1"
        return 0
    elif which "$1" >/dev/null 2>&1; then
        __USABLE_HIT_CMDS="${__USABLE_HIT_CMDS-} $1"
        return 0
    fi

    __USABLE_MISS_CMDS="${__USABLE_MISS_CMDS-} $1"
    return 1
}

#
# # usable_batch - Batch check multiple commands for existence
# # usage: usable_batch cmd1 cmd2 cmd3 ...
# # Sets __USABLE_BATCH_RESULTS with space-separated "cmd:0" (found) or "cmd:1" (not found)
usable_batch() {
    local cmd 2>/dev/null || true

    # Reset cached results
    __USABLE_HIT_CMDS=""
    __USABLE_MISS_CMDS=""
    # Combined results
    __USABLE_BATCH_RESULTS=""
    for cmd in "$@"; do
        if usable "$cmd"; then
            __USABLE_BATCH_RESULTS="${__USABLE_BATCH_RESULTS}${cmd}:0 "
        else
            __USABLE_BATCH_RESULTS="${__USABLE_BATCH_RESULTS}${cmd}:1 "
        fi
    done
}

#
# # forgit_me_config - Configure git for many repos at once
# # usage forgit_me_config [some_git_config]
forgit_me_config() {
    local d 2>/dev/null || true

    for d in $(ls -d */); do
        [ -d "$d/.git/" ] && \
            echo "Configuring git repo $d..." && \
            (cd "$d" && git config "$@")
    done
}

#
# # git_web_url - Get url in https for remote url
# # usage git_web_url
git_web_url() {
    local remote url 2>/dev/null || true

    # Remote from input or default to 'origin'
    remote=$1
    if [ -z "$remote" ]; then
        remote="origin"
    fi

    # Get Git remote URL
    url=$(git config --get remote."$remote".url)

    # Remove ".git" suffix
    url=$(echo "$url" | sed 's/\.git$//')

    # Remove prefixes
    case "$url" in
        https://*) url=${url#https://};;
        http://*) url=${url#http://};;
        ssh://*) url=${url#ssh://};;
    esac

    # Remove "git@"
    url=$(echo "$url" | sed 's/git@//')

    # Replaces ':' with '/' in the middle of the SSH URL
    url=$(echo "$url" | sed 's/:/\//')

    # Format URL as a GitLab web URL
    echo "https://$url"
}

#
# # gitlab_web_mr_create - Get url for creating PR on gitlab with information prefilled
# # usage gitlab_web_mr_create [target_branch] [assignees] [reviewers] [remote]
gitlab_web_mr_create() {
    local remove_branch current_branch target_branch assignees reviewers remote repo title description 2>/dev/null || true

    remove_branch="merge_request[force_remove_source_branch]=true"
    current_branch="&merge_request[source_branch]=$(git branch --show-current)"

    target_branch="&merge_request[target_branch]=${1:-develop}"
    assignees="&merge_request[assignee_ids][]=$2"
    reviewers="&merge_request[reviewer_ids][]=$3"

    remote=${4:-origin}
    repo=$(git_web_url "$remote")

    title="&merge_request[title]='$(git log -1 --pretty=format:%s)'"
    description="&merge_request[description]='$(git log --pretty=format:%s origin/develop..HEAD | jq -sRr @uri)'"

    echo "${repo}/-/merge_requests/new?${remove_branch}${current_branch}${target_branch}${assignees}${reviewers}${title}${description}"
}

#
# # gitlab_push_mr_create - Creating PR on gitlab by git push
# # usage gitlab_push_mr_create [target_branch] [assignees] [reviewers] [remote]
gitlab_push_mr_create() {
    local remove_branch current_branch target_branch assignees reviewers remote title 2>/dev/null || true

    set -x

    remove_branch="merge_request.force_remove_source_branch=true"
    current_branch="merge_request.source_branch=$(git branch --show-current)"

    target_branch="merge_request.target_branch=${1:-develop}"
    assignees="merge_request.assignee_ids[]=$2"
    reviewers="merge_request.reviewer_ids[]=$3"

    remote=${4:-origin}

    title="merge_request.title='$(git log -1 --pretty=format:%s)'"

    git push "$remote" \
        -o merge_request.create \
        -o "$remove_branch" \
        -o "$current_branch" \
        -o "$target_branch" \
        -o "$assignees" \
        -o "$reviewers" \
        -o "$title"

    set +x
}

#
# # batch_open - open links in batches
# # usage: batch_open [file_contain_links] [batch_size] [start]
batch_open() {
    local f size start browser links_all len s links 2>/dev/null || true

    f=${1:-links.txt}
    size=${2:-10}
    start=${3:-1}
    browser=${4:-firefox}
    links_all=$(grep -Eo 'https?://[^ ]+' "$f" 2>/dev/null || true)
    len=$(printf '%s\n' "$links_all" | awk 'NF {c++} END {print c+0}')

    [ "$len" -eq 0 ] && return 0

    for s in $(seq "$start" "$size" "$len"); do
        echo "$s"+"$size":
        links=$(printf '%s\n' "$links_all" | awk 'NF' | tail -n +"$s" | head -n "$size")
        echo "$links"
        printf 'Press ENTER to continue...'
        IFS= read -r _
        printf '%s\n' "$links" | xargs open -a "$browser"
    done
}

#
# # lag - Dummy sleep with a spinner and customizable sleep time
# # usage: lag [seconds]
lag() {
    local sleep_time job s 2>/dev/null || true

    sleep_time=${1:-5}
    sleep "$sleep_time" & job=$!
    while kill -0 "$job" 2>/dev/null; do
        for s in / - \\ \|; do
            printf "\r%s" "$s"
            sleep .1
        done
    done
}

#
# # gacha - Animated number generator with optional range. Press ENTER to stop the animation and get a random number.
# # usage: gacha [min] [max]
gacha() {
    local min max 2>/dev/null || true

    min=${1:-1}
    max=${2:-100}
    while ! read -t 0.25 -rsn 1; do
        printf "\r%5d" $((RANDOM % (max - min + 1) + min))
    done
    echo
}

#
# # dotfiles_clean - Clean caches for common tools, temporary artifacts, and platform junk
# # usage: dotfiles_clean [--dry-run] [--mac-cleanup]
dotfiles_clean() {
    local dry_run=0 run_mac_cleanup=0 2>/dev/null || true
    local cache_dir="${XDG_CACHE_HOME:-$HOME/.cache}"

    while [ $# -gt 0 ]; do
        case "$1" in
            --dry-run|-n)
                dry_run=1
                shift
                ;;
            --mac-cleanup|-m)
                run_mac_cleanup=1
                shift
                ;;
            --help|-h)
                printf 'usage: dotfiles_clean [--dry-run] [--mac-cleanup]\n'
                printf 'Clean known tool caches (uv, bun, npm, pnpm, go, gh), temporary files, and platform junk.\n'
                return 0
                ;;
            *)
                shift
                ;;
        esac
    done

    printf "==> Cleaning known tool caches...\n"

    # 1. uv cache
    if usable uv; then
        printf "Pruning uv package cache...\n"
        if [ "$dry_run" -eq 0 ]; then
            uv cache prune >/dev/null 2>&1 || true
        fi
    fi

    # 2. bun cache
    if usable bun; then
        printf "Pruning bun cache...\n"
        if [ "$dry_run" -eq 0 ]; then
            bun pm cache rm >/dev/null 2>&1 || true
        fi
    fi

    # 3. npm cache
    if usable npm; then
        printf "Verifying and cleaning npm cache...\n"
        if [ "$dry_run" -eq 0 ]; then
            npm cache verify >/dev/null 2>&1 || true
        fi
    fi

    # 4. pnpm store
    if usable pnpm; then
        printf "Pruning pnpm store...\n"
        if [ "$dry_run" -eq 0 ]; then
            pnpm store prune >/dev/null 2>&1 || true
        fi
    fi

    # 5. go build cache
    if usable go; then
        printf "Cleaning go build cache...\n"
        if [ "$dry_run" -eq 0 ]; then
            go clean -cache 2>/dev/null || true
        fi
    fi

    # 6. GitHub CLI temporary logs
    if [ -d "$cache_dir/gh" ]; then
        printf "Removing gh run-log archives...\n"
        if [ "$dry_run" -eq 0 ]; then
            rm -f "$cache_dir"/gh/run-log-*.zip 2>/dev/null || true
        fi
    fi

    # 7. Chrome DevTools MCP cache
    if [ -d "$cache_dir/chrome-devtools-mcp" ]; then
        printf "Removing chrome-devtools-mcp cache...\n"
        if [ "$dry_run" -eq 0 ]; then
            rm -rf "$cache_dir/chrome-devtools-mcp" 2>/dev/null || true
        fi
    fi

    # 8. OpenCode npm cache
    if [ -d "$cache_dir/opencode/npm" ]; then
        printf "Removing opencode npm cache...\n"
        if [ "$dry_run" -eq 0 ]; then
            rm -rf "$cache_dir/opencode/npm" 2>/dev/null || true
        fi
    fi

    # 9. Platform-specific cleanup
    case "$(uname -s)" in
        Darwin)
            if usable macos_cleanup; then
                macos_cleanup "$dry_run" "$run_mac_cleanup"
            fi
            ;;
    esac

    printf "==> Cleanup finished.\n"
}

#
# # mux - pickup terminal multiplexer or download and execute one
# # usage: mux [zellij_args]
mux() {
    if usable zellij; then
        if alias zellij >/dev/null 2>&1; then
            # Expand aliases at invocation time, not when this function is sourced.
            eval 'zellij "$@"'
        else
            zellij "$@"
        fi
    elif [ -n "$BASH_VERSION" ] || [ -n "$ZSH_VERSION" ]; then
        # If shell supports process substitution, use it to avoid creating a temporary file
        # shellcheck disable=SC3001
        bash <(curl -fsSL zellij.dev/launch) "$@"
    else
        local tmp_script rc 2>/dev/null || true
        tmp_script=$(mktemp)
        curl -fsSL zellij.dev/launch > "$tmp_script" || {
            rm -f "$tmp_script"
            return 1
        }
        bash "$tmp_script" "$@"
        rc=$?
        rm -f "$tmp_script"
        return "$rc"
    fi
}

#
# # vscode_cli_install - Install VSCode CLI per OS and architecture
# # usage: vscode_cli_install
vscode_cli_install() (
    # Subshell isolates installer variables and cleanup traps from interactive callers.
    if usable code; then
        echo "VSCode CLI is already installed."
        exit 0
    fi
    OS=$(uname -s) || exit $?
    ARCH=$(uname -m) || exit $?
    case "$OS:$ARCH" in
        Darwin:arm64) platform=cli-darwin-arm64 ;;
        Linux:x86_64) platform=cli-alpine-x64 ;;
        Linux:aarch64|Linux:arm64) platform=cli-alpine-arm64 ;;
        *) echo "Unsupported OS/architecture: $OS/$ARCH" >&2; exit 1 ;;
    esac
    URL="https://code.visualstudio.com/sha/download?build=stable&os=$platform"
    umask 077
    CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/vscode-cli"
    DEST_DIR="$HOME/.local/bin"
    mkdir -p "$CACHE_DIR" "$DEST_DIR" || exit $?
    TMP_DIR=$(mktemp -d "$CACHE_DIR/install.XXXXXXXX") || exit $?
    trap 'rm -rf -- "$TMP_DIR"' 0
    trap 'exit 130' INT
    trap 'exit 143' TERM
    trap 'exit 129' HUP
    case "$OS" in
        Darwin)
            curl -fL --connect-timeout 15 --max-time 300 -o "$TMP_DIR/code.zip" "$URL" || exit $?
            unzip -q "$TMP_DIR/code.zip" -d "$TMP_DIR" || exit $?
            ;;
        Linux)
            curl -fL --connect-timeout 15 --max-time 300 -o "$TMP_DIR/code.tar.gz" "$URL" || exit $?
            tar -xzf "$TMP_DIR/code.tar.gz" -C "$TMP_DIR" || exit $?
            ;;
    esac
    [ -s "$TMP_DIR/code" ] || { echo "Downloaded archive has no code binary" >&2; exit 1; }
    chmod 755 "$TMP_DIR/code" || exit $?
    mv -f "$TMP_DIR/code" "$DEST_DIR/code" || exit $?
)

#
# # cron_routine - cron at random time over a day
# # usage: cron_routine [shell_script_file] [number_of_runs]
cron_routine() {
    local SCRIPT RUNS MIN_STEP MIN HOURS CONF 2>/dev/null || true

    SCRIPT=${1:-cron.sh}
    RUNS=${2:-5}
    MIN_STEP=${3:-3}
    MIN=$(awk 'BEGIN{srand(); print int(rand()*60)}')
    HOURS=$(seq 0 "$MIN_STEP" 23 | shuf | head -n "$RUNS" | sort -n | tr '\n' ' ' | sed -e 's/[[:space:]]$//' | tr ' ' ',')

    CONF="$MIN\t$HOURS\t*\t*\t*\tcd $PWD && /usr/bin/env -S bash -l -c 'CRON=true LOGLEVEL=DEBUG ./$SCRIPT > ./out.log 2>> ./error.log'"

    printf '%b\n' "$CONF"
}

#
# # setPath - Add to PATH if not there
# # usage: setPath [some_path]
setPath() {
case :${PATH:=$1}: in
    *:"$1":*) ;;
    *)
        [ -d "$1" ] && export PATH="$1:$PATH"
esac;
}

#
# # ngrokhttp - Reverse tunneling to ngrok
# # usage ngrokhttp [port]
ngrokhttp() {
    ssh -R 443:localhost:"$1" tunnel.ap.ngrok.com http
}

#
# # nvim_ssh_server - Start and connect to neovim on remote server
# # usage: nvim_ssh_server [--server remote-machine] [--shell shell]
# #        nvim_ssh_server [remote-machine] [shell]
nvim_ssh_server() {
    local remote_server shell positional_args server_named shell_named end_of_opts 2>/dev/null || true

    remote_server=''
    shell='bash'
    positional_args=0
    server_named=0
    shell_named=0
    end_of_opts=0

    while [ "$#" -gt 0 ]; do
        if [ "$end_of_opts" -eq 0 ]; then
            case "$1" in
                -h|--help)
                    printf 'usage: nvim_ssh_server [--server remote-machine] [--shell shell]\n'
                    printf '       nvim_ssh_server [remote-machine] [shell]\n'
                    return 0
                    ;;
                --server|--server-name|--remote-server|--name|-r)
                    [ "$#" -gt 1 ] || {
                        printf 'nvim_ssh_server: %s requires a value\n' "$1" >&2

                        return 2
                    }
                    remote_server="$2"
                    server_named=1
                    shift 2
                    continue
                    ;;
                --server=*|--server-name=*|--remote-server=*|--name=*)
                    remote_server=${1#*=}
                    server_named=1
                    shift
                    continue
                    ;;
                --shell|-s)
                    [ "$#" -gt 1 ] || {
                        printf 'nvim_ssh_server: %s requires a value\n' "$1" >&2

                        return 2
                    }
                    shell="$2"
                    shell_named=1
                    shift 2
                    continue
                    ;;
                --shell=*)
                    shell=${1#*=}
                    shell_named=1
                    shift
                    continue
                    ;;
                --)
                    end_of_opts=1
                    shift
                    continue
                    ;;
                -*)
                    printf 'nvim_ssh_server: unknown option: %s\n' "$1" >&2

                    return 2
                    ;;
            esac
        fi

        # Keep supporting the original positional arguments (and arguments after --).
        if [ "$server_named" -eq 0 ] && [ "$positional_args" -eq 0 ]; then
            remote_server="$1"
            positional_args=1
        elif [ "$shell_named" -eq 0 ] && [ "$positional_args" -le 1 ]; then
            shell="$1"
            positional_args=2
        else
            printf 'nvim_ssh_server: unexpected argument: %s\n' "$1" >&2
            return 2
        fi
        shift
    done

    [ -n "$remote_server" ] && [ -n "$shell" ] || {
        printf 'usage: nvim_ssh_server [--server remote-machine] [--shell shell]\n' >&2

        return 2
    }

    ssh -L 6666:localhost:6666 -- "$remote_server" -t "${shell} -l -c 'nvim --headless --listen localhost:6666'"
}

#
# # editor - Open default editor
# # usage: editor [file ...] [+line file]
editor() {
    eval "${EDITOR:-vi} \"\$@\""
}

#
# # colortest - Print colors on terminal
# # usage: colortest
colortest() {
    local fgc bgc vals seq0 2>/dev/null || true

    printf "Color escapes are %s\n" '\e[${value};...;${value}m'
    printf "Values 30..37 are \e[33mforeground colors\e[m\n"
    printf "Values 40..47 are \e[43mbackground colors\e[m\n"
    printf "Value  1 gives a  \e[1mbold-faced look\e[m\n\n"

    # foreground colors
    for fgc in $(seq 30 37); do
        # background colors
        for bgc in $(seq 40 47); do
            fgc=${fgc#37} # white
            bgc=${bgc#40} # black

            vals="${fgc:+$fgc;}${bgc}"
            vals=${vals%%;}

            seq0="${vals:+\e[${vals}m}"
            printf "  %-9s" "${seq0:-(default)}"
            printf " %sTEXT\e[m" "${seq0}"
            printf " \e[%s1mBOLD\e[m" "${vals:+${vals+$vals;}}"
        done
        echo; echo
    done
}
# Only alias in non-zsh shells to avoid collision with zsh's native `autoload -U colors`
[ -z "$ZSH_VERSION" ] && alias colors=colortest

#
# # ex - archive extractor
# # usage: ex <file>
ex ()
{
    if [ -f "$1" ] ; then
        case "$1" in
            *.tar.bz2)   tar xjf "$1"   ;;
            *.tar.gz)    tar xzf "$1"   ;;
            *.bz2)       bunzip2 "$1"   ;;
            *.rar)       unrar x "$1"     ;;
            *.gz)        gunzip "$1"    ;;
            *.tar)       tar xf "$1"    ;;
            *.tbz2)      tar xjf "$1"   ;;
            *.tgz)       tar xzf "$1"   ;;
            *.zip)       unzip "$1"     ;;
            *.Z)         uncompress "$1";;
            *.7z)        7z x "$1"      ;;
            *)           echo "'$1' cannot be extracted via ex()" ;;
        esac
    else
        echo "'$1' is not a valid file"
    fi
}

#
# # tiktok_id - Get TikTok ID from username
# # usage: tiktok_id [username]
tiktok_id() {
    curl -s "https://www.tiktok.com/@$1" | sed -n 's/.*"userInfo":{"user":{"id":"\([^"]*\)".*/\1/p'
}

#
# # setup_remote_user - Provision a remote user without remembering script path
# # usage: setup_remote_user [script_args]
setup_remote_user() {
    local script_path 2>/dev/null || true

    script_path="$CONF_SH_DIR/utils/setup_user.sh"

    [ ! -r "$script_path" ] && {
        echo "setup_remote_user script not found: $script_path" >&2
        return 1
    }

    /usr/bin/env sh "$script_path" "$@"
}

#
# # chrome_debug - Start Chrome with a debug port
# # usage: chrome_debug [port]
chrome_debug() {
    local port chrome_bin cmd 2>/dev/null || true

    port=${1:-9222}
    case "$(uname -s)" in
        Darwin)
            chrome_bin="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            ;;
        Linux)
            for cmd in google-chrome google-chrome-stable chromium-browser chromium; do
                if usable "$cmd"; then
                    chrome_bin=$(command -v "$cmd")
                    break
                fi
            done
            ;;
    esac

    if [ -n "$chrome_bin" ] && [ -x "$chrome_bin" ]; then
        # Shift the first argument (port) if it was provided
        [ -n "$1" ] && shift
        "$chrome_bin" --remote-debugging-port="$port" --user-data-dir="$HOME/.local/chrome/user_data" "$@"
    else
        echo "Chrome or Chromium not found"
        return 1
    fi
}

#
# # socat_bind - Bind and forward a port to external LAN using socat
# # usage: socat_bind --port <port> [--host <host>]
socat_bind() {
    local bind_host bind_port target_host target_port lan_ip listen_opts 2>/dev/null || true

    if ! usable socat; then
        echo "Error: socat is not installed or not in PATH" >&2
        return 1
    fi

    bind_host=""
    bind_port=""
    target_host="127.0.0.1"
    target_port=""

    while [ $# -gt 0 ]; do
        case "$1" in
            --help)
                cat <<'EOF'
Usage: socat_bind --port <port> [--host <host>]

Options:
  -p, --port <port>        Port to listen on and forward (required)
  -h, --host <host>        Interface/host to bind on (optional, default: TCP-LISTEN)
  -t, --target <host>      Target host to forward to (default: 127.0.0.1)
      --target-port <port> Target port to forward to (default: same as port)
      --help               Show this help message

Formats supported:
  --port 8317 / -p 8317 / --port=8317 / port=8317
  --host TCP-LISTEN / -h TCP-LISTEN / --host=192.168.1.187 / host=TCP-LISTEN
EOF
                return 0
                ;;
            -p|--port)
                [ -n "${2-}" ] || { echo "Error: --port requires a value" >&2; return 1; }
                bind_port="$2"
                shift 2
                ;;
            --port=*)
                bind_port="${1#*=}"
                shift
                ;;
            port=*)
                bind_port="${1#*=}"
                shift
                ;;
            -h|--host)
                [ -n "${2-}" ] || { echo "Error: --host requires a value" >&2; return 1; }
                bind_host="$2"
                shift 2
                ;;
            --host=*)
                bind_host="${1#*=}"
                shift
                ;;
            host=*)
                bind_host="${1#*=}"
                shift
                ;;
            -t|--target)
                [ -n "${2-}" ] || { echo "Error: --target requires a value" >&2; return 1; }
                target_host="$2"
                shift 2
                ;;
            --target=*)
                target_host="${1#*=}"
                shift
                ;;
            target=*)
                target_host="${1#*=}"
                shift
                ;;
            --target-port)
                [ -n "${2-}" ] || { echo "Error: --target-port requires a value" >&2; return 1; }
                target_port="$2"
                shift 2
                ;;
            --target-port=*)
                target_port="${1#*=}"
                shift
                ;;
            [0-9]*)
                if [ -z "$bind_port" ]; then
                    bind_port="$1"
                fi
                shift
                ;;
            *)
                echo "Error: unrecognized argument '$1'" >&2
                echo "Run 'socat_bind --help' for usage." >&2
                return 1
                ;;
        esac
    done

    if [ -z "$bind_port" ]; then
        echo "Error: port is required (--port <port> or port=<port>)" >&2
        return 1
    fi

    case "$bind_port" in
        ''|*[!0-9]*)
            echo "Error: port must be a valid number: '$bind_port'" >&2
            return 1
            ;;
    esac

    if [ "$bind_port" -lt 1 ] || [ "$bind_port" -gt 65535 ]; then
        echo "Error: port must be between 1 and 65535: '$bind_port'" >&2
        return 1
    fi

    target_port="${target_port:-$bind_port}"

    case "$bind_host" in
        ""|[lL][aA][nN])
            bind_host="TCP-LISTEN"
            listen_opts="TCP-LISTEN:${bind_port},reuseaddr,fork"
            ;;
        *LISTEN*)
            listen_opts="${bind_host}:${bind_port},reuseaddr,fork"
            ;;
        *)
            listen_opts="TCP-LISTEN:${bind_port},bind=${bind_host},reuseaddr,fork"
            ;;
    esac

    lan_ip=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')

    echo "Forwarding ${bind_host}:${bind_port} -> ${target_host}:${target_port} via socat (Ctrl+C to stop)..."
    if [ "$bind_host" = "TCP-LISTEN" ] || [ "$bind_host" = "0.0.0.0" ]; then
        [ -n "$lan_ip" ] && echo "Accessible on LAN at: http://${lan_ip}:${bind_port}"
    else
        echo "Accessible at: http://${bind_host}:${bind_port}"
    fi

    socat "$listen_opts" "TCP:${target_host}:${target_port}"
}

# Run development workspace commands; return the wrapper status without exiting this shell.
dev_workspace() {
    local helper="${CONF_SH_DIR:-$HOME/.sh.d}/utils/dev_workspace/dev_workspace.sh"
    if [ ! -r "$helper" ]; then
        printf '%s\n' 'dev_workspace: helper missing or unreadable; check your shell configuration path.' >&2
        return 1
    fi
    "$helper" "$@"
}

# Run a VS Code tunnel or integrated Tailscale SSH on a Slurm node; return the wrapper status without exiting this shell.
dev_slurm() {
    local helper="${CONF_SH_DIR:-$HOME/.sh.d}/utils/dev_slurm/dev_slurm.sh"
    if [ ! -r "$helper" ]; then
        printf '%s\n' 'dev_slurm: helper missing or unreadable; check your shell configuration path.' >&2
        return 1
    fi
    "$helper" "$@"
}

# Start Tailscale in this environment; the child owns traps, not the calling shell.
dev_tailscale() {
    local helper="${CONF_SH_DIR:-$HOME/.sh.d}/utils/dev_tailscale/dev_tailscale.sh"
    if [ ! -r "$helper" ]; then
        printf '%s\n' 'dev_tailscale: helper missing or unreadable; check your shell configuration path.' >&2
        return 1
    fi
    bash "$helper" "$@"
}

# Start a foreground VS Code tunnel without a scheduler or container.
dev_tunnel() {
    local helper="${CONF_SH_DIR:-$HOME/.sh.d}/utils/dev_tunnel/dev_tunnel.sh"
    if [ ! -r "$helper" ]; then
        printf '%s\n' 'dev_tunnel: helper missing or unreadable; check your shell configuration path.' >&2
        return 1
    fi
    bash "$helper" "$@"
}

# Custom functions
# shellcheck source=/dev/null
[ -r "$CONF_SH_DIR/func.user.sh" ] && . "$CONF_SH_DIR/func.user.sh"
