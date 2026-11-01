import { readFile } from "node:fs/promises"
import { dirname, extname, join, relative, resolve } from "node:path"
import { z } from "zod"
import { resolveWorkspacePath, within } from "../workspace/paths.ts"
import type { QualityProvider } from "./contracts.ts"
import {
  parseActionlint,
  parseClippy,
  parseEslint,
  parseMarkdownlint,
  parseRuff,
  parseShellcheck,
  parseStaticcheck,
  parseStylelint,
  parseYamllint,
} from "./parsers.ts"

const fileTimeout = 30_000
const projectTimeout = 120_000
const none: QualityProvider["needs"] = []
const providers: QualityProvider[] = [
  {
    id: "ruff",
    extensions: [".py", ".pyi"],
    scope: "file",
    defaultTimeoutMs: fileTimeout,
    argv: (f) => ["ruff", "check", "--no-fix", "--force-exclude", "--output-format", "json", f],
    findingsExitCodes: [1],
    needs: none,
    parse: parseRuff,
  },
  {
    id: "shellcheck",
    extensions: [".sh", ".bash"],
    scope: "file",
    defaultTimeoutMs: fileTimeout,
    argv: (f) => ["shellcheck", "-f", "json1", f],
    findingsExitCodes: [1, 2],
    needs: none,
    parse: parseShellcheck,
  },
  {
    id: "eslint",
    extensions: [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"],
    scope: "file",
    defaultTimeoutMs: fileTimeout,
    argv: (f) => ["eslint", "--format", "json", f],
    findingsExitCodes: [1],
    needs: ["eslint-config"],
    parse: parseEslint,
  },
  {
    id: "yamllint",
    extensions: [".yml", ".yaml"],
    scope: "file",
    defaultTimeoutMs: fileTimeout,
    argv: (f) => ["yamllint", "-f", "parsable", f],
    findingsExitCodes: [1],
    needs: none,
    parse: parseYamllint,
  },
  {
    id: "markdownlint-cli2",
    extensions: [".md", ".markdown"],
    scope: "file",
    defaultTimeoutMs: fileTimeout,
    argv: () => ["markdownlint-cli2", "--no-globs", "-"],
    feedStdin: true,
    findingsExitCodes: [0, 1],
    needs: none,
    parse: parseMarkdownlint,
  },
  {
    id: "stylelint",
    extensions: [".css", ".scss", ".sass", ".less"],
    scope: "file",
    defaultTimeoutMs: fileTimeout,
    argv: (f) => ["stylelint", "--formatter", "json", f],
    findingsExitCodes: [2],
    needs: ["stylelint-config"],
    parse: parseStylelint,
  },
  {
    id: "actionlint",
    extensions: [".yml", ".yaml"],
    scope: "file",
    defaultTimeoutMs: fileTimeout,
    argv: (f) => ["actionlint", "-no-color", "-format", "{{json .}}", f],
    findingsExitCodes: [1],
    needs: none,
    parse: parseActionlint,
  },
  {
    id: "staticcheck",
    extensions: [".go"],
    scope: "project",
    defaultTimeoutMs: projectTimeout,
    argv: () => ["staticcheck", "-f", "json", "./..."],
    findingsExitCodes: [1],
    needs: ["go-module"],
    parse: parseStaticcheck,
  },
  {
    id: "clippy",
    extensions: [".rs"],
    scope: "project",
    defaultTimeoutMs: projectTimeout,
    argv: () => ["cargo", "clippy", "--message-format=json", "--quiet"],
    findingsExitCodes: [0, 101],
    needs: ["cargo-manifest"],
    parse: parseClippy,
  },
]
export const qualityProviders: readonly QualityProvider[] = providers

export function providersForFile(absoluteFile: string, root: string): QualityProvider[] {
  if (!within(resolve(root), resolve(absoluteFile))) return []
  const ext = extname(absoluteFile).toLowerCase()
  return providers.filter(
    (p) =>
      p.extensions.includes(ext) &&
      (p.id !== "actionlint" ||
        resolve(absoluteFile).startsWith(`${join(resolve(root), ".github", "workflows")}/`)),
  )
}

// Always use relative paths: the workspace resolver rejects every symlink
// component in this mode, including a package.json or configuration symlink.
async function configFile(root: string, path: string): Promise<string | undefined> {
  try {
    return (await resolveWorkspacePath(root, relative(root, path))).path
  } catch {
    return undefined
  }
}
const packageFields = z.record(z.string(), z.unknown())
async function packageKey(
  dir: string,
  root: string,
  key: "eslintConfig" | "stylelint",
): Promise<boolean> {
  const path = await configFile(root, join(dir, "package.json"))
  if (!path) return false
  try {
    const pkg = packageFields.parse(JSON.parse(await readFile(path, "utf8")))
    return Object.hasOwn(pkg, key)
  } catch {
    return false
  }
}
async function ancestorSearch(
  start: string,
  root: string,
  names: readonly string[],
  key?: "eslintConfig" | "stylelint",
): Promise<boolean> {
  let dir = resolve(start)
  const boundary = resolve(root)
  while (within(boundary, dir)) {
    for (const name of names) if (await configFile(boundary, join(dir, name))) return true
    if (key && (await packageKey(dir, boundary, key))) return true
    if (dir === boundary) break
    dir = dirname(dir)
  }
  return false
}
async function configured(provider: QualityProvider, file: string, root: string): Promise<boolean> {
  const dir = dirname(file)
  if (provider.id === "eslint")
    return ancestorSearch(
      dir,
      root,
      [
        "eslint.config.js",
        "eslint.config.mjs",
        "eslint.config.cjs",
        "eslint.config.ts",
        "eslint.config.mts",
        "eslint.config.cts",
        ".eslintrc",
        ".eslintrc.js",
        ".eslintrc.cjs",
        ".eslintrc.yaml",
        ".eslintrc.yml",
        ".eslintrc.json",
      ],
      "eslintConfig",
    )
  if (provider.id === "stylelint")
    return ancestorSearch(
      dir,
      root,
      [
        "stylelint.config.js",
        "stylelint.config.mjs",
        "stylelint.config.cjs",
        "stylelint.config.ts",
        ".stylelintrc",
        ".stylelintrc.json",
        ".stylelintrc.yaml",
        ".stylelintrc.yml",
        ".stylelintrc.js",
        ".stylelintrc.cjs",
        ".stylelintrc.mjs",
        ".stylelintrc.ts",
      ],
      "stylelint",
    )
  if (provider.id === "staticcheck") return ancestorSearch(dir, root, ["go.mod"])
  if (provider.id === "clippy") return ancestorSearch(dir, root, ["Cargo.toml"])
  return true
}
export async function checkApplicability(
  provider: QualityProvider,
  absoluteFile: string,
  root: string,
): Promise<"ready" | { status: "not-applicable"; note: string }> {
  const boundary = resolve(root)
  if (!within(boundary, resolve(absoluteFile))) throw new Error("Quality target escapes workspace")
  await resolveWorkspacePath(boundary, relative(boundary, resolve(absoluteFile)))
  if (!provider.extensions.includes(extname(absoluteFile).toLowerCase()))
    return { status: "not-applicable", note: "unsupported file extension" }
  if (
    provider.id === "actionlint" &&
    !resolve(absoluteFile).startsWith(`${join(resolve(root), ".github", "workflows")}/`)
  )
    return { status: "not-applicable", note: "actionlint applies only to .github/workflows" }
  if (!(await configured(provider, absoluteFile, root)))
    return { status: "not-applicable", note: "no workspace configuration found" }
  return "ready"
}
