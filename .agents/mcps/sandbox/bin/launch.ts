import { join } from "node:path"
import { withWarmCache } from "../../shared/startup/coordination.ts"

// bin/mcp-sandbox (POSIX sh) set this MCP's BUN_INSTALL_CACHE_DIR before Bun started;
// the warm marker lets steady-state starts skip the cross-process lock entirely.
await withWarmCache("sandbox", () => import("../src/server.ts"), { sourceDir: join(import.meta.dir, "..") })
