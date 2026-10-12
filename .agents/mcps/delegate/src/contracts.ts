import { z } from "zod@4"

/** Largest prompt accepted, measured in UTF-8 bytes of the single argv element. */
export const MAX_PROMPT_BYTES = 65_536

export const DEFAULT_WALL_TIME_MS = 900_000
export const MAX_WALL_TIME_MS = 7_200_000
export const DEFAULT_MAX_OUTPUT_BYTES = 4_194_304
export const MAX_OUTPUT_BYTES = 33_554_432

/**
 * Authority granted to the delegated harness, mapped per harness to its own flag.
 * `default` passes no permission flag at all, so the harness keeps its own
 * non-interactive behaviour (read-only or tool-denying on most CLIs).
 */
export const permissionModeSchema = z
  .enum(["default", "acceptEdits", "bypassPermissions"])
  .describe(
    "Authority granted to the delegated harness. 'default' (no permission flag) keeps the harness's own non-interactive policy and is not read-only isolation; 'acceptEdits' lets it apply file edits unattended; 'bypassPermissions' drops all approval prompts for every tool and requires explicit human permission. Higher modes execute whatever the prompt asks for, so scope the prompt instead of escalating this.",
  )

export type PermissionMode = z.infer<typeof permissionModeSchema>

const positiveInt = (max: number) => z.number().int().positive().max(max)

/**
 * A leading `-` would be parsed by the harness CLI as an option rather than as
 * the value it was meant to be. `claude -p --version` prints a version and exits
 * 0 without running the task, and `qwen -p -m --yolo …` turns a model id into
 * an approval bypass. No legitimate prompt or model identifier starts with a
 * dash, so both are refused up front instead of relying on every supported CLI
 * to treat them literally.
 */
const notAnOption = (value: string): boolean => !value.startsWith("-")

const optionSafe = (label: string) => ({
  message: `${label} must not start with '-': the harness CLI would read it as an option rather than as the value. No supported CLI takes an end-of-options delimiter for the prompt, so the text has to start with a letter, a digit, or a space — a leading space is invisible to the harness and keeps a bullet list or diff intact.`,
})

/**
 * One schema shared by every advertised tool. Harnesses that cannot honour a
 * field ignore it; the registry records which capabilities each one supports so
 * the tool description can say so before the call.
 */
export const delegateInputSchema = {
  prompt: z
    .string()
    .min(1)
    .refine(notAnOption, optionSafe("prompt"))
    .describe(
      "Complete, self-contained instructions for the external AI subagent: the goal, necessary context, allowed actions, exact paths, acceptance criteria, and output format. No parent conversation, follow-up, or resumable session is supplied. Passed literally as one argv element that is not interpreted by a shell; it allows at most 64 KiB of UTF-8 bytes, cannot start with '-', and text that looks like shell syntax is passed through unchanged.",
    ),
  workdir: z
    .string()
    .optional()
    .describe(
      "Absolute directory the harness runs in; it supplies the working directory, not filesystem isolation. Defaults to this session's MCP root when the client exposes one, otherwise the server's working directory.",
    ),
  model: z
    .string()
    .min(1)
    .refine(notAnOption, optionSafe("model"))
    .optional()
    .describe(
      "Harness-native model identifier or alias. Leave unset to use that harness's configured default. An empty inspected model list does not mean the harness has no models. Must not start with '-'.",
    ),
  permissionMode: permissionModeSchema
    .default("default")
    .describe(
      "Authority granted to the delegated harness. 'default' (no permission flag) keeps the harness's own non-interactive policy and is not read-only isolation; 'acceptEdits' lets it apply file edits unattended; 'bypassPermissions' drops all approval prompts for every tool and requires explicit human permission. Higher modes execute whatever the prompt asks for, so scope the prompt instead of escalating this. Defaults to 'default'.",
    ),
  wallTimeMs: positiveInt(MAX_WALL_TIME_MS)
    .default(DEFAULT_WALL_TIME_MS)
    .describe(
      "Wall-clock limit for the whole delegated turn, including model latency. Default 900000 (15 min), maximum 7200000 (2 h). On expiry the harness process group is killed and partial output is returned.",
    ),
  maxOutputBytes: positiveInt(MAX_OUTPUT_BYTES)
    .default(DEFAULT_MAX_OUTPUT_BYTES)
    .describe(
      "Combined stdout+stderr byte budget. Default 4194304 (4 MiB), maximum 33554432 (32 MiB). Exceeding it kills the process group and returns the truncated prefix.",
    ),
} satisfies Record<string, z.ZodType>

export const delegateInput = z.object(delegateInputSchema).strict()
export type DelegateInput = z.infer<typeof delegateInput>

/**
 * Input for the `delegate_run` tool: all delegateInput fields plus a stable
 * harness registry ID selected from `delegate_status`.
 */
export const delegateRunSchema = delegateInput.extend({
  harness: z
    .string()
    .min(1)
    .describe(
      "External subagent CLI ID from delegate_status. Prefer 'agy' when configured and suitable for the independent task; use another configured worker or native subagent when the required capability is unavailable. This selects a CLI worker, not a model.",
    ),
})
export type DelegateRunInput = z.infer<typeof delegateRunSchema>

export const delegateOutputSchema = z
  .object({
    ok: z.boolean().describe("True only when the harness exited 0 within every limit."),
    harness: z.string().describe("Harness id that ran, e.g. 'claude'."),
    executable: z.string().describe("Absolute path of the binary that was executed."),
    exitCode: z.number().int().nullable().describe("Exit status, or null when killed by a signal."),
    signal: z
      .string()
      .nullable()
      .describe("Terminating signal name, or null when the process exited."),
    stop: z
      .enum(["exited", "wall_time", "output_limit", "spawn_failed"])
      .describe("Why the run ended. Any value other than 'exited' is a budget or launch failure."),
    timedOut: z.boolean().describe("True when the wall-clock limit killed the run."),
    truncated: z.boolean().describe("True when the output budget stopped collection early."),
    stdout: z.string().describe("Captured standard output."),
    stderr: z.string().describe("Captured standard error."),
    durationMs: z.number().int().nonnegative().describe("Wall-clock time the harness consumed."),
    workdir: z.string().describe("Resolved working directory the harness ran in."),
    argv: z.array(z.string()).describe("Exact argument vector, prompt redacted."),
    promptBytes: z
      .number()
      .int()
      .nonnegative()
      .describe("Size of the prompt argument in UTF-8 bytes."),
    depth: z.number().int().nonnegative().describe("Delegation depth of this call, 0 at the top."),
  })
  .strict()

export type DelegateOutput = z.infer<typeof delegateOutputSchema>

export const statusOutputSchema = z
  .object({
    ok: z.boolean().describe("True when at least one harness is advertised."),
    harnesses: z
      .array(
        z
          .object({
            id: z.string().describe("External subagent CLI ID to pass as delegate_run.harness."),
            executable: z.string().describe("Absolute path of the detected binary."),
            version: z
              .string()
              .nullable()
              .describe("Reported version string, or null when probing failed."),
            readiness: z
              .literal("configured")
              .describe("Readiness state; always 'configured' for advertised harnesses."),
            reason: z
              .string()
              .describe("Human-readable explanation of the readiness state, credential-free."),
            models: z
              .array(z.string())
              .describe(
                "Inspected harness-native model selectors; OpenCode uses provider/model[#variant]. An empty list means no verified model allowlist, not no models. Check modelSupported before setting a model.",
              ),
            permissionModes: z
              .array(permissionModeSchema)
              .describe("Permission modes this harness accepts, in ascending authority."),
            modelSupported: z
              .boolean()
              .describe(
                "True when the harness accepts a model flag; false when it ignores or rejects one (e.g. amp).",
              ),
            depth: z
              .number()
              .int()
              .nonnegative()
              .describe("Depth available to this harness in the current chain."),
          })
          .strict(),
      )
      .describe(
        "External AI subagents in the current status snapshot, in advertisement order; refresh:true returns the re-inspected list.",
      ),
    unsupported: z
      .array(
        z
          .object({
            id: z.string().describe("Harness id that was checked."),
            executable: z
              .string()
              .nullable()
              .describe("Absolute path of the binary, or null when not found on PATH."),
            readiness: z
              .enum(["missing", "not_configured", "unknown"])
              .describe(
                "Why this CLI is unavailable as an external subagent: missing, not configured, or unknown.",
              ),
            reason: z.string().describe("Human-readable explanation, credential-free."),
          })
          .strict(),
      )
      .describe("Supported harnesses that were not advertised, with the reason."),
    maxDepth: z
      .number()
      .int()
      .nonnegative()
      .describe("Deepest delegation chain this server permits."),
    depth: z
      .number()
      .int()
      .nonnegative()
      .describe("This server's own depth in the delegation chain."),
  })
  .strict()

export type StatusOutput = z.infer<typeof statusOutputSchema>

/**
 * Every tool answers with this envelope: `data` when the call produced a result,
 * `error` when it was refused or failed. Both members are optional because the
 * client validates the response against this schema before handing it back, and
 * a half-filled envelope would be rejected as a protocol error instead of
 * reported as the failure it actually is.
 */
export function resultEnvelope<T extends z.ZodType>(data: T) {
  return z.object({
    ok: z.boolean().describe("True when the tool produced a result, false when it failed."),
    data: data.optional().describe("Result payload; absent on failure."),
    error: z.string().optional().describe("Why the call failed; absent on success."),
  })
}
