import { join } from "node:path"
import { withWarmCache } from "../../shared/startup.ts"

// bin/mcp-lsp (POSIX sh) set this MCP's BUN_INSTALL_CACHE_DIR before Bun started;
// the warm marker lets steady-state starts skip the cross-process lock entirely.
await withWarmCache("lsp", () => import("../src/server.ts"), { sourceDir: join(import.meta.dir, "..") })
