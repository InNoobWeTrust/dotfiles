## Navigation Strategies

### Quick Reference: Pick Your Strategy

```
What do you need to do?
│
├── Make a specific change ──────────► Strategy 1: "Logic Bubble" Isolation
│   (fix a bug, add a feature)
│
├── Understand the architecture ─────► Strategy 2: Boundary & Registration Tracing
│   (how does this system work?)
│
├── Add something similar to ────────► Strategy 3: Clone & Mutate
│   what already exists
│
└── Plan a migration or map ─────────► Strategy 4: Metadata & Module Auditing
    the full dependency graph
```

---

**Use when**: You need to make a targeted change (fix a bug, add a feature) and don't need to understand the whole system.

**Report Template**: `assets/logic-bubble-report.md`

### Steps

1. **Find the Entry Point** — where does data or a command enter the flow you care about?
   - Search for route handlers, CLI argument parsers, event listeners, or message handlers related to the feature.
   - Use content search for API endpoints, function names, or error messages.
   ```bash
   rg "function handleLogin" --max-count=1 --with-filename
   ```

2. **Find the Exit Point** — where does the result get output?
   - Trace from the entry point forward: what gets returned, written to disk, sent over the network, or rendered?
   - Look for return statements, API responses, file writes, or UI renders.

3. **Draw the boundary** — everything between entry and exit is your "bubble." Ignore everything outside it.
   - Read only the files and functions in the bubble. Resist the urge to explore beyond.
   - Use AST/LSP symbol extraction to skim files without reading everything.

4. **Make your change** within the bubble. Test at the entry and exit points.

### Example Quick Exploration for Strategy 1

```bash
# Turn 1: Find entry point
rg "POST /api/login" --max-count=1
# → Found in: src/routes/auth.ts:42

# Turn 2: Extract function structure
bunx @ast-grep/cli scan src/routes/auth.ts --pattern 'async function $NAME'
# → Found: handleLogin, refreshToken, logout

# Turn 3: Check what it calls
rg "validateCredentials|authenticateUser" src/routes/auth.ts --max-count=3
# → Calls: src/services/auth.ts:validateCredentials

# Decision: 2 files, clear flow → Can handle directly
```

---

## Strategy 2: Boundary & Registration Tracing

**Use when**: You need to understand the high-level architecture — how modules connect, what the extension points are, how things get wired together.

**Report Template**: `assets/architecture-map-report.md`

### Steps

1. **Find the "Glue" code** — large systems use registration patterns, not direct calls.
   - Search for keywords: `Register`, `Factory`, `Provider`, `Manager`, `Plugin`, `Module`, `Handler`, `Middleware`.
   ```bash
   rg "class \w*Registry|function register\w*" --max-count=5
   ```

2. **Identify the Contract** — find the interface or abstract class that modules must implement.
   - Look at what the registration function accepts. That's the contract.
   - Use LSP go-to-definition or AST queries to inspect the base class/interface.

3. **Map the Lifecycle** — trace when modules are loaded vs. initialized.
   - Search for initialization sequences: `init`, `setup`, `bootstrap`, `configure`.
   - This reveals the true dependency graph (load order = dependency order).
   ```bash
   rg "\.init\(|\.setup\(|\.bootstrap\(" --max-count=10
   ```

4. **Document what you find** using the Architecture Discovery Report template.

### Example Quick Exploration for Strategy 2

```bash
# Turn 1: Find registration system
rg "PluginRegistry|registerPlugin" --files-with-matches
# → Found in: src/core/plugin-registry.ts, src/plugins/*/index.ts

# Turn 2: Check plugin interface
bunx @ast-grep/cli scan src/core/plugin-registry.ts --pattern 'interface Plugin'
# → Interface requires: init(), execute(), cleanup()

# Turn 3: Count implementing plugins
fd plugin --type=d | wc -l
# → 15 plugin directories found

# Decision: Complex plugin system with 15 modules → Delegate deep dive
```

---

## Strategy 3: Clone & Mutate

**Use when**: You need to add something similar to what already exists (new endpoint, new command, new module).

**Report Template**: `assets/clone-pattern-report.md`

### Steps

1. **Find the closest existing example** — search for a feature similar to what you're building.
   ```bash
   fd "user.*controller" --type=f
   ```

2. **Analyze its registration** — how does the existing feature register itself with the system?
   - What files does it touch? What config entries does it need? What interfaces does it implement?

3. **Copy the structure** — duplicate the existing feature's files.

4. **Swap the internal logic** — replace the business logic while keeping the registration boilerplate identical.

5. **Verify registration** — confirm the new module is picked up by the system the same way the original was.

### Example Quick Exploration for Strategy 3

```bash
# Turn 1: Find similar feature
fd "product" --type=f --extension=ts | head -5
# → Found: src/controllers/product.controller.ts, src/services/product.service.ts

# Turn 2: Check registration pattern
rg "ProductController" src/app.ts --max-count=1
# → Pattern: app.use('/products', new ProductController())

# Turn 3: Verify test structure
fd "product" --type=f --extension=test.ts
# → Found: tests/product.test.ts

# Decision: Clear 3-file pattern (controller/service/test) → Can clone directly
```

---

## Strategy 4: Metadata & Module Auditing

**Use when**: Planning a migration, mapping the full dependency graph, or understanding which modules can be changed safely.

**Report Template**: `assets/dependency-audit-report.md`

### Steps

1. **Start with build configuration** — treat `package.json`, `Cargo.toml`, `build.gradle`, `CMakeLists.txt`, etc. as your schematic.
   ```bash
   fd "package.json|Cargo.toml|build.gradle" --max-depth=2
   ```

2. **Classify modules**:
   - **Leaf modules** — no other modules depend on them. Safe to change or migrate first.
   - **Core modules** — many modules depend on them. Change last, with extreme care.
   ```bash
   # Count imports of a module
   rg "from.*core/auth" --count-matches
   ```

3. **Start from the leaves** — migrate or refactor leaf modules first, working inward toward the core.

4. **Map side effects** — identify where code touches databases, APIs, file systems, or external services. These are your risk boundaries.
   ```bash
   rg "fetch\(|axios\.|db\.|fs\." --files-with-matches | head -10
   ```

### Example Quick Exploration for Strategy 4

```bash
# Turn 1: Find module structure
fd "index.ts" --max-depth=2
# → 23 module entry points found

# Turn 2: Check core module dependencies
rg "from.*src/core" --count-matches | sort -t: -k2 -nr | head -5
# → src/core/logger.ts imported 47 times (core module)

# Turn 3: Identify leaf modules
rg "from.*src/utils/date" --count-matches
# → 0 imports (leaf module, safe to change)

# Decision: Complex 23-module system, need full dependency graph → Delegate
```

---

## When to Stop Navigating

Navigation is a means to an end. Once you've identified the files relevant to your task, stop mapping and start working. A complete codebase understanding is rarely needed — just enough to make your change safely.

**Signs you should stop:**
- You've found the entry and exit points for your change (Strategy 1)
- You've mapped the registration contract and can mimic it (Strategy 2/3)
- You've classified modules into leaf vs core (Strategy 4)
- You have enough context to make your change confidently

**Signs you're over-navigating:**
- You're reading files "just in case"
- You've been mapping for longer than the task itself should take
- You're exploring modules unrelated to your change
- You're on your 10th file and still don't know where to make the change -> Time to delegate

---
