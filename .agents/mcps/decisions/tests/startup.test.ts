import { expect, test } from "bun:test"
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { spawn } from "node:child_process"
import { createInterface } from "node:readline"

// One isolated package cache for the whole suite, reused across runs: the first
// child pays the cold download, later cases and runs reuse the populated packages.
const suiteCache = process.env.BUN_INSTALL_CACHE_DIR ?? join(process.env.TMPDIR ?? "/tmp/opencode", "decisions-test-cache")

// Only HTTP is mocked: actual launcher, SDK, schemas, registration and handlers.
const preload = `
import { readFileSync, appendFileSync } from "node:fs";
globalThis.fetch = async (url, init) => {
  const control = JSON.parse(readFileSync(process.env.TEST_CONTROL, "utf8"));
  const body = JSON.parse(init.body);
  const provider = String(url).includes("opencode.ai") ? "zen" : "cf";
  const probe = body.state === "Public startup availability probe. No user data.";
  const event = {provider, probe, body, method:init.method, redirect:init.redirect,
    authorization:new Headers(init.headers).get("authorization")};
  const log = phase => appendFileSync(process.env.TEST_EVENTS, JSON.stringify({...event,phase})+"\\n");
  log("start");
  if (!probe && control.evalHang) {
    await new Promise((_, reject) => {
      if (init.signal.aborted) reject(init.signal.reason);
      else init.signal.addEventListener("abort", () => reject(init.signal.reason), {once:true});
    });
  }
  if (probe && control.delayMs) await Bun.sleep(control.delayMs);
  const status = !probe && control.evalStatus ? control.evalStatus : control[provider];
  const result = {model:body.model,answers:{q0:{type:"choice",choice:"a",probabilities:{a:0.5,b:0.5}}}};
  log("end");
  return new Response(JSON.stringify(status === 200 ? result : {error:"fake HTTP failure"}), {status});
};
`
type Control = { zen: number; cf: number; delayMs?: number; evalStatus?: number; evalHang?: boolean }
type Rpc = { id?: number; method?: string; result?: any; error?: { message: string } }
type Client = {
  request: (method: string, params?: unknown) => Promise<any>
  control: (next: Control) => void
  events: () => any[]
  notifications: Rpc[]
}
const args = { state: "Synthetic test decision", questions: { q0: {
  type: "choice", instructions: "Choose a label", criteria: { a: "A", b: "B" },
} } }

async function withServer(config: Control, credentials: "none" | "zen" | "both", run: (client: Client) => Promise<void>) {
  const scratch = mkdtempSync(join(process.env.TMPDIR ?? "/tmp/opencode", "decisions-stdio-"))
  const controlPath = join(scratch, "control.json")
  const eventsPath = join(scratch, "events.jsonl")
  const fixturePath = join(scratch, "fetch.ts")
  writeFileSync(controlPath, JSON.stringify(config))
  writeFileSync(eventsPath, "")
  writeFileSync(fixturePath, preload)
  // No inherited provider keys, NODE_OPTIONS or Bun preloads.
  const env: Record<string, string | undefined> = {
    PATH: process.env.PATH, HOME: process.env.HOME,
    BUN_INSTALL_CACHE_DIR: suiteCache,
    XDG_CACHE_HOME: scratch, TMPDIR: scratch, MCP_STARTUP_TIMEOUT_MS: "5000",
    TEST_CONTROL: controlPath, TEST_EVENTS: eventsPath,
  }
  if (credentials !== "none") env.OPENCODE_API_KEY = "fake-zen-test-key"
  if (credentials === "both") {
    env.OPENROUTER_API_KEY = "fake-openrouter-test-key"
  }
  // The launcher is a POSIX sh shim (it selects the per-MCP Bun cache), so run
  // it directly and pass Bun flags through BUN_OPTIONS instead of the CLI.
  env.BUN_OPTIONS = `--prefer-offline --preload ${fixturePath}`
  const child = spawn(new URL("../bin/mcp-decisions", import.meta.url).pathname, [], { env, stdio: "pipe" })
  const exited = new Promise<void>(resolve => child.once("exit", () => resolve()))
  const watchdog = setTimeout(() => child.kill("SIGKILL"), 12000)
  const lines = createInterface({ input: child.stdout })
  const pending = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void }>()
  const notifications: Rpc[] = []
  let stderr = ""
  let id = 0
  child.stderr.on("data", chunk => { stderr = (stderr + chunk).slice(-4000) })
  lines.on("line", line => {
    const message: Rpc = JSON.parse(line)
    if (message.id === undefined) { notifications.push(message); return }
    const waiter = pending.get(message.id)
    if (!waiter) return
    pending.delete(message.id)
    if (message.error) waiter.reject(new Error(message.error.message))
    else waiter.resolve(message.result)
  })
  child.on("exit", () => {
    for (const waiter of pending.values()) waiter.reject(new Error(`MCP child exited: ${stderr}`))
    pending.clear()
  })
  const request = async (method: string, params: unknown = {}) => {
    const requestId = ++id
    let timer: ReturnType<typeof setTimeout>
    try {
      return await new Promise<any>((resolve, reject) => {
        timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`MCP timeout: ${method}; ${stderr}`)) }, 6500)
        pending.set(requestId, { resolve, reject })
        child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: requestId, method, params }) + "\n")
      })
    } finally { clearTimeout(timer!) }
  }
  try {
    const initialized = await request("initialize", {
      protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "startup-test", version: "1" },
    })
    expect(initialized.serverInfo.name).toBe("decisions")
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n")
    await run({ request, notifications,
      control: next => writeFileSync(controlPath, JSON.stringify(next)),
      events: () => readFileSync(eventsPath, "utf8").trim().split("\n").filter(Boolean).map(line => JSON.parse(line)),
    })
  } finally {
    child.stdin.end()
    let grace: ReturnType<typeof setTimeout>
    await Promise.race([exited, new Promise<void>(resolve => { grace = setTimeout(resolve, 200) })])
    clearTimeout(grace!)
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL")
    await exited
    clearTimeout(watchdog)
    lines.close()
    rmSync(scratch, { recursive: true, force: true })
  }
}
const names = async (client: Client) =>
  (await client.request("tools/list")).tools.map((tool: { name: string }) => tool.name).sort()
const call = async (client: Client, name: string, arguments_: unknown = {}) =>
  JSON.parse((await client.request("tools/call", { name, arguments: arguments_ })).content[0].text)

test("real launcher without credentials exposes discover only and makes no HTTP requests", async () => {
  await withServer({ zen: 200, cf: 200 }, "none", async client => {
    expect(await names(client)).toEqual(["discover"])
    const availability = await call(client, "discover")
    expect(availability.evaluateAvailable).toBe(false)
    expect(availability.providers.zen.status).toBe("unconfigured")
    expect(availability.providers.cloudflare.status).toBe("unconfigured")
    expect(client.events()).toEqual([])
  })
})
for (const scenario of [
  { label: "healthy Zen", zen: 200, available: true, status: "available" },
  { label: "Zen 429 and healthy OpenRouter Clef", zen: 429, available: true, status: "rate_limited" },
  { label: "Zen 401 cannot use healthy OpenRouter Clef", zen: 401, available: false, status: "unauthorized" },
]) {
  test(`real startup gate: ${scenario.label}; probes complete before initialize`, async () => {
    await withServer({ zen: scenario.zen, cf: 200, delayMs: 100 }, "both", async client => {
      const events = client.events()
      expect(events.filter(event => event.phase === "start")).toHaveLength(4)
      expect(events.filter(event => event.phase === "end")).toHaveLength(4)
      for (const event of events) {
        expect(event.probe).toBe(true)
        expect(event.method).toBe("POST")
        expect(event.redirect).toBe("error")
        expect(event.authorization).toBe(event.provider === "zen" ? "Bearer fake-zen-test-key" : "Bearer fake-openrouter-test-key")
      }
      expect(await names(client)).toEqual(scenario.available ? ["discover", "evaluate"] : ["discover"])
      const discovered = await call(client, "discover")
      expect(discovered.providers.zen.status).toBe(scenario.status)
      expect(discovered.providers.cloudflare.status).toBe("available")
      expect(discovered.evaluateAvailable).toBe(scenario.available)
      if (scenario.available) expect((await call(client, "evaluate", args)).ok).toBe(true)
    })
  })
}
test("discover refresh really removes and re-adds the SDK evaluate handle", async () => {
  await withServer({ zen: 200, cf: 200 }, "zen", async client => {
    expect(await names(client)).toEqual(["discover", "evaluate"])
    client.control({ zen: 401, cf: 200 })
    expect((await call(client, "discover")).evaluateAvailable).toBe(false)
    expect(await names(client)).toEqual(["discover"])
    client.control({ zen: 200, cf: 200 })
    expect((await call(client, "discover")).evaluateAvailable).toBe(true)
    expect(await names(client)).toEqual(["discover", "evaluate"])
    expect((await call(client, "evaluate", args)).ok).toBe(true)
    expect(client.notifications.some(message => message.method === "notifications/tools/list_changed")).toBe(true)
    expect(client.events().filter(event => event.probe && event.phase === "start")).toHaveLength(3)
  })
})
for (const status of [401, 403, 429, 500]) {
  test(`terminal evaluate HTTP ${status} revokes evaluate until discover succeeds`, async () => {
    await withServer({ zen: 200, cf: 200 }, "zen", async client => {
      client.control({ zen: 200, cf: 200, evalStatus: status })
      const failed = await call(client, "evaluate", args)
      expect(failed.ok).toBe(false)
      expect(failed.error.code).toBe("HTTP_ERROR")
      expect(failed.error.status).toBe(status)
      expect(await names(client)).toEqual(["discover"])
      client.control({ zen: 200, cf: 200 })
      expect((await call(client, "discover")).evaluateAvailable).toBe(true)
      expect(await names(client)).toEqual(["discover", "evaluate"])
    })
  })
}
test("evaluate timeout does not revoke a healthy provider registration", async () => {
  await withServer({ zen: 200, cf: 200 }, "zen", async client => {
    client.control({ zen: 200, cf: 200, evalHang: true })
    const timedOut = await call(client, "evaluate", { ...args, timeoutMs: 1000 })
    expect(timedOut.error.code).toBe("CANCELLED_OR_TIMED_OUT")
    expect(await names(client)).toEqual(["discover", "evaluate"])
    client.control({ zen: 200, cf: 200 })
    expect((await call(client, "evaluate", args)).ok).toBe(true)
  })
})
