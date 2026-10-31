/** Host sandbox schemas, resource budgets and wire output types; no launch or process effects. */
import { z } from "zod@4"
import path from "node:path"

export type SandboxMode = "ro" | "pure" | "rw"
const positiveInteger = z.number().int().positive().max(Number.MAX_SAFE_INTEGER)
const limitsObjectSchema = z
  .object({
    wallTimeMs: positiveInteger
      .max(2147483647)
      .describe("Elapsed milliseconds, including setup; default 120000."),
    cpuSeconds: positiveInteger.describe(
      "Per-process soft CPU seconds; default 60, not aggregate or elapsed time.",
    ),
    cpuHardSeconds: positiveInteger.describe(
      "Per-process hard CPU seconds; default 120, must be at least cpuSeconds.",
    ),
    maxFileBytes: positiveInteger
      .multipleOf(1024)
      .describe("Per-file bytes; default 104857600, not a total storage quota."),
    maxOpenFiles: positiveInteger.describe("Per-process file descriptors; default 256."),
    coreBytes: z
      .number()
      .int()
      .nonnegative()
      .max(Number.MAX_SAFE_INTEGER)
      .multipleOf(1024)
      .describe("Core-file bytes; default 0 (disabled)."),
    maxProcesses: positiveInteger
      .optional()
      .describe("Optional user-wide process ceiling; existing user processes count. No default."),
    addressSpaceBytes: positiveInteger
      .multipleOf(1024)
      .optional()
      .describe(
        "Optional Linux-only per-process virtual address-space bytes, not physical RAM. No default; can break runtime reservations.",
      ),
  })
  .strict()
export const limitsSchema = limitsObjectSchema.refine(
  (value) => value.cpuSeconds <= value.cpuHardSeconds,
  "cpuSeconds must not exceed cpuHardSeconds",
)
export type ResourceLimits = z.infer<typeof limitsSchema>
export const defaultLimits: ResourceLimits = {
  wallTimeMs: 120000,
  cpuSeconds: 60,
  cpuHardSeconds: 120,
  maxFileBytes: 100 * 1024 * 1024,
  maxOpenFiles: 256,
  coreBytes: 0,
}
export const inputSchema = {
  command: z.string().min(1).describe("Shell command to execute inside the sandbox"),
  workdir: z
    .string()
    .refine(path.isAbsolute, "workdir must be absolute")
    .optional()
    .describe(
      "Absolute working directory. Defaults to a single MCP directory root, otherwise the inferred server launch directory. Multiple roots require this argument.",
    ),
  limits: limitsObjectSchema
    .partial()
    .optional()
    .describe(
      "Invocation-only resource overrides. Investigate failures and obtain human permission before raising defaults. " +
        "Milliseconds: wallTimeMs. Bytes: maxFileBytes/coreBytes (multiples of 1024), addressSpaceBytes (Linux only, multiple of 1024). " +
        "CPU seconds: cpuSeconds/cpuHardSeconds. Counts: maxOpenFiles, optional maxProcesses (user-wide, not command-tree). " +
        "Output volume has no limit: complete streams are always retained in the private cache.",
    ),
}

export const outputSchema = {
  exitCode: z
    .number()
    .int()
    .nullable()
    .describe("Sandbox process exit code; null if execution could not complete."),
  stdoutPath: z
    .string()
    .nullable()
    .describe(
      "Complete raw standard output in the private cache; null only when capture setup failed.",
    ),
  stderrPath: z
    .string()
    .nullable()
    .describe(
      "Complete raw standard error in the private cache; null only when capture setup failed.",
    ),
  stdoutBytes: z.number().int().nonnegative().describe("Raw stdout bytes retained in cache."),
  stderrBytes: z.number().int().nonnegative().describe("Raw stderr bytes retained in cache."),
  stdout: z.string().describe("Bounded standard output preview; raw bytes live at stdoutPath."),
  stderr: z.string().describe("Bounded standard error preview; raw bytes live at stderrPath."),
  workdir: z
    .string()
    .nullable()
    .describe("Resolved working directory; null if directory discovery failed."),
  workdirSource: z.string().nullable(),
  error: z.string().optional().describe("Sandbox setup or execution error, not command stderr."),
  restrictionHint: z
    .string()
    .optional()
    .describe("Possible restriction guidance; not a confirmed diagnosis."),
  limits: limitsSchema
    .optional()
    .describe("Selected invocation budget; inherited OS ceilings may prevent application."),
  limitsApplied: z
    .boolean()
    .optional()
    .describe(
      "Launcher confirmed that requested OS limits were installed before sandbox execution.",
    ),
  termination: z.enum(["exited", "signal", "timeout", "setup_error", "execution_error"]).optional(),
  signal: z
    .string()
    .nullable()
    .optional()
    .describe("Observed process termination signal; never inferred from exit code alone."),
  truncated: z.object({ stdout: z.boolean(), stderr: z.boolean() }).optional(),
}
export type SandboxOutput = z.infer<z.ZodObject<typeof outputSchema>>
export type ExecutionOutput = Omit<SandboxOutput, "workdir" | "workdirSource">
