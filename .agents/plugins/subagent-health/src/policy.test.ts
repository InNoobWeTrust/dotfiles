import { describe, expect, test } from "bun:test"
import plugin from "../index"
import { canonicalHash, retryDecision, toolDecision, type HealthState } from "./policy"

const state = (): HealthState => ({ retries: 0, waitMs: 0, repeats: 0 })

describe("critical health stop boundaries", () => {
  test("allows two retries, vetoes the third and excessive projected waiting", () => {
    const health = state()
    expect(retryDecision(health, 1, 100)).toBeUndefined()
    expect(retryDecision(health, 2, 100)).toBeUndefined()
    expect(retryDecision(health, 3, 100)).toBeDefined()
    expect(retryDecision(state(), 1, 60_000)).toBeDefined()
    const waits = state()
    expect(retryDecision(waits, 1, 30_000)).toBeUndefined()
    expect(retryDecision(waits, 2, 30_000)).toBeDefined()
  })

  test("key order is irrelevant; changed arguments/results break the repetition", () => {
    expect(canonicalHash({ b: 2, a: 1 })).toBe(canonicalHash({ a: 1, b: 2 }))
    const health = state()
    const first = canonicalHash(["read", { path: "a" }, "same"])
    expect(toolDecision(health, first)).toBeUndefined()
    expect(toolDecision(health, first)).toBeUndefined()
    expect(toolDecision(health, canonicalHash(["read", { path: "b" }, "same"]))).toBeUndefined()
    expect(toolDecision(health, first)).toBeUndefined()
    expect(toolDecision(health, first)).toBeUndefined()
    expect(toolDecision(health, first)).toBeDefined()
    expect(canonicalHash(["read", {}, "changed"])).not.toBe(canonicalHash(["read", {}, "same"]))
  })
})

function host(overrides = {}) {
  const hooks = new Map<string, (event: never) => Promise<void>>()
  const effects: { kind: string; input: Record<string, unknown> }[] = []
  const session = {
    id: "child", parentID: "parent", projectID: "project",
    location: { directory: "/work" }, metadata: {}, ...overrides,
  }
  const hook = async (name: string, callback: (event: never) => Promise<void>) => {
    hooks.set(name, callback)
    return { dispose: async () => {} }
  }
  const ctx = {
    location: { directory: "/work", project: { id: "project" } },
    session: {
      hook, get: async () => session,
      interrupt: async (input: Record<string, unknown>) => {
        effects.push({ kind: "interrupt", input })
        return { interrupted: true }
      },
      synthetic: async (input: Record<string, unknown>) => { effects.push({ kind: "note", input }) },
    },
    tool: { hook },
  }
  return {
    ctx: ctx as unknown as Parameters<typeof plugin.setup>[0], effects,
    emit: async (name: string, event: unknown) => hooks.get(name)!(event as never),
  }
}

test("root, fork and foreign sessions are never vetoed or interrupted", async () => {
  for (const scope of [{ parentID: undefined }, { fork: { sessionID: "root" } },
    { projectID: "other" }, { location: { directory: "/other" } }]) {
    const h = host(scope)
    const cleanup = await plugin.setup(h.ctx)
    const event = { sessionID: "child", attempt: 9, decision: { retry: true, delay: 90_000 } }
    await h.emit("retry", event)
    expect(event.decision.retry).toBe(true)
    expect(h.effects).toEqual([])
    await cleanup?.()
  }
})

test("retry veto notifies parent without resuming or interrupting parent", async () => {
  const h = host()
  const cleanup = await plugin.setup(h.ctx)
  const event = { sessionID: "child", attempt: 3, decision: { retry: true, delay: 100 } }
  await h.emit("retry", event)
  expect(event.decision.retry).toBe(false)
  await new Promise(resolve => setTimeout(resolve, 30))
  expect(h.effects).toHaveLength(1)
  expect(h.effects[0].kind).toBe("note")
  expect(h.effects[0].input.sessionID).toBe("parent")
  expect(h.effects[0].input.resume).toBe(false)
  await cleanup?.()
})

test("third identical tool completion stops child; polling exempts successes, not errors", async () => {
  for (const polling of [false, true]) {
    const h = host({ metadata: { subagentHealthPollingTools: polling ? ["status"] : [] } })
    const cleanup = await plugin.setup(h.ctx)
    const event = { sessionID: "child", tool: "status", input: { job: 1 },
      status: "completed", result: { content: "running" } }
    for (let i = 0; i < 3; i++) await h.emit("execute.after", event)
    await new Promise(resolve => setTimeout(resolve, 30))
    expect(h.effects.length).toBe(polling ? 0 : 2)
    if (polling) {
      for (let i = 0; i < 3; i++) await h.emit("execute.after", {
        ...event, status: "error", error: { message: "unavailable" },
      })
      await new Promise(resolve => setTimeout(resolve, 30))
    }
    expect(h.effects[0]).toEqual({ kind: "interrupt", input: { sessionID: "child", resume: false } })
    await expect(h.emit("execute.before", { sessionID: "child" })).rejects.toThrow("subagent-health")
    await cleanup?.()
  }
})
