import { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk@1/server/stdio.js"
import { registerMemoryTools } from "./protocol/tools.ts"
import { BaseResolver } from "./scopes/scope.ts"

// Resolve the SDK graph before the engine graph. Bun 1.4.2 can fail to resolve
// csv-parse's versioned /sync subpath on a cold cache when both graphs load together.
const { runEngine } = await import("./retrieval/engine.ts")

const instructions = `Scoped external-memory resolver and read-only BM25 search. resolve_root returns the
absolute path of one external scope so the agent reads/edits Markdown and YAML there directly; this server
never writes or manages memory files. Scope identities are caller-selected stable nonsecret IDs; metadata in
.scope.md is verified on every call and mismatches fail closed. index/search rebuild an ephemeral in-memory
MiniSearch BM25+ index per call, so direct edits appear on the next call. Targets are explicit: a memory scope
(optionally one subdirectory) or a custom directory with optional exact relative files; never glob patterns,
never parents.
Custom walks skip and count hidden/build/dependency entries; memory walks fail closed on symlinks and
non-UTF-8 Markdown. fields/filters apply to explicitly selected CSV files only; filters are exact case-sensitive
equality ANDed before ranking. Host-local paths require the same filesystem namespace or a user-supplied
mount. Scope conventions are not filesystem ACLs; normal filesystem permissions still apply.`

const server = new McpServer({ name: "remote-memory", version: "0.1.0" }, { instructions })
const baseResolver = new BaseResolver()
registerMemoryTools(server, baseResolver, runEngine)

async function close() {
  await server.close()
}
process.stdin.once("end", () => void close())
process.once("SIGTERM", () => void close())
process.once("SIGINT", () => void close())
await server.connect(new StdioServerTransport())
