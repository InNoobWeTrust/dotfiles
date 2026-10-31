import assert from "node:assert/strict"
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import {
  applyTextEdits,
  applyWorkspaceEdit,
  lineLength,
  lineStarts,
  toLspPosition,
} from "../src/workspace/edits.ts"

const workspace = await mkdtemp(join(tmpdir(), "lsp-text-"))
const uri = (name: string) => pathToFileURL(join(workspace, name)).href
const edit = (sl: number, sc: number, el: number, ec: number, newText: string) => ({
  range: { start: { line: sl, character: sc }, end: { line: el, character: ec } },
  newText,
})

try {
  // Line math across terminators.
  assert.deepEqual(lineStarts("a\nb\r\nc\rd"), [0, 2, 5, 7])
  assert.equal(lineLength("a\nb", lineStarts("a\nb"), 0), 1)
  assert.equal(lineLength("a\nb", lineStarts("a\nb"), 1), 1)

  // 1-based to 0-based conversion, including UTF-16 surrogate pairs.
  assert.deepEqual(toLspPosition("😀x\nvalue = 2\n", { line: 1, character: 4 }), {
    line: 0,
    character: 3,
  })
  assert.deepEqual(toLspPosition("😀x\nvalue = 2\n", { line: 2, character: 4 }), {
    line: 1,
    character: 3,
  })
  assert.match(
    (() => {
      try {
        toLspPosition("a\n", { line: 9, character: 1 })
        return ""
      } catch (error) {
        return (error as Error).message
      }
    })(),
    /Line 9 is out of bounds \(1-based; the file has 2 line\(s\)\)/,
  )
  assert.throws(() => toLspPosition("😀x\n", { line: 1, character: 5 }), /3 UTF-16 code unit/)

  // Edit application: ordering, overlap and bounds.
  assert.equal(
    applyTextEdits("alpha beta\n", [edit(0, 6, 0, 10, "gamma"), edit(0, 0, 0, 5, "first")]),
    "first gamma\n",
  )
  assert.equal(applyTextEdits("abc", [edit(0, 1, 0, 1, "X")]), "aXbc")
  assert.equal(applyTextEdits("abc", [edit(0, 1, 0, 3, "")]), "a")
  assert.throws(
    () => applyTextEdits("abcdef", [edit(0, 0, 0, 3, "x"), edit(0, 2, 0, 5, "y")]),
    /Overlapping text edits/,
  )
  assert.throws(
    () => applyTextEdits("abc", [edit(0, 0, 1, 0, "x")]),
    /Edit line 1 is out of bounds/,
  )
  assert.throws(() => applyTextEdits("abc", [edit(0, 2, 0, 1, "x")]), /end precedes start/)
  assert.throws(() => applyTextEdits("abc", [edit(0, 9, 0, 9, "x")]), /Edit character/)

  await writeFile(join(workspace, "one.py"), "old = 1\n")
  await writeFile(join(workspace, "two.py"), "old = 2\n")

  // Rejection: mixed shapes and resource operations.
  await assert.rejects(
    applyWorkspaceEdit(workspace, {
      changes: { [uri("one.py")]: [] },
      documentChanges: [],
    }),
    /both changes and documentChanges/,
  )
  await assert.rejects(applyWorkspaceEdit(workspace, { changes: {} }), /no changes/)
  await assert.rejects(
    applyWorkspaceEdit(workspace, {
      documentChanges: [
        {
          textDocument: { uri: "untitled:scratch", version: null },
          edits: [edit(0, 0, 0, 1, "x")],
        },
      ],
    }),
    /non-file URI/,
  )

  // File operations apply in order: create, then text-edit the created file.
  const created = await applyWorkspaceEdit(workspace, {
    documentChanges: [
      { kind: "create", uri: uri("made.py") },
      {
        textDocument: { uri: uri("made.py"), version: null },
        edits: [edit(0, 0, 0, 0, "x = 1\n")],
      },
    ],
  })
  assert.equal(created.totalEdits, 1)
  assert.deepEqual(created.operations, [
    { kind: "create", file: "made.py", uris: [uri("made.py")] },
  ])
  assert.equal(await readFile(join(workspace, "made.py"), "utf8"), "x = 1\n")

  // Rename, then text-edit the new path; the old path is gone.
  const renamed = await applyWorkspaceEdit(workspace, {
    documentChanges: [
      { kind: "rename", oldUri: uri("made.py"), newUri: uri("moved.py") },
      {
        textDocument: { uri: uri("moved.py"), version: null },
        edits: [edit(0, 0, 0, 1, "y")],
      },
    ],
  })
  assert.deepEqual(renamed.operations, [
    {
      kind: "rename",
      file: "moved.py",
      from: "made.py",
      to: "moved.py",
      uris: [uri("made.py"), uri("moved.py")],
    },
  ])
  assert.equal(await Bun.file(join(workspace, "made.py")).exists(), false)
  assert.equal(await readFile(join(workspace, "moved.py"), "utf8"), "y = 1\n")

  const deleted = await applyWorkspaceEdit(workspace, {
    documentChanges: [{ kind: "delete", uri: uri("moved.py") }],
  })
  assert.deepEqual(deleted.operations, [
    { kind: "delete", file: "moved.py", uris: [uri("moved.py")] },
  ])
  assert.equal(await Bun.file(join(workspace, "moved.py")).exists(), false)

  // Options and validation for file operations.
  await assert.rejects(
    applyWorkspaceEdit(workspace, { documentChanges: [{ kind: "create", uri: uri("one.py") }] }),
    /File already exists: one\.py/,
  )
  const ignored = await applyWorkspaceEdit(workspace, {
    documentChanges: [
      { kind: "create", uri: uri("one.py"), options: { ignoreIfExists: true } },
      {
        textDocument: { uri: uri("one.py"), version: null },
        edits: [edit(0, 0, 0, 0, "")],
      },
    ],
  })
  assert.equal(ignored.operations.length, 0)
  await assert.rejects(
    applyWorkspaceEdit(workspace, {
      documentChanges: [{ kind: "delete", uri: uri("gone.py") }],
    }),
    /File does not exist: gone\.py/,
  )
  await assert.rejects(
    applyWorkspaceEdit(workspace, {
      documentChanges: [{ kind: "rename", oldUri: uri("missing.py"), newUri: uri("other.py") }],
    }),
    /File does not exist: missing\.py/,
  )
  await assert.rejects(
    applyWorkspaceEdit(workspace, {
      documentChanges: [
        { kind: "create", uri: pathToFileURL(join(workspace, "..", "escape.py")).href },
      ],
    }),
    /escapes the workspace/,
  )
  await writeFile(join(workspace, "over.py"), "keep\n")
  await applyWorkspaceEdit(workspace, {
    documentChanges: [{ kind: "create", uri: uri("over.py"), options: { overwrite: true } }],
  })
  assert.equal(await readFile(join(workspace, "over.py"), "utf8"), "")
  await rm(join(workspace, "over.py"))

  // Legacy changes map applies to disk.
  const legacy = await applyWorkspaceEdit(workspace, {
    changes: { [uri("one.py")]: [edit(0, 0, 0, 3, "new")] },
  })
  assert.equal(legacy.totalEdits, 1)
  assert.equal(await readFile(join(workspace, "one.py"), "utf8"), "new = 1\n")

  // Drift guard: content synced to the server no longer matches disk.
  await assert.rejects(
    applyWorkspaceEdit(
      workspace,
      {
        documentChanges: [
          {
            textDocument: { uri: uri("one.py"), version: null },
            edits: [edit(0, 0, 0, 3, "zzz")],
          },
        ],
      },
      { synced: () => "stale = 1\n" },
    ),
    /changed on disk since the language server read it/,
  )
  assert.equal(await readFile(join(workspace, "one.py"), "utf8"), "new = 1\n")

  // Write failure rolls back files that were already written in the same edit.
  await chmod(join(workspace, "two.py"), 0o400)
  await assert.rejects(
    applyWorkspaceEdit(workspace, {
      documentChanges: [
        {
          textDocument: { uri: uri("one.py"), version: null },
          edits: [edit(0, 0, 0, 3, "first")],
        },
        {
          textDocument: { uri: uri("two.py"), version: null },
          edits: [edit(0, 0, 0, 3, "second")],
        },
      ],
    }),
    /Failed to apply workspace edit for two\.py.*rolled back/,
  )
  assert.equal(await readFile(join(workspace, "one.py"), "utf8"), "new = 1\n")
  assert.equal(await readFile(join(workspace, "two.py"), "utf8"), "old = 2\n")
  await chmod(join(workspace, "two.py"), 0o600)

  console.log(
    "PASS edit text math (terminators, UTF-16, ordering, overlap, bounds), workspace file operations, rejection rules, legacy changes, drift guard and write rollback",
  )
} finally {
  await rm(workspace, { recursive: true, force: true })
}
