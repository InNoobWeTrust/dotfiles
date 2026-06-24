# Clone Pattern Discovery: [Feature to Clone]

**Purpose**: Identify structure and boilerplate for adding similar functionality  
**Use When**: Adding new endpoints, commands, modules similar to existing ones

---

## Reference Implementation
- **Primary File**: `[file:line]` - [Core logic]
- **Supporting Files**:
  - `[file1]` - [Role: registration, tests, config, etc.]
  - `[file2]` - [Role: ...]

## Registration Checklist

Step-by-step instructions for adding new instance:

- [ ] **Step 1**: Duplicate `[file]` → `[new_file]`
  - Rename: `[OldName]` → `[NewName]`
  
- [ ] **Step 2**: Register in `[registration_file:line]`
  - Add: `[code snippet to add]`
  
- [ ] **Step 3**: Add config entry in `[config_file]`
  - Add: `[config structure]`
  
- [ ] **Step 4**: Create test file `[test_file]`
  - Clone from: `[existing_test_file]`

- [ ] **Step 5**: Update `[any other files]`
  - Modify: `[what needs to change]`

## Required Boilerplate

### File Structure
```
[Directory layout showing where new files go]
```

### Code Template
```[language]
// Copy this structure and customize marked sections:

[Essential boilerplate code to replicate]

// CUSTOMIZE: [Section 1 - what to change]
[Code section]

// CUSTOMIZE: [Section 2 - what to change]
[Code section]
```

## Customization Points

Where to inject new logic (leave everything else unchanged):

1. **`[file:line]`**: [What to customize - business logic]
2. **`[file:line]`**: [What to customize - validation rules]
3. **`[file:line]`**: [What to customize - error messages]
4. **`[file:line]`**: [What to customize - config defaults]

## Files to NOT Modify
[Core framework files that should remain unchanged]

## Verification Steps

### 1. Registration Verification
```bash
# Run this to confirm new module is detected:
[Command to list registered modules/routes/commands]
```

### 2. Functionality Test
```bash
# Test the new feature:
[Command or curl/request to test]
```

### 3. Existing Tests Pass
```bash
# Ensure no regressions:
[Test command]
```

## Common Gotchas
- **[Gotcha 1]**: [What developers often forget] → [How to fix]
- **[Gotcha 2]**: [Common mistake] → [How to avoid]

## Example Clone Diff
```diff
# High-level diff showing what changed in reference implementation:
+ [New lines added]
- [Old lines removed]
~ [Lines modified]
```

## Confidence & Gaps
- **Confidence**: [High / Medium / Low]
- **Incomplete Information**: [What might vary per use case]
- **Risk Areas**: [Where cloning might not work cleanly]

---

**Next Steps**: Follow registration checklist, customize marked sections, verify registration and tests.
