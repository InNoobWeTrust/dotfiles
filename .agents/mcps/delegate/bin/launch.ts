import { join } from "node:path"
import { withWarmCache } from "../../shared/startup.ts"

// bin/mcp-delegate (POSIX sh) set this MCP's BUN_INSTALL_CACHE_DIR before Bun started;
// the warm marker lets steady-state starts skip the cross-process lock entirely.
await withWarmCache("delegate", () => import("../src/server.ts"), { sourceDir: join(import.meta.dir, "..") })
