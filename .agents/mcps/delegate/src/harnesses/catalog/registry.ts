/** Harness command catalog, argument construction and argv invariants. */
import type { DelegateInput } from "../../protocol/contracts.ts"

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

const join = (parts: string[][]): string[] => parts.flat()

export const HARNESSES: HarnessSpec[] = [
  {
    id: "amp",
    label: "Sourcegraph Amp",
    binaries: ["amp"],
    cwdFlag: null,
    stdinClosed: true,
    promptFlag: "-x",
    modelSupported: false,
    notes:
      "Install as `@ampcode/cli`. Amp documents no model flag, no working-directory flag, and no unattended-approval flag, so tool permissions follow Amp's own saved thread settings.",
    buildArgs: (input) => {
      if (input.model)
        throw new Error("The amp harness documents no model flag; leave 'model' unset.")
      return ["-x", input.prompt]
    },
  },
  {
    id: "agy",
    label: "Antigravity CLI (agy)",
    binaries: ["agy"],
    cwdFlag: null,
    stdinClosed: true,
    promptFlag: "--print",
    modelSupported: true,
    notes:
      "Antigravity CLI print mode. Uses agy's own agent and model catalogue, so `model` takes an agy model id rather than a provider string.",
    buildArgs: (input) => {
      const args: string[] = []
      if (input.agySandbox) args.push("--sandbox")
      if (input.model) args.push("--model", input.model)
      return join([
        args,
        ["--mode", "accept-edits", "--dangerously-skip-permissions", "--print", input.prompt],
      ])
    },
  },
  {
    id: "claude",
    label: "Claude Code",
    binaries: ["claude"],
    cwdFlag: null,
    stdinClosed: true,
    promptFlag: null,
    modelSupported: true,
    notes:
      "Full tool surface (read, edit, shell, web) plus its own MCP servers. Reads `$CLAUDE.md` and the user and project settings of the working directory.",
    buildArgs: (input) => {
      const args = ["-p"]
      if (input.model) args.push("--model", input.model)
      return join([args, [input.prompt]])
    },
  },
  {
    id: "codex",
    label: "OpenAI Codex",
    binaries: ["codex"],
    cwdFlag: "-C",
    stdinClosed: true,
    promptFlag: null,
    modelSupported: true,
    notes:
      "Read-only sandbox by default. Codex refuses to run outside a git repository, so `workdir` should point at one; it also blocks forever if stdin stays an open pipe.",
    buildArgs: (input, workdir) => {
      const args = ["exec", "-C", workdir]
      if (input.model) args.push("--model", input.model)
      return join([args, ["--sandbox", "read-only", input.prompt]])
    },
  },
  {
    id: "crush",
    label: "Charm Crush",
    binaries: ["crush"],
    cwdFlag: "-c",
    stdinClosed: true,
    promptFlag: null,
    modelSupported: true,
    notes: "Crush uses its native permission configuration. It has no JSON output mode.",
    buildArgs: (input, workdir) => {
      const args = ["run", "--quiet", "-c", workdir]
      if (input.model) args.push("--model", input.model)
      return join([args, [input.prompt]])
    },
  },
  {
    id: "cursor",
    label: "Cursor CLI",
    binaries: ["agent", "cursor-agent"],
    cwdFlag: "--workspace",
    stdinClosed: true,
    promptFlag: null,
    modelSupported: true,
    notes:
      "The official installer names the binary `agent`. Workspace trust is enforced in headless runs, so `--trust` is always passed and edits need `--force`.",
    buildArgs: (input, workdir) => {
      const args = ["--trust", "--workspace", workdir, "-p"]
      if (input.model) args.push("--model", input.model)
      return join([args, ["--trust", input.prompt]])
    },
  },
  {
    id: "droid",
    label: "Factory Droid",
    binaries: ["droid"],
    cwdFlag: "--cwd",
    stdinClosed: true,
    promptFlag: null,
    modelSupported: true,
    notes:
      "The npm package is `droid`, not `@factory-ai/droid`. `droid exec` is read-only until `--auto` raises the autonomy level, and it fails fast rather than leaving partial edits.",
    buildArgs: (input, workdir) => {
      const args = ["exec", "--cwd", workdir]
      if (input.model) args.push("--model", input.model)
      return join([args, [input.prompt]])
    },
  },
  {
    id: "gemini",
    label: "Gemini CLI",
    binaries: ["gemini"],
    cwdFlag: null,
    stdinClosed: true,
    promptFlag: "-p",
    modelSupported: true,
    notes:
      "No working-directory flag, so the run uses the server's resolved directory. `-p` reads the token after it as the prompt and rejects a positional prompt alongside it, so the prompt is passed as that value and every other flag comes first. `-p` also appends any piped stdin, so keep the prompt self-contained.",
    buildArgs: (input) => {
      const args: string[] = []
      if (input.model) args.push("-m", input.model)
      return join([args, ["-p", input.prompt]])
    },
  },
  {
    id: "hermes",
    label: "Hermes Agent (Nous Research)",
    binaries: ["hermes"],
    cwdFlag: "--in",
    stdinClosed: true,
    promptFlag: "-z",
    modelSupported: true,
    notes:
      "`-z` is the pure one-shot mode: final answer on stdout, nothing else, and it reads the token after it as the prompt. Installed by script, not npm.",
    buildArgs: (input, workdir) => {
      const args = ["--in", workdir]
      if (input.model) args.push("--model", input.model)
      return join([args, ["-z", input.prompt]])
    },
  },
  {
    id: "kilo",
    label: "Kilo Code",
    binaries: ["kilo", "kilocode"],
    cwdFlag: "--dir",
    stdinClosed: true,
    promptFlag: null,
    modelSupported: true,
    notes: "OpenCode fork using its native permission configuration.",
    buildArgs: (input, workdir) => {
      const args = ["run", "--dir", workdir]
      if (input.model) args.push("--model", input.model)
      return join([args, [input.prompt]])
    },
  },
  {
    id: "opencode",
    label: "OpenCode",
    binaries: ["opencode"],
    cwdFlag: null,
    stdinClosed: true,
    promptFlag: null,
    modelSupported: true,
    notes:
      "OpenCode `run` against the project config, agents, and skills of this workspace, started with `--standalone` so the turn runs in this server's own process group instead of being handed to an already-running OpenCode server that the wall-clock limit could not stop.",
    buildArgs: (input) => {
      const args = ["run", "--standalone"]
      if (input.model) args.push("--model", input.model)
      return join([args, [input.prompt]])
    },
  },
  {
    id: "qwen",
    label: "Qwen Code",
    binaries: ["qwen"],
    cwdFlag: null,
    stdinClosed: true,
    promptFlag: "-p",
    modelSupported: true,
    notes:
      "Gemini CLI fork requiring Node 22+. No working-directory flag. Like Gemini, `-p` takes the prompt as its value rather than as a positional.",
    buildArgs: (input) => {
      const args: string[] = []
      if (input.model) args.push("-m", input.model)
      return join([args, ["-p", input.prompt]])
    },
  },
]

export const harnessById = (id: string): HarnessSpec | undefined =>
  HARNESSES.find((harness) => harness.id === id)

/** Validate final-prompt placement and value-taking prompt flags. */
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

/** Validate one baseline default command per harness before advertising tools. */
export function assertRegistryInvariants(harnesses: readonly HarnessSpec[] = HARNESSES): void {
  for (const spec of harnesses) {
    const input: DelegateInput = { prompt: "registry probe", wallTimeMs: 1 }
    assertArgv(spec, spec.buildArgs(input, "/tmp"), input.prompt)
  }
}

/** Tool description advertised for a detected harness. */
export function toolDescription(spec: HarnessSpec, version: string | null): string {
  const detected = version ? `${spec.label} ${version}` : spec.label
  const cwd = spec.cwdFlag
    ? `Set 'workdir' with \`${spec.cwdFlag}\`; without it the run stays in the server's working directory.`
    : "This harness has no working-directory flag, so the run stays in the server's working directory."
  return [
    `Delegate one non-interactive turn to ${detected} and return its final message.`,
    spec.notes,
    "The harness is a detached process group with stdin closed; a timeout or output overflow kills the whole group and returns the partial output.",
    cwd,
    "Give a complete prompt: the harness sees no other conversation context and cannot ask a follow-up question.",
  ].join(" ")
}
