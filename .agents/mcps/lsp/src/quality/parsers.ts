import { z } from "zod@4"
import { isAbsolute, relative, resolve, sep } from "node:path"
import type { DiagnosticRecord, QualityOutput } from "./contracts.ts"

export type ParseContext = { root: string; absoluteFile: string }
const positive = z.number().int().positive()
const text = z.string().min(1)
const level = z.enum(["error", "warning", "info", "note", "help", "hint", "failure-note", "ice"])
const point = z.object({ row: positive, column: positive })
// Native tools add metadata across releases. Validate consumed fields without
// rejecting unrelated native metadata (fixes, snippets, source, end positions).
const ruff = z.array(
  z.object({
    filename: text,
    location: point,
    message: text,
    code: text.nullable(),
    severity: level.optional(),
  }),
)
const shellcheck = z.object({
  comments: z.array(
    z.object({
      file: text,
      line: positive,
      column: positive,
      level,
      message: text,
      code: z.number().int(),
    }),
  ),
})
const eslint = z.array(
  z.object({
    filePath: text,
    messages: z.array(
      z.object({
        message: text,
        severity: z.union([z.literal(0), z.literal(1), z.literal(2)]),
        ruleId: text.nullable(),
        line: positive.optional(),
        column: positive.optional(),
      }),
    ),
  }),
)
const stylelint = z.array(
  z.object({
    source: text,
    warnings: z.array(
      z.object({
        line: positive,
        column: positive,
        severity: z.enum(["error", "warning"]),
        text,
        rule: text,
      }),
    ),
    parseErrors: z.array(z.unknown()).optional(),
    invalidOptionWarnings: z.array(z.unknown()).optional(),
  }),
)
const actionlint = z.array(
  z.object({
    filepath: text,
    line: positive,
    column: positive,
    message: text,
    kind: text,
  }),
)
const staticcheck = z.object({
  location: z.object({ file: text, line: positive, column: positive }),
  severity: z.enum(["error", "warning", "ignored"]),
  message: text,
  code: text,
})
const rustSpan = z.object({
  file_name: text,
  line_start: positive,
  column_start: positive,
  is_primary: z.boolean(),
})
const rustMessage = z.object({
  level,
  message: text,
  code: z.object({ code: text }).nullable(),
  spans: z.array(rustSpan),
})
const cargo = z.discriminatedUnion("reason", [
  z.object({ reason: z.literal("compiler-message"), message: rustMessage }),
  z.object({
    reason: z.literal("compiler-artifact"),
    package_id: text,
    filenames: z.array(z.string()),
  }),
  z.object({ reason: z.literal("build-script-executed"), package_id: text }),
  z.object({ reason: z.literal("build-finished"), success: z.boolean() }),
])

function location(root: string, file: string, line: number, column: number): string {
  const rel = relative(root, resolve(root, file)).split(sep).join("/")
  return `${rel}:${line}:${column}`
}
function severity(value: string | number): DiagnosticRecord["severity"] {
  if (value === 2 || value === "error" || value === "ice") return "Error"
  if (value === 1 || value === "warning") return "Warning"
  if (value === "hint" || value === "help") return "Hint"
  return "Information"
}
function make(
  tool: string,
  file: string,
  line: number,
  col: number,
  nativeLevel: string | number,
  msg: string,
  rule: string | null | undefined,
  root: string,
): DiagnosticRecord {
  return {
    location: location(root, file, line, col),
    severity: severity(nativeLevel),
    message: msg,
    ...(rule ? { rule } : {}),
    tool,
  }
}
function jsonLines(text: string): unknown[] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line))
}

export function parseRuff(output: QualityOutput, ctx: ParseContext): DiagnosticRecord[] {
  return ruff
    .parse(JSON.parse(output.stdout))
    .map((item) =>
      make(
        "ruff",
        item.filename,
        item.location.row,
        item.location.column,
        item.severity ?? "error",
        item.message,
        item.code,
        ctx.root,
      ),
    )
}
export function parseShellcheck(output: QualityOutput, ctx: ParseContext): DiagnosticRecord[] {
  return shellcheck
    .parse(JSON.parse(output.stdout))
    .comments.map((item) =>
      make(
        "shellcheck",
        item.file,
        item.line,
        item.column,
        item.level,
        item.message,
        String(item.code),
        ctx.root,
      ),
    )
}
export function parseEslint(output: QualityOutput, ctx: ParseContext): DiagnosticRecord[] {
  return eslint
    .parse(JSON.parse(output.stdout))
    .flatMap((file) =>
      file.messages.map((item) =>
        make(
          "eslint",
          file.filePath,
          item.line ?? 1,
          item.column ?? 1,
          item.severity,
          item.message,
          item.ruleId,
          ctx.root,
        ),
      ),
    )
}
export function parseYamllint(output: QualityOutput, ctx: ParseContext): DiagnosticRecord[] {
  const out: DiagnosticRecord[] = []
  for (const line of output.stdout.split(/\r?\n/).filter(Boolean)) {
    const match = /^(.*?):(\d+):(\d+): \[(warning|error)\] (.*?) \(([^)]+)\)$/.exec(line)
    if (!match) throw new Error(`malformed yamllint output: ${line}`)
    out.push(
      make("yamllint", match[1], +match[2], +match[3], match[4], match[5], match[6], ctx.root),
    )
  }
  return out
}
export function parseMarkdownlint(output: QualityOutput, ctx: ParseContext): DiagnosticRecord[] {
  const out: DiagnosticRecord[] = []
  for (const line of output.stderr.split(/\r?\n/).filter(Boolean)) {
    if (/^(Finding:|Linting:|Summary:)/.test(line)) continue
    const match =
      /^(.+?):(\d+)(?::(\d+))?\s+(error|warning)\s+(\S+)\s+(.+?)(?:\s+\[Context:.*\])?$/.exec(line)
    if (!match) throw new Error(`malformed markdownlint output: ${line}`)
    if (match[1] !== "stdin" && !(isAbsolute(match[1]) && match[1].endsWith("/stdin")))
      throw new Error(`unexpected markdownlint stdin label: ${match[1]}`)
    out.push(
      make(
        "markdownlint-cli2",
        ctx.absoluteFile,
        +match[2],
        +(match[3] ?? 1),
        match[4],
        match[6],
        match[5],
        ctx.root,
      ),
    )
  }
  return out
}
export function parseStylelint(output: QualityOutput, ctx: ParseContext): DiagnosticRecord[] {
  // Stylelint 17 writes formatted reports to stderr; older releases use stdout.
  const report = output.stdout.trim() ? output.stdout : output.stderr
  return stylelint.parse(JSON.parse(report)).flatMap((file) => {
    if (file.parseErrors?.length || file.invalidOptionWarnings?.length)
      throw new Error("Stylelint reported configuration or parse errors")
    return file.warnings.map((item) =>
      make(
        "stylelint",
        file.source,
        item.line,
        item.column,
        item.severity,
        item.text,
        item.rule,
        ctx.root,
      ),
    )
  })
}
export function parseActionlint(output: QualityOutput, ctx: ParseContext): DiagnosticRecord[] {
  return actionlint
    .parse(JSON.parse(output.stdout))
    .map((item) =>
      make(
        "actionlint",
        item.filepath,
        item.line,
        item.column,
        "error",
        item.message,
        item.kind,
        ctx.root,
      ),
    )
}
export function parseStaticcheck(output: QualityOutput, ctx: ParseContext): DiagnosticRecord[] {
  return jsonLines(output.stdout).map((value) => {
    const item = staticcheck.parse(value)
    return make(
      "staticcheck",
      item.location.file,
      item.location.line,
      item.location.column,
      item.severity,
      item.message,
      item.code,
      ctx.root,
    )
  })
}
export function parseClippy(output: QualityOutput, ctx: ParseContext): DiagnosticRecord[] {
  return jsonLines(output.stdout).flatMap((value) => {
    const item = cargo.parse(value)
    if (item.reason !== "compiler-message") return []
    const msg = item.message
    const span = msg.spans.find((span) => span.is_primary)
    if (!span) return [] // Native summaries and spanless diagnostics have no location.
    return [
      make(
        "clippy",
        span.file_name,
        span.line_start,
        span.column_start,
        msg.level,
        msg.message,
        msg.code?.code,
        ctx.root,
      ),
    ]
  })
}
