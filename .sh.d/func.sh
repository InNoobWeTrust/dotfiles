#!/usr/bin/env sh

#
# # usable - Check if command exist before invoking
# # usage: usable [some_command] && [some_command]
usable() {
    type "$1" >/dev/null 2>&1
}

#
# # forgit-me-config - Configure git for many repos at once
# # usage forgit-me-config [some_git_config]
forgit_me_config() {
    for d in $(ls -d */); do
        [ -d "$d/.git/" ] && \
            echo "Configuring git repo $d..." && \
            (cd "$d" && git config "$@")
    done
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
