# Modern CLI and TUI Stacks

Standard reference for selecting terminal user interface (TUI), interactive prompt, command-line argument parsing, schema validation, and terminal styling libraries across modern programming languages. Greenfield defaults; preserve existing repository standards.

## The 5 Architectural Roles in Terminal Applications

Terminal applications vary in UX complexity. Distinguish between these five architectural concerns before selecting dependencies:

1. **Full-Screen TUI:** Alternate terminal screen buffer, full control over cursor/drawing, widget tree, event-driven reactive loops, mouse support (e.g., dashboards, process monitors, file managers).
2. **Interactive Prompts / Wizards (Inline CLI):** Scrolling standard output with in-place step forms, select menus, confirms, and spinners (e.g., project generators, setup wizards like `npm create`).
3. **CLI / Argument Parser:** Subcommands, flags, positional options, automatic help page generation, and shell auto-completion.
4. **Schema & DTO Validation:** Type coercion, structural assertion, environment variable parsing, and domain argument boundaries.
5. **Console Styling & Pretty-Printing:** ANSI colors, Unicode box-drawing, formatted tables, syntax highlighting, and progress bars.

---

## Cross-Language Recommendation Matrix

| Language | Full-Screen TUI | Inline Prompts / Wizards | CLI Argument Parser | Schema & DTO Validation | Console Styling & Output |
|---|---|---|---|---|---|
| **TypeScript / Bun / Node** | **OpenTUI** (verify runtime compatibility) / Ink | **@clack/prompts** | **Commander** / citty | **Zod** / Valibot | **Chalk** / picocolors / cli-table3 |
| **Python (`uv` / `pixi`)** | **Textual** | InquirerPy | **Typer** | **Pydantic v2** / explicit parser/domain checks | **Rich** |
| **Rust** | **Ratatui** | **inquire** | **clap** (derive) | **Serde** + **validator** | **owo-colors** + comfy-table + indicatif |
| **Go** | **Bubble Tea** | **Huh?** | **Cobra** / kong | **go-playground/validator** | **Lip Gloss** + Bubbles / pterm |
| **C# (.NET 8/9+)** | **Terminal.Gui** | **Spectre.Console** | **Spectre.Console.Cli** | **FluentValidation** | **Spectre.Console** |
| **Zig** | **Vaxis** | stdlib / vaxis | **cova** / zig-clap | Comptime struct types | Vaxis cell styling |

---

## Language Ecosystems

### 1. TypeScript & JavaScript (Bun & Node.js)

- **Full-Screen TUI:**
  - **OpenTUI** (`@opentui/core`, `@opentui/react`, `@opentui/solid`): Zig-powered native rendering engine with React and Solid reconcilers. High-framerate rendering, flexbox layout, and WebGPU/Three.js support. Favored for performance-intensive terminal apps (e.g., OpenCode). Before selecting it, verify the selected release's [runtime and platform requirements](https://github.com/anomalyco/opentui/tree/main/packages/core#runtime-and-platform-support), including Node ESM/FFI requirements; do not assume compatibility with Node LTS.
  - **Ink** (`ink`): The established React-for-CLI framework. Mature component ecosystem (`ink-text-input`, `ink-spinner`). Prefer it when retaining the Node LTS baseline; verify the selected release's compatibility.
- **Interactive Prompts & Step Wizards:**
  - **`@clack/prompts`**: Modern gold standard for setup wizards (used by Vite, Astro, Biome). Elegant Unicode borders, spinners, multi-select, and text inputs without alternate-buffer takeover.
- **CLI / Argument Parser:**
  - **Commander** (`commander`): Industry standard, robust subcommands and options.
  - **citty** (Unjs) / **cac**: Modern, lightweight, strongly-typed alternative.
- **Schema & Validation:**
  - **Zod** (`zod`): Universal TypeScript runtime schema validator for CLI args and env vars.
  - **Valibot** (`valibot`): Modular, tree-shakeable alternative for ultra-small bundle sizes.
- **Styling & Output:**
  - **Chalk** (`chalk`): Feature-rich ANSI color formatting.
  - **picocolors**: Zero-dependency, ultra-fast color library for build tools and minimal CLIs.
  - **cli-table3** + **boxen**: Structured tables and border boxes.

### 2. Python (with `uv` / `pixi`)

- **Full-Screen TUI:**
  - **Textual** (`textual`): Undisputed Python standard. Async event loop, CSS-driven widget styling, reactive properties, DOM tree, mouse and keyboard event handling.
- **Interactive Prompts:**
  - **InquirerPy** or Textual inline mode: Clean arrow-key prompt selection and input validation.
- **CLI / Argument Parser:**
  - **Typer** (`typer`): Type-hint-based CLI builder powered by Click. Automatically integrates with Rich for colorful, structured `--help` pages.
- **Schema & Validation:**
  - **Pydantic v2** (`pydantic`): Fast C++/Rust-backed validation for complex argument structures, environment configuration (`pydantic-settings`), and external DTOs.
  - Standard library `dataclass` / `TypedDict` for already-validated internal lightweight records. Neither enforces annotated types or coerces external input at runtime; use Pydantic or explicit parser/domain checks for boundary validation.
- **Styling & Pretty-Printing:**
  - **Rich** (`rich`): Universal terminal presentation library: syntax highlighting, tables, markdown rendering, progress bars, and rich traceback formatting.

### 3. Rust (Cargo)

- **Full-Screen TUI:**
  - **Ratatui** (`ratatui`): Community fork and successor to `tui-rs`. Modular backend support (`crossterm`, `termion`), layout constraints, widget hierarchy, and high rendering performance.
- **Interactive Prompts:**
  - **inquire** (`inquire`): Modern, zero-flicker terminal prompts: text, select, multi-select, confirm, date, password, and autocompletion.
- **CLI / Argument Parser:**
  - **clap** (with `derive` feature): De facto Rust standard. Type-safe struct attributes define subcommands, flags, value parsers, and generate shell completions.
- **Schema & Validation:**
  - **Serde** (`serde`, `serde_json`, `toml`): Standard serialization/deserialization framework.
  - **validator**: Derive macro for validating struct fields (ranges, lengths, patterns).
- **Styling & Output Formatting:**
  - **owo-colors**: Zero-allocation compile-time and runtime ANSI styling.
  - **comfy-table**: Dynamic terminal width detection and table formatting with automatic cell wrapping.
  - **indicatif**: Thread-safe progress bars and spinners.
  - **miette**: Compiler-grade diagnostics and error reporting with source code highlights.

### 4. Go (Go Modules)

- **Full-Screen TUI:**
  - **Bubble Tea** (`charmbracelet/bubbletea`): Functional Elm architecture (Model, Update, View) for the terminal. Powers `gh` (GitHub CLI), `glow`, and `mods`.
- **Interactive Prompts & Forms:**
  - **Huh?** (`charmbracelet/huh`): Modern, accessible form and prompt library with multi-step workflows.
- **CLI / Argument Parser:**
  - **Cobra** (`spf13/cobra`): Enterprise and cloud-native standard (Kubernetes, Hugo, Docker).
  - **kong** (`alecthomas/kong`): Modern struct-tag-based parser for smaller, cleaner tools.
- **Schema & Validation:**
  - **go-playground/validator** (`v10`): Declarative struct tag validation.
  - **caarlos0/env**: Typed environment variable binding.
- **Styling & Output Formatting:**
  - **Lip Gloss** (`charmbracelet/lipgloss`): Declarative CSS-like terminal layout and style definitions (margins, paddings, borders, colors).
  - **Bubbles** (`charmbracelet/bubbles`): Pre-built Charm components (spinners, viewports, progress bars, text areas).
  - **pterm** (`pterm/pterm`): Comprehensive console output library (Rich equivalent for Go).

### 5. Modern C# (.NET 8/9+)

- **Unified Console Powerhouse:**
  - **Spectre.Console** (`Spectre.Console` + `Spectre.Console.Cli`): Standard for modern .NET CLI tools. Combines Rich-like styling, tables, trees, progress bars, spinners, interactive selection prompts, and strongly-typed command-line parsing.
- **Full-Screen TUI:**
  - **Terminal.Gui** (`gui.cs`): Multi-window console application framework with menus, dialogs, and mouse support.
- **Schema & Validation:**
  - **FluentValidation**: Strongly-typed business validation rules for C# records and DTOs.

### 6. Zig

- **Full-Screen TUI:**
  - **Vaxis** (`vaxis` / `libvaxis`): High-performance Zig TUI engine supporting Kitty keyboard protocol, truecolor, and modern terminal graphics.
- **CLI / Argument Parser:**
  - **cova** or **zig-clap**: Declarative compile-time argument and option parsing.
- **Schema & Validation:**
  - Compile-time types (`comptime`) and `std.json`.

---

## UX Decision Guide

1. **Simple single-action script or filter?**
   - Use standard CLI parsing (Commander / Typer / clap / Cobra) + basic styling (Chalk / Rich / owo-colors / Lip Gloss).
   - Write to standard output; preserve pipeability (disable ANSI colors when `!stdout.isTTY`).
2. **Setup wizard, interactive generator, or configuration CLI?**
   - Use inline prompts (`@clack/prompts` / InquirerPy / `inquire` / `Huh?`).
   - Keep interactions in standard scrollback; avoid taking over the full terminal window.
3. **Real-time monitor, dashboard, interactive editor, or debugger?**
   - Use full-screen TUI (OpenTUI / Textual / Ratatui / Bubble Tea).
   - Use the alternate screen buffer, handle window resize signals (`SIGWINCH`), and clean up the terminal state on exit.
