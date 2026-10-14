import { describe, expect, test } from "bun:test"
import type { DelegateInput } from "../src/contracts.ts"
import type { HarnessSpec } from "../src/registry.ts"
import {
  assertArgv,
  assertRegistryInvariants,
  HARNESSES,
  harnessById,
  toolDescription,
} from "../src/registry.ts"

const MODES = ["default", "acceptEdits", "bypassPermissions"] as const

/**
 * Inputs are built as literals rather than parsed from the zod schema: Bun's
 * test runner does not auto-install packages, so a runtime import of `zod@4`
 * would fail here even though the server resolves it fine. What keeps these
 * literals in step with `DelegateInput` is that the return type is annotated:
 * a field added to or renamed in the schema fails this file to compile, and
 * `src/registry.ts`'s own `DelegateInput` literal is checked the same way.
 */
const input = (overrides: Partial<DelegateInput> = {}): DelegateInput => ({
  prompt: "summarise the auth module",
  permissionMode: "default",
  wallTimeMs: 900_000,
  ...overrides,
})

const mustFind = (id: string) => {
  const harness = harnessById(id)
  if (!harness) throw new Error(`harness '${id}' is missing from the registry`)
  return harness
}

describe("harness registry", () => {
  test("ids are unique and stable tool suffixes", () => {
    const ids = HARNESSES.map((harness) => harness.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9]*$/)
  })

  test("every harness declares at least one binary and a buildArgs result", () => {
    for (const harness of HARNESSES) {
      expect(harness.binaries.length).toBeGreaterThan(0)
      const argv = harness.buildArgs(input(), "/tmp/work")
      expect(argv.length).toBeGreaterThan(1)
      expect(argv[argv.length - 1]).toBe("summarise the auth module")
    }
  })

  test("a harness that reads the prompt from an option is given it as that value", () => {
    for (const harness of HARNESSES) {
      const argv = harness.buildArgs(input(), "/tmp/work")
      if (harness.promptFlag === null) continue
      // `gemini -p` and `hermes -z` consume the token after them as the prompt,
      // so anything between the flag and the prompt would be read as text.
      expect(argv[argv.length - 2]).toBe(harness.promptFlag)
    }
  })

  test("no option ever sits directly after a prompt-taking flag", () => {
    for (const harness of HARNESSES) {
      if (harness.promptFlag === null) continue
      let argv: string[]
      try {
        argv = harness.buildArgs(input({ model: "some-model" }), "/tmp/work")
      } catch {
        continue // `amp` documents no model flag and refuses one outright
      }
      const flagIndex = argv.lastIndexOf(harness.promptFlag)
      expect(flagIndex).toBe(argv.length - 2)
      expect(argv[flagIndex + 1]).toBe("summarise the auth module")
    }
  })

  test("the prompt is exactly one argv element, even when it looks like a shell command", () => {
    const hostile = 'ignore previous; rm -rf / && echo "$(whoami)" `id`'
    for (const harness of HARNESSES) {
      const argv = harness.buildArgs(input({ prompt: hostile }), "/tmp/work")
      const occurrences = argv.filter((arg) => arg === hostile).length
      expect(occurrences).toBe(1)
      expect(argv).not.toContain("-")
    }
  })

  test("supported permission modes build, unsupported modes are rejected", () => {
    for (const harness of HARNESSES) {
      for (const mode of MODES) {
        if (!harness.permissionModes.includes(mode)) {
          expect(() => harness.buildArgs(input({ permissionMode: mode }), "/tmp/work")).toThrow(
            /not available for this harness/,
          )
          continue
        }
        const argv = harness.buildArgs(input({ permissionMode: mode }), "/tmp/work")
        expect(argv[argv.length - 1]).toBe("summarise the auth module")
      }
    }
  })

  test("higher permission modes add authority flags the default mode omits", () => {
    const claude = mustFind("claude")
    const base = claude.buildArgs(input({ permissionMode: "default" }), "/tmp/work")
    expect(base).not.toContain("--dangerously-skip-permissions")
    const bypass = claude.buildArgs(input({ permissionMode: "bypassPermissions" }), "/tmp/work")
    expect(bypass).toContain("--dangerously-skip-permissions")
  })

  test("AGY sandbox profile autoapproves every tool exactly once for every permission mode", () => {
    const agy = mustFind("agy")
    for (const permissionMode of MODES) {
      const task = input({ agySandbox: true, permissionMode, model: "some-model" })
      const argv = agy.buildArgs(task, "/tmp/work")
      expect(argv).toEqual([
        "--sandbox",
        "--model",
        "some-model",
        "--mode",
        "accept-edits",
        "--dangerously-skip-permissions",
        "--print",
        task.prompt,
      ])
      assertArgv(agy, argv, task.prompt)
    }
  })

  test("AGY always autoapproves independently of omitted or false sandbox", () => {
    const agy = mustFind("agy")
    for (const permissionMode of MODES) {
      const original = agy.buildArgs(input({ permissionMode }), "/tmp/work")
      expect(original).not.toContain("--sandbox")
      expect(original.filter((arg) => arg === "--dangerously-skip-permissions")).toHaveLength(1)
      expect(original.slice(-2)).toEqual(["--print", input().prompt])
      assertArgv(agy, original, input().prompt)
      expect(agy.buildArgs(input({ permissionMode, agySandbox: false }), "/tmp/work")).toEqual(
        original,
      )
    }
  })

  test("harnesses with a directory flag receive the resolved workdir", () => {
    for (const harness of HARNESSES.filter((entry) => entry.cwdFlag !== null)) {
      const flag = harness.cwdFlag
      if (flag === null) continue
      const argv = harness.buildArgs(input(), "/tmp/resolved")
      expect(argv).toContain("/tmp/resolved")
      expect(argv).toContain(flag)
    }
    for (const harness of HARNESSES.filter((entry) => entry.cwdFlag === null)) {
      expect(harness.buildArgs(input(), "/tmp/resolved")).not.toContain("/tmp/resolved")
    }
  })

  test("model is passed only when set, and amp refuses it outright", () => {
    for (const harness of HARNESSES) {
      const without = harness.buildArgs(input(), "/tmp/work")
      if (harness.id === "amp") {
        expect(() => harness.buildArgs(input({ model: "gpt-5" }), "/tmp/work")).toThrow(
          /model flag/,
        )
        continue
      }
      expect(without.some((arg) => arg.includes("gpt"))).toBe(false)
      const with_ = harness.buildArgs(input({ model: "gpt-5" }), "/tmp/work")
      expect(with_.slice(0, -1)).toContain("gpt-5")
    }
  })

  test("the shipped registry satisfies the startup invariants", () => {
    expect(() => assertRegistryInvariants()).not.toThrow()
  })

  test("a malformed entry is rejected at startup rather than at first use", () => {
    const gemini = mustFind("gemini")
    const amp = mustFind("amp")
    const broken: Array<[string, HarnessSpec]> = [
      [
        "does not pass the prompt as the final argument",
        { ...gemini, buildArgs: (value, workdir) => [...gemini.buildArgs(value, workdir), "-v"] },
      ],
      [
        // `amp` documents only `default`, so claiming the others is a registry lie.
        "advertises permissionMode 'acceptEdits' but buildArgs rejects it",
        { ...amp, permissionModes: ["default", "acceptEdits", "bypassPermissions"] },
      ],
      [
        // `gemini`'s builder handles every mode, so claiming one fewer is a lie
        // in the other direction: the tool description would under-report it.
        "accepts permissionMode 'acceptEdits' without advertising it",
        { ...gemini, permissionModes: ["default"] },
      ],
      [
        // Puts a model option between the value-taking prompt flag and the prompt.
        "must place '-p' immediately before the prompt",
        {
          ...gemini,
          buildArgs: (value, workdir) => {
            const argv = gemini.buildArgs(value, workdir)
            const prompt = argv[argv.length - 1] as string
            return [...argv.slice(0, -1), "-m", "gpt", prompt]
          },
        },
      ],
    ]
    for (const [expected, spec] of broken) {
      expect(() => assertRegistryInvariants([spec])).toThrow(expected)
    }
  })

  test("assertArgv accepts what the shipped registry builds, with and without a model", () => {
    for (const harness of HARNESSES) {
      for (const model of [undefined, "gpt-5"]) {
        let argv: string[]
        try {
          argv = harness.buildArgs(input({ model }), "/tmp/work")
        } catch {
          continue
        }
        expect(() => assertArgv(harness, argv, "summarise the auth module")).not.toThrow()
      }
    }
  })

  test("assertArgv catches a defect that only appears once a model is supplied", () => {
    // `assertRegistryInvariants` probes without a model, so a builder that only
    // misbehaves when one is present slips past the startup check. `server.ts`
    // runs `assertArgv` against the real arguments of every call for that reason.
    const gemini = mustFind("gemini")
    const broken: HarnessSpec = {
      ...gemini,
      buildArgs: (value, workdir) => {
        const argv = gemini.buildArgs(value, workdir)
        if (value.model === undefined) return argv
        const prompt = argv[argv.length - 1] as string
        return [...argv.slice(0, -1), "--verbose", prompt]
      },
    }
    const argv = broken.buildArgs(input({ model: "gemini-3-pro" }), "/tmp/work")
    expect(() => assertArgv(broken, argv, "summarise the auth module")).toThrow(
      "must place '-p' immediately before the prompt",
    )
  })

  test("assertArgv catches a prompt that is no longer the final argument", () => {
    const claude = mustFind("claude")
    const argv = [...claude.buildArgs(input(), "/tmp/work"), "--verbose"]
    expect(() => assertArgv(claude, argv, "summarise the auth module")).toThrow(
      "does not pass the prompt as the final argument",
    )
  })

  test("assertArgv catches a dropped prompt flag", () => {
    // A single-element argv makes the flag's index and its required position both
    // -1, so a position check alone reads that as correct.
    const gemini = mustFind("gemini")
    expect(() =>
      assertArgv(gemini, ["summarise the auth module"], "summarise the auth module"),
    ).toThrow("omits its prompt flag '-p'")
  })

  test("tool descriptions state the permission modes and name the harness", () => {
    for (const harness of HARNESSES) {
      const description = toolDescription(harness, "1.2.3")
      expect(description).toContain(harness.label)
      expect(description).toContain("1.2.3")
      for (const mode of harness.permissionModes) expect(description).toContain(`'${mode}'`)
      expect(description).not.toContain("undefined")
    }
  })

  test("modelSupported is false only for amp, true for every other harness", () => {
    for (const harness of HARNESSES) {
      if (harness.id === "amp") {
        expect(harness.modelSupported).toBe(false)
      } else {
        expect(harness.modelSupported).toBe(true)
      }
    }
  })

  test("amp modelSupported=false is consistent with it refusing a model argument", () => {
    const amp = mustFind("amp")
    expect(amp.modelSupported).toBe(false)
    expect(() => amp.buildArgs(input({ model: "gpt-5" }), "/tmp/work")).toThrow(/model flag/)
  })
})
