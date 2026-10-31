/** Concrete engine-CLI configuration shared by lifecycle, constraint verification, builders and cleanup. */
export const PACKAGE = "sandbox"
export const CTRL_DIR = "/run/agent-sandbox"
export const DEADLINE_FILE = `${CTRL_DIR}/deadline`
export const WS_TARGET = "/workspace"

// Internal allowance for engine CLI responses the server must parse, such as
// `inspect`. Workload output uses the fixed shared preview and is always
// retained in full on disk.
export const CLI_PREVIEW_BYTES = 4 * 1024 * 1024

// Control tmpfs: only holds the deadline file; kept minimal and root-only.
export const CTRL_TMPFS_BYTES = 65_536 // 64 KiB

// Per-operation timeouts (ms)
export const T_CREATE = 60_000
export const T_INSPECT = 10_000
export const T_PULL = 120_000
export const T_START = 30_000
export const T_DEADLINE = 10_000
export const T_KILL = 5_000
export const T_STOP = 15_000
export const T_RM = 15_000
