/** Private failure artifacts; only trace references, never raw causes, cross the MCP boundary. */
import { inspect } from "node:util"
import { OutputCapture } from "../../../shared/output/capture.ts"
import type { TraceReference } from "./contracts.ts"
import { CliStageError } from "./errors.ts"

/** Advertise a trace only after its complete JSON has been appended and durably closed. */
export function preserveFailure(operation: string, error: unknown): TraceReference {
  let output: OutputCapture | undefined
  try {
    const payload = JSON.stringify({
      timestamp: new Date().toISOString(),
      operation,
      error: serializeError(error, new Set()),
    })
    output = new OutputCapture(process.env, 0, "sandbox")
    output.append("stderr", Buffer.from(`${payload}\n`))
    output.close()
    return { tracePath: output.stderrPath }
  } catch {
    // Partial artifacts must never be advertised as complete traces. Still close both fds.
    try {
      output?.close()
    } catch {
      // The original tool outcome is authoritative even when the cache itself fails.
    }
    return { tracePath: null, traceError: "Could not preserve the private failure trace." }
  }
}

function serializeError(error: unknown, seen: Set<unknown>): unknown {
  if (!(error instanceof Error)) {
    return inspect(error, {
      getters: false,
      customInspect: false,
      depth: null,
      maxArrayLength: null,
      maxStringLength: null,
    })
  }
  if (seen.has(error)) return { circular: true }
  seen.add(error)
  const fields: Record<string, unknown> = {}
  for (const key of ["name", "message", "stack", "code", "errno", "syscall", "path"]) {
    const value = errorField(error, key)
    if (typeof value === "string" || typeof value === "number") fields[key] = value
  }
  if (error instanceof CliStageError) {
    for (const key of [
      "engine",
      "stage",
      "exitCode",
      "stop",
      "stdoutPath",
      "stderrPath",
      "stdoutBytes",
      "stderrBytes",
      "truncated",
    ] as const) {
      fields[key] = error[key]
    }
  }
  const cause = errorField(error, "cause")
  if (cause !== undefined) fields.cause = serializeError(cause, seen)
  const errors = errorField(error, "errors")
  if (Array.isArray(errors)) fields.errors = errors.map((item) => serializeError(item, seen))
  return fields
}

/** Read data properties only: even a thrown Error may carry user-defined accessors. */
function errorField(error: Error, key: string): unknown {
  let current: object | null = error
  while (current !== null) {
    const descriptor = Object.getOwnPropertyDescriptor(current, key)
    if (descriptor) return "value" in descriptor ? descriptor.value : "[Accessor]"
    current = Object.getPrototypeOf(current)
  }
  return undefined
}
