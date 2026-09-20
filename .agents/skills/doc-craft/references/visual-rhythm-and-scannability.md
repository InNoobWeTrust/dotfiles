# Visual Rhythm and Scannability

The cure for AI-generated "walls of text" and dense discursive prose. This guide establishes visual and structural rules that make technical documentation effortless to scan, reason about, and navigate.

---

## The Core Problem

Frontier models (especially reasoning-heavy models like GPT-5.6) default to academic, conversational, or discursive prose:
- Paragraphs of 6–10 sentences explaining context before delivering facts.
- Deeply nested bullet points with italicized commentary.
- Absence of visual anchors, leaving the human eye unable to locate key decisions.

Readers do not read documentation sequentially; they **scan** for interfaces, commands, status, invariants, and decisions.

---

## The Six Visual Disciplines

### 1. The 3-Sentence Paragraph Limit
- **Rule**: No paragraph may exceed 3 sentences. If an idea requires more exposition, break it with a list, a table, or a sub-heading.
- **Why**: Paragraphs longer than 3 sentences create visual gray blocks that readers instinctively skip.

### 2. Tables Over Prose
Whenever presenting any of the following, use a **Markdown table** instead of sentences or bullet lists:
- Metadata / Properties (status, owner, version, inputs, outputs)
- Comparisons (options, trade-offs, pros/cons)
- Mappings / Catalogs (error codes, command options, routes, files)
- Step sequences with distinct roles or tools

*Bad (Prose)*:
> "The auth service requires a client_id string which is mandatory, a client_secret string which is also required, and an optional redirect_uri which defaults to localhost if not specified."

*Good (Table)*:
| Parameter | Type | Required | Description |
|---|---|---|---|
| `client_id` | `string` | Yes | OAuth application ID |
| `client_secret` | `string` | Yes | Secure client credential |
| `redirect_uri` | `string` | No | Callback URL (default: `localhost`) |

### 3. Bold Lead-Ins for Lists
- **Rule**: Every bullet point must begin with a **bold keyword or phrase** summarizing the item.
- **Why**: Readers scan the left margin. A bold lead-in allows the reader to evaluate relevance in under 200ms.

*Bad*:
> - In this step you need to check if the database is running before continuing.
> - Another thing is you should ensure environment variables are exported.

*Good*:
> - **Verify database connectivity**: Confirm Postgres responds on port 5432 before starting the service.
> - **Validate environment configuration**: Ensure `DATABASE_URL` and `JWT_SECRET` are set.

### 4. Strategic Alert Blocks
Use GitHub-style alert callouts sparingly to create visual contrast for non-obvious details:
- `> [!NOTE]` — Background context or non-obvious design rationale.
- `> [!IMPORTANT]` — Invariants, mandatory prerequisites, or breaking boundaries.
- `> [!WARNING]` — Sharp edges, common failure modes, or deprecation notices.
- `> [!TIP]` — Efficiency shortcuts or productivity tricks.

**Hard Rule**: Never stack alerts consecutively. An alert loses all visual pop if surrounded by other alerts.

### 5. Diagram Anchors for Topologies
- **Rule**: For any document explaining a multi-component interaction, workflow, or architecture, anchor the explanation with a **Mermaid diagram** BEFORE diving into text.
- **Why**: A diagram provides an immediate mental map. The text then only needs to explain nuances rather than reconstruct geometry in prose.

### 6. Code Fences with Explicit Language & Filenames
- **Rule**: Never use generic code fences (```). Always specify the language (```typescript`, ```bash`).
- When referencing file contents, include the target file path in an introductory label or comment.

### 7. Raw HTML Blocks: No Blank Lines Inside (CommonMark)
Most models miss this one. When embedding raw HTML (e.g. `<table>` with `rowspan` for merged cells) inside Markdown:
- **Rule**: Never place a blank line *inside* the HTML block (`<table>…</table>`). A blank line in the middle terminates the HTML block early per CommonMark — everything after it is rendered as literal text (`</tbody>` and `</table>` show up verbatim).
- Place blank lines **only between** blocks and surrounding Markdown elements (one blank line before the opening tag and one after the closing tag).
- The opening tag must start in **column 1** to be recognized as an HTML block.
- Indentation *within* the block is fine and keeps the source readable; verify after writing that the rendered page shows one table, not a table + trailing text.

*Bad (blank line between rows — blocks split mid-table)*:
```html
<table>
  <tr><td>row 1</td></tr>

  <tr><td>row 2</td></tr>
</table>
```

*Good (blank lines only between blocks)*:
```html
<table>
  <tr><td>row 1</td></tr>
  <tr><td>row 2</td></tr>
</table>
```

---

## Anti-Pattern Quick Reference

| Temptation | Why Wrong | Scannable Replacement |
|---|---|---|
| Write an essay-style introduction explaining history | Reader wants the "what" and "how" immediately | Summary table with Goal, Status, Prerequisites |
| Use 4-level deep bullet nesting | Loses horizontal alignment; impossible to scan | Flatten; convert sub-concerns into tables or separate leaf files |
| Italicize entire sentences for emphasis | Hard to read; low visual contrast | Bold 2–3 key words or use a single `> [!IMPORTANT]` block |
| Output multiple code blocks without explanation | Disconnected fragments | Precede each snippet with an explicit single-sentence goal and follow with a verification command |
