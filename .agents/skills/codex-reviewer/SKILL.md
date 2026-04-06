---
name: codex-reviewer
description: >
  Invoke Codex (GPT-5.4, xhigh reasoning) as a second-opinion reviewer.
  Use when user types `/codex review <anything>` or says "cho codex xem",
  "hỏi codex", "nhờ codex review", "gửi codex", "codex đánh giá", or similar
  phrasing asking for Codex's input. Also use when user wants a deep reasoning
  second opinion on code, options, ideas, plans, or commits.
  If Codex is unavailable, fall back to performing the review myself using
  adversarial-reviewer and edge-case-hunter skills.
---

# Codex Reviewer

Codex (GPT-5.4 with extra-high reasoning) acts as a powerful second opinion.
It reads local files directly and reasons deeply before responding.

## Guard Rail: Codex Availability Check

**Before attempting any Codex invocation, verify availability:**

```bash
which codex >/dev/null 2>&1 || echo "CODEX_UNAVAILABLE"
```

If Codex is unavailable, **fall back to self-review** using:
- Load `adversarial-reviewer` skill for challenge-based review
- Load `edge-case-hunter` skill for boundary-condition analysis
- Inform user: "Codex is not available. Performing review with adversarial + edge-case-hunter perspectives instead."

If Codex is available, proceed with the full protocol below.

**Note on model selection**: The skill forces `-m gpt-5.4 -c model_reasoning_effort="xhigh"`.
If the model is unavailable, Codex will error or use a fallback. If the command fails,
treat as unavailable and fall back to self-review.

## Pre-Invocation: Disable MCP Servers

Codex sessions with xhigh reasoning run long (60-180s+). MCP connections are
unreliable over long sessions and frequently disconnect, losing the entire response.

**Always disable all MCP servers** when running Codex:

```bash
grep -oP 'mcp_servers\.\K[^.]+' ~/.codex/config.toml 2>/dev/null
```

For each MCP server found, add: `-c mcp_servers.<name>.enabled=false`

**Only disable servers that actually exist** — referencing nonexistent servers
causes "invalid transport" error.

## Review Types

### 1. `review code` — Review changed code

Use `codex exec review` subcommand for git-aware diffing:

| Situation | Command |
|-----------|---------|
| Uncommitted work | `codex exec review --uncommitted -m gpt-5.4 -c model_reasoning_effort="xhigh" [MCP_FLAGS]` |
| Last commit | `codex exec review --commit HEAD -m gpt-5.4 -c model_reasoning_effort="xhigh" [MCP_FLAGS]` |
| vs main branch | `codex exec review --base main -m gpt-5.4 -c model_reasoning_effort="xhigh" [MCP_FLAGS]` |
| Custom focus | Append prompt: `"Focus on security and edge cases"` |

### 2. `review options` — Review approaches listed in conversation

```bash
codex exec -m gpt-5.4 -c model_reasoning_effort="xhigh" [MCP_FLAGS] "$(cat <<'EOF'
<paste options from conversation>

Context: <problem statement>

Please evaluate each option. Consider: trade-offs, risks, implementation
complexity, and long-term maintainability. Recommend the best option.
EOF
)"
```

### 3. `review idea` — Review an idea or concept

```bash
codex exec -m gpt-5.4 -c model_reasoning_effort="xhigh" [MCP_FLAGS] "$(cat <<'EOF'
Idea to evaluate: <describe idea>

Relevant files:
- <list file paths>

Please evaluate: feasibility, potential issues, missing pieces, improvements.
EOF
)"
```

### 4. `review plan` — Review an execution plan

```bash
codex exec -m gpt-5.4 -c model_reasoning_effort="xhigh" [MCP_FLAGS] "$(cat <<'EOF'
Plan to review:
<paste plan>

Codebase: <working directory or key files>

Please review for: completeness, sequencing, missing steps, risks.
EOF
)"
```

### 5. `review commit` — Review a specific commit

```bash
codex exec review --commit <SHA or HEAD> -m gpt-5.4 -c model_reasoning_effort="xhigh" [MCP_FLAGS]
```

## Required Flags

**Always include these — user's config may differ:**

```
-m gpt-5.4 -c model_reasoning_effort="xhigh"
```

## Execution Steps

1. **Check codex availability** via `which codex` — if unavailable or command fails, fall back to self-review
2. **If available**:
   - Identify review type from command
   - Extract context (git status/diff for code, conversation for ideas/options)
   - Build MCP disable flags from `~/.codex/config.toml`
   - Construct command with required flags: `-m gpt-5.4 -c model_reasoning_effort="xhigh"`
   - Run via Bash with generous timeout (300s normal, 600s complex)
   - If command fails, fall back to self-review
   - Present Codex's analysis; add synthesis if helpful

## Language

Match user's language in the prompt (Vietnamese, English, or mixed).

## Common Pitfalls

- **Don't paste file contents** — give paths only. Codex reads files directly.
- **Always force `-m gpt-5.4 -c model_reasoning_effort="xhigh"`** — never rely on defaults.
- **Disable MCP servers** — unstable over long xhigh sessions.
- **Provide intent context** — "this code implements X" improves review quality.
- **No timeout** — Codex xhigh can take 60-180s. Wait for completion.
