#!/usr/bin/env sh

#
# # usable - Check if command exist before invoking
# # usage: usable [some_command] && [some_command]
usable() {
    type "$1" >/dev/null 2>&1
}

#
# # forgit_me_config - Configure git for many repos at once
# # usage forgit_me_config [some_git_config]
forgit_me_config() {
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
    f=${1:-links.txt}
    size=${2:-10}
    start=${3:-1}
    browser=${4:-Microsoft Edge}
    content=($(grep -o 'http[s]\?://[^ ]\+' "$f"))
    len=${#content[@]}

    for s in $(seq "$start" "$size" "$len"); do
        echo "$s"+"$size":
        links=$(printf '%s\n' "${content[@]}" | tail -n +"$s" | head -n "$size")
        echo "$links"
        read -n 1
        echo "$links" | xargs open -a "$browser"
    done
}

#
# # mux - pickup terminal multiplexer or download and execute one
# # usage: mux [zellij_args]
mux() {
    if $(usable zellij); then
        zellij "$@"
    else
        bash <(curl -L zellij.dev/launch) "$@"
    fi
}

#
# # cron_routine - cron at random time over a day
# # usage: cron_routine [shell_script_file] [number_of_runs]
cron_routine() {
    SCRIPT=${1:-cron.sh}
    RUNS=${2:-5}
    MIN_STEP=${3:-3}
    MIN=$(($RANDOM % 60))
    HOURS=$(seq 0 $MIN_STEP 23 | shuf | head -n $RUNS | sort --general-numeric-sort | tr '\n' ' ' | sed -e 's/[[:space:]]$//' | tr ' ' ',')

    CONF="$MIN\t$HOURS\t*\t*\t*\tcd $PWD && /usr/bin/env -S bash -l -c 'CRON=true LOGLEVEL=DEBUG ./$SCRIPT > ./out.log 2>> ./error.log'"

    echo -e $CONF
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
# # usage nvim_ssh_server [remote-machine] [shell]
nvim_ssh_server() {
    shell='bash'
    [ -n "$2" ] && shell="$2"
    ssh -L 6666:localhost:6666 "$1" -t "${shell} -l -c 'nvim --headless --listen localhost:6666'"
}

#
# # colors - Print colors on terminal
# # usage: colors
colors() {
    usable local && local fgc bgc vals seq0

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

# Custom functions
# shellcheck source=/dev/null
[ -r "$CONF_SH_DIR/func.user.sh" ] && . "$CONF_SH_DIR/func.user.sh"
