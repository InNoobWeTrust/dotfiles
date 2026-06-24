# Dependency Audit: [Module/System Name]

**Purpose**: Map dependency graph, classify modules by risk, plan safe migration path  
**Use When**: Migrations, refactors, impact analysis, understanding module relationships

---

## Module Classification

### Leaf Modules (Safe to change first - nothing depends on them)
| Module | Path | Imports From | Reason |
|--------|------|--------------|--------|
| [name] | `[path]` | [list] | No reverse dependencies found |

### Mid-tier Modules (Moderate risk)
| Module | Path | Dependent Count | Key Dependents |
|--------|------|-----------------|----------------|
| [name] | `[path]` | [N] | [Module1, Module2] |

### Core Modules (Change last - high risk, many dependents)
| Module | Path | Dependent Count | What Breaks If Changed |
|--------|------|-----------------|------------------------|
| [name] | `[path]` | [N] | [Impact description] |

## Import Graph

```
[Text-based dependency graph showing key relationships]

Core Module A
├── Mid-tier Module B
│   ├── Leaf Module D
│   └── Leaf Module E
└── Mid-tier Module C
    └── Leaf Module F
```

### Circular Dependencies (if any)
- `[Module A]` ↔ `[Module B]` via `[what is imported]`
  - **Risk**: [Why this is problematic]
  - **Break Point**: [How to resolve the cycle]

## Side-Effect Catalog

### Database Access
| File | Tables/Collections | Type of Access |
|------|-------------------|----------------|
| `[file]` | [table names] | [read/write/migrate] |

### File System
| File | Paths Accessed | Type of Access |
|------|----------------|----------------|
| `[file]` | [directories/files] | [read/write/delete] |

### Network I/O
| File | Endpoints | Purpose |
|------|-----------|---------|
| `[file]` | [URLs/services] | [API calls/webhooks/etc.] |

### Global State
| File | State Modified | Scope |
|------|----------------|-------|
| `[file]` | [variable/singleton] | [global/process/thread] |

## Migration Path Recommendation

### Phase 1: Low Risk (Start Here)
**Modules**: [List leaf modules]  
**Rationale**: No reverse dependencies, isolated changes  
**Estimated Effort**: [Time estimate]  
**Testing**: [Which tests to run]

### Phase 2: Medium Risk
**Modules**: [List mid-tier modules]  
**Rationale**: Limited dependents, manageable impact  
**Dependencies**: Must complete Phase 1 first  
**Estimated Effort**: [Time estimate]  
**Testing**: [Which tests to run]

### Phase 3: High Risk (Do Last)
**Modules**: [List core modules]  
**Rationale**: Many dependents, system-wide impact  
**Dependencies**: Must complete Phases 1 & 2 first  
**Estimated Effort**: [Time estimate]  
**Testing**: Full regression test suite required

## Testing Boundaries

### Unit Test Coverage
- **Existing**: `[test files]` cover `[modules]`
- **Missing**: `[modules without tests]`

### Integration Test Points
- **Critical Paths**: [Where to add integration tests]
- **API Contracts**: [Endpoints/interfaces to verify]

### Recommended Test Strategy
1. [Test type]: [What to test] → [Why it's important]
2. [Test type]: [What to test] → [Why it's important]

## Build/Deploy Dependencies

### Build Order
```
[Build stage 1] → [Build stage 2] → [Build stage 3]
Files: [list]     Files: [list]     Files: [list]
```

### Runtime Dependencies
- **Required Services**: [Databases, APIs, etc.]
- **Environment Config**: [Required env vars]
- **Deployment Order**: [If services must deploy in sequence]

## Risk Assessment

### High-Risk Change Patterns
- **[Pattern]**: Changing `[files]` will impact `[N]` modules
- **[Pattern]**: Breaking API contracts in `[files]`

### Safe Change Zones
- **[Pattern]**: These files can be freely modified: `[list]`

## Confidence & Gaps
- **Confidence**: [High / Medium / Low]
- **Dynamic Dependencies**: [Runtime-loaded modules not captured]
- **Test Coverage Gaps**: [Areas with insufficient tests]
- **Unknown Risks**: [What might be missed]

---

**Next Steps**: Start with Phase 1 leaf modules, verify with tests, work inward toward core.
