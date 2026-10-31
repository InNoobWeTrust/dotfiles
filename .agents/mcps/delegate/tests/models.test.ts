/** Name-based Zen hints, inspection admission and public catalog contracts. */
import { describe, expect, test } from "bun:test"
import { devNull } from "node:os"
import { Client } from "@modelcontextprotocol/sdk@1/client/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk@1/inMemory.js"
import { McpServer } from "@modelcontextprotocol/sdk@1/server/mcp.js"
import type { RunOptions, RunResult } from "../src/execution/process/execute.ts"
import { harnessById } from "../src/harnesses/catalog/registry.ts"
import type { DetectionResult } from "../src/harnesses/discovery/detect.ts"
import {
  evaluateOpenCodeEvidence,
  type OpenCodeEvidence,
} from "../src/harnesses/discovery/evidence/opencode.ts"
import { createInspectionGate } from "../src/harnesses/discovery/inspection.ts"
import { listModels, parseAgyModels, presentModels } from "../src/harnesses/discovery/models.ts"
import { inspectReadiness } from "../src/harnesses/discovery/readiness.ts"
import {
  type ModelsInput,
  type ModelsOutput,
  modelsInputSchema,
  type StatusOutput,
} from "../src/protocol/contracts.ts"
import { registerDelegateTools } from "../src/protocol/tools.ts"

// TASK.md records the verified OpenCode V2 DTO and observed AGY two-column TSV contracts.
// Only native CLI execution is substituted; SDK transport and owned catalog logic are real.
const cwd = "/work"
const input = (fields: Partial<ModelsInput> = {}) =>
  modelsInputSchema.parse({ harness: "opencode", ...fields })
const model = (id: string, fields: Record<string, unknown> = {}) => ({
  id,
  providerID: "opencode",
  name: `Label ${id}`,
  enabled: true,
  status: "active",
  variants: [],
  ...fields,
})
const evidence = (models: unknown[]): OpenCodeEvidence => ({
  integrations: [{ id: "connected", connections: [{ type: "env", name: "TEST_KEY" }] }],
  providers: ["opencode", "other"].map((id) => ({
    id,
    integrationID: "connected",
    activation: "enabled",
  })),
  models,
})
const exited = (stdout: string, overrides: Partial<RunResult> = {}): RunResult => ({
  exitCode: 0,
  signal: null,
  stop: "exited",
  stdout,
  stderr: "",
  durationMs: 1,
  truncated: false,
  stdoutPath: null,
  stderrPath: null,
  stdoutBytes: Buffer.byteLength(stdout),
  stderrBytes: 0,
  ...overrides,
})
const context = (
  run: (file: string, args: string[], options: RunOptions) => Promise<RunResult>,
) => ({
  cwd,
  env: {},
  gate: createInspectionGate(),
  which: () => "/stub",
  run,
})
function apiRun(source: OpenCodeEvidence) {
  return async (_file: string, args: string[]): Promise<RunResult> => {
    const data = new Map([
      ["/api/integration", source.integrations],
      ["/api/provider", source.providers],
      ["/api/model", source.models],
    ]).get(args[2] ?? "")
    if (!data) throw new Error(`Unexpected external probe: ${args.join(" ")}`)
    return exited(JSON.stringify({ data }))
  }
}
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function spec(id: string) {
  const found = harnessById(id)
  if (!found) throw new Error(`Missing registered harness: ${id}`)
  return found
}

describe("automatic Zen name hints are not the run allowlist", () => {
  test("matches free case-insensitively in the display name or native ID, only for base Zen selectors", () => {
    const result = evaluateOpenCodeEvidence(
      evidence([
        model("prefix-free-id", { name: "Ordinary", variants: [{ id: "reasoning" }] }),
        model("free-name", { name: "Mostly FREE label" }),
        model("ordinary", { name: "Paid model", cost: [{ input: 10 }] }),
        model("external-free", { providerID: "other" }),
        model("disabled", { enabled: false }),
        model("deprecated", { status: "deprecated" }),
      ]),
    )
    expect(result.readiness).toBe("configured")
    expect(result.modelHints).toEqual(["opencode/prefix-free-id", "opencode/free-name"])
    expect(result.modelHintsState).toBe("available")
    expect(result.models).toEqual([
      "opencode/prefix-free-id",
      "opencode/prefix-free-id#reasoning",
      "opencode/free-name",
      "opencode/ordinary",
      "other/external-free",
    ])
    expect(result.catalog.map((row) => row.selector)).toEqual(result.models)
  })

  test("missing cost is ignored and duplicate hints deduplicate; structural issues remain unknown", () => {
    const result = evaluateOpenCodeEvidence(
      evidence([model("free-id", { cost: undefined }), model("free-id")]),
    )
    expect(result.readiness).toBe("configured")
    expect(result.modelHints).toEqual(["opencode/free-id"])
    expect(result.modelHintsState).toBe("available")

    const structural = evaluateOpenCodeEvidence(evidence([model("free-id", { variants: [null] })]))
    expect(structural.modelHints).toEqual(["opencode/free-id"])
    expect(structural.modelHintsState).toBe("unknown")
  })

  test("non-free Zen models and free-named non-Zen models have empty hints", () => {
    const result = evaluateOpenCodeEvidence(
      evidence([
        model("ordinary", { cost: [{ input: 5 }] }),
        model("free", { providerID: "other" }),
      ]),
    )
    expect(result.readiness).toBe("configured")
    expect(result.modelHints).toEqual([])
    expect(result.modelHintsState).toBe("empty")
  })
})

describe("credential state aggregation across discovery consumers", () => {
  const active = { type: "credential", id: "primary", label: "Account", method: "key" }
  const inactive = {
    ...active,
    id: "secondary",
    method: "oauth",
    status: { status: "needs_auth", message: "Reconnect" },
  }
  const env = { type: "env", name: "TEST_KEY" }
  const sourceWith = (connections: unknown[]): OpenCodeEvidence => ({
    ...evidence([model("free", { variants: [{ id: "reasoning" }] })]),
    integrations: [{ id: "connected", connections }],
  })

  test("uniform credentials agree on readiness, catalog variants and automatic hints", async () => {
    for (const count of [2, 3]) {
      for (const connected of [true, false]) {
        for (const withEnv of [true, false]) {
          const credentials = Array.from({ length: count }, (_, index) => ({
            ...(connected ? active : inactive),
            id: `account-${index}`,
          }))
          const source = sourceWith([...credentials, ...(withEnv ? [env] : [])])
          const evaluated = evaluateOpenCodeEvidence(source)
          const selectors = connected ? ["opencode/free", "opencode/free#reasoning"] : []
          expect(evaluated.readiness).toBe(connected ? "configured" : "not_configured")
          expect(evaluated.catalogValid).toBe(true)
          expect(evaluated.models).toEqual(selectors)
          expect(evaluated.modelHints).toEqual(connected ? ["opencode/free"] : [])
          expect(evaluated.modelHintsState).toBe(connected ? "available" : "empty")
          const page = await listModels(input(), context(apiRun(source)))
          expect(page.models.map((row) => row.selector)).toEqual(selectors)
        }
      }
    }
  })

  test("mixed credential states fail closed regardless of order or env fallback", async () => {
    for (const credentials of [
      [active, inactive],
      [inactive, active],
    ]) {
      for (const withEnv of [true, false]) {
        const source = sourceWith([...credentials, ...(withEnv ? [env] : [])])
        const evaluated = evaluateOpenCodeEvidence(source)
        expect(evaluated.readiness).toBe("unknown")
        expect(evaluated.catalogValid).toBe(false)
        expect(evaluated.modelHintsState).toBe("unknown")
        await expect(listModels(input(), context(apiRun(source)))).rejects.toThrow(
          "CATALOG_INVALID:",
        )
      }
    }
  })

  test("active alternatives cannot rescue malformed connection evidence", async () => {
    for (const malformed of [
      null,
      { ...active, method: "unknown" },
      { ...active, status: null },
      { ...active, status: { status: "needs_auth" } },
      { ...env, name: "" },
      { ...env, status: { status: "unexpected", message: "Invalid" } },
    ]) {
      const source = sourceWith([active, { ...active, id: "backup" }, env, malformed])
      expect(evaluateOpenCodeEvidence(source).catalogValid).toBe(false)
      await expect(listModels(input(), context(apiRun(source)))).rejects.toThrow("CATALOG_INVALID:")
    }
  })

  test("an unknown provider still invalidates the complete catalog", async () => {
    const source = sourceWith([active, { ...active, id: "backup" }])
    source.models.push(model("other-model", { providerID: "missing" }))
    const evaluated = evaluateOpenCodeEvidence(source)
    expect(evaluated.readiness).toBe("configured")
    expect(evaluated.catalogValid).toBe(false)
    await expect(listModels(input(), context(apiRun(source)))).rejects.toThrow("CATALOG_INVALID:")
  })
})

describe("explicit catalog input and bounded presentation", () => {
  test("text is literal, case-insensitive, Unicode-aware and bounded by UTF-8 bytes", () => {
    const rows = [
      { selector: "opencode/a", label: "Literal [a-z].*$ Ö" },
      { selector: "opencode/b", label: "abc" },
    ]
    for (const text of ["[A-Z].*$", "ö"]) {
      expect(presentModels(input({ text }), cwd, rows).models).toEqual([rows[0]])
    }
    expect(presentModels(input({ text: "OPENCODE/B" }), cwd, rows).models).toEqual([rows[1]])
    expect(modelsInputSchema.safeParse({ harness: "agy", text: "x".repeat(256) }).success).toBe(
      true,
    )
    expect(modelsInputSchema.safeParse({ harness: "agy", text: "😀".repeat(64) }).success).toBe(
      true,
    )
    for (const fields of [
      { text: "x".repeat(257) },
      { text: "😀".repeat(65) },
      { text: "" },
      { offset: -1 },
      { offset: 0.5 },
      { limit: 0 },
      { limit: 101 },
      { limit: 1.5 },
      { regex: ".*" },
    ]) {
      expect(modelsInputSchema.safeParse({ harness: "agy", ...fields }).success).toBe(false)
    }
    expect(input()).toEqual({ harness: "opencode", offset: 0, limit: 25 })
  })

  test("deduplicates and sorts before filtering and paging, preserving snapshot counts", () => {
    const rows = ["z", "a", "b", "a"].map((selector) => ({ selector, label: "match" }))
    expect(presentModels(input({ text: "MATCH", limit: 2 }), cwd, rows)).toEqual({
      harness: "opencode",
      workdir: cwd,
      models: [
        { selector: "a", label: "match" },
        { selector: "b", label: "match" },
      ],
      total: 3,
      matched: 3,
      offset: 0,
      nextOffset: 2,
    })
    const last = presentModels(input({ offset: 2, limit: 2 }), cwd, rows)
    expect(last.models).toEqual([{ selector: "z", label: "match" }])
    expect(last.nextOffset).toBeNull()
    for (const fields of [{ offset: 3 }, { offset: 100 }, { text: "no-match" }]) {
      const page = presentModels(input(fields), cwd, rows)
      expect(page.models).toEqual([])
      expect(page.nextOffset).toBeNull()
      expect(page.total).toBe(3)
    }
  })

  test("64 KiB envelope limit advances by delivered rows without loss or pagination loops", () => {
    const rows = Array.from({ length: 35 }, (_, index) => ({
      selector: `model/${String(index).padStart(3, "0")}`,
      label: `\\"${"😀".repeat(1000)}`,
    }))
    const delivered: string[] = []
    let offset = 0
    for (let attempt = 0; attempt < rows.length; attempt += 1) {
      const page = presentModels(input({ offset, limit: 100 }), cwd, rows)
      expect(Buffer.byteLength(JSON.stringify({ ok: true, data: page }))).toBeLessThanOrEqual(
        65_536,
      )
      expect(page.total).toBe(35)
      expect(page.matched).toBe(35)
      expect(page.models.length).toBeGreaterThan(0)
      delivered.push(...page.models.map((row) => row.selector))
      if (page.nextOffset === null) break
      expect(page.nextOffset).toBe(offset + page.models.length)
      offset = page.nextOffset
      expect(delivered.length).toBeLessThan(35)
    }
    expect(delivered).toEqual(rows.map((row) => row.selector))
  })

  test("an oversized row is an explicit error, never skipped or returned with a stuck cursor", () => {
    const oversized = { selector: "b", label: "😀".repeat(20_000) }
    const rows = [{ selector: "a", label: "fits" }, oversized]
    const page = presentModels(input(), cwd, rows)
    expect(page.models).toEqual([rows[0]])
    expect(page.nextOffset).toBe(1)
    expect(() => presentModels(input({ offset: 1 }), cwd, rows)).toThrow("CATALOG_TOO_LARGE:")
    expect(() => presentModels(input(), cwd, [oversized])).toThrow("CATALOG_TOO_LARGE:")
  })
})

describe("external inspection failure is not a valid empty catalog", () => {
  test("AGY accepts only observed two-column TSV, not inferred or partial formats", () => {
    expect(parseAgyModels("\r\ngemini-pro\tGemini Pro\r\n\nclaude\tClaude Ö\n")).toEqual([
      { selector: "gemini-pro", label: "Gemini Pro" },
      { selector: "claude", label: "Claude Ö" },
    ])
    expect(parseAgyModels("\n\r\n")).toEqual([])
    for (const stdout of [
      "slug Label",
      "slug\t",
      "\tLabel",
      "slug\tLabel\textra",
      "-flag\tLabel",
      "bad slug\tLabel",
      "slug\tBad\u0000label",
      "slug\tBad\u001blabel",
      "slug\tOK\nbroken",
    ]) {
      expect(() => parseAgyModels(stdout)).toThrow("CATALOG_INVALID:")
    }
  })

  test("AGY listing uses global log suppression and update/recursion guards without readiness inference", async () => {
    const calls: Array<{ file: string; args: string[]; options: RunOptions }> = []
    const options = context(async (file, args, runOptions) => {
      calls.push({ file, args, options: runOptions })
      return exited("paid-slug\tPaid Model\n")
    })
    const page = await listModels(input({ harness: "agy", text: "PAID MODEL" }), options)
    expect(page.models).toEqual([{ selector: "paid-slug", label: "Paid Model" }])
    expect(calls).toHaveLength(1)
    expect(calls[0]?.file).toBe("/stub")
    expect(calls[0]?.args).toEqual(["--log-file", devNull, "models"])
    expect(calls[0]?.options.cwd).toBe(cwd)
    expect(calls[0]?.options.env).toEqual({
      DELEGATE_INSPECTION: "1",
      AGY_CLI_DISABLE_AUTO_UPDATE: "true",
    })
    expect(calls[0]?.options.maxOutputBytes).toBe(4_194_304)
    expect(calls[0]?.options.wallTimeMs).toBeGreaterThan(0)
    expect(calls[0]?.options.wallTimeMs).toBeLessThanOrEqual(8_000)
    expect(options.env).toEqual({})
  })

  test("unknown, missing, unsupported and nested inspections return distinct errors without probing", async () => {
    let probes = 0
    const options = context(async () => {
      probes += 1
      return exited("")
    })
    await expect(listModels(input({ harness: "not-registered" }), options)).rejects.toThrow(
      "UNKNOWN_HARNESS:",
    )
    await expect(listModels(input({ harness: "claude" }), options)).rejects.toThrow(
      "LISTING_UNSUPPORTED:",
    )
    await expect(listModels(input(), { ...options, which: () => null })).rejects.toThrow(
      "HARNESS_MISSING:",
    )
    await expect(
      listModels(input(), { ...options, env: { DELEGATE_INSPECTION: "1" } }),
    ).rejects.toThrow("INSPECTION_FAILED:")
    expect(probes).toBe(0)
  })

  test("clean empty OpenCode and AGY evidence succeeds while malformed catalog rows fail explicitly", async () => {
    for (const harness of ["opencode", "agy"]) {
      const run = harness === "opencode" ? apiRun(evidence([])) : async () => exited("")
      expect(await listModels(input({ harness }), context(run))).toEqual({
        harness,
        workdir: cwd,
        models: [],
        total: 0,
        matched: 0,
        offset: 0,
        nextOffset: null,
      })
    }
    for (const models of [
      [model("bad", { name: undefined })],
      [null],
      [model("bad", { variants: [null] })],
    ]) {
      await expect(listModels(input(), context(apiRun(evidence(models))))).rejects.toThrow(
        "CATALOG_INVALID:",
      )
    }
    await expect(
      listModels(
        input({ harness: "agy" }),
        context(async () => exited("not TSV")),
      ),
    ).rejects.toThrow("CATALOG_INVALID:")
  })

  test("truncated, nonzero, malformed JSON and failed probes are not empty successes", async () => {
    for (const result of [
      exited('{"data":[]}', { truncated: true }),
      exited('{"data":[]}', { exitCode: 1 }),
      exited('{"data":"raw-private-diagnostic"}'),
      exited("invalid json"),
      exited("", { stop: "wall_time" }),
    ]) {
      await expect(
        listModels(
          input(),
          context(async () => result),
        ),
      ).rejects.toThrow("INSPECTION_FAILED:")
    }
    await expect(
      listModels(
        input(),
        context(async () => {
          throw new Error("raw-private-diagnostic")
        }),
      ),
    ).rejects.toThrow("INSPECTION_FAILED: Native catalog inspection could not complete.")
  })
})

describe("shared two-slot inspection admission", () => {
  test("overlapping readiness and catalog hold admission across all three OpenCode probes", async () => {
    const phases = [deferred<RunResult>(), deferred<RunResult>(), deferred<RunResult>()]
    const started = [deferred<void>(), deferred<void>(), deferred<void>()]
    const counts = [0, 0, 0]
    let active = 0
    let maximum = 0
    const options = context(async (_file, args) => {
      const index = ["/api/integration", "/api/provider", "/api/model"].indexOf(args[2] ?? "")
      const phase = phases[index]
      const start = started[index]
      const count = counts[index]
      if (!phase || !start || count === undefined) throw new Error("Unexpected external command")
      active += 1
      maximum = Math.max(maximum, active)
      counts[index] = count + 1
      if (counts[index] === 2) start.resolve()
      try {
        return await phase.promise
      } finally {
        active -= 1
      }
    })
    const readiness = inspectReadiness(spec("opencode"), "/stub", options)
    const catalog = listModels(input(), options)
    const source = evidence([model("free")])
    const arrays = [source.integrations, source.providers, source.models]
    try {
      for (let index = 0; index < phases.length; index += 1) {
        const phase = phases[index]
        const start = started[index]
        const data = arrays[index]
        if (!phase || !start || !data) throw new Error("Missing inspection phase fixture")
        await start.promise
        await expect(listModels(input(), options)).rejects.toThrow("DISCOVERY_BUSY:")
        const busy = await inspectReadiness(spec("opencode"), "/stub", options)
        expect(busy.readiness).toBe("unknown")
        expect(busy.models).toEqual([])
        expect(busy.reason).toMatch(/busy/i)
        expect(counts[index]).toBe(2)
        phase.resolve(exited(JSON.stringify({ data })))
      }
      expect((await readiness).readiness).toBe("configured")
      expect((await catalog).models).toEqual([{ selector: "opencode/free", label: "Label free" }])
      expect(maximum).toBe(2)
      expect(counts).toEqual([2, 2, 2])
      expect((await listModels(input(), { ...options, run: apiRun(source) })).total).toBe(1)
    } finally {
      phases.forEach((phase, index) => {
        phase.resolve(exited(JSON.stringify({ data: arrays[index] })))
      })
      await Promise.allSettled([readiness, catalog])
    }
  })

  test("a rejected native catalog job releases its slot while another readiness job is still held", async () => {
    const held = deferred<RunResult>()
    const failed = deferred<RunResult>()
    const options = context(async (_file, args) =>
      args.includes("/usage") ? held.promise : failed.promise,
    )
    const readiness = inspectReadiness(spec("agy"), "/stub", options)
    const catalogFailure = listModels(input({ harness: "agy" }), options).catch(
      (error: unknown) => error,
    )
    try {
      await expect(listModels(input({ harness: "agy" }), options)).rejects.toThrow(
        "DISCOVERY_BUSY:",
      )
      failed.reject(new Error("external launch failed"))
      expect(String(await catalogFailure)).toContain("INSPECTION_FAILED:")
      const recovered = await listModels(input({ harness: "agy" }), {
        ...options,
        run: async () => exited("slug\tLabel\n"),
      })
      expect(recovered.total).toBe(1)
      held.resolve(exited("Quota: 90%"))
      expect((await readiness).readiness).toBe("configured")
    } finally {
      held.resolve(exited("Quota: 90%"))
      failed.resolve(exited(""))
      await Promise.allSettled([readiness, catalogFailure])
    }
  })
})

test("SDK public tools project name hints, preserve the full selector set and envelope catalog errors", async () => {
  const evaluated = evaluateOpenCodeEvidence(evidence([model("free"), model("ordinary")]))
  const snapshot: DetectionResult = {
    detected: ["opencode", "agy", "claude"].map((id) => ({
      spec: spec(id),
      executable: "/stub",
      version: null,
      readiness: "configured",
      reason: "fixture",
      models: evaluated.models,
      modelHints: evaluated.modelHints,
      modelHintsState: evaluated.modelHintsState,
    })),
    unavailable: [],
  }
  const server = new McpServer({ name: "catalog-test", version: "1" })
  const client = new Client({ name: "catalog-test-client", version: "1" })
  registerDelegateTools(server, {
    getSnapshot: () => snapshot,
    performRefresh: async () => {},
    delegateRun: async () => {
      throw new Error("No model turns in catalog tests")
    },
    delegateModels: (query) =>
      listModels(query, context(apiRun(evidence([model("paid", { name: "Paid Label" })])))),
    depth: 0,
    maxDepth: 2,
  })
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  try {
    await server.connect(serverTransport)
    await client.connect(clientTransport)
    expect((await client.listTools()).tools.map((tool) => tool.name).sort()).toEqual([
      "delegate_models",
      "delegate_run",
      "delegate_status",
    ])
    const statusResponse = await client.callTool({ name: "delegate_status", arguments: {} })
    const status = assertEnvelope<StatusOutput>(statusResponse)
    expect(status.data?.harnesses[0]?.models).toEqual(["opencode/free"])
    expect(status.data?.harnesses[0]?.modelListing).toBe("supported")
    expect(status.data?.harnesses[1]?.models).toEqual([])
    expect(status.data?.harnesses[1]?.modelHintsState).toBe("not_applicable")
    expect(status.data?.harnesses[1]?.modelListing).toBe("supported")
    expect(status.data?.harnesses[2]?.modelListing).toBe("unsupported")
    expect(snapshot.detected[0]?.models).toEqual(["opencode/free", "opencode/ordinary"])
    const listing = assertEnvelope<ModelsOutput>(
      await client.callTool({
        name: "delegate_models",
        arguments: { harness: "opencode", text: "PAID LABEL" },
      }),
    )
    expect(listing.data?.models).toEqual([{ selector: "opencode/paid", label: "Paid Label" }])
    const failure = assertEnvelope(
      await client.callTool({ name: "delegate_models", arguments: { harness: "claude" } }),
    )
    expect(failure).toEqual({
      ok: false,
      error: "LISTING_UNSUPPORTED: This harness has no supported model catalog inspector.",
    })
  } finally {
    await client.close()
    await server.close()
  }
})

function assertEnvelope<T>(response: Awaited<ReturnType<Client["callTool"]>>) {
  const envelope = response.structuredContent as { ok: boolean; data?: T; error?: string }
  expect(response.isError).toBe(!envelope.ok)
  const text = Array.isArray(response.content) ? response.content[0] : undefined
  if (text?.type !== "text") throw new Error("Expected JSON text fallback")
  expect(JSON.parse(text.text)).toEqual(envelope)
  return envelope
}
