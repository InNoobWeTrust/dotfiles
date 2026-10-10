import { describe, expect, test } from "bun:test"
import { detectHarnesses, locate, type WhichFn } from "../src/detect.ts"
import type { ReadinessResult } from "../src/readiness.ts"
import { type HarnessSpec, harnessById } from "../src/registry.ts"

const present =
  (names: string[]): WhichFn =>
  (name) =>
    names.includes(name) ? `/usr/local/bin/${name}` : null

const mustFind = (id: string): HarnessSpec => {
  const harness = harnessById(id)
  if (!harness) throw new Error(`harness '${id}' is missing from the registry`)
  return harness
}

const readiness = (state: ReadinessResult["readiness"], reason: string): ReadinessResult => ({
  readiness: state,
  reason,
  models: [],
})

const flush = async () => Bun.sleep(0)

const mustRelease = (release: Array<() => void>, index: number): (() => void) => {
  const ready = release[index]
  if (!ready) throw new Error(`release[${index}] was not registered`)
  return ready
}

describe("locate", () => {
  test("returns the first candidate binary that resolves", () => {
    const cursor = mustFind("cursor")
    expect(locate(cursor, present(["cursor-agent"]))).toBe("/usr/local/bin/cursor-agent")
    expect(locate(cursor, present(["agent"]))).toBe("/usr/local/bin/agent")
    expect(locate(cursor, present(["agent", "cursor-agent"]))).toBe("/usr/local/bin/agent")
    expect(locate(cursor, present([]))).toBeNull()
  })

  test("reports null when no supported binary exists", () => {
    expect(locate(mustFind("hermes"), present([]))).toBeNull()
  })
})

describe("detectHarnesses", () => {
  test("treats PATH aliases as unavailable until inspection proves they are configured", async () => {
    const inspected: Array<{
      id: string
      executable: string
      cwd: string
      env: NodeJS.ProcessEnv
    }> = []
    const env = { PATH: "/usr/local/bin", HOME: "/tmp/home", EXAMPLE_CONFIG: "1" }

    const result = await detectHarnesses({
      harnesses: [mustFind("claude"), mustFind("amp")],
      which: present(["claude"]),
      cwd: "/workspace",
      env,
      inspect: async (spec, executable, options) => {
        inspected.push({ id: spec.id, executable, cwd: options.cwd, env: options.env })
        return readiness("not_configured", "Run `claude auth login` in this workspace.")
      },
    })

    expect(inspected).toEqual([
      {
        id: "claude",
        executable: "/usr/local/bin/claude",
        cwd: "/workspace",
        env,
      },
    ])
    expect(result.detected).toEqual([])
    expect(result.unavailable).toEqual([
      {
        id: "claude",
        executable: "/usr/local/bin/claude",
        readiness: "not_configured",
        reason: "Run `claude auth login` in this workspace.",
      },
      {
        id: "amp",
        executable: null,
        readiness: "missing",
        reason: "no binary named amp on PATH",
      },
    ])
  })

  test("keeps an inspectable alias unavailable when inspection cannot prove readiness", async () => {
    const result = await detectHarnesses({
      harnesses: [mustFind("codex")],
      which: present(["codex"]),
      inspect: async () =>
        readiness("unknown", "Codex readiness could not be determined from `codex login status`."),
    })

    expect(result.detected).toEqual([])
    expect(result.unavailable).toEqual([
      {
        id: "codex",
        executable: "/usr/local/bin/codex",
        readiness: "unknown",
        reason: "Codex readiness could not be determined from `codex login status`.",
      },
    ])
  })

  test("fails closed when already running under a delegated inspection", async () => {
    let inspected = 0

    const result = await detectHarnesses({
      harnesses: [mustFind("claude"), mustFind("codex")],
      which: present(["claude", "codex"]),
      env: { PATH: "/usr/local/bin", HOME: "/tmp/home", DELEGATE_INSPECTION: "1" },
      inspect: async () => {
        inspected += 1
        return readiness("configured", "should never be used")
      },
    })

    expect(inspected).toBe(0)
    expect(result.detected).toEqual([])
    expect(result.unavailable).toHaveLength(2)
    expect(result.unavailable.map((entry) => entry.id)).toEqual(["claude", "codex"])
    for (const entry of result.unavailable) {
      expect(entry.executable).toBe(`/usr/local/bin/${entry.id}`)
      expect(entry.readiness).toBe("unknown")
      expect(entry.reason).toMatch(/inspection/i)
    }
  })

  test("inspects at most two harnesses at a time, in sequential chunks of two", async () => {
    const harnesses = [
      mustFind("claude"),
      mustFind("codex"),
      mustFind("opencode"),
      mustFind("agy"),
      mustFind("amp"),
    ]
    const started: string[] = []
    const release: Array<() => void> = []
    let active = 0
    let maxActive = 0

    const pending = detectHarnesses({
      harnesses,
      which: present(["claude", "codex", "opencode", "agy", "amp"]),
      inspect: async (spec) => {
        started.push(spec.id)
        active += 1
        maxActive = Math.max(maxActive, active)
        await new Promise<void>((resolve) =>
          release.push(() => {
            active -= 1
            resolve()
          }),
        )
        return readiness("configured", `${spec.label} is configured locally.`)
      },
    })

    await flush()
    expect(started).toEqual(["claude", "codex"])
    expect(maxActive).toBe(2)

    mustRelease(release, 0)()
    await flush()
    expect(started).toEqual(["claude", "codex"])

    mustRelease(release, 1)()
    await flush()
    expect(started).toEqual(["claude", "codex", "opencode", "agy"])
    expect(maxActive).toBe(2)

    mustRelease(release, 2)()
    await flush()
    expect(started).toEqual(["claude", "codex", "opencode", "agy"])

    mustRelease(release, 3)()
    await flush()
    expect(started).toEqual(["claude", "codex", "opencode", "agy", "amp"])
    expect(maxActive).toBe(2)

    mustRelease(release, 4)()
    const result = await pending
    expect(result.detected.map((entry) => entry.spec.id)).toEqual(harnesses.map((spec) => spec.id))
    expect(result.unavailable).toEqual([])
  })
})
