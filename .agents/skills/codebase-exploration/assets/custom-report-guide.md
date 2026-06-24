# Custom Report Format Guide

**Use this when none of the standard templates match your exploration purpose.**

---

## When to Use Custom Format

Standard templates cover:
- ✅ Logic Bubble (targeted changes)
- ✅ Architecture Map (system structure)
- ✅ Clone Pattern (replicating features)
- ✅ Dependency Audit (migration/impact analysis)
- ✅ API Surface (integration tasks)
- ✅ Config Schema (configuration management)

**Use custom format when exploring:**
- Build/deployment pipelines
- Test infrastructure
- Documentation systems
- Data migration scripts
- Performance bottlenecks
- Security boundaries
- Logging/monitoring systems
- [Any other specialized concern]

---

## How to Specify Custom Format

When delegating exploration, provide explicit report structure:

```
Explore [specific goal/artifact].

Return a discovery report with these sections:

1. **[Section Name]**: [What information to include in this section]
2. **[Section Name]**: [What information to include]
3. **[Section Name]**: [What information to include]

Format Requirements:
- Use markdown with code references as `file:line`
- Prioritize actionable information over complete documentation
- Include "Confidence & Gaps" section at end

Brevity Target: [Short (< 50 lines) / Medium (< 100 lines) / Comprehensive]
```

---

## Custom Format Examples

### Example 1: Build Pipeline Exploration

```markdown
Explore the build pipeline for this project.

Return a discovery report with:

1. **Build Stages**: List each stage, script location, inputs/outputs
2. **Artifact Outputs**: Where compiled/bundled files are written
3. **Environment Variables**: Which env vars affect the build
4. **Failure Points**: Common build errors and their triggers
5. **Optimization Opportunities**: Slow stages or redundant work

Format: Markdown with file:line references
Brevity: Medium (< 100 lines)
```

### Example 2: Test Infrastructure Exploration

```markdown
Explore the test infrastructure and organization.

Return a discovery report with:

1. **Test Categories**: Unit/integration/e2e, where each lives
2. **Test Runners**: What tools run tests, configuration files
3. **Fixtures & Mocks**: Shared test data and mock implementations
4. **Coverage Tooling**: How coverage is measured and reported
5. **CI Integration**: How tests run in CI/CD pipeline
6. **Pain Points**: Slow tests, flaky tests, missing coverage

Format: Markdown with file:line references
Brevity: Medium (< 100 lines)
```

### Example 3: Performance Profiling Entry Points

```markdown
Explore where performance bottlenecks can be investigated.

Return a discovery report with:

1. **Profiling Hooks**: Existing instrumentation, logging, metrics
2. **Critical Paths**: High-traffic code paths worth profiling
3. **Known Slow Operations**: Database queries, API calls, file I/O
4. **Optimization History**: Past performance improvements (git log, comments)
5. **Monitoring Integration**: How performance metrics are collected

Format: Markdown with file:line references
Brevity: Short (< 50 lines)
```

### Example 4: Security Boundary Mapping

```markdown
Explore security boundaries and trust zones.

Return a discovery report with:

1. **Trust Boundaries**: Where external data enters the system
2. **Input Validation**: Where/how user input is validated
3. **Authentication Points**: Entry points requiring auth
4. **Authorization Checks**: Where permissions are enforced
5. **Sensitive Data Flow**: Where secrets/PII are handled
6. **Known Vulnerabilities**: TODO comments, security issues

Format: Markdown with file:line references
Brevity: Medium (< 100 lines)
```

---

## Custom Format Template

Use this structure for your custom report specification:

```markdown
Explore [your specific goal/question].

**Context**: [1-2 sentences explaining why this matters]

Return a discovery report with these sections:

1. **[Section Name]**: 
   - [Specific data point to include]
   - [Specific data point to include]
   - [Format: table / list / code block / prose]

2. **[Section Name]**:
   - [What to capture]
   - [How to present it]

3. **[Section Name]**:
   - [What to identify]

4. **Confidence & Gaps**:
   - Confidence: [H/M/L]
   - Unclear Areas: [what couldn't be determined]
   - Assumptions: [what was inferred]

Format Requirements:
- Markdown with `file:line` references for all claims
- Prioritize: [actionable / comprehensive / concise]
- Code examples: [Yes/No, and how many]

Brevity Target: [Short / Medium / Comprehensive]
```

---

## Best Practices for Custom Formats

### ✅ Do:
- **Be specific**: "List database schema files" not "find data stuff"
- **Request structure**: Tables, lists, code blocks make reports scannable
- **Set brevity targets**: Prevent 500-line reports when 50 lines suffice
- **Include confidence section**: Always ask for gaps/assumptions
- **Use file:line format**: Makes findings verifiable and navigable

### ❌ Don't:
- **Be vague**: "Tell me about the codebase" (too broad)
- **Ask for everything**: Request only what you need to make a decision
- **Omit format guidance**: Unstructured prose is hard to act on
- **Forget edge cases**: Ask for "common errors" and "gotchas" sections
- **Skip validation**: Ask how findings can be verified/tested

---

## Template Composition (Mix & Match)

You can combine elements from standard templates:

```markdown
Explore user authentication system.

Use hybrid format combining:
- **Logic Bubble** (entry/exit points for login flow)
- **API Surface** (authentication endpoints)
- **Security Boundaries** (input validation, session management)

Return report with sections:
[Specify which sections from each template]
```

---

## Output Validation

After receiving custom report, verify it contains:
- [ ] Requested sections are present
- [ ] File paths use `file:line` format
- [ ] Confidence level is stated
- [ ] Gaps/assumptions are acknowledged
- [ ] Report length matches brevity target
- [ ] Actionable next steps are clear

If missing critical information, request follow-up exploration focusing on gaps.

---

## Iteration Strategy

Custom reports often require refinement:

1. **First pass**: Broad custom format to understand domain
2. **Identify gaps**: What was unclear or insufficient?
3. **Second pass**: Focused exploration on specific gaps
4. **Synthesize**: Combine findings into actionable plan

Don't expect perfect reports on first attempt for novel exploration domains.

---

**Next Steps**: Use this guide when standard templates don't fit, iterate on report format until you have decision-making information.
