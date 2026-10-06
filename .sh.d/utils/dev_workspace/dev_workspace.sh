#!/usr/bin/env bash
# Shell entrypoint; Bun/TypeScript owns command parsing and workspace operations.
set -euo pipefail

if ! command -v bun >/dev/null 2>&1 || [ ! -x "$(command -v bun)" ]; then
    printf '%s\n' 'dev_workspace: an executable bun is required on PATH.' >&2
    exit 1
fi

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
exec bun --no-env-file "$script_dir/dev_workspace.ts" "$@"
