# phases

### Phase 1 — Discover Project Context

1. **Identify the CI/CD platform**:
   - Check for `.github/workflows/` → GitHub Actions
   - Check for `.gitlab-ci.yml` → GitLab CI
   - Check for `Jenkinsfile` → Jenkins
   - Check for `bitbucket-pipelines.yml` → Bitbucket Pipelines
   - If none found, ask before generating.

2. **Discover the project structure**:
   - Monorepo or single-service?
   - Which directories are independent build targets? (e.g., `backend/`, `frontend/`, `docs/`)
   - What build tools are used? (from `Makefile`, `package.json`, `pyproject.toml`)
   - What environments exist? (dev, staging, production)
   - How are deployments done? (Helm, docker-compose, serverless, manual)

3. **Discover existing quality gates**:
   - Does `make fix`, `make lint`, `make quality`, `make test` work?
   - Any existing CI config to preserve or extend?

**Deliverable**: Context summary with platform, project structure, environments, build tools, and quality commands.

### Phase 2 — Design Pipeline Architecture

Before writing YAML, design on paper:

1. **Define stages**: test → build → deploy → release (standard; adapt if needed)
2. **Define triggers**:
   - Merge request → pre-merge validation (test + build only)
   - Push to main → dev deploy (test + build + deploy to dev)
   - Git tag `v*` → production deploy (test + build + deploy to prod)
3. **Define change detection rules** (adapt patterns to the actual directory layout — e.g. `packages/backend/`, `apps/frontend/`, `services/api/`):
   | Path Pattern | Triggers | Skips |
   |---|---|---|
   | `backend/**` | Backend test + build | Frontend build |
   | `frontend/**` | Frontend test + build | Backend build |
   | `docs/**` | Nothing (or docs build only) | All app builds |
   | `*.md` | Nothing | All app builds |
4. **Define artifact retention**: Build artifacts kept 7 days for dev, longer for production.
5. **Define diagnostic collection**: On deploy failure, auto-collect logs, pod status, recent events.

**STOP CONDITION**: If the user has not confirmed the platform or environment setup, ask before generating config.

### Phase 3 — Generate Pipeline Configuration

Generate the pipeline file with:

1. **Change detection implemented**: Use path filters (`paths`, `changes`, `only`) to skip irrelevant jobs.
2. **Quality gates wired in**: `make fix` → `make lint` → `make quality` → `make test` on every change.
3. **Environment separation**: Different rules for pre-merge, dev, and production.
4. **Artifact retention configured**: Explicit expiry days per artifact type.
5. **Diagnostic collection**: On failure, a job or step that captures diagnostic data.
6. **Secret management**: Secrets referenced via platform's store — never hardcoded.

Use idiomatic patterns: GitHub Actions `.github/workflows/` with `on.push.paths`, GitLab CI `.gitlab-ci.yml` with `rules:changes:`, Jenkins declarative pipeline with `when { changeset }`.

### Phase 4 — Run Security Posture Audit

Run the full security scan against the repository. If scanner tools are not installed and the project has no `Makefile` quality commands, halt and route to `project-foundation` skill first — do not proceed with incomplete scans.

**A. Secret Detection**:
- Run `trufflehog git file://. --only-verified`, `gitleaks detect --source .`, or `git secrets --scan`.
- If none installed, recommend one and explain what to add to `.gitignore`.
- Check `.gitignore` coverage: `.env`, `*.pem`, `*.key`, `auth.json`, `credentials.json`, `service-account.json`.
- Check for `.env.example` with all vars listed but no values.
- **CRITICAL**: Any high-confidence secret in git history → must be rotated and history rewritten. **STOP**: history rewriting on shared repos risks corrupting collaborators' work — do not proceed without explicit approval and a documented rollback plan. Escalate to the project's security lead or repo admin.

**B. Dependency Vulnerability Audit**:
- Python: `pip-audit` or `safety check`
- JavaScript/TypeScript: `npm audit` or `yarn audit`
- Go: `govulncheck ./...`
- For each finding: CVSS score, exploitability, fix version.
- **CRITICAL**: CVSS ≥ 9.0 that is exploitable → do not proceed without fix or documented mitigation.

**C. Static Code Analysis (SAST)**:
- `semgrep scan --config auto` (prefer `--config p/default` for deterministic, version-pinned rules), `bandit -r src/` (Python), `gosec ./...` (Go), ESLint security plugins (JS/TS).
- Check for: hardcoded credentials, SQL injection, command injection, insecure deserialization, missing auth checks, insecure random generation, debug mode in production configs.

**D. Infrastructure-as-Code Scanning** (if applicable):
- `checkov --directory .`, `tfsec .`, `trivy config .`
- Check for: containers running as root, missing resource limits, open security groups, unencrypted data stores, hardcoded secrets in templates, privileged containers.

**E. Audit Trail Verification** (business-critical systems only):
- Single write path for business data changes.
- Server-authoritative state (frontend displays backend truth, no speculative data).
- Operation logging for background jobs, syncs, pipeline runs (timestamp, status, diagnostics, trigger identity).
- Write-through persistence (data saved before UI refreshes).

### Phase 5 — Integrate Security into the Pipeline

Add security checks to the generated pipeline config:

1. **Secret scanning**: Run on every commit (pre-receive hook or CI step).
2. **Dependency auditing**: Run on every merge request.
3. **Static code analysis**: Run on every merge request (at minimum on changed files).
4. **IaC scanning**: Run when infrastructure files change.

Use platform-native integrations where available:
- GitHub Actions: `trufflehog-action`, `dependency-review-action`, CodeQL
- GitLab CI: `trufflehog` job, `gemnasium`, `semgrep` SAST
- Jenkins: Plugins or scripted steps

### Phase 6 — Validate and Document

1. **Validate the config**: Run the platform's validator (`actionlint`, `gitlab-ci-lint`).
2. **Document the pipeline**: Write or update `docs/engineering/ci-cd-pipeline.md` with:
   - Pipeline diagram (ASCII)
   - Trigger conditions and change detection rules
   - Environment descriptions
   - Security scanning summary (what runs, when, what to do on failure)
   - How to add a new service/deployment target
   - How to debug a pipeline failure
3. **Aggregate security findings** into a prioritized severity summary with file:line refs.

---
