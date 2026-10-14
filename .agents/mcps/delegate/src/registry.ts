import type { DelegateInput, PermissionMode } from "./contracts.ts"

/**
 * A harness the server knows how to drive, independent of whether its binary is
 * installed. `buildArgs` must produce the whole argument vector for one
 * non-interactive run; nothing is ever passed through a shell.
 */
export interface HarnessSpec {
  /** Stable id, also the advertised tool name suffix (`delegate_<id>`). */
  id: string
  /** Human name used in tool descriptions. */
  label: string
  /** Candidate binary names in PATH order; the first match is used. */
  binaries: string[]
  /** Flag that selects the working directory, or null when the harness has none. */
  cwdFlag: string | null
  /**
   * True when the harness must run with stdin closed rather than an inherited
   * pipe. `codex exec` appends piped stdin to the prompt and then blocks on EOF
   * when no writer exists (openai/codex#20919).
   */
  stdinClosed: boolean
  /** Permission modes this harness can express, in ascending authority. */
  permissionModes: PermissionMode[]
  /**
   * Option that takes the prompt as its value, or null when the prompt is a
   * bare trailing positional. `gemini -p` and `hermes -z` read the next token as
   * the prompt, so a flag placed between them and the prompt would be consumed
   * as the prompt text instead. Both arrangements end with the prompt as the
   * final argument; only the preceding token differs.
   */
  promptFlag: string | null
  /**
   * True when the harness accepts a `--model` (or equivalent) flag.
   * `amp` documents no model flag and rejects one outright; all other current
   * harnesses accept a model argument and pass it to their own CLI flag.
   */
  modelSupported: boolean
  /** One-line statement of what the caller can and cannot do with this harness. */
  notes: string
  /** Builds the complete argv, including the prompt as its own argument. */
  buildArgs: (input: DelegateInput, workdir: string) => string[]
}

function permissionFlags(flags: Partial<Record<PermissionMode, string[]>>) {
  const allowed = Object.keys(flags) as PermissionMode[]
  const known = new Set(allowed)
  return (mode: PermissionMode): string[] => {
    if (!known.has(mode)) {
      const list = allowed.map((value) => `'${value}'`).join(", ")
      throw new Error(
        `permissionMode '${mode}' is not available for this harness; it supports ${list}.`,
      )
    }
    return flags[mode] ?? []
  }
}

const join = (parts: string[][]): string[] => parts.flat()

export const HARNESSES: HarnessSpec[] = [
  {
    id: "amp",
    label: "Sourcegraph Amp",
    binaries: ["amp"],
    cwdFlag: null,
    stdinClosed: true,
    permissionModes: ["default"],
    promptFlag: "-x",
    modelSupported: false,
    notes:
      "Install as `@ampcode/cli`. Amp documents no model flag, no working-directory flag, and no unattended-approval flag, so tool permissions follow Amp's own saved thread settings.",
    buildArgs: (input) => {
      if (input.model)
        throw new Error("The amp harness documents no model flag; leave 'model' unset.")
      const permission = permissionFlags({ default: [] })
      permission(input.permissionMode)
      return ["-x", input.prompt]
    },
  },
  {
    id: "agy",
    label: "Antigravity CLI (agy)",
    binaries: ["agy"],
    cwdFlag: null,
    stdinClosed: true,
    permissionModes: ["default", "acceptEdits", "bypassPermissions"],
    promptFlag: "--print",
    modelSupported: true,
    notes:
      "Antigravity CLI print mode. Uses agy's own agent and model catalogue, so `model` takes an agy model id rather than a provider string.",
    buildArgs: (input) => {
      const permission = permissionFlags({
        default: ["--mode", "accept-edits", "--dangerously-skip-permissions"],
        acceptEdits: ["--mode", "accept-edits", "--dangerously-skip-permissions"],
        bypassPermissions: ["--mode", "accept-edits", "--dangerously-skip-permissions"],
      })
      const args: string[] = []
      if (input.agySandbox) args.push("--sandbox")
      if (input.model) args.push("--model", input.model)
      return join([args, permission(input.permissionMode), ["--print", input.prompt]])
    },
  },
  {
    id: "claude",
    label: "Claude Code",
    binaries: ["claude"],
    cwdFlag: null,
    stdinClosed: true,
    permissionModes: ["default", "acceptEdits", "bypassPermissions"],
    promptFlag: null,
    modelSupported: true,
    notes:
      "Full tool surface (read, edit, shell, web) plus its own MCP servers. Reads `$CLAUDE.md` and the user and project settings of the working directory.",
    buildArgs: (input) => {
      const permission = permissionFlags({
        default: [],
        acceptEdits: ["--permission-mode", "acceptEdits"],
        bypassPermissions: ["--dangerously-skip-permissions"],
      })
      const args = ["-p"]
      if (input.model) args.push("--model", input.model)
      return join([args, permission(input.permissionMode), [input.prompt]])
    },
  },
  {
    id: "codex",
    label: "OpenAI Codex",
    binaries: ["codex"],
    cwdFlag: "-C",
    stdinClosed: true,
    permissionModes: ["default", "acceptEdits", "bypassPermissions"],
    promptFlag: null,
    modelSupported: true,
    notes:
      "Read-only sandbox by default. Codex refuses to run outside a git repository, so `workdir` should point at one; it also blocks forever if stdin stays an open pipe.",
    buildArgs: (input, workdir) => {
      const permission = permissionFlags({
        default: ["--sandbox", "read-only"],
        acceptEdits: ["--sandbox", "workspace-write"],
        bypassPermissions: ["--dangerously-bypass-approvals-and-sandbox"],
      })
      const args = ["exec", "-C", workdir]
      if (input.model) args.push("--model", input.model)
      return join([args, permission(input.permissionMode), [input.prompt]])
    },
  },
  {
    id: "crush",
    label: "Charm Crush",
    binaries: ["crush"],
    cwdFlag: "-c",
    stdinClosed: true,
    permissionModes: ["default", "bypassPermissions"],
    promptFlag: null,
    modelSupported: true,
    notes:
      "Crush offers only a full `--yolo` switch, no middle tier, so `acceptEdits` is rejected instead of being quietly upgraded. It has no JSON output mode.",
    buildArgs: (input, workdir) => {
      const permission = permissionFlags({
        default: [],
        bypassPermissions: ["--yolo"],
      })
      const args = ["run", "--quiet", "-c", workdir]
      if (input.model) args.push("--model", input.model)
      return join([args, permission(input.permissionMode), [input.prompt]])
    },
  },
  {
    id: "cursor",
    label: "Cursor CLI",
    binaries: ["agent", "cursor-agent"],
    cwdFlag: "--workspace",
    stdinClosed: true,
    permissionModes: ["default", "acceptEdits", "bypassPermissions"],
    promptFlag: null,
    modelSupported: true,
    notes:
      "The official installer names the binary `agent`. Workspace trust is enforced in headless runs, so `--trust` is always passed and edits need `--force`.",
    buildArgs: (input, workdir) => {
      const permission = permissionFlags({
        default: ["--trust"],
        acceptEdits: ["--trust", "--force"],
        bypassPermissions: ["--trust", "--force"],
      })
      const args = ["--trust", "--workspace", workdir, "-p"]
      if (input.model) args.push("--model", input.model)
      return join([args, permission(input.permissionMode), [input.prompt]])
    },
  },
  {
    id: "droid",
    label: "Factory Droid",
    binaries: ["droid"],
    cwdFlag: "--cwd",
    stdinClosed: true,
    permissionModes: ["default", "acceptEdits", "bypassPermissions"],
    promptFlag: null,
    modelSupported: true,
    notes:
      "The npm package is `droid`, not `@factory-ai/droid`. `droid exec` is read-only until `--auto` raises the autonomy level, and it fails fast rather than leaving partial edits.",
    buildArgs: (input, workdir) => {
      const permission = permissionFlags({
        default: [],
        acceptEdits: ["--auto", "medium"],
        bypassPermissions: ["--auto", "high"],
      })
      const args = ["exec", "--cwd", workdir]
      if (input.model) args.push("--model", input.model)
      return join([args, permission(input.permissionMode), [input.prompt]])
    },
  },
  {
    id: "gemini",
    label: "Gemini CLI",
    binaries: ["gemini"],
    cwdFlag: null,
    stdinClosed: true,
    permissionModes: ["default", "acceptEdits", "bypassPermissions"],
    promptFlag: "-p",
    modelSupported: true,
    notes:
      "No working-directory flag, so the run uses the server's resolved directory. `-p` reads the token after it as the prompt and rejects a positional prompt alongside it, so the prompt is passed as that value and every other flag comes first. `-p` also appends any piped stdin, so keep the prompt self-contained.",
    buildArgs: (input) => {
      const permission = permissionFlags({
        default: [],
        acceptEdits: ["--approval-mode", "auto_edit"],
        bypassPermissions: ["--approval-mode", "yolo"],
      })
      const args: string[] = []
      if (input.model) args.push("-m", input.model)
      return join([args, permission(input.permissionMode), ["-p", input.prompt]])
    },
  },
  {
    id: "hermes",
    label: "Hermes Agent (Nous Research)",
    binaries: ["hermes"],
    cwdFlag: "--in",
    stdinClosed: true,
    permissionModes: ["default", "bypassPermissions"],
    promptFlag: "-z",
    modelSupported: true,
    notes:
      "`-z` is the pure one-shot mode: final answer on stdout, nothing else, and it reads the token after it as the prompt. Hermes has only `--yolo`, no middle tier, so `acceptEdits` is rejected. Installed by script, not npm.",
    buildArgs: (input, workdir) => {
      const permission = permissionFlags({
        default: [],
        bypassPermissions: ["--yolo"],
      })
      const args = ["--in", workdir]
      if (input.model) args.push("--model", input.model)
      return join([args, permission(input.permissionMode), ["-z", input.prompt]])
    },
  },
  {
    id: "kilo",
    label: "Kilo Code",
    binaries: ["kilo", "kilocode"],
    cwdFlag: "--dir",
    stdinClosed: true,
    permissionModes: ["default", "bypassPermissions"],
    promptFlag: null,
    modelSupported: true,
    notes:
      "OpenCode fork. Without `--auto` any denied permission ends the run with exit 1, so an edit mode would be the same command as bypass; only the two honest levels are exposed.",
    buildArgs: (input, workdir) => {
      const permission = permissionFlags({
        default: [],
        bypassPermissions: ["--auto"],
      })
      const args = ["run", "--dir", workdir]
      if (input.model) args.push("--model", input.model)
      return join([args, permission(input.permissionMode), [input.prompt]])
    },
  },
  {
    id: "opencode",
    label: "OpenCode",
    binaries: ["opencode"],
    cwdFlag: null,
    stdinClosed: true,
    permissionModes: ["default", "acceptEdits"],
    promptFlag: null,
    modelSupported: true,
    notes:
      "OpenCode `run` against the project config, agents, and skills of this workspace, started with `--standalone` so the turn runs in this server's own process group instead of being handed to an already-running OpenCode server that the wall-clock limit could not stop. There is no bypass-permissions flag, so `bypassPermissions` is rejected rather than silently downgraded.",
    buildArgs: (input) => {
      const permission = permissionFlags({
        default: [],
        acceptEdits: ["--auto"],
      })
      const args = ["run", "--standalone"]
      if (input.model) args.push("--model", input.model)
      return join([args, permission(input.permissionMode), [input.prompt]])
    },
  },
  {
    id: "qwen",
    label: "Qwen Code",
    binaries: ["qwen"],
    cwdFlag: null,
    stdinClosed: true,
    permissionModes: ["default", "acceptEdits", "bypassPermissions"],
    promptFlag: "-p",
    modelSupported: true,
    notes:
      "Gemini CLI fork requiring Node 22+. No working-directory flag. Unlike Gemini it spells the edit mode `auto-edit` with a hyphen, and `yolo` auto-approves shell and write tools without enabling a sandbox. Like Gemini, `-p` takes the prompt as its value rather than as a positional.",
    buildArgs: (input) => {
      const permission = permissionFlags({
        default: [],
        acceptEdits: ["--approval-mode", "auto-edit"],
        bypassPermissions: ["--approval-mode", "yolo"],
      })
      const args: string[] = []
      if (input.model) args.push("-m", input.model)
      return join([args, permission(input.permissionMode), ["-p", input.prompt]])
    },
  },
]

export const harnessById = (id: string): HarnessSpec | undefined =>
  HARNESSES.find((harness) => harness.id === id)

const ALL_PERMISSION_MODES: PermissionMode[] = ["default", "acceptEdits", "bypassPermissions"]

/**
 * Fail at startup rather than on first use when a registry entry is malformed.
 * The tests cover the same invariants, but only the tests run in a review; this
 * runs before any tool is advertised, so a bad edit to this file stops the
 * server instead of quietly misbuilding argv for a real delegated turn.
 *
 * Checks per harness and permission mode: the prompt is the final argument, a
 * value-taking prompt flag is present exactly once and sits immediately before
 * it, and the modes `buildArgs` accepts are exactly the ones the entry advertises.
 */
export function assertArgv(spec: HarnessSpec, argv: string[], prompt: string): void {
  if (argv[argv.length - 1] !== prompt) {
    throw new Error(`Harness '${spec.id}' does not pass the prompt as the final argument.`)
  }
  if (spec.promptFlag === null) return
  const at = argv.indexOf(spec.promptFlag)
  if (at === -1) {
    throw new Error(`Harness '${spec.id}' omits its prompt flag '${spec.promptFlag}'.`)
  }
  if (at !== argv.length - 2) {
    throw new Error(
      `Harness '${spec.id}' must place '${spec.promptFlag}' immediately before the prompt.`,
    )
  }
  if (argv.indexOf(spec.promptFlag, at + 1) !== -1) {
    throw new Error(
      `Harness '${spec.id}' repeats '${spec.promptFlag}', which would leave an option between it and the prompt.`,
    )
  }
}

/**
 * Refuse a registry that would misbuild a command line, before any real turn
 * runs. This probes each entry with a model-less input; because a builder can
 * behave differently once a model is supplied, `server.ts` re-runs
 * {@link assertArgv} against the actual arguments of every call as well.
 */
export function assertRegistryInvariants(harnesses: readonly HarnessSpec[] = HARNESSES): void {
  for (const spec of harnesses) {
    for (const permissionMode of ALL_PERMISSION_MODES) {
      const input: DelegateInput = {
        prompt: "registry probe",
        permissionMode,
        wallTimeMs: 1,
      }
      const listed = spec.permissionModes.includes(permissionMode)
      let argv: string[]
      try {
        argv = spec.buildArgs(input, "/tmp")
      } catch {
        if (listed) {
          throw new Error(
            `Harness '${spec.id}' advertises permissionMode '${permissionMode}' but buildArgs rejects it.`,
          )
        }
        continue
      }
      if (!listed) {
        throw new Error(
          `Harness '${spec.id}' accepts permissionMode '${permissionMode}' without advertising it.`,
        )
      }
      assertArgv(spec, argv, input.prompt)
    }
  }
}

/** Tool description advertised for a detected harness. */
export function toolDescription(spec: HarnessSpec, version: string | null): string {
  const detected = version ? `${spec.label} ${version}` : spec.label
  const modes = spec.permissionModes.map((mode) => `'${mode}'`).join(", ")
  const cwd = spec.cwdFlag
    ? `Set 'workdir' with \`${spec.cwdFlag}\`; without it the run stays in the server's working directory.`
    : "This harness has no working-directory flag, so the run stays in the server's working directory."
  return [
    `Delegate one non-interactive turn to ${detected} and return its final message.`,
    spec.notes,
    "The harness is a detached process group with stdin closed; a timeout or output overflow kills the whole group and returns the partial output.",
    cwd,
    `'permissionMode' accepts ${modes}.`,
    "Give a complete prompt: the harness sees no other conversation context and cannot ask a follow-up question.",
  ].join(" ")
}
