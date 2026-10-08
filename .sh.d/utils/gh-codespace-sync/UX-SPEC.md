# Codespaces inline wizard

## Discovery and intent

For the local dotfiles user, keep `gh_codespace` and its Bun/gh prerequisites,
but use inline arrow-key menus and checkbox prompts in terminal scrollback.
Delete OpenTUI, its renderer and its form state owner; no fullscreen fallback.
Keep encrypted uploads, literal dotenv parsing, names-only output, independent
owned/external choices, explicit confirmation, and sequential fail-fast writes.
Pinned dotenv and sodium dependencies remain. Inquirer select/checkbox prompts
own keyboard navigation and terminal restoration; no fullscreen renderer.
Scope: this utility directory and its existing shell/index integration only.

Package as a local interpreted GitHub CLI extension: `gh codespace-sync` is
the primary entry, with optional `gh codespace sync` alias. Keep `gh_codespace`
as a direct shell entry for installations that have not registered the extension.
The matching directory/executable are `gh-codespace-sync`; the launcher resolves
sibling modules and passes arguments, exit status and interrupts through to Bun.
The launcher isolates Bun's auto-install cache by utility and import-pin checksum:
an unrelated cached version must not break startup, and changed pins use a new cache.
It never deletes or repairs the caller's existing dependency cache.
The entry command, API, value handling and access-list semantics remain unchanged.
Interactive shell startup runs `install.sh`: local-only registration if absent,
preserving existing extensions/aliases. Missing gh and non-interactive shells
skip setup; failed registration warns without aborting the parent shell.

Implementation: `github.ts` owns GitHub/encryption effects; `wizard.ts` owns
choices, navigation and plans; `prompts.ts` owns the inline keyboard adapter,
and the entry point owns cancellation.
The injected prompt/API boundaries permit offline verification. No generic
framework, concurrent mutations, automatic retries or compatibility shims.

## Journey and step inventory

Action → Entries → Owned repositories → External repositories → Review →
Progress → Result. Each choice scope has its own separate checkbox prompt.
Escape revisits the previous step and preserves submitted selections. Changing the action
reloads the catalog and clears choices; reusing the action preserves them.
Cancel menu choices, Ctrl-D and Ctrl-C cancel; during execution stop after the current operation.

| Step | Choice and validation |
| --- | --- |
| Action | Arrow-key menu: upload, manage access, cancel; Enter confirms |
| Entries | Space toggles, Enter submits; at least one required; A selects all |
| Owned repositories | Separate checkbox list; A selects all; initially empty |
| External repositories | Separate checkbox list; bulk select/invert disabled; initially empty |
| Review | Full names and repositories, write count, preservation/concurrency warning; explicit Apply menu choice; default Cancel |
| Progress/result | Append completed/total and current name; final success, cancellation or partial failure |

Arrow keys move focus; Space toggles only the focused checkbox; Enter submits
the displayed choices. Each checkbox opens with previous submitted selections,
not automatic defaults. Upload-only allows no repositories. Access-only requires
at least one repository. Empty scopes offer Continue/Back/Cancel; empty entries
cannot advance. Discovery failures offer Retry/Back/Cancel via arrow-key menu.

## Layout and visual design

Two-region inline layout: step heading/list and keyboard help. Inquirer redraws
only the active prompt; no alternate screen or fullscreen UI. Lists paginate at
seven visible rows, using native terminal wrapping and the library's focus and
checkbox markers. Selection is not color-dependent; plain terminal monospace
and the library's default accessible prompt theme are the visual tokens.

```text
Step 3/5 — Owned repositories
  > [ ] owner/project-one
    [x] owner/project-two
↑/↓ move · Space toggle · Enter continue · Esc back · Ctrl-C cancel
```

Wide (100+), medium (50–99), and narrow (<50 columns) terminals use the same
stacked layout; the terminal wraps full names rather than cropping them. Terminal
scrollback provides history and review scrolling. Browser SVG/ARIA/touch/contrast
requirements do not apply to these plain text prompts. Density is compact;
variance and motion are minimal. Normal shell output remains visible on exit.

## State matrix

| Component | Applicable states |
| --- | --- |
| Action/pickers | Default unchecked; selected labels; visible focus; empty required selection explains; empty scope offers navigation; loading announces discovery; error offers retry |
| Continue/confirm | Validation guards; review defaults to Cancel; explicit Apply starts writes; Escape edits; no mutation before confirmation |
| Review | Read-only full scope; back edits; warns batch read/merge/write is not atomic against another editor |
| Progress | Current operation, completed write count; stop pending; first failure halts; in-flight outcome may be uncertain |
| Result | Success, cancellation, or partial failure; applied writes are retained; no rollback/retry |

Hover, drag, disabled visual widgets and animation are not applicable. Cancellation
is always available, including while discovery or execution awaits a request.

## Batch contract

One grant operation per selected name contains all selected repositories.
Immediately before each batch PUT, read all pages of that name's current access,
validate IDs and merge them with the selections. A failed/incomplete read must
not lead to a replacement write. Abort before writing if cancellation arrives
during that read. Uploads still omit access replacement; grants run after uploads
so new entries exist before their access is read. Upload + grant therefore uses
two writes per entry; access-only uses one. No cross-variable batch endpoint exists.
Concurrent edits between the read and PUT may be overwritten; the user accepted
this limitation. Do not run another access editor simultaneously.

## Verification checklist

- Names only, hidden values; encrypted upload adapter remains intact.
- Inline arrow-key/Space/Enter selectors separate scopes and retain complete review.
- No default checkbox selection; bulk shortcuts disabled for external repositories.
- Back preserves choices; mode changes reset; empty-entry/access guards.
- Confirmation boundary, EOF/Ctrl-C, progress, fail-fast and partial results.
- Batch pagination/deduplication/preservation and read-failure/cancellation guards.
- Launcher help, Bash/Zsh syntax, strict types, formatting and scoped diffs.
- Extension registration, nested alias, help and execution from another directory.
- Disposable synthetic/mocked checks only; no real dotenv reads or live writes.

## Verification outcome

| Check | Outcome |
| --- | --- |
| Arrow/Space/Enter selection, scoped all, no defaults, Back | Pass: real Inquirer prompt harness with synthetic catalog and API; external all/invert disabled; submitted choices retained on Back |
| Empty scope guards, discovery recovery and explicit retry | Pass: mocked prompts; failed mode changes reload invalidated catalogs |
| Confirmation, progress, fail-fast and stop-after-in-flight | Pass: mocked API operations and partial counts |
| Batched access preservation, pagination, deduplication | Pass: existing owned/external IDs retained in one PUT per name |
| Failed/incomplete access read and cancellation before batch write | Pass: zero replacement writes |
| Encrypted upload, hidden values and preserved trailing newline | Pass: synthetic dotenv and sealed-box round trip; no access replacement field |
| Ctrl-C/Ctrl-D cancellation and prompt cleanup | Pass: Inquirer harness; no writes and no leaked keypress listeners |
| Live terminal restoration | Unverified for the new selectors: sandbox PTY allocation reports out of pty devices; no unrestricted retry |
| Strict TypeScript | Pass: all four TypeScript modules |
| Formatting, shell syntax and installed command help | Pass: Prettier, Bash/Zsh/launcher checks and `gh codespace sync --help` outside the checkout |
| Bun cached-version startup regression | Pass: cached select 5.2.6 reproduces ENOENT for pinned 4.3.4; isolated launcher succeeds twice and through the alias without modifying original cached versions; pin changes rotate the cache |
| Normal installed-command dependency cache | Pass: `gh codespace sync --help` succeeds without a temporary cache override |
| Local extension and nested alias registration | Pass: `gh codespace-sync --help` and `gh codespace sync --help` from outside the checkout |
| Launcher argument/status forwarding and missing Bun | Pass: invalid argument returns 2; missing Bun returns 1; shell syntax checks pass |
| Automatic local setup | Pass: mocked missing/present registrations, preserved alias, failed list causes no writes, non-interactive skip and parent-shell survival; existing real registration is a read-only no-op |
| Live GitHub writes and real dotenv input | Not run/read: checks use synthetic data and mocks only |

Disposable verification scripts and fixtures are not repository deliverables.
