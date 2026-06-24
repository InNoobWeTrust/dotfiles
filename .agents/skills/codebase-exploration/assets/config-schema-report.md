# Config Schema Discovery: [Config System Name]

**Purpose**: Map configuration structure, loading mechanism, change impact  
**Use When**: Configuration changes, environment setup, understanding system behavior

---

## Config Files

### Primary Config
- **Location**: `[path/to/config.json]`
- **Format**: [JSON / YAML / TOML / .env / INI]
- **Schema Validation**: `[file validating schema]` or [None]

### Environment-Specific Overrides
| Environment | File | Priority |
|-------------|------|----------|
| Development | `[config/dev.json]` | [1-5, 1=highest] |
| Testing | `[config/test.json]` | [priority] |
| Production | `[config/prod.json]` | [priority] |

### Environment Variables
- **File**: `[.env.example]`
- **Loader**: `[file:line]` - [How env vars are loaded]

## Schema Structure

```[format]
{
  "section": {
    "key": "type - purpose - default value",
    "nested": {
      "subkey": "type - purpose - default value"
    }
  }
}
```

### Full Schema
```[actual format]
[Paste actual config structure with inline comments]
```

## Loading Mechanism

### Load Order & Priority
```
[Source 1: CLI args]  (highest priority)
    ↓
[Source 2: Environment variables]
    ↓
[Source 3: Config file overrides (prod/dev/test)]
    ↓
[Source 4: Default config file]
    ↓
[Source 5: Hardcoded defaults]  (lowest priority)
```

### Loader Implementation
- **Primary Loader**: `[file:line]` - [Function name]
- **Validation**: `[file:line]` - [How config is validated]
- **Error Handling**: [What happens if config is invalid]

### Load Timing
- **When**: [Application startup / Lazy on-demand / Hot-reload]
- **Triggered By**: `[file:line]` - [Entry point]

## Config Key Reference

### Required Keys (Must be set)
| Key Path | Type | Purpose | Example Value |
|----------|------|---------|---------------|
| `[section.key]` | [type] | [What it controls] | `[example]` |

### Optional Keys (Have defaults)
| Key Path | Type | Purpose | Default Value |
|----------|------|---------|---------------|
| `[section.key]` | [type] | [What it controls] | `[default]` |

### Deprecated Keys (Legacy, will be removed)
| Key Path | Replacement | Migration Path |
|----------|-------------|----------------|
| `[old.key]` | `[new.key]` | [How to migrate] |

## Change Impact Analysis

### Which Services Read Which Sections

| Config Section | Read By (Files) | Impact if Changed |
|----------------|-----------------|-------------------|
| `[section.key]` | `[file1]`, `[file2]` | [What breaks/changes] |

### Hot-Reloadable vs Restart-Required
- **Hot-reload supported**: `[config keys that update live]`
- **Requires restart**: `[config keys that need app restart]`

## Validation Rules

### Schema Definition
- **Location**: `[schema file or validator code]`
- **Validation Library**: [Zod / Joi / JSON Schema / Custom]

### Constraints
```[language]
// Example validation rules:
[Show key validation constraints like min/max, regex patterns, enum values]
```

## Environment Setup Guide

### Development Setup
```bash
# 1. Copy template:
cp .env.example .env

# 2. Set required keys:
#    - [KEY_NAME]: [How to obtain value]
#    - [KEY_NAME]: [How to obtain value]

# 3. Verify config:
[command to validate config]
```

### Production Deployment
```bash
# Required environment variables:
export KEY_NAME=value

# Config file location:
[Where to place config in production environment]
```

## Secrets Management

### Secret Keys (Never commit these)
- `[config.database.password]` - [Where to store: vault/env var]
- `[config.api.secret_key]` - [Where to store]

### Secret Loading
- **Mechanism**: [Env vars / Vault integration / Secrets manager]
- **Implementation**: `[file:line]`

## Config Examples

### Minimal Working Config
```[format]
[Smallest config needed to run the application]
```

### Full Featured Config
```[format]
[Complete config showing all options]
```

## Troubleshooting

### Common Config Errors
| Error Message | Cause | Fix |
|---------------|-------|-----|
| [Error] | [What triggers it] | [How to resolve] |

### Debug Config Loading
```bash
# Print effective config:
[command to show loaded config]

# Validate config:
[command to check config validity]
```

## Confidence & Gaps
- **Confidence**: [High / Medium / Low]
- **Undocumented Keys**: [Keys found in code but not documented]
- **Dynamic Config**: [Runtime-generated config not captured]
- **Missing Validation**: [Keys without validation rules]

---

**Next Steps**: Reference this schema when modifying config, use change impact analysis to assess risk.
