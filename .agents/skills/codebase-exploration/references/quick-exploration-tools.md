# Quick Exploration Tools Reference

**Purpose**: Identify appropriate CLI tools for 2-3 turn reconnaissance based on artifact type.

**Tool Invocation**: Use modern package managers that auto-resolve/fetch tools:
- `bunx <tool>` (Bun)
- `npx <tool>` (npm)
- `uvx <tool>` (uv for Python)
- `pkgx <tool>` (pkgx universal)
- `x <tool>` (x-cmd universal)

Configure all tools for **concise output** (limit results, reduce verbosity).

---

## Tool Selection by Artifact Type

### JavaScript/TypeScript Code
**Structure analysis:**
```bash
# Tree-sitter based structure query
bunx @ast-grep/cli scan --pattern 'function $NAME' --json | head -20

# TypeScript AST extraction
npx ts-morph-cli extract --functions --classes --max-depth=1

# Quick symbol extraction
bunx @volar/language-server symbols <file> --format=compact
```

**Dependency tracing:**
```bash
# ES module imports (concise)
bunx es-module-lexer <file> | head -10

# Dependency tree (shallow)
npm ls --depth=0 --parseable
```

### Python Code
**Structure analysis:**
```bash
# AST-based function/class extraction
uvx ast-dump <file> --filter=FunctionDef,ClassDef --compact

# Symbol extraction
uvx jedi symbols <file> --format=json | head -20

# Dependency tree
uv pip tree --depth=1
```

### Rust Code
**Structure analysis:**
```bash
# Cargo metadata (shallow)
cargo metadata --no-deps --format-version=1

# Symbol extraction via rust-analyzer
pkgx rust-analyzer symbols <file> --format=compact
```

### Go Code
**Structure analysis:**
```bash
# Go package symbols
pkgx gopls symbols <file>

# Dependency graph
go list -m all | head -20
```

### Java/Kotlin Code
**Structure analysis:**
```bash
# JVM bytecode symbols
pkgx javap -public -cp . ClassName | head -30

# Dependency tree
./gradlew dependencies --configuration=runtimeClasspath | head -50
```

### C/C++ Code
**Structure analysis:**
```bash
# Clang AST dump (filtered)
pkgx clang -Xclang -ast-dump=json -fsyntax-only <file> \
  | jq '[.inner[]? | select(.kind=="FunctionDecl" or .kind=="CXXRecordDecl")]' \
  | head -20

# CMake targets
cmake --build . --target help | head -20
```

---

## Universal Tools (Language-Agnostic)

### File Pattern Discovery
```bash
# Fast file search (ripgrep, fd, or native find)
rg --files | rg '<pattern>' | head -10

fd '<pattern>' --max-results=10 --type=f

find . -name '*<pattern>*' -type f | head -10
```

### Content Search (Concise Mode)
```bash
# Ripgrep: max 3 matches per file, no context
rg '<pattern>' --max-count=3 --no-heading --with-filename

# Show only filenames with matches (count)
rg '<pattern>' --files-with-matches --count-matches
```

### Directory Structure Overview
```bash
# Tree with depth limit
tree -L 2 -d  # directories only, 2 levels

# Custom compact view
find . -maxdepth 2 -type d | head -20
```

### LSP Servers (Generic)
**When available for the language, prefer LSP for symbol extraction:**

```bash
# Generic LSP symbol query (requires LSP server running)
pkgx language-server symbols <file> --format=json

# Semantic tokens (types, functions, variables)
pkgx language-server tokens <file> --semantic
```

**Common LSP servers by language:**
- TypeScript: `typescript-language-server`, `volar`
- Python: `pyright`, `jedi-language-server`
- Rust: `rust-analyzer`
- Go: `gopls`
- Java: `jdtls`
- C/C++: `clangd`

**LSP setup note**: Most LSP servers need workspace initialization. If tool invocation fails, fall back to AST parsers or grep.

---

## Tool Selection Decision Tree

```
Artifact Type?
│
├─ Known language (JS/TS/Py/Rust/Go/Java/C++)
│  └─ Try language-specific AST/LSP tool first
│     ├─ Success (< 2 sec, < 50 lines output) → Use it
│     └─ Fail/slow → Fall back to grep/fd
│
├─ Unknown/Mixed language codebase
│  └─ Use universal tools: rg, fd, tree
│
└─ Config/Data files (JSON/YAML/TOML)
   └─ Use jq, yq, toml-cli for structured queries
```

---

## Output Configuration Principles

**All tool invocations should:**
1. **Limit results**: `--max-count`, `--max-results`, `| head -N`
2. **Reduce verbosity**: `--compact`, `--quiet`, `--format=json`
3. **Filter to essentials**: Functions/classes/exports only (no implementation details)
4. **Timeout quickly**: Fail fast if tool takes >5 seconds

**Anti-patterns (avoid these):**
- Reading entire files with `cat`
- Running full builds or type-checks
- Parsing without limits (can hang on huge files)
- Recursive searches without depth limits

---

## Example Quick Exploration Sequence

**Scenario**: "Where is user authentication handled?"

**Turn 1**: File pattern search
```bash
fd auth --type=f --max-results=10
# Output: src/auth/manager.ts, src/middleware/auth.ts, config/auth.json
```

**Turn 2**: Symbol extraction from candidates
```bash
bunx @ast-grep/cli scan src/auth/manager.ts --pattern 'export function $NAME'
bunx @ast-grep/cli scan src/middleware/auth.ts --pattern 'export function $NAME'
# Output: authenticate(), validateToken(), refreshSession()
```

**Turn 3**: Quick grep for entry point
```bash
rg "authenticate\(" --files-with-matches --max-count=1
# Output: src/routes/user.ts, src/api/login.ts
```

**Decision**: Found 3 key files, clear entry point → Can answer directly (no delegation needed)

---

## Troubleshooting

**Tool not found:**
- Ensure package manager is installed (bunx, npx, uvx, pkgx, x-cmd)
- Check network access (tools may need to download on first use)
- Fall back to native Unix tools (grep, find, sed)

**Tool too slow (>5 seconds):**
- Cancel and fall back to simpler tool
- Use file path filtering to reduce scope
- Consider this a signal for delegation (codebase is complex)

**Output too verbose:**
- Add `| head -20` to limit lines
- Use `--quiet` or `--compact` flags
- Switch to `--files-with-matches` mode for grep

---

## References

- [ast-grep](https://ast-grep.github.io/) - Universal AST pattern matching
- [ripgrep](https://github.com/BurntSushi/ripgrep) - Fast content search
- [fd](https://github.com/sharkdp/fd) - Fast file search
- [tree-sitter](https://tree-sitter.github.io/) - Language parsers
- [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) - Editor tooling standard
