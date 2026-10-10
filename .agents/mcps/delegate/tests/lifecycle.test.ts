import { describe, expect, test } from "bun:test"
import { onceAsync } from "../src/lifecycle.ts"

describe("onceAsync", () => {
  // Stands in for `StdioServerTransport.close()`, which calls the protocol's
  // onclose handler synchronously and so asks for the shutdown all over again.
  function reentrant(action: () => void) {
    let runs = 0
    let close: () => Promise<void> = () => Promise.resolve()
    const guarded = onceAsync(async () => {
      runs += 1
      if (runs > 10) throw new Error("the shutdown action ran itself again")
      action()
      void close()
    })
    close = guarded
    return { runs: () => runs, guarded }
  }

  test("runs the action once when it synchronously re-enters the guard", async () => {
    const { runs, guarded } = reentrant(() => {})
    await guarded()
    expect(runs()).toBe(1)
  })

  test("later callers join the first run instead of starting another", async () => {
    let runs = 0
    let release = () => {}
    const held = new Promise<void>((resolve) => {
      release = resolve
    })
    const guarded = onceAsync(async () => {
      runs += 1
      await held
    })
    const first = guarded()
    const second = guarded()
    expect(second).toBe(first)
    release()
    await Promise.all([first, second])
    expect(runs).toBe(1)
  })

  test("a rejected action resolves instead of surfacing as an unhandled rejection", async () => {
    const guarded = onceAsync(() => Promise.reject(new Error("transport already closed")))
    await expect(guarded()).resolves.toBeUndefined()
    await expect(guarded()).resolves.toBeUndefined()
  })
})
