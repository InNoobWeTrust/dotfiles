# Go Default Stack

Use for greenfield Go services and CLIs. Retain a repository's existing compatible choices.

## Code style — `go-gofmt`

Use [gofmt](https://pkg.go.dev/cmd/gofmt) for canonical layout, [Effective Go](https://go.dev/doc/effective_go) for applicable idioms and the [Google Go Style Guide](https://google.github.io/styleguide/go/) as explicitly adopted supplemental company guidance. Effective Go is historical and does not cover all modern language/module features; Google policy is not language-wide consensus. Do not impose a fixed line limit or add gofumpt as another default.

Prefer the project's check; a non-writing `gofmt -l <files>` lists unformatted files, so a zero exit status alone is not a formatting pass: the list must also be empty. Review naming, error handling and API conventions separately, without duplicating gofmt/linter noise. Pass the same resolved [style contract](../style-policy.md) to the reviewer.

## Baseline

- Use Go modules, `gofmt`, `go vet`, standard `testing`, `go test`, and `govulncheck`. Add golangci-lint when a broader, centrally configured lint set is needed.
- Prefer standard library capabilities for HTTP (`net/http` and modern `ServeMux` routing), JSON (`encoding/json`), structured logging (`log/slog`), flags for small CLIs, and tests. These are first-class production choices, not dependency avoidance.
- Use Cobra (or `kong`) for multi-command CLIs, `Huh?` for interactive prompt wizards, and Bubble Tea for full-screen interactive TUIs. Use Lip Gloss for terminal styling/layout, and Bubbles or `pterm` for console components/tables. Use `caarlos0/env` for declarative typed environment configuration, and `go-playground/validator` for structured request validation. For cross-language patterns, see [CLI & TUI Stacks](cli-tui-stacks.md).
- Use OpenTelemetry for portable telemetry. Use `sqlc` for typed SQL and `golang-migrate` or Goose for migrations; choose an ORM only when its model/query ergonomics materially outweigh SQL ownership.
- Use Gin or Echo only when their middleware/ergonomic value is needed beyond `net/http`; do not add a router reflexively.

## Sources

- https://go.dev/doc/modules/introduction
- https://go.dev/doc/go1.22
- https://go.dev/blog/slog
- https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck
- https://github.com/spf13/cobra
- https://docs.sqlc.dev/
- https://opentelemetry.io/docs/languages/go/
