# Language Stack References

Load the smallest matching reference only when choosing a greenfield stack or adding a substantial capability to one. Existing repository conventions and explicit project constraints always win.

For coding or review style, use the local [style policy](../style-policy.md) and only the matching core reference below; framework variants inherit the resolved host-language formatter and required syntax support. Pass the same profile, effective command/configuration and exceptions to every producer/reviewer. Other languages use caller-supplied resolved style records or project conventions, not a dependency on a sibling package.

| Target | Reference |
| --- | --- |
| Python | `python.md` |
| Python Composable Data Stack (Ibis + DuckDB) | `python-data-stack.md` |
| JavaScript / TypeScript | `javascript-typescript.md` |
| React | `react.md` |
| Vue | `vue.md` |
| Angular | `angular.md` |
| Vanilla JavaScript / Web Components | `web-components.md` |
| Go | `go.md` |
| Rust | `rust.md` |
| CLI & TUI Stacks (Multi-Language) | `cli-tui-stacks.md` |

Do not pin versions here. Use the repository lockfile and official compatibility matrices.
