# Shared cloud policy and errors. No startup effects or native-service knowledge.
cloud_names() {
    printf '%s\n' onedrive box dropbox
}

fail() {
    printf 'rclone-mount: %s\n' "$*" >&2
    exit 75
}

cloud_folder() {
    case $1 in
        onedrive) printf '%s\n' OneDrive ;;
        box) printf '%s\n' Box ;;
        dropbox) printf '%s\n' Dropbox ;;
        *) return 1 ;;
    esac
}
