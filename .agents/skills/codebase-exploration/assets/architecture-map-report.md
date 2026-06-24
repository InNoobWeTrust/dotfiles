# Architecture Discovery: [System/Module Name]

**Purpose**: Map system structure, registration patterns, module relationships  
**Use When**: Understanding architecture, planning refactors, onboarding to new codebase

---

## Core Components
- **Entry Point**: `[main.ts, index.js, __init__.py, etc.]`
- **Core Module**: `[path]` - [Primary responsibility]
- **Architecture Style**: [Monolithic / Microkernel / Plugin-based / Event-driven / Layered]

## Registration System

### Manager/Registry
- **Location**: `[file:line]`
- **Type**: [Factory / Registry / DI Container / Event Bus]

### Base Contract
- **Interface/Class**: `[Name]` at `[file:line]`
- **Required Methods**:
  ```[language]
  methodName(params): returnType // [purpose]
  methodName2(params): returnType // [purpose]
  ```

### Registration Pattern
```[language]
// How modules register themselves:
[Code example showing typical registration]
```

## Module Lifecycle

```
[Phase 1: Discovery]  →  [Phase 2: Init]  →  [Phase 3: Activation]
    ↓                         ↓                      ↓
[What happens]           [What happens]         [What happens]
Files: [list]            Files: [list]          Files: [list]
```

## Dependency Hierarchy

### Core Modules (change last, highest risk)
| Module | Path | Dependents | Primary Role |
|--------|------|------------|--------------|
| [name] | `[path]` | [count] | [What it provides] |

### Mid-tier Modules
| Module | Path | Dependents | Primary Role |
|--------|------|------------|--------------|
| [name] | `[path]` | [count] | [What it provides] |

### Leaf Modules (change first, lowest risk)
| Module | Path | Dependents | Primary Role |
|--------|------|------------|--------------|
| [name] | `[path]` | 0 | [What it provides] |

## Side-Effect Boundaries

### I/O Operations
- **File System**: `[files touching disk]`
- **Network**: `[files making HTTP/socket calls]`
- **Database**: `[files with queries/ORM]`

### State Management
- **Global State**: `[files managing singletons/globals]`
- **Shared State**: `[files with cross-module state]`

### External Integrations
- **Third-party APIs**: [Services and where they're called]
- **Message Queues**: [Pub/sub, where messages are sent/received]

## Architecture Patterns Detected
- **[Pattern Name]** (e.g., Observer, Factory, Middleware):  
  Used in `[files]` for `[purpose]`

## Anomalies & Surprises
[Unexpected patterns, deviations from standard architecture, technical debt]

## Extension Points
[Where new functionality can be added without modifying core]
- **[Extension Point Name]**: `[file:line]` - [How to use]

## Confidence & Gaps
- **Confidence**: [High / Medium / Low]
- **Incomplete Mapping**: [Areas not fully explored]
- **Assumptions**: [What was inferred vs confirmed]

---

**Next Steps**: Use this map to plan changes, identify safe modification zones, or understand feature flow.
