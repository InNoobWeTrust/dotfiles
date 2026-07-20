# Automation, CI/CD & Deployment

### Makefile as the Single Entry Point

All automation commands should go through a single entry point — typically a `Makefile` at the project root. This means:

- A new team member runs `make help` and sees every available command
- CI/CD pipelines call the same targets, not bespoke scripts
- The AI agent has a deterministic set of commands to reference

**Essential Makefile targets:**

```
make fix              # Format everything (safe auto-fixes)
make lint             # Fast lint + format check
make quality          # Full quality gate (structural + dependencies)
make test             # All tests
make dev              # Start dev server(s)
make dev-up           # Start infrastructure (databases, message queues)
make build            # Production build
make api-sync         # Regenerate API contracts
make api-check        # Verify API contracts haven't drifted
```

**Pattern to follow:** Each target is a thin wrapper. The real logic lives in the application's build system (package.json scripts, pyproject.toml scripts). The Makefile is the consistent interface, not the implementation.

### CI/CD Pipeline Principles

Your CI/CD pipeline should implement these patterns:

1. **Change detection** — Only build/test/deploy what changed. Frontend changes shouldn't trigger backend builds. Documentation changes shouldn't trigger any build.
2. **Diagnostic collection on failure** — When a deploy fails, automatically collect pod status, recent events, and logs. Attach them as pipeline artifacts. Debugging a failed deploy without diagnostics is guessing.
3. **Artifact retention** — Keep build artifacts with explicit expiry. A 7-day retention is typical for development; production artifacts may need longer.
4. **Environment separation** — Pre-merge (build-only validation), development (full deploy with debug mode), production (full deploy, triggered by git tag).

**Example pipeline stages:**

```
test → build → deploy → release

Triggers:
  Merge request → pre-merge (test + build only)
  Push to main branch → dev (test + build + deploy to dev)
  Git tag vX.Y.Z → prod (test + build + deploy to prod + release)
```

### Deployment Patterns

For Kubernetes-based projects, use a declarative deployment tool (Helm, Kustomize, Garden.io, Pulumi) that produces auditable configuration:

```
helm/
├── Chart.yaml              # Root chart with subchart dependencies
├── values.yaml             # Shared values across environments
├── charts/
│   └── <app-name>/         # Main application subchart
├── templates/              # Infrastructure templates
│   ├── ingress.yaml        # Route configuration
│   ├── middleware.yaml      # Auth, rate limiting, CORS
│   ├── secret.yaml          # Kubernetes secret definitions
│   └── ...                  # Other infrastructure templates
└── .gitignore
```

Key separation:
- **Infrastructure templates** (ingress, middleware, secrets) belong in the shared chart
- **Application deployment** (backend, frontend) belongs in the subchart
- **Environment-specific values** are injected via CI/CD, not hardcoded in templates

### Scripts as Thin Utilities

Scripts in a `scripts/` directory should be thin utilities — they connect systems, not contain business logic. Examples:
- `sync_openapi_contract.py` — Regenerate frontend types from the backend's OpenAPI schema
- `check_frontend_business_logic.py` — Static analysis guard against business logic in UI code
- `seed_test_data.py` — Populate local database with test fixtures

If a script grows beyond ~100 lines of orchestration logic, the logic should move into the application codebase and the script should become a thin caller.

---
