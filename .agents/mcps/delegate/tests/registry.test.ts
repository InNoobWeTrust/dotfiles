import { describe, expect, test } from "bun:test"
import type { HarnessSpec } from "../src/harnesses/catalog/registry.ts"
import {
  assertArgv,
  assertRegistryInvariants,
  HARNESSES,
  harnessById,
  toolDescription,
} from "../src/harnesses/catalog/registry.ts"
import type { DelegateInput } from "../src/protocol/contracts.ts"

const input = (overrides: Partial<DelegateInput> = {}): DelegateInput => ({
  prompt: "summarise the auth module",
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

  test("exact configured default argv", () => {
    const prompt = "summarise the auth module"
    const workdir = "/tmp/work"
    const expected: Record<string, string[]> = {
      amp: ["-x", prompt],
      agy: ["--mode", "accept-edits", "--dangerously-skip-permissions", "--print", prompt],
      claude: ["-p", prompt],
      codex: ["exec", "-C", workdir, "--sandbox", "read-only", prompt],
      crush: ["run", "--quiet", "-c", workdir, prompt],
      cursor: ["--trust", "--workspace", workdir, "-p", "--trust", prompt],
      droid: ["exec", "--cwd", workdir, prompt],
      gemini: ["-p", prompt],
      hermes: ["--in", workdir, "-z", prompt],
      kilo: ["run", "--dir", workdir, prompt],
      opencode: ["run", "--standalone", prompt],
      qwen: ["-p", prompt],
    }
    expect(HARNESSES.map(({ id }) => id).sort()).toEqual(Object.keys(expected).sort())
    for (const [id, argv] of Object.entries(expected))
      expect(mustFind(id).buildArgs(input(), workdir)).toEqual(argv)
  })

  test("model arguments retain their native position", () => {
    const prompt = input().prompt
    const workdir = "/tmp/work"
    const expected: Record<string, string[]> = {
      agy: [
        "--model",
        "some-model",
        "--mode",
        "accept-edits",
        "--dangerously-skip-permissions",
        "--print",
        prompt,
      ],
      claude: ["-p", "--model", "some-model", prompt],
      codex: ["exec", "-C", workdir, "--model", "some-model", "--sandbox", "read-only", prompt],
      crush: ["run", "--quiet", "-c", workdir, "--model", "some-model", prompt],
      cursor: ["--trust", "--workspace", workdir, "-p", "--model", "some-model", "--trust", prompt],
      droid: ["exec", "--cwd", workdir, "--model", "some-model", prompt],
      gemini: ["-m", "some-model", "-p", prompt],
      hermes: ["--in", workdir, "--model", "some-model", "-z", prompt],
      kilo: ["run", "--dir", workdir, "--model", "some-model", prompt],
      opencode: ["run", "--standalone", "--model", "some-model", prompt],
      qwen: ["-m", "some-model", "-p", prompt],
    }
    for (const [id, argv] of Object.entries(expected))
      expect(mustFind(id).buildArgs(input({ model: "some-model" }), workdir)).toEqual(argv)
    expect(() => mustFind("amp").buildArgs(input({ model: "some-model" }), workdir)).toThrow(
      /model flag/,
    )
  })

  test("AGY sandbox remains an independent optional flag", () => {
    const base = [
      "--mode",
      "accept-edits",
      "--dangerously-skip-permissions",
      "--print",
      input().prompt,
    ]
    const agy = mustFind("agy")
    expect(agy.buildArgs(input({ agySandbox: true }), "/tmp")).toEqual(["--sandbox", ...base])
    expect(agy.buildArgs(input({ agySandbox: false }), "/tmp")).toEqual(base)
    expect(agy.buildArgs(input(), "/tmp")).toEqual(base)
    const withModel = [
      "--model",
      "some-model",
      "--mode",
      "accept-edits",
      "--dangerously-skip-permissions",
      "--print",
      input().prompt,
    ]
    expect(agy.buildArgs(input({ agySandbox: true, model: "some-model" }), "/tmp")).toEqual([
      "--sandbox",
      ...withModel,
    ])
    expect(agy.buildArgs(input({ agySandbox: false, model: "some-model" }), "/tmp")).toEqual(
      withModel,
    )
    expect(agy.buildArgs(input({ model: "some-model" }), "/tmp")).toEqual(withModel)
  })

  test("prompt remains one final argv element and prompt flags are adjacent exactly once", () => {
    const hostile = 'ignore previous; rm -rf / && echo "$(whoami)" `id`'
    for (const harness of HARNESSES) {
      const argv = harness.buildArgs(input({ prompt: hostile }), "/tmp/work")
      expect(argv.filter((arg) => arg === hostile)).toHaveLength(1)
      expect(() => assertArgv(harness, argv, hostile)).not.toThrow()
    }
  })

  test("workdir is supplied only through harnesses with directory flags", () => {
    for (const harness of HARNESSES) {
      const argv = harness.buildArgs(input(), "/tmp/resolved")
      if (harness.cwdFlag) {
        expect(argv).toContain(harness.cwdFlag)
        expect(argv).toContain("/tmp/resolved")
      } else expect(argv).not.toContain("/tmp/resolved")
    }
  })

  test("shipped registry satisfies startup invariants", () =>
    expect(() => assertRegistryInvariants()).not.toThrow())

  test("startup invariants reject malformed final prompt and prompt flag placement", () => {
    const gemini = mustFind("gemini")
    const broken: Array<[string, HarnessSpec]> = [
      [
        "does not pass the prompt as the final argument",
        { ...gemini, buildArgs: (v, w) => [...gemini.buildArgs(v, w), "-v"] },
      ],
      [
        "must place '-p' immediately before the prompt",
        {
          ...gemini,
          buildArgs: (v, w) => {
            const argv = gemini.buildArgs(v, w)
            return [...argv.slice(0, -1), "-m", "gpt", argv[argv.length - 1] as string]
          },
        },
      ],
    ]
    for (const [message, spec] of broken)
      expect(() => assertRegistryInvariants([spec])).toThrow(message)
  })

  test("assertArgv catches model-only prompt adjacency defects", () => {
    const gemini = mustFind("gemini")
    const broken: HarnessSpec = {
      ...gemini,
      buildArgs: (v, w) => {
        const argv = gemini.buildArgs(v, w)
        if (v.model === undefined) return argv
        return [...argv.slice(0, -1), "--verbose", argv[argv.length - 1] as string]
      },
    }
    expect(() =>
      assertArgv(
        broken,
        broken.buildArgs(input({ model: "gemini-3-pro" }), "/tmp"),
        input().prompt,
      ),
    ).toThrow("must place '-p' immediately before the prompt")
  })

  test("assertArgv catches dropped prompt flag and non-final prompt", () => {
    const gemini = mustFind("gemini")
    expect(() => assertArgv(gemini, [input().prompt], input().prompt)).toThrow(
      "omits its prompt flag '-p'",
    )
    const claude = mustFind("claude")
    expect(() =>
      assertArgv(claude, [...claude.buildArgs(input(), "/tmp"), "--verbose"], input().prompt),
    ).toThrow("does not pass the prompt as the final argument")
  })

  test("tool descriptions identify harness without removed permission controls", () => {
    for (const harness of HARNESSES) {
      const description = toolDescription(harness, "1.2.3")
      expect(description).toContain(harness.label)
      expect(description).toContain("1.2.3")
      expect(description).not.toContain("permissionMode")
      expect(description).not.toContain("undefined")
    }
  })

  test("modelSupported is false only for amp, which rejects model arguments", () => {
    for (const harness of HARNESSES) expect(harness.modelSupported).toBe(harness.id !== "amp")
    expect(() => mustFind("amp").buildArgs(input({ model: "gpt-5" }), "/tmp")).toThrow(/model flag/)
  })
})
