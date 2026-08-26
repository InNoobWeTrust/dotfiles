# Working with Poorly Engineered Tools

**Use when:** A tool's behavior doesn't match its interface, has ambiguous path resolution, or returns silent success for incorrect outcomes.

---

## The Incident Pattern

**What happened:** Tool resolved `relative_path` parameter against project root instead of intended subdirectory. Agent declared success without verification. File created at wrong location. Work proceeded on false assumption.

**Root cause:** Agent assumed tool behavior matched mental model. Tool's actual resolution logic differed. Success response was not proof of correct outcome.

---

## Why Tools Behave Unpredictably

| Pattern | Example | Risk |
|---|---|---|
| Ambiguous path resolution | `relative_path` → project root vs current dir vs parent context | File lands at wrong location |
| Silent success responses | Tool returns `ok` regardless of outcome quality | Agent doesn't detect mismatch |
| Implicit scope | Tool operates in hidden context (env vars, working dir, config files) | Behavior varies by environment |
| Parameter overloading | Same parameter means different things in different contexts | Misinterpretation |
| Missing validation | Tool accepts invalid inputs without error | Garbage in, garbage out |

---

## General Mitigation Strategy

### 1. Never Trust Success Responses

A tool reporting success is not proof that:
- File landed at intended path
- Content matches expected structure
- Side effects occurred as intended
- No unintended consequences happened

**Always verify outcomes independently.**

### 2. Use Absolute Paths When Tool Behavior Is Ambiguous

| Context | Strategy |
|---|---|
| Tool docs unclear on path resolution | Use absolute paths |
| Parameter called `relative_path` | Verify which "relative to" applies |
| Tool has implicit working directory | Pass absolute or verify after |
| Multiple context levels (project/session/user) | Disambiguate explicitly |

### 3. Verify After Every Side-Effect Call

Before declaring success or proceeding with dependent work:

- [ ] Verify target path exists (`ls`, `read`)
- [ ] Spot-check content structure
- [ ] Check for unintended artifacts (duplicates, wrong locations)
- [ ] For moves: verify source is gone

See `tool-call-integrity.md` for full protocol.

### 4. Document Tool Quirks for Future Reference

When you discover a tool's actual behavior differs from its interface or documentation, record the safe practice in your memory system so future sessions don't repeat the mistake.

---

## Red Flags: When to Be Extra Vigilant

- Tool is new or rarely used
- Tool documentation is sparse or generic
- Parameter names are ambiguous (`path`, `target`, `location`)
- Tool has no explicit validation or error checking
- Tool wraps another tool (indirection layers)
- Tool behavior changes based on environment
- Previous incidents with this tool

---

## This Applies Beyond File Operations

Same pattern affects:

| Domain | Example | Verify |
|---|---|---|
| API calls | POST returns 200 but data malformed | Check response payload structure |
| Database writes | INSERT succeeds but constraint violated | Query to confirm record exists as expected |
| Version control | Commit succeeds but staged wrong files | Inspect status and diff before committing |
| Shell commands | Exit code 0 but stderr has warnings | Check both stdout and stderr |
| External tools | Tool returns success but external state unchanged | Verify external state directly |

---

## Relationship to Tool-Call Integrity Rule

This document explains **why** the verify-after-call protocol exists. The tool-call integrity rule (`tool-call-integrity.md`) defines **how** to apply it.

When a tool behaves unpredictably → this doc  
When any side-effect tool is called → tool-call integrity rule

Both are mandatory for robust agent behavior.
