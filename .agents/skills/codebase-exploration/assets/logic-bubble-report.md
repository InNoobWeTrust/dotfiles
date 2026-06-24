# Logic Bubble Discovery: [Feature/Bug Name]

**Purpose**: Isolate the execution path for a specific feature or bug fix  
**Use When**: Making targeted changes, fixing bugs, adding features

---

## Entry Point
- **Location**: `[file:line]`
- **Signature**: `[function/endpoint signature]`
- **Trigger**: [HTTP request / CLI command / event that activates this]
- **Input Data**: [What data enters here]

## Exit Point
- **Location**: `[file:line]`
- **Output Mechanism**: [return value / file write / API response / event emit]
- **Success/Failure Conditions**: [What determines success]

## Bubble Boundary (Files in Critical Path)

| File | Lines | Role | Priority |
|------|-------|------|----------|
| `[file1.ext]` | [range] | [One-line: what it does] | [Read/Skim/Skip] |
| `[file2.ext]` | [range] | [One-line: what it does] | [Read/Skim/Skip] |
| `[file3.ext]` | [range] | [One-line: what it does] | [Read/Skim/Skip] |

## External Dependencies (Outside Bubble)
- **[module/library name]**: [How it's used in the bubble]
- **[module/library name]**: [How it's used in the bubble]

## Data Transformations
```
[Input Format] → [Step 1] → [Intermediate Format] → [Step 2] → [Output Format]
```

## Recommended Action
**Files to read in detail**: `[file1:line_range]`, `[file2:line_range]`  
**Files to skim**: `[file3]`, `[file4]`  
**Files to ignore**: Everything else outside the bubble

## Testing Points
- **Entry test**: [How to test at entry point]
- **Exit test**: [How to verify output]
- **Existing tests**: `[test file paths]`

## Confidence & Gaps
- **Confidence**: [High / Medium / Low]
- **Unclear Areas**: 
  - [What couldn't be determined]
  - [Where assumptions were made]
- **Suggested Follow-up**: [What to investigate if confidence is low]

---

**Next Steps**: Read priority "Read" files, make changes within bubble, test at entry/exit points.
