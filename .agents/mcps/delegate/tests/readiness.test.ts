import { describe, expect, test } from "bun:test"
import type { RunOptions, RunResult } from "../src/execute.ts"
import { inspectReadiness } from "../src/readiness.ts"
import { type HarnessSpec, harnessById } from "../src/registry.ts"

type RunCall = { file: string; args: string[]; options: RunOptions }

const BASE_ENV = { PATH: "/usr/bin", HOME: "/tmp/home", EXAMPLE_FLAG: "1" }
const MAX_INSPECTION_BYTES = 4_194_304

const mustFind = (id: string): HarnessSpec => {
  const harness = harnessById(id)
  if (!harness) throw new Error(`harness '${id}' is missing from the registry`)
  return harness
}

const exited = (stdout: string, overrides: Partial<RunResult> = {}): RunResult => ({
  exitCode: 0,
  signal: null,
  stop: "exited",
  stdout,
  stderr: "",
  durationMs: 1,
  truncated: false,
  ...overrides,
})

const queueRun = (results: RunResult[]) => {
  const calls: RunCall[] = []
  const run = async (file: string, args: string[], options: RunOptions): Promise<RunResult> => {
    calls.push({ file, args: [...args], options: { ...options, env: { ...options.env } } })
    const next = results.shift()
    if (!next) throw new Error(`unexpected readiness probe: ${file} ${args.join(" ")}`)
    return next
  }
  return { calls, run }
}

const response = (data: unknown[]): string => JSON.stringify({ data })

const needsAuth = (message = "Reconnect required.", url = "https://example.test/login") => ({
  status: "needs_auth",
  message,
  url,
})

const credential = (id: string, label: string, overrides: Record<string, unknown> = {}) => ({
  type: "credential",
  id,
  label,
  method: "key",
  ...overrides,
})

const envConnection = (name: string, overrides: Record<string, unknown> = {}) => ({
  type: "env",
  name,
  ...overrides,
})

const integration = (id: string, connections: unknown[]) => ({ id, connections })

const provider = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  activation: "auto",
  ...overrides,
})

const model = (id: string, providerID: string, overrides: Record<string, unknown> = {}) => ({
  id,
  providerID,
  enabled: true,
  status: "active",
  variants: [] as Array<{ id: string }>,
  ...overrides,
})

async function withFakePerformanceNow<T>(
  start: number,
  work: (advance: (ms: number) => void) => Promise<T>,
): Promise<T> {
  let now = start
  const originalNow = performance.now.bind(performance)
  Object.defineProperty(performance, "now", {
    configurable: true,
    value: () => now,
  })
  try {
    return await work((ms) => {
      now += ms
    })
  } finally {
    Object.defineProperty(performance, "now", {
      configurable: true,
      value: originalNow,
    })
  }
}

describe("inspectReadiness", () => {
  test("opencode accepts empty display labels and known needs-auth messages", async () => {
    for (const status of [undefined, { status: "needs_auth", message: "" }]) {
      const { run } = queueRun([
        exited(response([integration("int-openai", [credential("account", "", { status })])])),
        exited(response([provider("openai", { integrationID: "int-openai" })])),
        exited(response([model("gpt-5", "openai")])),
      ])
      const result = await inspectReadiness(mustFind("opencode"), "/opt/opencode", {
        cwd: "/work",
        env: {},
        run,
      })
      expect(result.readiness).toBe(status ? "not_configured" : "configured")
      expect(result.models).toEqual(status ? [] : ["openai/gpt-5"])
    }
  })

  test("returns unknown for harnesses without a verified non-model status command and never spawns a probe", async () => {
    const ids = [
      "agy",
      "amp",
      "cursor",
      "crush",
      "droid",
      "gemini",
      "hermes",
      "kilo",
      "qwen",
    ] as const
    const run = async (): Promise<RunResult> => {
      throw new Error("unknown-harness readiness should not spawn a subprocess")
    }

    for (const id of ids) {
      const result = await inspectReadiness(mustFind(id), `/opt/${id}`, {
        cwd: "/workspace",
        env: { ...BASE_ENV },
        run,
      })
      expect(result.readiness).toBe("unknown")
      expect(result.models).toEqual([])
      expect(result.reason.length).toBeGreaterThan(0)
    }
  })

  test("claude reads only auth-status JSON and fails closed on malformed or non-clean exits", async () => {
    const cases = [
      {
        probe: exited('{"loggedIn":true,"apiKey":"__RAW_CLI_VALUE__"}'),
        readiness: "configured" as const,
      },
      { probe: exited('{"loggedIn":false}'), readiness: "not_configured" as const },
      {
        probe: exited('{"loggedIn":false}', { exitCode: 1 }),
        readiness: "not_configured" as const,
      },
      { probe: exited('{"loggedIn":true}', { exitCode: 1 }), readiness: "unknown" as const },
      { probe: exited('{"loggedIn":"true"}'), readiness: "unknown" as const },
      { probe: exited('{"loggedIn":true}', { truncated: true }), readiness: "unknown" as const },
    ]

    for (const { probe, readiness } of cases) {
      const { calls, run } = queueRun([probe])
      const result = await inspectReadiness(mustFind("claude"), "/opt/claude", {
        cwd: "/workspace",
        env: { ...BASE_ENV },
        run,
      })

      expect(calls).toHaveLength(1)
      expect(calls[0]?.args).toEqual(["auth", "status"])
      expect(calls[0]?.options.cwd).toBe("/workspace")
      expect(calls[0]?.options.wallTimeMs).toBe(8_000)
      expect(calls[0]?.options.maxOutputBytes).toBe(MAX_INSPECTION_BYTES)
      expect(calls[0]?.options.env.DELEGATE_INSPECTION).toBe("1")
      expect(result.readiness).toBe(readiness)
      expect(result.models).toEqual([])
      expect(result.reason).not.toContain("__RAW_CLI_VALUE__")
    }
  })

  test("codex relies on anchored login status lines, including an anchored negative", async () => {
    const cases = [
      {
        probe: exited("Logged in using ChatGPT\nWorkspace: ready"),
        readiness: "configured" as const,
      },
      { probe: exited("Not logged in\nRun `codex login`."), readiness: "not_configured" as const },
      { probe: exited("status: Logged in using ChatGPT"), readiness: "unknown" as const },
      {
        probe: exited("Logged in using ChatGPT", { truncated: true }),
        readiness: "unknown" as const,
      },
    ]

    for (const { probe, readiness } of cases) {
      const { calls, run } = queueRun([probe])
      const result = await inspectReadiness(mustFind("codex"), "/opt/codex", {
        cwd: "/workspace",
        env: { ...BASE_ENV },
        run,
      })

      expect(calls).toHaveLength(1)
      expect(calls[0]?.args).toEqual(["login", "status"])
      expect(calls[0]?.options.cwd).toBe("/workspace")
      expect(calls[0]?.options.wallTimeMs).toBe(8_000)
      expect(calls[0]?.options.maxOutputBytes).toBe(MAX_INSPECTION_BYTES)
      expect(calls[0]?.options.env.DELEGATE_INSPECTION).toBe("1")
      expect(result.readiness).toBe(readiness)
      expect(result.models).toEqual([])
    }
  })

  test("opencode uses canonical nested DTOs, native selectors, and a monotonic shrinking deadline", async () => {
    const calls: RunCall[] = []
    await withFakePerformanceNow(1_000, async (advance) => {
      const run = async (file: string, args: string[], options: RunOptions): Promise<RunResult> => {
        calls.push({ file, args: [...args], options: { ...options, env: { ...options.env } } })
        advance(3_000)
        switch (calls.length) {
          case 1:
            return exited(
              response([
                integration("int-openai", [envConnection("OPENAI_API_KEY")]),
                integration("int-anthropic", [
                  credential("cred-anthropic", "Anthropic account", {
                    status: needsAuth(
                      "AUTH_MESSAGE__RAW__",
                      "https://example.test/reauth?token=RAW",
                    ),
                  }),
                ]),
              ]),
            )
          case 2:
            return exited(
              response([
                provider("provider-openai", { integrationID: "int-openai", activation: "enabled" }),
                provider("provider-anthropic", {
                  integrationID: "int-anthropic",
                  activation: "enabled",
                }),
                provider("provider-disabled", {
                  integrationID: "int-openai",
                  activation: "disabled",
                }),
              ]),
            )
          case 3: {
            const largeMetadata = "x".repeat(300_000)
            return exited(
              response([
                model("gpt-5", "provider-openai", {
                  variants: [{ id: "reasoning" }, { id: "reasoning" }, { id: "" }],
                }),
                model("provider-openai/gpt-5-mini", "provider-openai", { status: "beta" }),
                model("family/submodel", "provider-openai", {
                  status: "alpha",
                  variants: [{ id: "long-context" }],
                  metadata: largeMetadata,
                }),
                model("ignored-disabled", "provider-openai", { enabled: false }),
                model("ignored-deprecated", "provider-openai", { status: "deprecated" }),
                model("ignored-inactive", "provider-anthropic"),
                model("ignored-other-provider", "provider-other"),
              ]),
            )
          }
          default:
            throw new Error("unexpected opencode probe")
        }
      }

      const result = await inspectReadiness(mustFind("opencode"), "/opt/opencode", {
        cwd: "/workspace",
        env: { ...BASE_ENV },
        run,
      })

      expect(result.readiness).toBe("configured")
      expect(result.models).toEqual([
        "provider-openai/gpt-5",
        "provider-openai/gpt-5#reasoning",
        "provider-openai/gpt-5-mini",
        "provider-openai/family/submodel",
        "provider-openai/family/submodel#long-context",
      ])
      expect(calls.map((call) => call.args)).toEqual([
        ["api", "get", "/api/integration", "--standalone", "--log-level", "none"],
        ["api", "get", "/api/provider", "--standalone", "--log-level", "none"],
        ["api", "get", "/api/model", "--standalone", "--log-level", "none"],
      ])
      expect(calls.map((call) => call.options.wallTimeMs)).toEqual([8_000, 5_000, 2_000])
      for (const call of calls) {
        expect(call.file).toBe("/opt/opencode")
        expect(call.options.cwd).toBe("/workspace")
        expect(call.options.maxOutputBytes).toBe(MAX_INSPECTION_BYTES)
        expect(call.options.env.DELEGATE_INSPECTION).toBe("1")
      }
      expect(result.reason).not.toContain("AUTH_MESSAGE__RAW__")
      expect(result.reason).not.toContain("Anthropic account")
    })
  })

  test("opencode treats a needs-auth credential as inactive even when the same integration also has env fallback", async () => {
    const { calls, run } = queueRun([
      exited(
        response([
          integration("int-openai", [
            credential("cred-openai", "Primary account", {
              status: needsAuth("Reconnect this account."),
            }),
            envConnection("OPENAI_API_KEY"),
          ]),
        ]),
      ),
      exited(
        response([
          provider("provider-openai", { integrationID: "int-openai", activation: "enabled" }),
        ]),
      ),
      exited(response([model("gpt-5", "provider-openai")])),
    ])

    const result = await inspectReadiness(mustFind("opencode"), "/opt/opencode", {
      cwd: "/workspace",
      env: { ...BASE_ENV },
      run,
    })

    expect(calls).toHaveLength(3)
    expect(result.readiness).toBe("not_configured")
    expect(result.models).toEqual([])
    expect(result.reason.length).toBeGreaterThan(0)
  })

  test("opencode returns unknown when one integration has multiple saved credentials and never leaks credential diagnostics", async () => {
    const rawLabel = "Primary account __RAW_LABEL__"
    const rawMessage = "Credential expired __RAW_MESSAGE__"
    const rawUrl = "https://example.test/reauth?token=__RAW_TOKEN__"
    const { calls, run } = queueRun([
      exited(
        response([
          integration("int-openai", [
            credential("cred-primary", rawLabel),
            credential("cred-backup", "Backup account", {
              method: "oauth",
              status: needsAuth(rawMessage, rawUrl),
            }),
            envConnection("OPENAI_API_KEY"),
          ]),
        ]),
      ),
      exited(
        response([
          provider("provider-openai", { integrationID: "int-openai", activation: "enabled" }),
        ]),
      ),
      exited(response([model("gpt-5", "provider-openai")])),
    ])

    const result = await inspectReadiness(mustFind("opencode"), "/opt/opencode", {
      cwd: "/workspace",
      env: { ...BASE_ENV },
      run,
    })

    expect(calls).toHaveLength(3)
    expect(result.readiness).toBe("unknown")
    expect(result.models).toEqual([])
    expect(result.reason).not.toContain(rawLabel)
    expect(result.reason).not.toContain(rawMessage)
    expect(result.reason).not.toContain(rawUrl)
    expect(result.reason).not.toContain("cred-primary")
    expect(result.reason).not.toContain("cred-backup")
  })

  test("opencode treats the old flattened and boolean fixtures as unknown", async () => {
    const { run } = queueRun([
      exited(JSON.stringify({ data: [{ id: "int-openai", type: "credential" }] })),
      exited(
        JSON.stringify({
          data: [{ id: "provider-openai", integrationID: "int-openai", disabled: false }],
        }),
      ),
      exited(
        JSON.stringify({
          data: [{ id: "gpt-5", providerID: "provider-openai", enabled: true, deprecated: false }],
        }),
      ),
    ])

    const result = await inspectReadiness(mustFind("opencode"), "/opt/opencode", {
      cwd: "/workspace",
      env: { ...BASE_ENV },
      run,
    })

    expect(result.readiness).toBe("unknown")
    expect(result.models).toEqual([])
  })

  test("opencode returns unknown when a catalog probe is truncated even if the DTO would otherwise look valid", async () => {
    const { calls, run } = queueRun([
      exited(response([integration("int-openai", [envConnection("OPENAI_API_KEY")])])),
      exited(
        response([
          provider("provider-openai", { integrationID: "int-openai", activation: "enabled" }),
        ]),
      ),
      exited(response([model("gpt-5", "provider-openai")]), { truncated: true }),
    ])

    const result = await inspectReadiness(mustFind("opencode"), "/opt/opencode", {
      cwd: "/workspace",
      env: { ...BASE_ENV },
      run,
    })

    expect(calls).toHaveLength(3)
    expect(result.readiness).toBe("unknown")
    expect(result.models).toEqual([])
  })

  test("opencode fails closed on malformed API shapes and never echoes raw CLI output", async () => {
    const raw = '{"data":"__RAW_CLI_VALUE__"}'
    const { calls, run } = queueRun([exited(raw)])

    const result = await inspectReadiness(mustFind("opencode"), "/opt/opencode", {
      cwd: "/workspace",
      env: { ...BASE_ENV },
      run,
    })

    expect(calls).toHaveLength(1)
    expect(calls[0]?.args).toEqual([
      "api",
      "get",
      "/api/integration",
      "--standalone",
      "--log-level",
      "none",
    ])
    expect(result.readiness).toBe("unknown")
    expect(result.models).toEqual([])
    expect(result.reason).not.toContain("__RAW_CLI_VALUE__")
    expect(result.reason).not.toContain(raw)
  })
})
