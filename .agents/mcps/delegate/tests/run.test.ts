/** Pi session-path integrity checks for explicit overrides and separated defaults. */
import { describe, expect, test } from "bun:test"
import { resolvePiSessionDir } from "../src/execution/run.ts"

describe("resolvePiSessionDir", () => {
  test("custom absolute path", () =>
    expect(resolvePiSessionDir({ piSessionDir: "/custom/sessions" }, {})).toBe("/custom/sessions"))
  test("rejects relative and NUL paths", () => {
    expect(() => resolvePiSessionDir({ piSessionDir: "relative" }, {})).toThrow(/absolute/)
    expect(() => resolvePiSessionDir({ piSessionDir: "/bad\0path" }, {})).toThrow(/NUL/)
  })
  test("uses absolute XDG then HOME fallback", () => {
    expect(resolvePiSessionDir({}, { XDG_CACHE_HOME: "/xdg" })).toBe("/xdg/delegate/pi-sessions")
    expect(resolvePiSessionDir({}, { XDG_CACHE_HOME: "relative", HOME: "/home/u" })).toBe(
      "/home/u/.cache/delegate/pi-sessions",
    )
    expect(() => resolvePiSessionDir({}, {})).toThrow(/XDG_CACHE_HOME.*HOME/)
    expect(() => resolvePiSessionDir({}, { HOME: "relative" })).toThrow(/absolute/)
  })
})
