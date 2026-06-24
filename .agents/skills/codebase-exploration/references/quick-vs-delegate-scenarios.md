# Example Scenarios: Quick Exploration → Decision

These examples demonstrate the hybrid reconnaissance pattern in action.

---

## Scenario 1: "Where is user login handled?" ✅ Handle Directly

### Quick Exploration (2 turns)

**Turn 1: Locate entry point**
```bash
$ rg "POST.*login|/login.*route" --max-count=3 --with-filename
src/routes/auth.routes.ts:12:router.post('/login', handleLogin);
src/api/v1/endpoints.ts:45:  { method: 'POST', path: '/auth/login', handler: 'authController.login' }
```

**Turn 2: Check handler implementation**
```bash
$ bunx @ast-grep/cli scan src/routes/auth.routes.ts --pattern 'function handleLogin'
src/routes/auth.routes.ts:25: async function handleLogin(req, res) { ... }

$ rg "validateCredentials|authenticateUser" src/routes/auth.routes.ts --max-count=2
src/routes/auth.routes.ts:27:  const user = await validateCredentials(req.body);
```

### Decision
**✅ Can answer directly**
- Found clear entry point: `src/routes/auth.routes.ts:25`
- Single handler function calls `validateCredentials`
- Bubble is small (2-3 files maximum)
- **Action**: Read auth.routes.ts and proceed with change

---

## Scenario 2: "How does the plugin system work?" ⚠️ Delegate

### Quick Exploration (3 turns)

**Turn 1: Find plugin registration**
```bash
$ rg "PluginRegistry|registerPlugin|PluginManager" --files-with-matches
src/core/plugin-manager.ts
src/core/plugin-registry.ts
src/app.ts
src/plugins/auth/index.ts
src/plugins/logging/index.ts
[12 more plugin files...]
```

**Turn 2: Check plugin interface**
```bash
$ bunx @ast-grep/cli scan src/core/plugin-registry.ts --pattern 'interface IPlugin'
src/core/plugin-registry.ts:15: interface IPlugin {
  name: string;
  version: string;
  init(context: AppContext): Promise<void>;
  execute(event: Event): Promise<void>;
  cleanup(): Promise<void>;
  dependencies?: string[];
}
```

**Turn 3: Count implementing plugins**
```bash
$ fd "index.ts" src/plugins --type=f | wc -l
17

$ rg "implements IPlugin" --count-matches
[Shows 17 plugin implementations across multiple files]
```

### Decision
**⚠️ Delegate to subagent**
- 17 plugins implementing complex interface
- Registration system spans multiple core files
- Dependency chain between plugins (`.dependencies` field)
- Lifecycle management (init → execute → cleanup)
- **Action**: Delegate with Strategy 2 (Architecture Map Report)

**Delegation prompt**:
```
Navigate the codebase to map the plugin system architecture.

Artifact Type: architecture
Exploration Purpose: understand plugin registration and lifecycle

Apply Strategy 2 (Boundary & Registration Tracing) from codebase-exploration skill.

Return discovery report using template: Architecture Map Report
See assets/architecture-map-report.md for structure.

Focus on:
- Registration mechanism (how plugins are discovered and loaded)
- Base contract (IPlugin interface requirements)
- Module lifecycle (init → execute → cleanup flow)
- Dependency management between plugins
```

---

## Scenario 3: "Add a new API endpoint for products" ✅ Handle Directly

### Quick Exploration (3 turns)

**Turn 1: Find similar endpoint**
```bash
$ fd "user" --type=f --extension=ts src/controllers | head -3
src/controllers/user.controller.ts
```

**Turn 2: Check registration pattern**
```bash
$ rg "UserController" src/app.ts --max-count=2 --context=1
src/app.ts:23:import { UserController } from './controllers/user.controller';
src/app.ts:45:app.use('/api/users', new UserController().router);
```

**Turn 3: Verify supporting files**
```bash
$ fd "user" --type=f --extension=ts | grep -E "(service|test|dto)"
src/services/user.service.ts
src/dto/user.dto.ts
tests/user.controller.test.ts
```

### Decision
**✅ Can clone directly (Strategy 3)**
- Clear pattern: Controller + Service + DTO + Test
- Simple registration: `app.use('/api/[resource]', new Controller().router)`
- Existing example to clone from
- **Action**: Copy 4 files, rename User → Product, update registration

---

## Scenario 4: "Migrate from Winston to Pino logger" ⚠️ Delegate

### Quick Exploration (3 turns)

**Turn 1: Find logger usage**
```bash
$ rg "logger\.|from.*winston" --files-with-matches | wc -l
142
```

**Turn 2: Check core logger module**
```bash
$ rg "from.*logger" --count-matches | sort -t: -k2 -nr | head -5
src/utils/logger.ts imported 87 times
src/core/logging/index.ts imported 34 times
src/config/logger.config.ts imported 21 times
```

**Turn 3: Check for direct Winston imports**
```bash
$ rg "from 'winston'|require\('winston'\)" --count-matches | wc -l
23 files import Winston directly
```

### Decision
**⚠️ Delegate to subagent**
- 142 files use logger (massive impact)
- Core module imported 87 times
- 23 files have direct Winston dependency (need to be updated)
- Need dependency graph to plan safe migration path
- **Action**: Delegate with Strategy 4 (Dependency Audit Report)

**Delegation prompt**:
```
Navigate the codebase to audit logger dependencies for Winston → Pino migration.

Artifact Type: code
Exploration Purpose: migration-plan

Apply Strategy 4 (Metadata & Module Auditing) from codebase-exploration skill.

Return discovery report using template: Dependency Audit Report
See assets/dependency-audit-report.md for structure.

Focus on:
- Classify modules by logger dependency depth (direct Winston vs via abstraction)
- Identify leaf modules (can migrate first) vs core modules (migrate last)
- Map side effects (where logger writes to files, sends to services)
- Recommend migration path with phases
```

---

## Scenario 5: "Fix typo in error message" ✅ Handle Directly

### Quick Exploration (1 turn)

**Turn 1: Find the error message**
```bash
$ rg "Authetication failed" --max-count=1 --with-filename
src/middleware/auth.middleware.ts:42:    throw new Error('Authetication failed');
```

### Decision
**✅ Can fix immediately**
- Single file, single line
- No complexity, no architecture to understand
- **Action**: Fix typo directly (no delegation needed)

---

## Scenario 6: "Understand database schema" ⚠️ Delegate (Custom Format)

### Quick Exploration (2 turns)

**Turn 1: Find schema files**
```bash
$ fd "schema|migration" --type=f | head -10
db/migrations/001_create_users.sql
db/migrations/002_create_products.sql
db/migrations/003_add_orders.sql
[15 more migration files...]
src/db/schema.prisma
```

**Turn 2: Check ORM models**
```bash
$ fd "model" --type=f --extension=ts src/models | wc -l
23
```

### Decision
**⚠️ Delegate with custom report format**
- 18+ migrations span unknown time period
- 23 ORM models
- Need to understand current schema state, not full history
- No standard template fits "database schema overview"
- **Action**: Delegate with custom format

**Delegation prompt**:
```
Explore the database schema for this project.

Return a discovery report with:

1. **Current Schema**: Tables/collections with key columns and relationships
2. **ORM Models**: Which models map to which tables, location of model files
3. **Migration State**: Latest migration version, how migrations are run
4. **Indexes & Constraints**: Performance-critical indexes, foreign keys
5. **Seed Data**: How test/dev data is loaded

Format: Markdown with file:line references
Brevity: Medium (< 100 lines)

Focus on current state, not full migration history.
```

---

## Decision Patterns Summary

| Scenario Type | Complexity Indicators | Decision | Strategy |
|---------------|----------------------|----------|----------|
| **Needle in haystack** | Single file/function, clear grep result | ✅ Direct | Quick fix |
| **Simple CRUD pattern** | 3-5 files, clear existing example | ✅ Direct | Strategy 3 (Clone) |
| **Small bubble** | 2-4 files, clear entry/exit | ✅ Direct | Strategy 1 (Bubble) |
| **Plugin/registry system** | >10 modules, registration patterns | ⚠️ Delegate | Strategy 2 (Architecture) |
| **Wide impact change** | >20 files affected, core module | ⚠️ Delegate | Strategy 4 (Dependency) |
| **Unfamiliar architecture** | No clear patterns in 3 turns | ⚠️ Delegate | Strategy 2 (Architecture) |
| **Novel exploration** | No template fits | ⚠️ Delegate | Custom format |

---

## Anti-Patterns (What NOT to Do)

### ❌ Over-exploring when answer is obvious
```bash
# Found the answer in Turn 1:
$ rg "calculateTax" --max-count=1
src/utils/tax.ts:15: function calculateTax(amount: number) { ... }

# DON'T keep exploring:
# - Reading entire tax.ts file "just in case"
# - Checking all imports of tax.ts
# - Mapping tax calculation architecture
# → You already found what you need, stop exploring!
```

### ❌ Trying to handle complex systems directly
```bash
# After 3 turns, you've found:
# - 42 files related to "billing"
# - Complex state machine with 8 states
# - Event-driven architecture with message bus

# DON'T try to read all 42 files
# DON'T try to understand it in the main agent context
# → Delegate to subagent with Strategy 2
```

### ❌ Delegating trivial tasks
```bash
# User asks: "Find the main entry point"
$ rg "^export (default )?function main\(|if __name__ == \"__main__\"" --max-count=1
src/index.ts:1: export default function main() { ... }

# DON'T delegate this to subagent
# → Answer is immediate, no exploration needed
```

---

**Use these patterns to calibrate your delegation decisions.**
