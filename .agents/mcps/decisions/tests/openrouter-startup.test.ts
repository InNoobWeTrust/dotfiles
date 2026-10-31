import { expect, test } from "bun:test"
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { spawn } from "node:child_process"
import { createInterface } from "node:readline"
import { FALLBACK_MODEL, MERCURY_MODEL, GPT_MODEL, OPENROUTER_ENDPOINT } from "../src/evaluation/providers/config.ts"

// Only HTTP is replaced; the real launcher, SDK, codecs and handlers run together.
const preload = `
import { appendFileSync } from "node:fs";
globalThis.fetch = async (url, init) => {
  const body = JSON.parse(init.body);
  const probe = body.state === "Public startup availability probe. No user data.";
  const zen = String(url).includes("opencode.ai");
  appendFileSync(process.env.TEST_EVENTS, JSON.stringify({url,body,probe,
    authorization:new Headers(init.headers).get("authorization")})+"\\n");
  if (zen || body.model !== process.env.TEST_WINNER) return new Response("{}", {status:429});
  const answers = Object.fromEntries(Object.entries(body.questions).map(([id,q]) => [id,
    q.type === "noul" ? {type:"noul",noul:0.75} : q.type === "score"
      ? {type:"score",score:0.5} : {type:"choice",choice:Object.keys(q.criteria)[0]}]));
  const model = process.env.TEST_INVALID === "yes" && !probe ? "unexpected-model" :
     body.model === "cloudflare/clef-flash" ? "cloudflare/clef-flash" :
       body.model.startsWith("inception/") ? "inception/mercury-decide-20260930" : "openai/gpt-6-luna-decisions-20261006";
  return Response.json({model,answers});
};
`

for (const { winner, invalid } of [FALLBACK_MODEL, MERCURY_MODEL, GPT_MODEL].flatMap(winner =>
  [false, true].map(invalid => ({ winner, invalid })))) {
  test(`real launcher OpenRouter ${winner}: ${invalid ? "rejects wrong model" : "validates aliases and all question types"}`, async () => {
    const scratch = mkdtempSync(join(process.env.TMPDIR ?? "/tmp/opencode", "decisions-or-"))
    const eventsPath = join(scratch, "events.jsonl")
    const fixture = join(scratch, "fetch.ts")
    writeFileSync(fixture, preload)
    writeFileSync(eventsPath, "")
    const child = spawn(new URL("../bin/mcp-decisions", import.meta.url).pathname, [], {
      stdio: "pipe", env: {
        PATH: process.env.PATH, HOME: process.env.HOME,
        BUN_INSTALL_CACHE_DIR: process.env.BUN_INSTALL_CACHE_DIR ?? join(scratch, "packages"),
        BUN_OPTIONS: `--prefer-offline --preload ${fixture}`,
        XDG_CACHE_HOME: scratch, TMPDIR: scratch, MCP_STARTUP_TIMEOUT_MS: "5000",
        OPENCODE_API_KEY: "fake-zen", OPENROUTER_API_KEY: "fake-openrouter",
        TEST_WINNER: winner, TEST_EVENTS: eventsPath, TEST_INVALID: invalid ? "yes" : "no",
      },
    })
    const exited = new Promise<void>(resolve => child.once("exit", () => resolve()))
    const watchdog = setTimeout(() => child.kill("SIGKILL"), 15000)
    const lines = createInterface({ input: child.stdout })
    const pending = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void }>()
    let id = 0
    let stderr = ""
    child.stderr.on("data", chunk => { stderr = (stderr + chunk).slice(-4000) })
    lines.on("line", line => {
      const message = JSON.parse(line)
      const waiter = pending.get(message.id)
      if (!waiter) return
      pending.delete(message.id)
      if (message.error) waiter.reject(new Error(message.error.message))
      else waiter.resolve(message.result)
    })
    child.on("exit", () => {
      for (const waiter of pending.values()) waiter.reject(new Error(`MCP exited: ${stderr}`))
      pending.clear()
    })
    async function request(method: string, params: unknown = {}) {
      const requestId = ++id
      let timer: ReturnType<typeof setTimeout>
      try {
        return await new Promise<any>((resolve, reject) => {
          timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`MCP timeout: ${stderr}`)) }, 10000)
          pending.set(requestId, { resolve, reject })
          child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: requestId, method, params }) + "\n")
        })
      } finally { clearTimeout(timer!) }
    }
    try {
      await request("initialize", {
        protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "openrouter-test", version: "1" },
      })
      child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n")
      expect((await request("tools/list")).tools.map((tool: any) => tool.name)).toContain("evaluate")
      const result = await request("tools/call", { name: "evaluate", arguments: {
        state: "Synthetic public fixture", questions: {
          pick: { type: "choice", instructions: "Choose", criteria: { a: null, b: "B" } },
          grade: { type: "score", instructions: "Rate", criteria: [null, "High"] },
          flag: { type: "boolean", instructions: "Likely?", criteria: { true: null } },
        },
      } })
      const payload = JSON.parse(result.content[0].text)
      if (invalid) {
        expect(payload.ok).toBe(false)
        expect(payload.error.code).toBe("INVALID_PAYLOAD")
        expect((await request("tools/list")).tools.map((tool: any) => tool.name)).toEqual(["discover"])
        return
      }
      expect(payload.ok).toBe(true)
      expect(payload.model).toBe(winner)
      expect(payload.answers.pick).toEqual({ type: "choice", choice: "a" })
      expect(payload.answers.grade).toEqual({ type: "score", score: 0.5 })
      expect(payload.answers.flag).toEqual({ type: "boolean", probability: 0.75 })
      const raw = JSON.parse(readFileSync(payload.responsePath, "utf8"))
      expect(raw.model).toBe(winner === FALLBACK_MODEL ? "cloudflare/clef-flash" : winner === MERCURY_MODEL ? "inception/mercury-decide-20260930" : "openai/gpt-6-luna-decisions-20261006")
      const events = readFileSync(eventsPath, "utf8").trim().split("\n").map(line => JSON.parse(line))
      expect(events.filter(event => event.probe)).toHaveLength(4)
      expect(events.filter(event => !event.probe).map(event => event.body.model))
        .toEqual(["jev-1.13-free", ...[FALLBACK_MODEL, MERCURY_MODEL, GPT_MODEL].slice(0, [FALLBACK_MODEL, MERCURY_MODEL, GPT_MODEL].indexOf(winner) + 1)])
      for (const event of events.filter(event => event.url === OPENROUTER_ENDPOINT)) {
        expect(event.authorization).toBe("Bearer fake-openrouter")
      }
      const final = events.at(-1).body.questions
      expect(final.grade.criteria).toEqual(["0", "High"])
      expect(final.flag.criteria).toEqual({ true: "true", false: "false" })
    } finally {
      child.stdin.end()
      if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL")
      await exited
      clearTimeout(watchdog)
      lines.close()
      rmSync(scratch, { recursive: true, force: true })
    }
  }, 20000)
}
