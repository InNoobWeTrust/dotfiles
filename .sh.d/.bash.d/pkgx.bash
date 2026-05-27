pkgx_shellcode_cache_dir="${XDG_CACHE_HOME:-$HOME/.cache}/pkgx"
pkgx_shellcode_cache_file="$pkgx_shellcode_cache_dir/pkgx-shellcode.bash"
[ -d "$pkgx_shellcode_cache_dir" ] || mkdir -p "$pkgx_shellcode_cache_dir"

if [ ! -s "$pkgx_shellcode_cache_file" ] || [ "$(command -v pkgx)" -nt "$pkgx_shellcode_cache_file" ]; then
    pkgx --shellcode > "$pkgx_shellcode_cache_file" 2>/dev/null || true
fi

[ -s "$pkgx_shellcode_cache_file" ] && . "$pkgx_shellcode_cache_file"
