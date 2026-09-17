# File-Targeted Micro-Rules

> **Parent skill:** [reviewer/SKILL.md](../SKILL.md).  
> **Purpose:** Specific defect checklists mapped by file pattern to eliminate generic, hallucinated warnings.  
> **Source:** Alibaba Open Code Review system rulesets (52 language/framework rules embedded in `rules/`).

This reference equips reviewers with concrete failure modes and defect patterns tailored to specific file types and languages. When reviewing a file in a changeset, match its path against the table below and load the corresponding deep rule sheet from `rules/`.

| Parameter | Value |
|---|---|
| **Role** | JIT file-type defect checklist router |
| **Layer** | Leaf reference under `reviewer` skill |
| **Deep Rules** | 52 language/manifest rule files in [`rules/`](./rules/) + [`rules/system_rules.json`](./rules/system_rules.json) |
| **Primary Invariant** | Evaluate ONLY lines added/modified within the diff (Gate 4 Anti-Context-Bleed) |

---

## Language & Manifest Rule Router

Match changed files against the glob patterns below to load their specialized review checklist:

| Glob Pattern | Category | Deep Rule Sheet | Key Defect Focus |
|---|---|---|---|
| `**/*.go` | Go Backend | [`rules/go.md`](./rules/go.md) | Goroutine leaks, unhandled errors, nil pointers, mutex lock/unlock scoping, defer in loops |
| `**/*.{ts,js,tsx,jsx,mjs,cjs}` | TypeScript / JavaScript | [`rules/ts_js_tsx_jsx.md`](./rules/ts_js_tsx_jsx.md) | Floating promises, hook closures, prototype pollution, dead code, type narrowing bypass |
| `**/*.{py,pyi,ipynb}` | Python | [`rules/python.md`](./rules/python.md) | Mutable defaults, unclosed context managers, bare excepts, NoneType access, SQL formatting |
| `**/*.rs` | Rust | [`rules/rust.md`](./rules/rust.md) | Unsafe blocks, unwrap in production, lock contention, memory leaks (`Box::leak`), channel deadlocks |
| `**/*.java` | Java Backend | [`rules/java.md`](./rules/java.md) | NPE checks, Spring `@Transactional` boundaries, resource leaks, concurrent collection safety |
| `**/*.{kt,kts}` | Kotlin | [`rules/kotlin.md`](./rules/kotlin.md) | Coroutine cancellation, platform type nullability, companion object memory leaks |
| `**/*.{cpp,cc,cxx,hpp,hxx}` | C++ | [`rules/cpp.md`](./rules/cpp.md) | Use-after-free, uninitialized members, iterator invalidation, exception safety, RAII |
| `**/*.c` | C | [`rules/c.md`](./rules/c.md) | Buffer overflows, unchecked `malloc`, format string bugs, dangling pointers, integer overflow |
| `.github/workflows/**/*.{yaml,yml}` | GitHub Actions | [`rules/github_workflows.md`](./rules/github_workflows.md) | Untrusted script injection via `github.event`, unpinned action SHAs, excessive token scopes |
| `.github/**/*.{yaml,yml}` | GitHub Config | [`rules/github_config.md`](./rules/github_config.md) | Misconfigured issue templates, code owners, automated bot permissions |
| `**/*{mapper,dao}*.xml` | MyBatis / XML SQL | [`rules/mapper_dao_xml.md`](./rules/mapper_dao_xml.md) | Dynamic SQL injection (`${}` vs `#{}`), parameter mismatch, missing closing tags |
| `**/package.json` | Node Supply Chain | [`rules/package_json.md`](./rules/package_json.md) | Unpinned dependencies, suspicious lifecycle hooks (`preinstall`), typosquatting |
| `**/Cargo.toml` | Rust Supply Chain | [`rules/cargo_toml.md`](./rules/cargo_toml.md) | Wildcard dependencies, unmaintained crates, missing feature flags |
| `**/pom.xml` | Maven Build | [`rules/pom_xml.md`](./rules/pom_xml.md) | Dependency version conflicts, unvetted plugins, missing repository credentials protection |
| `**/build.gradle` | Gradle Build | [`rules/build_gradle.md`](./rules/build_gradle.md) | Dynamic version ranges, insecure HTTP repository URLs, task execution side effects |
| `**/*.proto` | Protocol Buffers | [`rules/protobuf.md`](./rules/protobuf.md) | Breaking wire format changes, field tag renumbering, reserved field collisions |
| `**/*.{graphql,gql}` | GraphQL | [`rules/graphql.md`](./rules/graphql.md) | Unbounded query depth, missing authorization on fields, N+1 query triggers |
| `**/*.prisma` | Prisma ORM | [`rules/prisma.md`](./rules/prisma.md) | Missing unique indexes, cascading delete risks, unsafe raw SQL executions |
| `**/*.{tf,hcl,tfvars}` | Terraform / OpenTofu | [`rules/terraform.md`](./rules/terraform.md) | Hardcoded secrets, public CIDR blocks (`0.0.0.0/0`), unencrypted storage volumes |
| `**/*.sol` | Solidity Smart Contracts | [`rules/solidity.md`](./rules/solidity.md) | Reentrancy, integer arithmetic, unchecked call returns, flash loan attack vectors |
| `**/*.{yaml,yml}` | YAML Config | [`rules/yaml.md`](./rules/yaml.md) | Sensitive values in plaintext, parser ambiguity, invalid schema indentation |
| `*` (fallback) | Generic Fallback | [`rules/default.md`](./rules/default.md) | Boundary conditions, exception handling, resource cleanup, injection risks |

> For the complete machine-readable mapping of all 52 supported file types (including Swift, PHP, Zig, Bicep, Nix, Solidity, Rego, etc.), inspect [`rules/system_rules.json`](./rules/system_rules.json).

---

## Fast Defect Summaries (High-Frequency Stacks)

### 1. Go (`**/*.go`)
- **Goroutine Leaks**: Verify spawned goroutines listen on `ctx.Done()` or explicit stop channels.
- **Nil Pointer Dereferences**: Check return values before dereferencing struct pointers or method receivers.
- **Unhandled Error Returns**: Flag discarded errors (`_, _ = fn()`) unless explicitly documented.
- **Mutex & Lock Scoping**: Ensure `mu.Unlock()` is deferred immediately after `mu.Lock()` before any early return.
- **Defer in Loops**: Flag `defer` inside loops (deferred calls execute only when the enclosing function returns).

### 2. TypeScript & JavaScript (`**/*.{ts,tsx,js,jsx}`)
- **Floating Promises**: Ensure all `async` calls are awaited, returned, or handled with `.catch()`.
- **Error Swallowing**: Flag empty `catch (e) {}` blocks that mask runtime failures.
- **Unchecked Type Assertions**: Flag `as any` or forced casts that bypass type-checker guarantees without runtime validation.
- **Stale Closures & Hook Dependencies**: In React, verify `useEffect` and `useCallback` dependency arrays are complete.
- **Subscription Cleanup**: Ensure timers, WebSocket connections, and event listeners return explicit cleanup routines.

### 3. Python (`**/*.py`)
- **Mutable Default Arguments**: Flag functions with `def fn(items=[])` or `def fn(config={})`.
- **Context Managers**: Ensure file, network, and database operations use `with` statements.
- **Bare Except**: Prohibit bare `except:` statements catching `KeyboardInterrupt` and `SystemExit`.
- **NoneType Dereferencing**: Ensure `.get()` calls provide fallbacks before chained indexing (`data.get("user")["id"]`).

### 4. GitHub Actions Workflows (`.github/workflows/**/*.{yaml,yml}`)
- **Untrusted Script Injection**: Flag direct interpolation of untrusted inputs (`${{ github.event.issue.title }}`) into inline `run:` shell blocks. Pass via `env:` variables instead.
- **Action Pinning**: Ensure third-party actions are pinned to full commit SHAs rather than mutable tags.
- **Token Permissions**: Verify workflows declare minimal `permissions:` blocks (`contents: read`).

### 5. Database & SQL Access (`**/*{sql,mapper,dao}*`)
- **SQL Injection**: Strictly forbid dynamic string concatenation in queries. Require parameterized bindings (`$1`, `?`).
- **Unbounded Scans**: Flag `SELECT *` queries missing `LIMIT` or indexed `WHERE` predicates on growing tables.
- **Transaction Rollbacks**: Ensure transactions explicitly rollback on all error paths.
